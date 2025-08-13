import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Vote, Trophy, Calendar } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [results, setResults] = useState({
    totalVotes: 0,
    totalVoters: 0,
    progress: 0,
    candidates: [],
    winner: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [totalVotesRes, totalVotersRes, candidatesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/votes/total`),
        fetch(`${API_BASE_URL}/voters/total`),
        fetch(`${API_BASE_URL}/candidates/results`)
      ]);

      if (!totalVotesRes.ok || !totalVotersRes.ok || !candidatesRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const totalVotes = await totalVotesRes.json();
      const totalVoters = await totalVotersRes.json();
      const candidates = await candidatesRes.json();

      const progress = totalVoters.count > 0 ? 
        (totalVotes.count / totalVoters.count) * 100 : 0;

      const processedCandidates = candidates.map(candidate => ({
        ...candidate,
        photo: candidate.photo ? 
          `data:image/jpeg;base64,${candidate.photo}` : 
          createPlaceholderImageData(),
        percentage: totalVotes.count > 0 ? 
          Math.round((candidate.votes / totalVotes.count) * 100 * 10) / 10 : 0
      }));

      const winner = processedCandidates.length > 0 ? 
        processedCandidates.reduce((prev, current) => 
          (prev.votes > current.votes) ? prev : current
        ) : null;

      setResults({
        totalVotes: totalVotes.count,
        totalVoters: totalVoters.count,
        progress: Math.round(progress),
        candidates: processedCandidates,
        winner: winner
      });

    } catch (err) {
      console.error('Error loading results:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPlaceholderImageData = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(0, 0, 150, 150);
    ctx.fillStyle = '#6B7280';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No Image', 75, 75);
    
    return canvas.toDataURL();
  };

  useEffect(() => {
    loadResults();
  }, []);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const StatCard = ({ icon, title, value, subtitle }) => (
    <div className="stat-card">
      <div className="stat-content">
        <div className="stat-info">
          <p className="stat-title">{title}</p>
          <p className="stat-value">{value}</p>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
        <div className="stat-icon">
          {icon}
        </div>
      </div>
    </div>
  );

  const CandidateCard = ({ candidate, rank }) => (
    <div className="candidate-card">
      <div className="candidate-content">
        <div className="candidate-photo-container">
          <img 
            src={candidate.photo} 
            alt={candidate.name}
            className="candidate-photo"
          />
          <div className="candidate-rank">
            {rank}
          </div>
        </div>
        <div className="candidate-details">
          <h3 className="candidate-name">{candidate.name}</h3>
          <p className="candidate-course">{candidate.course}</p>
          <div className="candidate-stats">
            <span className="candidate-votes">{candidate.votes}</span>
            <span className="votes-label">Votes</span>
            <span className="candidate-percentage">{candidate.percentage}%</span>
          </div>
        </div>
      </div>
      <div className="candidate-progress-container">
        <div className="candidate-progress-bar">
          <div 
            className="candidate-progress-fill"
            style={{ width: `${candidate.percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const WinnerCard = ({ winner }) => (
    <div className="winner-card">
      <div className="winner-header">
        <Trophy className="winner-trophy" />
        <h2 className="winner-title">Election Winner</h2>
      </div>
      {winner ? (
        <div className="winner-info">
          <img 
            src={winner.photo} 
            alt={winner.name}
            className="winner-photo"
          />
          <div className="winner-details">
            <h3 className="winner-name">{winner.name}</h3>
            <p className="winner-course">{winner.course}</p>
            <p className="winner-votes">{winner.votes} Votes</p>
          </div>
        </div>
      ) : (
        <p className="no-winner">No Winner Yet</p>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-info">
              <h1 className="header-title">Election System</h1>
              <p className="header-subtitle">Leadership Election Results</p>
            </div>
            <div className="header-actions">
              <div className="date-display">
                <Calendar className="date-icon" />
                <span>{formatDate()}</span>
              </div>
              <button
                onClick={loadResults}
                disabled={loading}
                className="refresh-button"
              >
                <RefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-card">
            <div className="error-content">
              <div className="error-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="error-details">
                <h3 className="error-title">Database Connection Error</h3>
                <p className="error-message">{error}</p>
                <p className="error-help">Please ensure your backend API is running and accessible.</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-card">
            <div className="loading-content">
              <RefreshCw className="loading-icon" />
              <span className="loading-text">Loading results...</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <StatCard
            icon={<Vote className="icon" />}
            title="Total Votes"
            value={results.totalVotes.toLocaleString()}
            subtitle="Votes cast"
          />
          <StatCard
            icon={<Users className="icon" />}
            title="Registered Voters"
            value={results.totalVoters.toLocaleString()}
            subtitle="Enrolled"
          />
          <StatCard
            icon={<Trophy className="icon" />}
            title="Election Progress"
            value={`${results.progress}%`}
            subtitle="of Voters Have Voted"
          />
        </div>

        {/* Progress Bar */}
        <div className="progress-card">
          <h2 className="progress-title">Election Progress</h2>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${results.progress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {results.progress}% of voters have voted ({results.totalVotes} out of {results.totalVoters})
          </p>
        </div>

        <div className="main-content">
          {/* Candidates Results */}
          <div className="candidates-section">
            <div className="candidates-card">
              <h2 className="candidates-title">Candidate Results</h2>
              <div className="candidates-list">
                {results.candidates.map((candidate, index) => (
                  <CandidateCard 
                    key={candidate.referenceNo || candidate.id} 
                    candidate={candidate} 
                    rank={index + 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Winner Section */}
          <div className="winner-section">
            <WinnerCard winner={results.winner} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
