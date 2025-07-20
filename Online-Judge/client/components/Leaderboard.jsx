import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Leaderboard.css';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeLeaderboard = async () => {
      // Check authentication first
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      await fetchCurrentUser();
      await fetchLeaderboard();
    };

    initializeLeaderboard();
  }, [timeFilter, navigate]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      console.log('Fetching leaderboard with filter:', timeFilter);

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/leaderboard`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            period: timeFilter,
            limit: 100
          },
          timeout: 10000
        }
      );
      
      console.log('Leaderboard response:', response.data);

      // Handle different response formats
      let users = [];
      if (Array.isArray(response.data)) {
        users = response.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        users = response.data.users;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        users = response.data.data;
      } else if (response.data.leaderboard && Array.isArray(response.data.leaderboard)) {
        users = response.data.leaderboard;
      }

      // Process and normalize user data
      const processedUsers = users.map((user, index) => {
        // Prioritize name/username over email for display
        let displayName = 'Anonymous';
        if (user.name && user.name !== user.email) {
          displayName = user.name;
        } else if (user.username && user.username !== user.email) {
          displayName = user.username;
        } else if (user.email) {
          // Extract username from email if no other name available
          displayName = user.email.split('@')[0];
        }

        return {
          _id: user._id || user.id,
          username: displayName,
          name: displayName,
          email: user.email || '',
          avatar: user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          totalScore: user.totalScore || user.score || 0,
          solvedProblems: Array.isArray(user.solvedProblems) ? user.solvedProblems.length : (user.solvedProblems || user.solvedProblemsCount || 0),
          solvedProblemsCount: Array.isArray(user.solvedProblems) ? user.solvedProblems.length : (user.solvedProblems || user.solvedProblemsCount || 0),
          totalSubmissions: user.totalSubmissions || user.submissions || 0,
          rank: user.rank || (index + 1),
          accuracy: user.accuracy || (user.totalSubmissions > 0 ? 
            Math.round(((Array.isArray(user.solvedProblems) ? user.solvedProblems.length : (user.solvedProblems || 0)) / user.totalSubmissions) * 100) : 0)
        };
      });

      setLeaderboard(processedUsers);
      
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to fetch leaderboard. Please try again.');
      }
      
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching current user profile...');

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/profile`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('Current user response:', response.data);

      // Normalize user data
      let displayName = 'Anonymous';
      if (response.data.name && response.data.name !== response.data.email) {
        displayName = response.data.name;
      } else if (response.data.username && response.data.username !== response.data.email) {
        displayName = response.data.username;
      } else if (response.data.email) {
        // Extract username from email if no other name available
        displayName = response.data.email.split('@')[0];
      }

      const userData = {
        _id: response.data._id || response.data.id,
        username: displayName,
        name: displayName,
        email: response.data.email || '',
        avatar: response.data.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        totalScore: response.data.totalScore || 0,
        solvedProblems: Array.isArray(response.data.solvedProblems) ? response.data.solvedProblems.length : (response.data.solvedProblems || 0),
        totalSubmissions: response.data.totalSubmissions || 0
      };

      setCurrentUser(userData);
      
      // Try to fetch user's rank (this endpoint might not exist)
      if (userData._id) {
        try {
          const rankResponse = await axios.get(
            `${import.meta.env.VITE_SERVER_BASE_URL}/api/leaderboard/user/${userData._id}`,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              params: { period: timeFilter },
              timeout: 5000
            }
          );
          
          if (rankResponse.data) {
            setCurrentUserRank(rankResponse.data.user || rankResponse.data);
          }
        } catch (rankErr) {
          console.warn('User rank endpoint not available:', rankErr.message);
          // This is optional, so don't throw error
        }
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      
      // Don't set error for user profile issues, just log them
      setCurrentUser(null);
      setCurrentUserRank(null);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatScore = (score) => {
    return score?.toLocaleString() || 0;
  };

  const getCurrentUserRankDisplay = () => {
    if (!currentUser) return 'Not logged in';
    
    // Try to find current user in leaderboard
    const userInLeaderboard = leaderboard.find(user => user._id === currentUser._id);
    if (userInLeaderboard) {
      return `#${userInLeaderboard.rank}`;
    }
    
    if (currentUserRank?.rank) {
      return `#${currentUserRank.rank}`;
    }
    
    return 'Unranked';
  };

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
  };

  // Show error if loading failed
  if (error && loading) {
    return (
      <div className="leaderboard-page">
        <header className="home-header">
          <Link to="/home" className="nav-link"><h1 className="site-title">Rush2Code</h1></Link>
          <nav className="nav-links">
            <Link to="/contests" className="nav-link">Contests</Link>
            <Link to="/leaderboard" className="nav-link active">Leaderboard</Link>
            {currentUser && (
              <Link to="/profile" className="profile-link">
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="profile-icon"
                  title={currentUser.username}
                />
              </Link>
            )}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </nav>
        </header>
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchLeaderboard} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <header className="home-header">
        <Link to="/home" className="nav-link"><h1 className="site-title">Rush2Code</h1></Link>
        <nav className="nav-links">
          <Link to="/contests" className="nav-link">Contests</Link>
          <Link to="/leaderboard" className="nav-link active">Leaderboard</Link>
          {currentUser && (
            <Link to="/profile" className="profile-link">
              <img
                src={currentUser.avatar}
                alt="Profile"
                className="profile-icon"
                title={currentUser.username}
                onError={(e) => {
                  e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                }}
              />
            </Link>
          )}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </header>

      <main className="leaderboard-main">
        <div className="filter-section">
          <h2>Rankings</h2>
          <div className="time-filters">
            <button 
              className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('all')}
            >
              All Time
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('month')}
            >
              This Month
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => handleTimeFilterChange('week')}
            >
              This Week
            </button>
          </div>
        </div>

        {error && !loading && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchLeaderboard} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {currentUser && (
          <div className="user-rank-card">
            <div className="rank-info">
              <span className="user-rank">
                Your Rank: {getCurrentUserRankDisplay()}
              </span>
              <span className="user-score">
                Score: {formatScore(currentUserRank?.totalScore || currentUser.totalScore)}
              </span>
            </div>
            <div className="user-stats">
              <div className="stat">
                <span className="stat-label">Solved</span>
                <span className="stat-value">
                  {currentUserRank?.solvedProblems || currentUser.solvedProblems || 0}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Submissions</span>
                <span className="stat-value">
                  {currentUserRank?.totalSubmissions || currentUser.totalSubmissions || 0}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">
                  {currentUserRank?.accuracy || 
                   (currentUser.totalSubmissions > 0 ? 
                    Math.round((currentUser.solvedProblems / currentUser.totalSubmissions) * 100) : 0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="leaderboard-container">
          {leaderboard.length === 0 ? (
            <div className="no-data">
              <h3>No rankings available</h3>
              <p>Be the first to solve problems and climb the leaderboard!</p>
              <Link to="/home" className="cta-link">Start solving problems!</Link>
            </div>
          ) : (
            <>
              {leaderboard.length >= 3 && (
                <div className="podium">
                  {leaderboard[1] && (
                    <div className="podium-item second">
                      <div className="podium-user">
                        <img 
                          src={leaderboard[1].avatar} 
                          alt={leaderboard[1].username}
                          className="podium-avatar"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <h4>{leaderboard[1].username}</h4>
                        <span className="podium-score">
                          {formatScore(leaderboard[1].totalScore)} pts
                        </span>
                      </div>
                      <div className="podium-rank">🥈</div>
                    </div>
                  )}

                  {leaderboard[0] && (
                    <div className="podium-item first">
                      <div className="podium-user">
                        <img 
                          src={leaderboard[0].avatar} 
                          alt={leaderboard[0].username}
                          className="podium-avatar"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <h4>{leaderboard[0].username}</h4>
                        <span className="podium-score">
                          {formatScore(leaderboard[0].totalScore)} pts
                        </span>
                      </div>
                      <div className="podium-rank">🥇</div>
                      <div className="crown">👑</div>
                    </div>
                  )}

                  {leaderboard[2] && (
                    <div className="podium-item third">
                      <div className="podium-user">
                        <img 
                          src={leaderboard[2].avatar} 
                          alt={leaderboard[2].username}
                          className="podium-avatar"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <h4>{leaderboard[2].username}</h4>
                        <span className="podium-score">
                          {formatScore(leaderboard[2].totalScore)} pts
                        </span>
                      </div>
                      <div className="podium-rank">🥉</div>
                    </div>
                  )}
                </div>
              )}

              <div className="rankings-table">
                <div className="table-header">
                  <div className="col-rank">Rank</div>
                  <div className="col-user">User</div>
                  <div className="col-score">Score</div>
                  <div className="col-solved">Solved</div>
                  <div className="col-accuracy">Accuracy</div>
                </div>

                <div className="table-body">
                  {leaderboard.map((user, index) => (
                    <div 
                      key={user._id || index} 
                      className={`table-row ${
                        currentUser?._id === user._id ? 'current-user' : ''
                      } ${index < 3 ? 'top-three' : ''}`}
                    >
                      <div className="col-rank">
                        <span className="rank-display">{getRankIcon(user.rank)}</span>
                      </div>
                      <div className="col-user">
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="user-avatar"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <div className="user-info">
                          <span className="username">{user.username}</span>
                        </div>
                      </div>
                      <div className="col-score">
                        <span className="score">{formatScore(user.totalScore)}</span>
                        <span className="score-label">points</span>
                      </div>
                      <div className="col-solved">
                        <span className="solved-count">
                          {user.solvedProblemsCount}
                        </span>
                        <span className="solved-label">problems</span>
                      </div>
                      <div className="col-accuracy">
                        <span className="accuracy-percent">
                          {user.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {leaderboard.length >= 100 && (
                <div className="pagination-info">
                  <p>Showing top 100 users. More ranking features coming soon!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Leaderboard;