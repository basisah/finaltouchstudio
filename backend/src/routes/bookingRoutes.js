const express = require("express");
const router = express.Router();
const db = require("../db");
const { sendNotificationEmail } = require("../utils/mailer");

// Submit a new booking / pickup / payment request
router.post("/bookings", async (req, res) => {
  const { name, phone, email, pickupDate, returnDate, packageName, price, paymentMethod } = req.body;

  if (!name || !phone || !email || !pickupDate || !returnDate || !packageName || price === undefined || !paymentMethod) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  try {
    // 1. Save reservation request to MySQL database
    const [result] = await db.query(
      `INSERT INTO bookings (customer_name, email, phone, pickup_date, return_date, package_name, price, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, pickupDate, returnDate, packageName, price, paymentMethod]
    );

    const bookingId = result.insertId;

    // 2. Send instant email notification to studio admin
    await sendNotificationEmail({
      subject: `🔔 New Booking & Pickup Request (#${bookingId}) - FinalTouch Studio`,
      text: `A new booking has been placed!\n\nBooking ID: #${bookingId}\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nPickup Date: ${pickupDate}\nReturn Date: ${returnDate}\nPackage: ${packageName}\nTotal Price: CAD $${price}\nPayment Method: ${paymentMethod}`,
      html: `<h3>New Booking &amp; Pickup Request (#${bookingId})</h3>
             <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse; border-color: #eee;">
               <tr><td><strong>Customer Name</strong></td><td>${name}</td></tr>
               <tr><td><strong>Email</strong></td><td>${email}</td></tr>
               <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
               <tr><td><strong>Pickup Date</strong></td><td>${pickupDate}</td></tr>
               <tr><td><strong>Return Date</strong></td><td>${returnDate}</td></tr>
               <tr><td><strong>Package Selected</strong></td><td>${packageName}</td></tr>
               <tr><td><strong>Total Amount</strong></td><td><strong>CAD $${price}</strong></td></tr>
               <tr><td><strong>Payment Method</strong></td><td>${paymentMethod}</td></tr>
             </table>
             <p>This request is saved in the database and is pending confirmation.</p>`,
    });

    res.status(201).json({ success: true, bookingId, message: "Booking registered successfully" });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ error: "Failed to submit booking" });
  }
});

// Submit a contact enquiry
router.post("/contact", async (req, res) => {
  const { name, email, occasion, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  try {
    // 1. Save enquiry details to MySQL
    const [result] = await db.query(
      "INSERT INTO enquiries (name, email, occasion, message) VALUES (?, ?, ?, ?)",
      [name, email, occasion || "Not Specified", message]
    );

    const enquiryId = result.insertId;

    // 2. Send instant email notification to studio admin
    await sendNotificationEmail({
      subject: `✉️ New Customer Enquiry (#${enquiryId}) - FinalTouch Studio`,
      text: `A new enquiry has been submitted!\n\nEnquiry ID: #${enquiryId}\nName: ${name}\nEmail: ${email}\nOccasion: ${occasion || "Not Specified"}\nMessage:\n${message}`,
      html: `<h3>New Customer Enquiry (#${enquiryId})</h3>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Occasion:</strong> ${occasion || "Not Specified"}</p>
             <p><strong>Message:</strong></p>
             <blockquote style="background: #f9f9f9; padding: 12px; border-left: 4px solid #BD7893;">
               ${message.replace(/\n/g, "<br>")}
             </blockquote>`,
    });

    res.status(201).json({ success: true, enquiryId, message: "Enquiry submitted successfully" });
  } catch (err) {
    console.error("Enquiry submission error:", err);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
});

module.exports = router;
