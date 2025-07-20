import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    joinedDate: "",
    solvedProblems: 0,
    totalSubmissions: 0,
    rank: 0,
    contestsParticipated: 0,
    totalScore: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [contestHistory, setContestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    avatar: ""
  });
  const [activeTab, setActiveTab] = useState("submissions");

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/");
          return;
        }

        console.log("Token found, fetching profile data");
        await fetchUserProfile();
        await fetchRecentSubmissions();
        await fetchContestHistory();
      } catch (error) {
        console.error("Error initializing profile:", error);
        setError("Failed to load profile data");
        setLoading(false);
      }
    };

    initializeProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
  try {
    console.log("Fetching user profile...");
    const token = localStorage.getItem("token");
    
    const res = await axios.get(
      `${import.meta.env.VITE_SERVER_BASE_URL}/api/profile`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log("Profile data received:", res.data);

    // Fix the field mapping based on actual API response
    const userData = {
      username: res.data.name || res.data.username || "Anonymous", // Backend uses 'name'
      email: res.data.email || "",
      avatar: res.data.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      joinedDate: res.data.createdAt || res.data.joinedDate || "", // Backend uses 'createdAt'
      solvedProblems: res.data.solvedProblems?.length || res.data.solvedProblems || 0, // Handle if it's an array
      totalSubmissions: res.data.totalSubmissions || 0,
      rank: res.data.rank || 0,
      contestsParticipated: res.data.contestsParticipated?.length || res.data.contestsParticipated || 0,
      totalScore: res.data.totalScore || 0
    };

    setUser(userData);
    setEditForm({
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar
    });
    setError("");
    
  } catch (err) {
    console.error("Failed to fetch profile data:", err);
    
    if (err.response?.status === 401) {
      console.log("Unauthorized, removing token and redirecting");
      localStorage.removeItem("token");
      navigate("/");
      return;
    }
    
    if (err.code === 'ECONNABORTED') {
      setError("Request timeout. Please check your connection.");
    } else if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError("Failed to fetch profile data. Please try refreshing the page.");
    }
  } finally {
    setLoading(false);
  }
};

 const fetchRecentSubmissions = async () => {
  try {
    console.log("Fetching recent submissions...");
    const token = localStorage.getItem("token");
    
    const res = await axios.get(
      `${import.meta.env.VITE_SERVER_BASE_URL}/api/submissions/recent`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log("Recent submissions received:", res.data);
    
    // Handle different response formats
    let submissions = [];
    if (Array.isArray(res.data)) {
      submissions = res.data;
    } else if (res.data.submissions && Array.isArray(res.data.submissions)) {
      submissions = res.data.submissions;
    } else if (res.data.data && Array.isArray(res.data.data)) {
      submissions = res.data.data;
    }
    
    setRecentSubmissions(submissions.slice(0, 10));
    
  } catch (err) {
    console.error("Failed to fetch recent submissions:", err);
    // Don't set error for optional data, but log it
    setRecentSubmissions([]); // Set empty array as fallback
  }
};

  const fetchContestHistory = async () => {
    try {
      console.log("Fetching contest history...");
      const token = localStorage.getItem("token");
      
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/contests/user/history`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log("Contest history received:", res.data);
      setContestHistory(res.data.contests || []);
      
    } catch (err) {
      console.error("Failed to fetch contest history:", err);
      // Don't set error for optional data
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        username: user.username,
        email: user.email,
        avatar: user.avatar
      });
    }
    setError("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Saving profile changes...");
      const token = localStorage.getItem("token");
      
      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/profile`,
        editForm,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log("Profile updated successfully");
      
      setUser({
        ...user,
        username: editForm.username,
        email: editForm.email,
        avatar: editForm.avatar
      });
      setIsEditing(false);
      
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'success';
      case 'wrong answer': return 'error';
      case 'time limit exceeded': return 'warning';
      case 'memory limit exceeded': return 'warning';
      case 'runtime error': return 'error';
      case 'compilation error': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateAccuracy = () => {
    if (user.totalSubmissions === 0) return 0;
    return Math.round((user.solvedProblems / user.totalSubmissions) * 100);
  };

  // Error boundary fallback
  if (error && loading) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1 className="site-title">Rush2Code</h1>
        <nav className="nav-links">
          <Link to="/home" className="nav-link">Home</Link>
          <Link to="/contests" className="nav-link">Contests</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <img 
                src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                alt="Profile Avatar" 
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                }}
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
                      minLength={3}
                      maxLength={50}
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="edit-input"
                      placeholder="Email"
                      required
                    />
                    <input
                      type="url"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                      className="edit-input"
                      placeholder="Avatar URL (optional)"
                    />
                    <div className="edit-buttons">
                      <button type="submit" className="save-btn">Save</button>
                      <button type="button" onClick={handleEditToggle} className="cancel-btn">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="profile-username">{user.username || 'Anonymous'}</h2>
                    <p className="profile-email">{user.email || 'No email'}</p>
                    <p className="profile-joined">
                      Joined: {formatDate(user.joinedDate)}
                    </p>
                    <button onClick={handleEditToggle} className="edit-profile-btn">
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="error-message">
                <p className="error-msg">{error}</p>
                <button onClick={() => setError("")} className="close-error">×</button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{user.solvedProblems || 0}</span>
                <span className="stat-label">Problems Solved</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.totalSubmissions || 0}</span>
                <span className="stat-label">Total Submissions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">#{user.rank || 'Unranked'}</span>
                <span className="stat-label">Global Rank</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.totalScore || 0}</span>
                <span className="stat-label">Total Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{calculateAccuracy()}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{contestHistory.length}</span>
                <span className="stat-label">Contests</span>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="profile-activity">
            <div className="activity-tabs">
              <button 
                className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
                onClick={() => setActiveTab('submissions')}
              >
                Recent Submissions ({recentSubmissions.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'contests' ? 'active' : ''}`}
                onClick={() => setActiveTab('contests')}
              >
                Contest History ({contestHistory.length})
              </button>
            </div>

            <div className="activity-content">
              {activeTab === 'submissions' && (
                <div className="recent-submissions">
                  {recentSubmissions.length === 0 ? (
                    <div className="no-data">
                      <p>No recent submissions found.</p>
                      <Link to="/home" className="cta-link">Start solving problems!</Link>
                    </div>
                  ) : (
                    <div className="submissions-list">
                      {recentSubmissions.map((submission, index) => (
                        <div key={submission._id || index} className="submission-item">
                          <div className="submission-info">
                            <h4 className="submission-problem">
                              {submission.problemTitle || 'Unknown Problem'}
                            </h4>
                            <p className="submission-date">
                              {formatDateTime(submission.createdAt)}
                            </p>
                            <p className="submission-language">
                              {submission.language?.toUpperCase() || 'N/A'}
                            </p>
                          </div>
                          <div className="submission-results">
                            <span className={`submission-status ${getStatusColor(submission.status)}`}>
                              {submission.status || 'Unknown'}
                            </span>
                            {submission.runtime && (
                              <span className="submission-runtime">{submission.runtime}</span>
                            )}
                            {submission.testCasesPassed && submission.totalTestCases && (
                              <span className="submission-tests">
                                {submission.testCasesPassed}/{submission.totalTestCases} tests
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contests' && (
                <div className="contest-history">
                  {contestHistory.length === 0 ? (
                    <div className="no-data">
                      <p>No contest participation history.</p>
                      <Link to="/contests" className="cta-link">Join your first contest!</Link>
                    </div>
                  ) : (
                    <div className="contests-list">
                      {contestHistory.map((contest, index) => (
                        <div key={contest._id || index} className="contest-item">
                          <div className="contest-info">
                            <h4 className="contest-name">
                              <Link to={`/contest/${contest._id}/details`}>
                                {contest.name || 'Unknown Contest'}
                              </Link>
                            </h4>
                            <p className="contest-date">
                              {formatDateTime(contest.startTime)}
                            </p>
                            <span className={`contest-status ${contest.status}`}>
                              {contest.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </div>
                          {contest.userStats && (
                            <div className="contest-performance">
                              <span className="problems-solved">
                                {contest.userStats.problemsSolved}/{contest.userStats.problems} solved
                              </span>
                              <span className="submissions-count">
                                {contest.userStats.totalSubmissions} submissions
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="profile-footer">
        <p>&copy; 2025 Rush2Code. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Profile;