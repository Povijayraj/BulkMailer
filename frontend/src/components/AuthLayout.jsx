// Shared split-screen shell for Login / Register: a branded story panel on the
// left, the actual form passed in as children on the right.
function AuthLayout({ eyebrow, title, tagline, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div className="auth-brand-mark">
          <span className="auth-brand-icon">✉️</span>
          <span>BulkMailer</span>
        </div>

        <div className="auth-brand-copy">
          <p className="auth-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-tagline">{tagline}</p>
        </div>

        <ul className="auth-feature-list">
          <li>
            <span className="auth-feature-icon">📮</span>
            Send to hundreds of recipients in one go
          </li>
          <li>
            <span className="auth-feature-icon">🔒</span>
            Your history is private — only you see it
          </li>
          <li>
            <span className="auth-feature-icon">📊</span>
            Track delivery status for every campaign
          </li>
        </ul>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
