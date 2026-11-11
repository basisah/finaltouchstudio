const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const { sendNotificationEmail } = require("../utils/mailer");
const getEnquiryAdminTemplate = require("../emailservices/enquiryAdmin");

const MAX_PAGE_SIZE = 200;

// POST /api/contact — public contact form submission
router.post("/", async (req, res) => {
  const { name, email, occasion, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO enquiries (name, email, occasion, message) VALUES (?, ?, ?, ?)",
      [name, email, occasion || "Not Specified", message]
    );
    const enquiryId = result.insertId;

    const emailData = getEnquiryAdminTemplate({ enquiryId, name, email, occasion, message });
    await sendNotificationEmail({ subject: emailData.subject, text: emailData.text, html: emailData.html });

    res.status(201).json({ success: true, enquiryId, message: "Enquiry submitted successfully" });
  } catch (err) {
    console.error("Enquiry submission error:", err);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
});

// GET /api/contact — admin inbox (newest first; optional ?limit=&offset=)
router.get("/", auth, isAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || MAX_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const [rows] = await db.query(
      `SELECT id, name, email, occasion, message,
              is_read AS \`read\`,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS date
         FROM enquiries
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// PATCH /api/contact/read-all — mark every enquiry as read
router.patch("/read-all", auth, isAdmin, async (req, res) => {
  try {
    await db.query("UPDATE enquiries SET is_read = TRUE WHERE is_read = FALSE");
    res.json({ message: "All enquiries marked as read" });
  } catch (err) {
    console.error("Error marking enquiries as read:", err);
    res.status(500).json({ error: "Failed to update enquiries" });
  }
});

module.exports = router;
