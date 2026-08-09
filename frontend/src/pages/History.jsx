import { useEffect, useState } from "react";
import api from "../api/axios";

const statusColors = {
  success: "success",
  failed: "error",
  partial: "warning",
};

const statusIcons = {
  success: "✅",
  failed: "❌",
  partial: "⚠️",
};

function History() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/mail/history");
      setEmails(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this email record? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      await api.delete(`/mail/${id}`);
      setEmails((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalCampaigns = emails.length;
  const totalRecipients = emails.reduce((sum, e) => sum + e.recipients.length, 0);
  const successCount = emails.filter((e) => e.status === "success").length;
  const successRate = totalCampaigns === 0 ? 0 : Math.round((successCount / totalCampaigns) * 100);

  return (
    <div className="page-container">
      <div className="card wide history-card">
        <h2>Your Email History</h2>

        {error && <div className="message error">{error}</div>}
        {loading && <p>Loading...</p>}

        {!loading && emails.length > 0 && (
          <div className="stat-row">
            <div className="stat-tile">
              <span className="stat-value">{totalCampaigns}</span>
              <span className="stat-label">Campaigns Sent</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{totalRecipients}</span>
              <span className="stat-label">Total Recipients</span>
            </div>
            <div className="stat-tile">
              <span className="stat-value">{successRate}%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        )}

        {!loading && emails.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <p>You haven't sent any emails yet.</p>
          </div>
        )}

        {!loading && emails.length > 0 && (
          <ul className="timeline">
            {emails.map((email) => (
              <li key={email._id} className="timeline-item">
                <span className={`timeline-dot dot-${statusColors[email.status]}`} />
                <div className="timeline-content">
                  <div className="timeline-top-row">
                    <span className="timeline-subject">{email.subject}</span>
                    <span className={`badge ${statusColors[email.status]}`}>
                      {statusIcons[email.status]} {email.status}
                    </span>
                  </div>
                  <div className="timeline-meta">
                    <span>{new Date(email.createdAt).toLocaleString()}</span>
                    <span>·</span>
                    <span>
                      {email.recipients.length} recipient{email.recipients.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(email._id)}
                    disabled={deletingId === email._id}
                  >
                    {deletingId === email._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default History;
