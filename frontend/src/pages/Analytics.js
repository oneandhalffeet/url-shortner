import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDate, formatNumber, copyToClipboard } from '../utils/validation';
import { validateShortUrl } from '../utils/validation';
import apiService from '../services/api';

const Analytics = () => {
  const { shortUrl } = useParams();
  const [urlData, setUrlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shortUrl) {
      fetchAnalytics();
    } else {
      setError('No short URL provided');
      setLoading(false);
    }
  }, [shortUrl]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    // Validate short URL format
    const validation = validateShortUrl(shortUrl);
    if (!validation.isValid) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.getUrlAnalytics(shortUrl);
      
      if (response.success) {
        setUrlData(response.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      if (err.message.includes('404') || err.message.includes('Not Found')) {
        setError('Short URL not found. Please check the URL and try again.');
      } else {
        setError(err.message || 'Failed to fetch analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getClicksGrowthMessage = () => {
    if (!urlData || urlData.clickCount === 0) {
      return "No clicks yet - share your link to get started!";
    }
    
    const daysSinceCreated = Math.max(1, Math.floor((new Date() - new Date(urlData.createdAt)) / (1000 * 60 * 60 * 24)));
    const avgClicksPerDay = (urlData.clickCount / daysSinceCreated).toFixed(1);
    
    return `Averaging ${avgClicksPerDay} clicks per day`;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Loading analytics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Analytics Not Available</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={fetchAnalytics} className="retry-btn">
                Try Again
              </button>
              <Link to="/" className="home-btn">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!urlData) {
    return (
      <div className="analytics-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">🔍</div>
            <h2>No Data Found</h2>
            <p>Unable to retrieve analytics for this URL.</p>
            <Link to="/" className="home-btn">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="container">
        <header className="page-header">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Analytics</span>
          </div>
          <h1>URL Analytics</h1>
          <p className="page-subtitle">
            Detailed insights for your shortened URL
          </p>
        </header>

        <div className="analytics-content">
          {/* URL Information Card */}
          <div className="analytics-card url-info-card">
            <h2>URL Information</h2>
            
            <div className="url-details">
              <div className="url-section">
                <label>Short URL</label>
                <div className="url-display">
                  <a
                    href={apiService.getRedirectUrl(urlData.shortUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="short-url-link"
                  >
                    {apiService.getRedirectUrl(urlData.shortUrl)}
                  </a>
                  <button
                    onClick={() => handleCopy(apiService.getRedirectUrl(urlData.shortUrl))}
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    title="Copy to clipboard"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="url-section">
                <label>Original URL</label>
                <div className="original-url">
                  <a
                    href={urlData.longUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="original-url-link"
                    title={urlData.longUrl}
                  >
                    {urlData.longUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">👆</div>
              <div className="stat-content">
                <div className="stat-number">{formatNumber(urlData.clickCount)}</div>
                <div className="stat-label">Total Clicks</div>
                <div className="stat-sublabel">{getClicksGrowthMessage()}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-number">
                  {Math.floor((new Date() - new Date(urlData.createdAt)) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="stat-label">Days Active</div>
                <div className="stat-sublabel">Since {formatDate(urlData.createdAt)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-number">
                  {urlData.clickCount > 0 ? 
                    (urlData.clickCount / Math.max(1, Math.floor((new Date() - new Date(urlData.createdAt)) / (1000 * 60 * 60 * 24)))).toFixed(1) 
                    : '0'
                  }
                </div>
                <div className="stat-label">Avg. Daily Clicks</div>
                <div className="stat-sublabel">Performance metric</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-content">
                <div className="stat-number">
                  {urlData.updatedAt ? formatDate(urlData.updatedAt) : 'Never'}
                </div>
                <div className="stat-label">Last Activity</div>
                <div className="stat-sublabel">Most recent click</div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="analytics-card insights-card">
            <h2>Performance Insights</h2>
            
            <div className="insights-content">
              {urlData.clickCount === 0 ? (
                <div className="no-clicks">
                  <div className="no-clicks-icon">📈</div>
                  <h3>Ready for Action!</h3>
                  <p>Your shortened URL is ready to go. Share it to start tracking clicks and gathering insights.</p>
                  <div className="share-suggestions">
                    <h4>Share your link on:</h4>
                    <div className="share-buttons">
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(apiService.getRedirectUrl(urlData.shortUrl))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-btn twitter"
                      >
                        Twitter
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(apiService.getRedirectUrl(urlData.shortUrl))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-btn facebook"
                      >
                        Facebook
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(apiService.getRedirectUrl(urlData.shortUrl))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-btn linkedin"
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="performance-metrics">
                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">Click-through Performance</span>
                      <div className="metric-bar">
                        <div 
                          className="metric-fill"
                          style={{ 
                            width: `${Math.min(100, (urlData.clickCount / Math.max(urlData.clickCount, 100)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="metric-value">
                        {urlData.clickCount >= 100 ? 'Excellent' : 
                         urlData.clickCount >= 50 ? 'Good' : 
                         urlData.clickCount >= 10 ? 'Moderate' : 'Getting Started'}
                      </span>
                    </div>
                  </div>

                  <div className="insights-tips">
                    <h4>💡 Optimization Tips</h4>
                    <ul>
                      {urlData.clickCount < 10 && (
                        <li>Consider sharing your link on more platforms to increase visibility</li>
                      )}
                      {urlData.clickCount >= 10 && (
                        <li>Great engagement! Your link is getting good traction</li>
                      )}
                      {urlData.clickCount >= 50 && (
                        <li>Excellent performance! Consider A/B testing different contexts</li>
                      )}
                      <li>Share at optimal times when your audience is most active</li>
                      <li>Use compelling descriptions when sharing your link</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="analytics-card actions-card">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button
                onClick={() => handleCopy(apiService.getRedirectUrl(urlData.shortUrl))}
                className="action-btn primary"
              >
                <span className="action-icon">📋</span>
                <span>Copy Short URL</span>
              </button>
              
              <a
                href={apiService.getRedirectUrl(urlData.shortUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
              >
                <span className="action-icon">🔗</span>
                <span>Visit URL</span>
              </a>
              
              <a
                href={urlData.longUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
              >
                <span className="action-icon">🌐</span>
                <span>Visit Original</span>
              </a>
              
              <button
                onClick={fetchAnalytics}
                className="action-btn"
              >
                <span className="action-icon">🔄</span>
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 20px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: #6b7280;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-state .error-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .error-state h2 {
          color: #1f2937;
          margin: 0 0 12px 0;
          font-size: 1.75rem;
        }

        .error-state p {
          color: #6b7280;
          margin: 0 0 24px 0;
          font-size: 1.1rem;
        }

        .error-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .retry-btn, .home-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-btn {
          background: #3b82f6;
          color: white;
        }

        .retry-btn:hover {
          background: #2563eb;
        }

        .home-btn {
          background: #6b7280;
          color: white;
          display: inline-block;
        }

        .home-btn:hover {
          background: #4b5563;
          text-decoration: none;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .breadcrumb-link {
          color: #3b82f6;
          text-decoration: none;
        }

        .breadcrumb-link:hover {
          text-decoration: underline;
        }

        .breadcrumb-separator {
          color: #9ca3af;
        }

        .breadcrumb-current {
          color: #6b7280;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 1.1rem;
          margin: 0;
        }

        .analytics-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analytics-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        .analytics-card h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 20px 0;
        }

        .url-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .url-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .url-section label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .url-display {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .short-url-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          word-break: break-all;
        }

        .short-url-link:hover {
          text-decoration: underline;
        }

        .copy-btn {
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .copy-btn:hover {
          background: #e5e7eb;
        }

        .copy-btn.copied {
          background: #dcfce7;
          color: #16a34a;
        }

        .original-url {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 16px;
        }

        .original-url-link {
          color: #6b7280;
          text-decoration: none;
          word-break: break-all;
          font-size: 14px;
        }

        .original-url-link:hover {
          color: #374151;
          text-decoration: underline;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #d1d5db;
        }

        .stat-card.primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-color: #3b82f6;
        }

        .stat-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .stat-label {
          font-weight: 600;
          margin-bottom: 2px;
          font-size: 14px;
        }

        .stat-sublabel {
          font-size: 12px;
          opacity: 0.8;
        }

        .insights-content {
          min-height: 200px;
        }

        .no-clicks {
          text-align: center;
          padding: 40px 20px;
        }

        .no-clicks-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .no-clicks h3 {
          color: #1f2937;
          margin: 0 0 12px 0;
          font-size: 1.25rem;
        }

        .no-clicks p {
          color: #6b7280;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }

        .share-suggestions h4 {
          color: #374151;
          margin: 0 0 12px 0;
          font-size: 1rem;
        }

        .share-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .share-btn {
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .share-btn.twitter {
          background: #1da1f2;
          color: white;
        }

        .share-btn.facebook {
          background: #4267b2;
          color: white;
        }

        .share-btn.linkedin {
          background: #0077b5;
          color: white;
        }

        .share-btn:hover {
          transform: translateY(-1px);
          text-decoration: none;
        }

        .performance-metrics {
          padding: 20px 0;
        }

        .metric-row {
          margin-bottom: 24px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .metric-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .metric-bar {
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .metric-value {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .insights-tips h4 {
          color: #1f2937;
          margin: 0 0 12px 0;
          font-size: 1rem;
        }

        .insights-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
        }

        .insights-tips li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          text-decoration: none;
          color: #374151;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }

        .action-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          text-decoration: none;
          transform: translateY(-1px);
        }

        .action-btn.primary {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .action-btn.primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .action-icon {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .analytics-page {
            padding: 16px;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .analytics-card {
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 16px;
          }

          .url-display {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .share-buttons {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .page-header h1 {
            font-size: 1.75rem;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
          }

          .stat-icon {
            font-size: 1.5rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;