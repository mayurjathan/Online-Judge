// src/pages/LoginPage.jsx
import React, { useState } from "react";
import "./styles/Login.css";
import axios from "axios";
import loginJudge from './img/image copy 2.png'; 


function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSigned, setKeepSigned] = useState(true);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/auth/login`,
        { email, password }
      );
      localStorage.setItem("token", res.data.token);
      window.location.href = "/home";
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-left">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="heading-main">Sign In to Online Judge</div>
            <div className="heading-sub">
              Access problems, submit code, and track your results.
            </div>
            {error && <p className="error-msg">{error}</p>}

            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="Enter your email"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />

            <div className="options-row">
              <label className="keep-signed">
                <input
                  type="checkbox"
                  checked={keepSigned}
                  onChange={() => setKeepSigned(!keepSigned)}
                />
                Remember me
              </label>
              <a className="forgot-link" href="/forgot">
                Forgot password?
              </a>
            </div>

            <button className="login-btn" type="submit">
              Sign In
            </button>

            <div className="link-text">
              Don’t have an account? <a href="/register">Register here</a>
            </div>
          </form>
        </div>
        <div className="card-right">
          <img src={loginJudge} alt="Online Judge Login Art" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 
