import { useState } from "react";
import api from "../api/axios";
import RecipientChipInput from "../components/RecipientChipInput";
import SuccessCheck from "../components/SuccessCheck";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function SendMail() {
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
    <div className="page-container">
      <form className="card" onSubmit={handleSubmit}>
        {showCheck && <SuccessCheck />}

        <h2>Send Bulk Mail</h2>

        {status && <div className={`message ${status.type}`}>{status.text}</div>}

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
        <RecipientChipInput recipients={recipients} onChange={setRecipients} />
        <small>
          {recipients.length} recipient{recipients.length === 1 ? "" : "s"} added
        </small>

        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send Emails"}
        </button>
      </form>
    </div>
  );
}

export default SendMail;
