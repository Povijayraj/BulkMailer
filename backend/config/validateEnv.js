// Fails fast on boot if required config is missing, instead of surfacing
// confusing errors later (e.g. a 500 the first time someone tries to log in).
const REQUIRED_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variable(s): ${missing.join(", ")}`);
    console.error("Copy backend/.env.example to backend/.env and fill in the values.");
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET is too short for production. Use at least 32 random characters.");
    process.exit(1);
  }
}

module.exports = validateEnv;
