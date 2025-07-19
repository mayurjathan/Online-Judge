import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles/Contests.css';

function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/contests`,
        { withCredentials: true }
      );
      setContests(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch contests');
      setLoading(false);
      console.error('Error fetching contests:', err);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTimeRemaining = (startTime) => {
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
  };

  const filteredContests = contests.filter(contest => {
    const status = getContestStatus(contest.startTime, contest.endTime);
    return status === activeTab;
  });

  if (loading) {
    return (
      <div className="contests-page">
        <div className="loading">Loading contests...</div>
      </div>
    );
  }

  return (
    <div className="contests-page">
      <header className="contests-header">
        <div className="header-content">
          <Link to="/home" className="back-btn">← Back to Home</Link>
          <h1>Contests</h1>
        </div>
      </header>

      <main className="contests-main">
        <div className="contest-tabs">
          <button 
            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live ({contests.filter(c => getContestStatus(c.startTime, c.endTime) === 'live').length})
          </button>
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({contests.filter(c => getContestStatus(c.startTime, c.endTime) === 'upcoming').length})
          </button>
          <button 
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past ({contests.filter(c => getContestStatus(c.startTime, c.endTime) === 'past').length})
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="contests-list">
          {filteredContests.length === 0 ? (
            <div className="no-contests">
              <h3>No {activeTab} contests</h3>
              <p>Check back later for new contests!</p>
            </div>
          ) : (
            filteredContests.map(contest => {
              const status = getContestStatus(contest.startTime, contest.endTime);
              return (
                <div key={contest._id} className={`contest-card ${status}`}>
                  <div className="contest-header">
                    <h3>{contest.title}</h3>
                    <span className={`status-badge ${status}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="contest-description">{contest.description}</p>
                  
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
                      <span className="value">{contest.problems?.length || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Participants:</span>
                      <span className="value">{contest.participants?.length || 0}</span>
                    </div>
                  </div>

                  {status === 'upcoming' && (
                    <div className="time-remaining">
                      Starts in: {getTimeRemaining(contest.startTime)}
                    </div>
                  )}

                  <div className="contest-actions">
                    {status === 'live' && (
                      <Link to={`/contest/${contest._id}`} className="btn btn-primary">
                        Join Contest
                      </Link>
                    )}
                    {status === 'upcoming' && (
                      <button className="btn btn-secondary">
                        Register
                      </button>
                    )}
                    {status === 'past' && (
                      <Link to={`/contest/${contest._id}/results`} className="btn btn-secondary">
                        View Results
                      </Link>
                    )}
                    <Link to={`/contest/${contest._id}/details`} className="btn btn-outline">
                      Details
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Contests;