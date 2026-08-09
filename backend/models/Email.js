const mongoose = require("mongoose");

// One document = one bulk-mail "campaign" sent from the app
const emailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    recipients: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "partial"],
      default: "success",
    },
    // Keeps track of which recipients failed and why, useful for debugging
    failedRecipients: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model("Email", emailSchema);
