import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles/Leaderboard.css';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); 
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchCurrentUser();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/leaderboard?period=${timeFilter}`,
        { withCredentials: true }
      );
      setLeaderboard(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leaderboard');
      setLoading(false);
      console.error('Error fetching leaderboard:', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/profile`,
        { withCredentials: true }
      );
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
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

  const getCurrentUserRank = () => {
    if (!currentUser) return null;
    const userIndex = leaderboard.findIndex(user => user._id === currentUser._id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <div className="header-content">
          <Link to="/home" className="back-btn">← Back to Home</Link>
          <h1>🏆 Leaderboard</h1>
        </div>
      </header>

      <main className="leaderboard-main">
        <div className="filter-section">
          <h2>Rankings</h2>
          <div className="time-filters">
            <button 
              className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              All Time
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
              onClick={() => setTimeFilter('month')}
            >
              This Month
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => setTimeFilter('week')}
            >
              This Week
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {currentUser && (
          <div className="user-rank-card">
            <div className="rank-info">
              <span className="user-rank">Your Rank: {getCurrentUserRank() || 'Unranked'}</span>
              <span className="user-score">Score: {formatScore(currentUser.totalScore)}</span>
            </div>
            <div className="user-stats">
              <div className="stat">
                <span className="stat-label">Solved</span>
                <span className="stat-value">{currentUser.solvedProblems?.length || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Submissions</span>
                <span className="stat-value">{currentUser.totalSubmissions || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">
                  {currentUser.totalSubmissions ? 
                    Math.round((currentUser.solvedProblems?.length || 0) / currentUser.totalSubmissions * 100) : 0}%
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
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div className="podium">
                  {/* Second Place */}
                  <div className="podium-item second">
                    <div className="podium-user">
                      <img 
                        src={leaderboard[1].avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                        alt={leaderboard[1].username}
                        className="podium-avatar"
                      />
                      <h4>{leaderboard[1].username}</h4>
                      <span className="podium-score">{formatScore(leaderboard[1].totalScore)} pts</span>
                    </div>
                    <div className="podium-rank">🥈</div>
                  </div>

                  {/* First Place */}
                  <div className="podium-item first">
                    <div className="podium-user">
                      <img 
                        src={leaderboard[0].avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                        alt={leaderboard[0].username}
                        className="podium-avatar"
                      />
                      <h4>{leaderboard[0].username}</h4>
                      <span className="podium-score">{formatScore(leaderboard[0].totalScore)} pts</span>
                    </div>
                    <div className="podium-rank">🥇</div>
                    <div className="crown">👑</div>
                  </div>

                  {/* Third Place */}
                  <div className="podium-item third">
                    <div className="podium-user">
                      <img 
                        src={leaderboard[2].avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                        alt={leaderboard[2].username}
                        className="podium-avatar"
                      />
                      <h4>{leaderboard[2].username}</h4>
                      <span className="podium-score">{formatScore(leaderboard[2].totalScore)} pts</span>
                    </div>
                    <div className="podium-rank">🥉</div>
                  </div>
                </div>
              )}

              {/* Full Rankings Table */}
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
                      className={`table-row ${currentUser?._id === user._id ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''}`}
                    >
                      <div className="col-rank">
                        <span className="rank-display">{getRankIcon(index + 1)}</span>
                      </div>
                      <div className="col-user">
                        <img 
                          src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                          alt={user.username}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <span className="username">{user.username}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                      <div className="col-score">
                        <span className="score">{formatScore(user.totalScore)}</span>
                        <span className="score-label">points</span>
                      </div>
                      <div className="col-solved">
                        <span className="solved-count">{user.solvedProblems?.length || 0}</span>
                        <span className="solved-label">problems</span>
                      </div>
                      <div className="col-accuracy">
                        <span className="accuracy-percent">
                          {user.totalSubmissions ? 
                            Math.round((user.solvedProblems?.length || 0) / user.totalSubmissions * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Leaderboard;