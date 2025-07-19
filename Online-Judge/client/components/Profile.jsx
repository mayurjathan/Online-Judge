// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles/Profile.css";

function Profile() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    joinedDate: "",
    solvedProblems: 0,
    totalSubmissions: 0,
    rank: 0,
    contestsParticipated: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: ""
  });

  useEffect(() => {
    fetchUserProfile();
    fetchRecentSubmissions();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/profile`,
        { withCredentials: true }
      );
      setUser(res.data);
      setEditForm({
        username: res.data.username,
        email: res.data.email
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch profile data");
      setLoading(false);
    }
  };

  const fetchRecentSubmissions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/submissions/recent`,
        { withCredentials: true }
      );
      setRecentSubmissions(res.data.slice(0, 5)); // Show only 5 recent submissions
    } catch (err) {
      console.error("Failed to fetch recent submissions:", err);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        username: user.username,
        email: user.email
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/profile`,
        editForm,
        { withCredentials: true }
      );
      setUser({ ...user, ...editForm });
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1 className="site-title">Online Judge</h1>
        <nav className="nav-links">
          <Link to="/home" className="nav-link">Home</Link>
          <Link to="/contests" className="nav-link">Contests</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <img 
                src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                alt="Profile Avatar" 
                className="profile-avatar"
              />
              <div className="profile-info">
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="edit-form">
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="edit-input"
                      placeholder="Username"
                      required
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="edit-input"
                      placeholder="Email"
                      required
                    />
                    <div className="edit-buttons">
                      <button type="submit" className="save-btn">Save</button>
                      <button type="button" onClick={handleEditToggle} className="cancel-btn">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="profile-username">{user.username}</h2>
                    <p className="profile-email">{user.email}</p>
                    <p className="profile-joined">Joined: {new Date(user.joinedDate).toLocaleDateString()}</p>
                    <button onClick={handleEditToggle} className="edit-profile-btn">Edit Profile</button>
                  </>
                )}
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{user.solvedProblems}</span>
                <span className="stat-label">Problems Solved</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.totalSubmissions}</span>
                <span className="stat-label">Total Submissions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">#{user.rank}</span>
                <span className="stat-label">Global Rank</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.contestsParticipated}</span>
                <span className="stat-label">Contests</span>
              </div>
            </div>
          </div>

          <div className="recent-submissions">
            <h3>Recent Submissions</h3>
            {recentSubmissions.length === 0 ? (
              <p className="no-submissions">No recent submissions found.</p>
            ) : (
              <div className="submissions-list">
                {recentSubmissions.map((submission, index) => (
                  <div key={submission._id || index} className="submission-item">
                    <div className="submission-info">
                      <h4 className="submission-problem">{submission.problemTitle}</h4>
                      <p className="submission-date">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`submission-status ${submission.status.toLowerCase()}`}>
                      {submission.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="profile-footer">
        <p>&copy; 2025 Online Judge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Profile;