const nodemailer = require("nodemailer");

// Create standard SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || "", // Gmail/SMTP Username
    pass: process.env.SMTP_PASS || "", // Gmail App Password / SMTP Password
  },
});

/**
 * Sends a notification email to the studio contact email.
 * Falls back to console.log in development if credentials are empty.
 */
async function sendNotificationEmail({ subject, text, html }) {
  const recipient = "finaltouchstudiosask@gmail.com";

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("✉️ [SMTP Dev Mode] Logged Email Notification:");
    console.log(`To: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    return { devMode: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'FinalTouch Studio Notifications'}" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject,
      text,
      html,
    });
    console.log("📨 Email notification sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email notification:", error);
    // Never crash the primary api request if email notifications fail
    return null;
  }
}

module.exports = { sendNotificationEmail };
