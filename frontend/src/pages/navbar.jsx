import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "../styles/Navbar.css"; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); 
  };

  return (
    <nav className="navbar">

      <h3 className="navbar-title">Sandesh</h3>

      {user && <span className="navbar-user">Hi, {user.name}</span>}

      <div className="navbar-actions">
        <Link to="/new-chat">
          <button className="navbar-btn">+ New Chat</button>
        </Link>
        <button onClick={handleLogout} className="navbar-btn logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
