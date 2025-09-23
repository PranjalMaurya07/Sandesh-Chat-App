import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom"; 
import "../styles/Register.css"; 

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/"); 
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Registration failed");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="register-title">Register</h2>

        <input
          className="register-input"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          className="register-input"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="register-input"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button className="register-button" type="submit">
          Register
        </button>

        <p className="register-login-text">
          Already have an account?{" "}
          <Link to="/" className="register-login-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
