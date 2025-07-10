import React, { useState } from "react";
import "./styles/login.css";
import axios from "axios";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      console.error("Registration failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Register for Online Judge</h2>

        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Register</button>

        <div className="link-text">
          Already have an account? <a href="/">Login here</a>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
