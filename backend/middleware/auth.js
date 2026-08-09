const jwt = require("jsonwebtoken");

// Protects routes so only a logged-in admin can send mail / view history
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = requireAuth;
