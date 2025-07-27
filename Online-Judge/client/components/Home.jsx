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
  
  // New state for day-based problem solving
  const [targetDays, setTargetDays] = useState(30);
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [problemsPerDay, setProblemsPerDay] = useState(0);
  const [showDayPlan, setShowDayPlan] = useState(false);
  
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

    // Load saved plan settings
    const savedPlan = JSON.parse(localStorage.getItem('studyPlan') || '{}');
    if (savedPlan.targetDays) {
      setTargetDays(savedPlan.targetDays);
      setCurrentDay(savedPlan.currentDay || 1);
      setIsCustomPlan(savedPlan.isCustomPlan || false);
    }

    fetchProblems();
    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    // Calculate problems per day when problems or target days change
    if (problems.length > 0) {
      const remainingProblems = problems.length - stats.solvedProblems;
      const calculatedProblemsPerDay = Math.ceil(remainingProblems / targetDays);
      setProblemsPerDay(calculatedProblemsPerDay);
    }
  }, [problems.length, targetDays, stats.solvedProblems]);

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

  const handleCreatePlan = () => {
    const remainingProblems = problems.length - stats.solvedProblems;
    if (remainingProblems <= 0) {
      alert("Congratulations! You've solved all problems!");
      return;
    }
    
    if (targetDays <= 0) {
      alert("Please enter a valid number of days (greater than 0)");
      return;
    }

    const calculatedProblemsPerDay = Math.ceil(remainingProblems / targetDays);
    setProblemsPerDay(calculatedProblemsPerDay);
    setIsCustomPlan(true);
    setCurrentDay(1);
    setShowDayPlan(true);

    // Save plan to localStorage
    const studyPlan = {
      targetDays,
      currentDay: 1,
      isCustomPlan: true,
      startDate: new Date().toISOString(),
      problemsPerDay: calculatedProblemsPerDay
    };
    localStorage.setItem('studyPlan', JSON.stringify(studyPlan));
  };

  const handleNextDay = () => {
    if (currentDay < targetDays) {
      const newDay = currentDay + 1;
      setCurrentDay(newDay);
      
      // Update localStorage
      const savedPlan = JSON.parse(localStorage.getItem('studyPlan') || '{}');
      savedPlan.currentDay = newDay;
      localStorage.setItem('studyPlan', JSON.stringify(savedPlan));
    }
  };

  const handleResetPlan = () => {
    setIsCustomPlan(false);
    setCurrentDay(1);
    setShowDayPlan(false);
    localStorage.removeItem('studyPlan');
  };

  const getTodayProblems = () => {
    if (!isCustomPlan || !showDayPlan) return problems;
    
    const startIndex = (currentDay - 1) * problemsPerDay;
    const endIndex = startIndex + problemsPerDay;
    return problems.slice(startIndex, endIndex);
  };

  const filteredProblems = (showDayPlan && isCustomPlan ? getTodayProblems() : problems).filter(problem => {
    const matchesDifficulty = filterDifficulty === "all" || 
      problem.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDifficulty && matchesSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("studyPlan");
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
    <div>
      <header className="home-header">
        <h1 className="site-title">Rush2Code</h1>
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

        {/* Day-based Study Plan Section */}
        <div className="study-plan-section">
          <div className="plan-card">
            <h3 className="plan-title">📅 Create Your Study Plan</h3>
            
            {!isCustomPlan ? (
              <div className="plan-creator">
                <div className="plan-input-group">
                  <label htmlFor="target-days">Target Days:</label>
                  <input
                    id="target-days"
                    type="number"
                    min="1"
                    max="365"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="plan-input"
                  />
                </div>
                
                <div className="plan-preview">
                  <p className="plan-calculation">
                    📊 With <strong>{stats.totalProblems - stats.solvedProblems}</strong> remaining problems 
                    in <strong>{targetDays}</strong> days, you need to solve{' '}
                    <strong className="highlight">{Math.ceil((stats.totalProblems - stats.solvedProblems) / targetDays)}</strong> problems per day
                  </p>
                </div>
                
                <button onClick={handleCreatePlan} className="create-plan-btn">
                  🚀 Start Study Plan
                </button>
              </div>
            ) : (
              <div className="active-plan">
                <div className="plan-status">
                  <div className="plan-info">
                    <h4>📋 Active Study Plan</h4>
                    <div className="plan-details">
                      <span className="plan-detail">Day <strong>{currentDay}</strong> of <strong>{targetDays}</strong></span>
                      <span className="plan-detail"><strong>{problemsPerDay}</strong> problems per day</span>
                      <span className="plan-detail">Progress: <strong>{Math.round((currentDay / targetDays) * 100)}%</strong></span>
                    </div>
                  </div>
                  
                  <div className="plan-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(currentDay / targetDays) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="plan-actions">
                  <button 
                    onClick={() => setShowDayPlan(!showDayPlan)} 
                    className={`toggle-plan-btn ${showDayPlan ? 'active' : ''}`}
                  >
                    {showDayPlan ? '📚 View All Problems' : '🎯 View Today\'s Problems'}
                  </button>
                  
                  {currentDay < targetDays && showDayPlan && (
                    <button onClick={handleNextDay} className="next-day-btn">
                      ✅ Complete Day {currentDay}
                    </button>
                  )}
                  
                  <button onClick={handleResetPlan} className="reset-plan-btn">
                    🔄 Reset Plan
                  </button>
                </div>
              </div>
            )}
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
            <h2>
              {showDayPlan && isCustomPlan 
                ? `Day ${currentDay} Problems (${filteredProblems.length})` 
                : `Problems (${filteredProblems.length})`
              }
            </h2>
            {showDayPlan && isCustomPlan && (
              <p className="day-subtitle">
                🎯 Today's target: {problemsPerDay} problems
              </p>
            )}
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
              {filteredProblems.map((problem, index) => (
                <li key={problem._id} className="problem-item">
                  <Link to={`/problems/${problem._id}`} className="problem-link">
                    <div className="problem-header">
                      <h3 className="problem-title">
                        {showDayPlan && isCustomPlan && (
                          <span className="problem-number">#{index + 1} </span>
                        )}
                        {problem.title}
                      </h3>
                      <span className={`tag ${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <p className="problem-description">{problem.description}</p>
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="problem-tags">
                        {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="problem-tag">{tag}</span>
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
          <p>&copy; 2025 Rush2Code. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Home;