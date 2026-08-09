import { useEffect, useState } from "react";
import api from "../api/axios";

const statusColors = {
  success: "success",
  failed: "error",
  partial: "warning",
};

function History() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchHistory();
  }, []);

  const totalCampaigns = emails.length;
  const totalRecipients = emails.reduce((sum, e) => sum + e.recipients.length, 0);
  const successCount = emails.filter((e) => e.status === "success").length;
  const successRate = totalCampaigns === 0 ? 0 : Math.round((successCount / totalCampaigns) * 100);

  return (
    <div className="page-container">
      <div className="card wide">
        <h2>Email History</h2>

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

        {!loading && emails.length === 0 && <p>No emails sent yet.</p>}

        {!loading && emails.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Recipients</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email._id}>
                  <td>{new Date(email.createdAt).toLocaleString()}</td>
                  <td>{email.subject}</td>
                  <td>{email.recipients.length}</td>
                  <td>
                    <span className={`badge ${statusColors[email.status]}`}>{email.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default History;
