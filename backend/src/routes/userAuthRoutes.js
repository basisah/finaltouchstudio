const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
const auth = require("../middleware/auth");
const { sendNotificationEmail } = require("../utils/mailer");
const getRegistrationUserTemplate = require("../emailservices/registrationUser");
const getRegistrationAdminTemplate = require("../emailservices/registrationAdmin");

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

    // Send Welcome Email to Customer
    const userEmailData = getRegistrationUserTemplate({ name, email });
    await sendNotificationEmail({
      to: email,
      subject: userEmailData.subject,
      text: userEmailData.text,
      html: userEmailData.html
    });

    // Send Admin Notification Email
    const adminEmailData = getRegistrationAdminTemplate({ name, email, userId, type: "Manual Registration" });
    await sendNotificationEmail({
      subject: adminEmailData.subject,
      text: adminEmailData.text,
      html: adminEmailData.html
    });

    res.status(201).json({ token, user: { id: userId, email, name, role: "user" } });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register account" });
  }
});

// Login User (Manual)
router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
  const targetEmail = email || username;

  if (!targetEmail || !password) {
    return res.status(400).json({ error: "Email/Username and password are required" });
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

    // If it's a new user registration via Google, welcome the user and notify the admin!
    if (isNewUser) {
      // Send Welcome Email to Customer
      const userEmailData = getRegistrationUserTemplate({ name, email });
      await sendNotificationEmail({
        to: email,
        subject: userEmailData.subject,
        text: userEmailData.text,
        html: userEmailData.html
      });

      // Send Admin Notification Email
      const adminEmailData = getRegistrationAdminTemplate({ name, email, userId: user.id, type: "Google Identity OAuth" });
      await sendNotificationEmail({
        subject: adminEmailData.subject,
        text: adminEmailData.text,
        html: adminEmailData.html
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

    // Env-based admin tokens have no DB user id
    if (!userId && req.user.role === "admin") {
      return res.json({
        user: {
          name: req.user.username || "Admin",
          email: "admin@finaltouch.com",
          role: "admin",
          avatar_url: null,
          created_at: null,
        },
        bookings: [],
      });
    }

    if (!userId) {
      return res.status(401).json({ error: "Invalid session" });
    }

    // Fetch user record
    const [users] = await db.query(
      "SELECT id, name, email, avatar_url, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Unauthorized: User not found or session stale" });
    }

    const user = users[0];

    // Fetch bookings/orders linked to user ID in the new schema
    const [orders] = await db.query(
      `SELECT id, customer_name, event_date AS return_date, rental_date AS pickup_date, total_amount AS price, status, created_at, fulfillment_type
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const bookings = await Promise.all(orders.map(async (order) => {
      // Find package name or item names
      const [items] = await db.query(
        `SELECT oi.quantity, i.name AS item_name, p.name AS package_name
         FROM order_items oi
         LEFT JOIN items i ON oi.item_id = i.id
         LEFT JOIN packages p ON oi.package_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      // Construct a single summary line for package_name
      let description = "";
      const packageItem = items.find(it => it.package_name);
      if (packageItem) {
        description = packageItem.package_name;
        const otherItemsCount = items.filter(it => it.item_name).length;
        if (otherItemsCount > 0) {
          description += ` + ${otherItemsCount} custom item(s)`;
        }
      } else {
        description = items.map(it => `${it.quantity}x ${it.item_name || 'Item'}`).join(", ");
        if (!description) {
          description = "Custom Rental Package";
        }
      }

      return {
        ...order,
        package_name: description,
        payment_method: order.fulfillment_type === "delivery" ? "Delivery/Fulfillment" : "Customer Pickup"
      };
    }));

    res.json({ user, bookings });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;
