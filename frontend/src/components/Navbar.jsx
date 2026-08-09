import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">📧 Bulk Mail Sender</div>
      {isLoggedIn && (
        <div className="navbar-links">
          <Link to="/">Send Mail</Link>
          <Link to="/history">History</Link>
          <button onClick={handleLogout} className="link-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
