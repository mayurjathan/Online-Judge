
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Home.css";

function Home() {
  const [problems, setProblems] = useState([]);
  const [user, setUser] = useState({
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    username: "Guest"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0
  });
  const navigate = useNavigate();

  
  const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  };

  useEffect(() => {
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Fetch data
    fetchProblems();
    fetchUserProfile();
  }, [navigate]);

  const fetchProblems = async () => {
    try {
      const baseURL = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:5050';
      const res = await axios.get(`${baseURL}/api/problems`);
      
      setProblems(res.data);
      
     
      const easyCount = res.data.filter(p => p.difficulty === "Easy").length;
      const mediumCount = res.data.filter(p => p.difficulty === "Medium").length;
      const hardCount = res.data.filter(p => p.difficulty === "Hard").length;
      
      setStats({
        totalProblems: res.data.length,
        solvedProblems: 0,
        easyCount,
        mediumCount,
        hardCount
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch problems:", err);
      setError("Failed to load problems. Please try again.");
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const baseURL = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:5050';
      const res = await axios.get(
        `${baseURL}/api/profile`,
        getAxiosConfig()
      );
      
      if (res.data) {
        setUser({
          avatar: res.data.avatar || user.avatar,
          username: res.data.username || res.data.name || user.username
        });
      }
      
      // Try to fetch user stats
      fetchUserStats();
    } catch (err) {
      console.log("Could not fetch profile, using guest profile");
      
    }
  };

  const fetchUserStats = async () => {
    try {
      const baseURL = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:5050';
      const res = await axios.get(
        `${baseURL}/api/user/stats`,
        getAxiosConfig()
      );
      
      setStats(prevStats => ({
        ...prevStats,
        solvedProblems: res.data.solvedProblems || 0
      }));
    } catch (err) {
      console.log("Could not fetch user stats");
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesDifficulty = filterDifficulty === "all" || 
      problem.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDifficulty && matchesSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div >
      <header className="home-header">
        <h1 className="site-title">Online Judge</h1>
        <nav className="nav-links">
          <Link to="/contests" className="nav-link">Contests</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          <Link to="/profile" className="profile-link">
            <img
              src={user.avatar}
              alt="Profile"
              className="profile-icon"
              title={user.username}
            />
          </Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </header>
     <div className="home-page">
      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stats-card">
          <div className="stat-item">
            <span className="stat-number">{stats.totalProblems}</span>
            <span className="stat-label">Total Problems</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.solvedProblems}</span>
            <span className="stat-label">Solved</span>
          </div>
          <div className="stat-item easy-stat">
            <span className="stat-number">{stats.easyCount}</span>
            <span className="stat-label">Easy</span>
          </div>
          <div className="stat-item medium-stat">
            <span className="stat-number">{stats.mediumCount}</span>
            <span className="stat-label">Medium</span>
          </div>
          <div className="stat-item hard-stat">
            <span className="stat-number">{stats.hardCount}</span>
            <span className="stat-label">Hard</span>
          </div>
        </div>
      </div>

      <main className="problem-section">
        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <label htmlFor="difficulty-filter">Filter by difficulty:</label>
            <select
              id="difficulty-filter"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Problems List */}
        <div className="problems-header">
          <h2>Problems ({filteredProblems.length})</h2>
        </div>

        {filteredProblems.length === 0 ? (
          <div className="no-problems">
            <p>No problems found. Please add some problems to get started.</p>
            {(searchTerm || filterDifficulty !== "all") && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setFilterDifficulty("all");
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <ul className="problem-list">
            {filteredProblems.map((problem) => (
              <li key={problem._id} className="problem-item">
                <Link to={`/problems/${problem._id}`} className="problem-link">
                  <div className="problem-header">
                    <h3 className="problem-title">{problem.title}</h3>
                    <span className={`tag ${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="problem-description">{problem.description}</p>
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="problem-tags">
                      {problem.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="problem-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 Online Judge. All rights reserved.</p>
      </footer>
    </div>
    </div>
  );
}

export default Home;