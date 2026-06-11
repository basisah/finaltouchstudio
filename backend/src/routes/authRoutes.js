const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
const auth = require("../middleware/auth");
const { sendNotificationEmail } = require("../utils/mailer");

// Register User (Manual)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'user')",
      [email, password_hash, name]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, email, name, role: "user" },
      process.env.JWT_SECRET || "default_dev_secret",
      { expiresIn: "24h" }
    );

    // Send Admin Email Notification
    await sendNotificationEmail({
      subject: "✨ New Customer Registered - FinalTouch Studio",
      text: `A new user has registered manually!\n\nName: ${name}\nEmail: ${email}\nUser ID: ${userId}`,
      html: `<h3>New User Registration (Manual)</h3>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>User ID:</strong> ${userId}</p>
             <p>Account registered successfully in finaltouchstudio database.</p>`,
    });

    res.status(201).json({ token, user: { id: userId, email, name, role: "user" } });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register account" });
  }
});

// Login User (Manual - supports fallback admin and database users)
router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
  const targetEmail = email || username;

  if (!targetEmail || !password) {
    return res.status(400).json({ error: "Email/Username and password are required" });
  }

  // Admin fallback (only active if configured in environment variables)
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminUsername && adminPassword && targetEmail === adminUsername && password === adminPassword) {
    const token = jwt.sign({ username: adminUsername, role: "admin" }, process.env.JWT_SECRET || "default_dev_secret", {
      expiresIn: "24h"
    });
    return res.json({ token, user: { name: "Admin", email: "admin@finaltouch.com", role: "admin" } });
  }


  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [targetEmail]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];
    if (!user.password_hash) {
      return res.status(400).json({ error: "This account was created via Google Sign-In. Please sign in with Google." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "default_dev_secret",
      { expiresIn: "24h" }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to authenticate" });
  }
});

// Google Sign-In / Auto Registration
router.post("/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Google credential token is required" });
  }

  try {
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!verifyRes.ok) {
      const errorData = await verifyRes.json();
      return res.status(400).json({ error: errorData.error_description || "Invalid Google token" });
    }

    const decoded = await verifyRes.json();

    if (process.env.GOOGLE_CLIENT_ID && decoded.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ error: "Token audience mismatch" });
    }

    const email = decoded.email;
    const google_id = decoded.sub;
    const name = decoded.name || email.split("@")[0];
    const avatar_url = decoded.picture || null;

    const [users] = await db.query("SELECT * FROM users WHERE google_id = ? OR email = ?", [google_id, email]);

    let user;
    let isNewUser = false;

    if (users.length > 0) {
      user = users[0];
      if (!user.google_id) {
        await db.query("UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?", [google_id, avatar_url, user.id]);
        user.google_id = google_id;
        user.avatar_url = avatar_url;
      }
    } else {
      isNewUser = true;
      const [insertResult] = await db.query(
        "INSERT INTO users (email, name, google_id, avatar_url, role) VALUES (?, ?, ?, ?, 'user')",
        [email, name, google_id, avatar_url]
      );
      const newId = insertResult.insertId;
      user = { id: newId, email, name, google_id, avatar_url, role: "user" };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "default_dev_secret",
      { expiresIn: "24h" }
    );

    // If it's a new user registration via Google, notify the admin!
    if (isNewUser) {
      await sendNotificationEmail({
        subject: "🚀 New Customer Registered (Google) - FinalTouch Studio",
        text: `A new user has registered using Google Sign-In!\n\nName: ${name}\nEmail: ${email}\nUser ID: ${user.id}`,
        html: `<h3>New User Registration (Google OAuth)</h3>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>User ID:</strong> ${user.id}</p>
               <p>User account automatically created via Google login.</p>`,
      });
    }

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, role: user.role } });
  } catch (err) {
    console.error("Google Sign-In error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

// Verify token
router.get("/verify", auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Get user profile + booking history
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user record
    const [users] = await db.query(
      "SELECT id, name, email, avatar_url, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Fetch bookings linked to user email
    const [bookings] = await db.query(
      `SELECT id, customer_name, package_name, pickup_date, return_date, price, payment_method, status, created_at
       FROM bookings WHERE email = ? ORDER BY created_at DESC`,
      [user.email]
    );

    res.json({ user, bookings });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;
