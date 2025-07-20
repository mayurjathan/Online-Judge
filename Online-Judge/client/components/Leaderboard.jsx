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
    fetchLeaderboard();
    fetchCurrentUser();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/leaderboard?period=${timeFilter}&limit=100`,
        { withCredentials: true }
      );
      
      if (response.data.users) {
        setLeaderboard(response.data.users);
      } else {
        setLeaderboard([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to fetch leaderboard');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/profile`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );
      
      setCurrentUser(response.data);
      
      if (response.data._id) {
        try {
          const rankResponse = await axios.get(
            `${import.meta.env.VITE_SERVER_BASE_URL}/api/leaderboard/user/${response.data._id}?period=${timeFilter}`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true 
            }
          );
          setCurrentUserRank(rankResponse.data.user);
        } catch (rankErr) {
          console.error('Error fetching user rank:', rankErr);
        }
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setCurrentUser(null);
      setCurrentUserRank(null);
    }
  };

  const handleLogout = () => {
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
    if (!currentUserRank) return 'Unranked';
    return currentUserRank.rank || 'Unranked';
  };

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
  };

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
         <Link to="/home" className="nav-link"><h1 className="site-title">Online Judge</h1></Link>
        <nav className="nav-links">
          <Link to="/contests" className="nav-link">Contests</Link>
          <Link to="/leaderboard" className="nav-link active">Leaderboard</Link>
          {currentUser && (
            <Link to="/profile" className="profile-link">
              <img
                src={currentUser.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                alt="Profile"
                className="profile-icon"
                title={currentUser.username || currentUser.name}
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

        {error && (
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
            </div>
          ) : (
            <>
              {leaderboard.length >= 3 && (
                <div className="podium">
                  {leaderboard[1] && (
                    <div className="podium-item second">
                      <div className="podium-user">
                        <img 
                          src={leaderboard[1].avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                          alt={leaderboard[1].username || leaderboard[1].name}
                          className="podium-avatar"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <h4>{leaderboard[1].username || leaderboard[1].name}</h4>
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
                          src={leaderboard[0].avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                          alt={leaderboard[0].username || leaderboard[0].name}
                          className="podium-avatar"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <h4>{leaderboard[0].username || leaderboard[0].name}</h4>
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
                          src={leaderboard[2].avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                          alt={leaderboard[2].username || leaderboard[2].name}
                          className="podium-avatar"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <h4>{leaderboard[2].username || leaderboard[2].name}</h4>
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
                      key={user._id} 
                      className={`table-row ${
                        currentUser?._id === user._id ? 'current-user' : ''
                      } ${index < 3 ? 'top-three' : ''}`}
                    >
                      <div className="col-rank">
                        <span className="rank-display">{getRankIcon(user.rank || index + 1)}</span>
                      </div>
                      <div className="col-user">
                        <img 
                          src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                          alt={user.username || user.name}
                          className="user-avatar"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                          }}
                        />
                        <div className="user-info">
                          <span className="username">{user.username || user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                      <div className="col-score">
                        <span className="score">{formatScore(user.totalScore)}</span>
                        <span className="score-label">points</span>
                      </div>
                      <div className="col-solved">
                        <span className="solved-count">
                          {user.solvedProblemsCount || user.solvedProblems || 0}
                        </span>
                        <span className="solved-label">problems</span>
                      </div>
                      <div className="col-accuracy">
                        <span className="accuracy-percent">
                          {user.accuracy || 
                           (user.totalSubmissions > 0 ? 
                            Math.round(((user.solvedProblemsCount || user.solvedProblems || 0) / user.totalSubmissions) * 100) : 0)}%
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