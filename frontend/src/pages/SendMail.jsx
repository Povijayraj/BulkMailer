import { useState } from "react";
import api from "../api/axios";
import RecipientChipInput from "../components/RecipientChipInput";
import ExcelRecipientUpload from "../components/ExcelRecipientUpload";
import SuccessCheck from "../components/SuccessCheck";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getSenderEmail = () => {
  const token = localStorage.getItem("token");
  if (!token) return "you";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || "you";
  } catch {
    return "you";
  }
};

function SendMail() {
  const senderEmail = getSenderEmail();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [status, setStatus] = useState(null); // { type: "success" | "error", text: string }
  const [sending, setSending] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!subject.trim() || !body.trim()) {
      setStatus({ type: "error", text: "Subject and body cannot be empty." });
      return;
    }

    if (recipients.length === 0) {
      setStatus({ type: "error", text: "Please add at least one recipient email." });
      return;
    }

    const invalidEmails = recipients.filter((r) => !isValidEmail(r));
    if (invalidEmails.length > 0) {
      setStatus({ type: "error", text: `Invalid email address(es): ${invalidEmails.join(", ")}` });
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/mail/send", { subject, body, recipients });
      setStatus({ type: "success", text: res.data.message });
      setSubject("");
      setBody("");
      setRecipients([]);
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 1400);
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data?.message || "Failed to send emails." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-container compose-container">
      <div className="compose-grid">
        <form className="card compose-form" onSubmit={handleSubmit}>
          {showCheck && <SuccessCheck />}

          <h2>Compose Campaign</h2>

          {status && <div className={`message ${status.type}`}>{status.text}</div>}

          <label>From</label>
          <input type="text" value={senderEmail} disabled />

          <label>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Monthly Newsletter"
          />

          <label>Email Body</label>
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
          />

          <label>Recipient Emails</label>
          <ExcelRecipientUpload recipients={recipients} onChange={setRecipients} />
          <RecipientChipInput recipients={recipients} onChange={setRecipients} />
          <small>
            {recipients.length} recipient{recipients.length === 1 ? "" : "s"} added
          </small>

          <button type="submit" disabled={sending}>
            {sending ? "Sending..." : `Send to ${recipients.length || ""} Recipient${recipients.length === 1 ? "" : "s"}`}
          </button>
        </form>

        <div className="preview-pane">
          <span className="preview-label">Live Preview</span>
          <div className="preview-envelope">
            <div className="preview-envelope-header">
              <div className="preview-avatar">✉️</div>
              <div>
                <div className="preview-to">
                  To: {recipients.length > 0 ? `${recipients.length} recipient${recipients.length === 1 ? "" : "s"}` : "no one yet"}
                </div>
                <div className="preview-from">From: {senderEmail}</div>
              </div>
            </div>
            <div className="preview-subject">{subject || "Your subject will appear here"}</div>
            <div className="preview-body">
              {body || "Start typing your message and watch it show up here in real time."}
            </div>
            {recipients.length > 0 && (
              <div className="preview-chip-strip">
                {recipients.slice(0, 6).map((r) => (
                  <span key={r} className="preview-mini-chip">
                    {r}
                  </span>
                ))}
                {recipients.length > 6 && (
                  <span className="preview-mini-chip preview-mini-chip-more">
                    +{recipients.length - 6} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendMail;
