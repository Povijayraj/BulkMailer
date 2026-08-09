const express = require("express");
const nodemailer = require("nodemailer");
const Email = require("../models/Email");
const requireAuth = require("../middleware/auth");

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS_PER_REQUEST = 500;

// Nodemailer transporter — pooled + rate-limited so we don't get throttled or
// blocked by Gmail when sending to many recipients back to back
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5, // max 5 messages per rateDelta window
});

// POST /api/mail/send  — sends the same subject/body to a list of recipients
router.post("/send", requireAuth, async (req, res) => {
  const { subject, body, recipients } = req.body;

  if (!subject || !body || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ message: "Subject, body and at least one recipient are required" });
  }

  if (recipients.length > MAX_RECIPIENTS_PER_REQUEST) {
    return res
      .status(400)
      .json({ message: `Too many recipients in one request (max ${MAX_RECIPIENTS_PER_REQUEST}).` });
  }

  const invalidRecipients = recipients.filter((r) => typeof r !== "string" || !EMAIL_REGEX.test(r));
  if (invalidRecipients.length > 0) {
    return res.status(400).json({ message: `Invalid recipient email(s): ${invalidRecipients.join(", ")}` });
  }

  const failedRecipients = [];

  // Send emails one by one so a single bad address doesn't stop the rest
  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient,
        subject,
        text: body,
      });
    } catch (error) {
      console.error(`Failed to send email to ${recipient}:`, error.message);
      failedRecipients.push(recipient);
    }
  }

  let status = "success";
  if (failedRecipients.length === recipients.length) status = "failed";
  else if (failedRecipients.length > 0) status = "partial";

  // Save a record of this send attempt to MongoDB
  const emailRecord = await Email.create({
    subject,
    body,
    recipients,
    status,
    failedRecipients,
  });

  res.status(status === "failed" ? 500 : 200).json({
    message:
      status === "success"
        ? "All emails sent successfully"
        : status === "partial"
        ? "Some emails failed to send"
        : "All emails failed to send",
    record: emailRecord,
  });
});

// GET /api/mail/history — list previously sent mail campaigns, newest first
router.get("/history", requireAuth, async (req, res) => {
  const history = await Email.find().sort({ createdAt: -1 });
  res.json(history);
});

module.exports = router;
