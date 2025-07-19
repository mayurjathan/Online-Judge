
import React, { useState } from "react";
import "./styles/Login.css";
import axios from "axios";
import loginJudge from './img/image copy 2.png'; 
function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/auth/register`,
        { name, email, password }
      );
      alert("Registration successful!");
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-left">
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="heading-main">Register for Online Judge</div>
            <div className="heading-sub">
              Create your Online Judge account now.
            </div>
            {error && <p className="error-msg">{error}</p>}

            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />

            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <button className="auth-btn" type="submit">
              Register
            </button>

            <div className="link-text">
              Already have an account? <a href="/">Login here</a>
            </div>
          </form>
        </div>
        <div className="card-right">
          <img src={loginJudge} alt="Online Judge Register Art" />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
