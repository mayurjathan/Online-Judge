import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Contests.css';

function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [currentUser, setCurrentUser] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
    fetchCurrentUser();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/contests`,
        { withCredentials: true }
      );
      
      if (response.data.contests) {
        setContests(response.data.contests);
      } else if (Array.isArray(response.data)) {
        setContests(response.data);
      } else {
        setContests([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError('Failed to fetch contests');
      setContests([]);
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
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const getContestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'live';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getDuration = (startTime, endTime) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationMs = end - start;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  const getTimeRemaining = (startTime) => {
    try {
      const now = new Date();
      const start = new Date(startTime);
      const diff = start - now;
      
      if (diff <= 0) return 'Started';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  const handleRegister = async (contestId) => {
    if (!currentUser) {
      alert('Please login to register for contests');
      return;
    }

    setRegistrationLoading(prev => ({ ...prev, [contestId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/contests/${contestId}/register`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );
      
      await fetchContests();
      alert('Successfully registered for the contest!');
    } catch (err) {
      console.error('Error registering for contest:', err);
      const errorMessage = err.response?.data?.error || 'Failed to register for contest';
      alert(errorMessage);
    } finally {
      setRegistrationLoading(prev => ({ ...prev, [contestId]: false }));
    }
  };

  const handleUnregister = async (contestId) => {
    if (!currentUser) return;

    setRegistrationLoading(prev => ({ ...prev, [contestId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/contests/${contestId}/unregister`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );
      
      await fetchContests();
      alert('Successfully unregistered from the contest!');
    } catch (err) {
      console.error('Error unregistering from contest:', err);
      const errorMessage = err.response?.data?.error || 'Failed to unregister from contest';
      alert(errorMessage);
    } finally {
      setRegistrationLoading(prev => ({ ...prev, [contestId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isUserRegistered = (contest) => {
    if (!currentUser || !contest.participants) return false;
    return contest.participants.some(p => 
      (typeof p === 'string' ? p : p._id) === currentUser._id
    );
  };

  const filteredContests = contests.filter(contest => {
    const status = contest.status || getContestStatus(contest.startTime, contest.endTime);
    return status === activeTab;
  });

  const getTabCounts = () => {
    const counts = {
      live: 0,
      upcoming: 0,
      past: 0
    };

    contests.forEach(contest => {
      const status = contest.status || getContestStatus(contest.startTime, contest.endTime);
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  };

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="contests-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading contests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contests-page">
      <header className="home-header">
        <h1 className="site-title">Rush2Code</h1>
        <nav className="nav-links">
          <Link to="/contests" className="nav-link active">Contests</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
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

      <main className="contests-main">
        <div className="contests-content">
          <h1 className="page-title">Contests</h1>
          
          <div className="contest-tabs">
            <button 
              className={`tab ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              Live ({tabCounts.live})
            </button>
            <button 
              className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({tabCounts.upcoming})
            </button>
            <button 
              className={`tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past ({tabCounts.past})
            </button>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchContests} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          <div className="contests-list">
            {filteredContests.length === 0 ? (
              <div className="no-contests">
                <h3>No {activeTab} contests</h3>
                <p>Check back later for new contests!</p>
              </div>
            ) : (
              filteredContests.map(contest => {
                const status = contest.status || getContestStatus(contest.startTime, contest.endTime);
                const isRegistered = isUserRegistered(contest);
                const isRegistering = registrationLoading[contest._id];
                
                return (
                  <div key={contest._id} className={`contest-card ${status}`}>
                    <div className="contest-card-header">
                      <h3>{contest.name || contest.title}</h3>
                      <span className={`status-badge ${status}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="contest-description">
                      {contest.description || 'No description available'}
                    </p>
                    
                    <div className="contest-info">
                      <div className="info-item">
                        <span className="label">Start:</span>
                        <span className="value">{formatDate(contest.startTime)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Duration:</span>
                        <span className="value">{getDuration(contest.startTime, contest.endTime)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Problems:</span>
                        <span className="value">{contest.problemCount || contest.problems?.length || 0}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Participants:</span>
                        <span className="value">{contest.participantCount || contest.participants?.length || 0}</span>
                      </div>
                    </div>

                    {status === 'upcoming' && (
                      <div className="time-remaining">
                        Starts in: {getTimeRemaining(contest.startTime)}
                      </div>
                    )}

                    {status === 'live' && (
                      <div className="contest-live-indicator">
                        🔴 Contest is currently running!
                      </div>
                    )}

                    <div className="contest-actions">
                      {status === 'live' && (
                        <>
                          {isRegistered ? (
                            <Link to={`/contest/${contest._id}`} className="btn btn-primary">
                              Join Contest
                            </Link>
                          ) : (
                            <span className="registration-required">
                              Registration required to participate
                            </span>
                          )}
                        </>
                      )}
                      
                      {status === 'upcoming' && (
                        <>
                          {isRegistered ? (
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleUnregister(contest._id)}
                              disabled={isRegistering}
                            >
                              {isRegistering ? 'Processing...' : 'Unregister'}
                            </button>
                          ) : (
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleRegister(contest._id)}
                              disabled={isRegistering}
                            >
                              {isRegistering ? 'Registering...' : 'Register'}
                            </button>
                          )}
                        </>
                      )}
                      
                      {status === 'past' && (
                        <Link to={`/contest/${contest._id}/leaderboard`} className="btn btn-secondary">
                          View Results
                        </Link>
                      )}
                      
                      <Link to={`/contest/${contest._id}/details`} className="btn btn-outline">
                        Details
                      </Link>
                    </div>

                    {isRegistered && (
                      <div className="registration-indicator">
                        You are registered for this contest
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Contests;