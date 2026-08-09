const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/auth/register — creates a new account
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email: email.toLowerCase(), passwordHash });

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(201).json({ message: "Account created successfully", token });
});

// POST /api/auth/login — verifies credentials against MongoDB
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ message: "Login successful", token });
});

module.exports = router;
