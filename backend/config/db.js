const mongoose = require("mongoose");

// Serverless functions can get invoked many times against the same warm
// process — cache the connection promise so repeat calls reuse it instead of
// opening a fresh connection (and hitting Atlas's connection limit) every time.
let connectionPromise = null;

const connectDB = () => {
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      connectionPromise = null; // allow a retry on the next invocation instead of staying stuck
      if (require.main === module) process.exit(1);
      throw error;
    });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  return connectionPromise;
};

module.exports = connectDB;
