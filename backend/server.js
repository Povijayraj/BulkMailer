require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const validateEnv = require("./config/validateEnv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const mailRoutes = require("./routes/mailRoutes");

validateEnv();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Behind a reverse proxy (nginx, Render, Heroku, etc.) so req.ip / rate limiting work correctly
app.set("trust proxy", 1);

connectDB();

app.use(helmet());
app.use(compression());

// Only allow the configured frontend origin in production; wide open in dev for convenience
const allowedOrigin = process.env.FRONTEND_ORIGIN;
app.use(
  cors(
    isProduction && allowedOrigin
      ? { origin: allowedOrigin }
      : {} // no restriction during local development
  )
);

app.use(express.json({ limit: "1mb" }));

// Lightweight request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Brute-force protection on login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Prevent the /send endpoint from being hammered (it triggers real emails + SMTP calls)
const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many send requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/mail/send", sendLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/mail", mailRoutes);

app.get("/", (req, res) => {
  res.send("Bulk Mail Sender API is running");
});

// Simple health check for uptime monitors / container orchestrators
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown so in-flight requests and the Mongo connection close cleanly
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
