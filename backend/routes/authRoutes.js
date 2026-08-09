const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Simple admin login — credentials come from .env (no user collection needed)
// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const isValidEmail = email === process.env.ADMIN_EMAIL;
  const isValidPassword = password === process.env.ADMIN_PASSWORD;

  if (!isValidEmail || !isValidPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.json({ message: "Login successful", token });
});

module.exports = router;
