const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

// Login Admin (Manual admin authentication)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminUsername && adminPassword && username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ username: adminUsername, role: "admin" }, process.env.JWT_SECRET || "default_dev_secret", {
      expiresIn: "30m"
    });
    return res.json({ token, user: { name: "Admin", email: "admin@finaltouch.com", role: "admin" } });
  }

  return res.status(401).json({ error: "Invalid username or password" });
});

// Verify token for admin
router.get("/verify", auth, (req, res) => {
  if (req.user && req.user.role === "admin") {
    res.json({ valid: true, user: req.user });
  } else {
    res.status(403).json({ error: "Access denied. Admin role required." });
  }
});

module.exports = router;
