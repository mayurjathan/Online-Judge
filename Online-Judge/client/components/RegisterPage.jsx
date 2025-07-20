// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";
import axios from "axios";
import loginJudge from './img/image copy 2.png';

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (name.length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/auth/register`,
        { 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          password 
        }
      );

      if (res.data.message || res.status === 201) {
        // Registration successful
        alert("Registration successful! Please login with your credentials.");
        navigate("/");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-left">
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="heading-main">Register for Rush2Code</div>
            <div className="heading-sub">
              Create your Rush2Code account now.
            </div>
            {error && <p className="error-msg">{error}</p>}

            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={loading}
              minLength={2}
              maxLength={50}
            />

            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
              autoComplete="username"
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
              required
              disabled={loading}
              minLength={6}
              autoComplete="new-password"
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={loading}
              autoComplete="new-password"
            />

            <button 
              className="auth-btn" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>

            <div className="link-text">
              Already have an account? <a href="/">Login here</a>
            </div>
          </form>
        </div>
        <div className="card-right">
          <img src={loginJudge} alt="Register Art" />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;