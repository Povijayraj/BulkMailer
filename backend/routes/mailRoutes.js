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
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
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
        from: `"${req.admin.email}" <${process.env.EMAIL_USER}>`,
        replyTo: req.admin.email,
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

  // Save a record of this send attempt to MongoDB, tagged with who sent it
  const emailRecord = await Email.create({
    subject,
    body,
    recipients,
    status,
    failedRecipients,
    sentBy: req.admin.id,
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

// GET /api/mail/history — list only the logged-in user's previously sent campaigns
router.get("/history", requireAuth, async (req, res) => {
  const history = await Email.find({ sentBy: req.admin.id }).sort({ createdAt: -1 });
  res.json(history);
});

// DELETE /api/mail/:id — remove a campaign, only if it belongs to the logged-in user
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, sentBy: req.admin.id });

    if (!email) {
      return res.status(404).json({ message: "Email record not found" });
    }

    await email.deleteOne();
    res.json({ message: "Email record deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid email record id" });
  }
});

module.exports = router;
