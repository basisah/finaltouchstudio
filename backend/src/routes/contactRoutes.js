const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// POST /api/contact — public contact form submission
router.post("/", async (req, res) => {
  const { name, email, occasion, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO enquiries (name, email, occasion, message) VALUES (?, ?, ?, ?)",
      [name, email, occasion || null, message]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Enquiry submitted successfully",
    });
  } catch (err) {
    console.error("Error saving enquiry:", err);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
});

// GET /api/contact — admin inbox
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        email,
        occasion,
        message,
        is_read AS \`read\`,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS date
      FROM enquiries
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// PATCH /api/contact/read-all — mark all enquiries as read
router.patch("/read-all", auth, async (req, res) => {
  try {
    await db.query("UPDATE enquiries SET is_read = TRUE WHERE is_read = FALSE");
    res.json({ message: "All enquiries marked as read" });
  } catch (err) {
    console.error("Error marking enquiries as read:", err);
    res.status(500).json({ error: "Failed to update enquiries" });
  }
});

module.exports = router;
