// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";
import axios from "axios";
import loginJudge from './img/image copy 2.png';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSigned, setKeepSigned] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/auth/login`,
        { email, password }
      );

      if (res.data.token) {
        // Store token
        localStorage.setItem("token", res.data.token);
        
        // Set axios default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Store user info if provided
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        // Handle "Remember me" functionality
        if (!keepSigned) {
          // Set token to expire when browser closes
          sessionStorage.setItem("token", res.data.token);
          localStorage.removeItem("token");
        }

        console.log("Login successful, redirecting to home...");
        navigate("/home");
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-left">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="heading-main">Sign In to Rush2Code</div>
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
              disabled={loading}
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              disabled={loading}
            />

            <div className="options-row">
              <label className="keep-signed">
                <input
                  type="checkbox"
                  checked={keepSigned}
                  onChange={() => setKeepSigned(!keepSigned)}
                  disabled={loading}
                />
                Remember me
              </label>
              <a className="forgot-link" href="/forgot">
                Forgot password?
              </a>
            </div>

            <button 
              className="login-btn" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="link-text">
              Don't have an account? <a href="/register">Register here</a>
            </div>
          </form>
        </div>
        <div className="card-right">
          <img src={loginJudge} alt="Login Art" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;