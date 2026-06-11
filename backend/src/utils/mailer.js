const nodemailer = require("nodemailer");

// Initialize the SMTP carrier using your environment credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

/**
 * Sends a system-triggered transactional email.
 * @param {string} to - Recipient email address (defaults to owner if omitted)
 * @param {string} subject - Email subject header
 * @param {string} text - Raw plain-text fallback content
 * @param {string} html - Formatted HTML body layout
 */
async function sendNotificationEmail({ to, subject, text, html }) {
  // Fallback automatically to the owner if no specific customer address is provided
  const recipient = to || "finaltouchstudiosask@gmail.com";

  // Safe development fallback if SMTP credentials aren't set up yet in your .env file
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`✉️ [SMTP Dev Mode] Logged Email Target: ${recipient}`);
    console.log(`Subject: ${subject}\nBody: ${text}`);
    return { devMode: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'FinalTouch Studio'}" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject,
      text,
      html,
    });
    console.log("📨 Transactional email dispatched: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email transmission intercept failure:", error);
    return null; // Return null so a failed email never crashes a customer's checkout process
  }
}

module.exports = { sendNotificationEmail };