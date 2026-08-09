import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to={isLoggedIn ? "/" : "/login"} className="navbar-brand">
        <span className="navbar-brand-icon">✉️</span>
        <span>BulkMailer</span>
      </Link>
      {isLoggedIn && (
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-active" : "")}>
            Send Mail
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? "nav-active" : "")}>
            History
          </NavLink>
          <button onClick={handleLogout} className="link-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
