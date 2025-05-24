import React, { useState, useEffect } from 'react';
import { formatDate, formatNumber, copyToClipboard, truncateUrl } from '../utils/validation';
import apiService from '../services/api';

const UrlList = ({ refreshTrigger }) => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [copiedUrl, setCopiedUrl] = useState('');

  const fetchUrls = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.getAllUrls(page, pagination.limit);
      
      if (response.success) {
        setUrls(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch URLs');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [refreshTrigger]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUrls(newPage);
    }
  };

  const handleCopy = async (url) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    }
  };

  const handleRefresh = () => {
    fetchUrls(pagination.currentPage);
  };

  if (loading && urls.length === 0) {
    return (
      <div className="url-list">
        <div className="list-header">
          <h3>Recent URLs</h3>
        </div>
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading URLs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="url-list">
      <div className="list-header">
        <h3>Recent URLs</h3>
        <div className="header-actions">
          <span className="total-count">
            {pagination.totalCount} URL{pagination.totalCount !== 1 ? 's' : ''}
          </span>
          <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
            {loading ? '↻' : '🔄'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={handleRefresh} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {urls.length === 0 && !loading && !error ? (
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <h4>No URLs yet</h4>
          <p>Start by shortening your first URL above!</p>
        </div>
      ) : (
        <>
          <div className="urls-container">
            {urls.map((url) => (
              <div key={url.id} className="url-card">
                <div className="url-content">
                  <div className="url-info">
                    <div className="short-url-section">
                      <label>Short URL:</label>
                      <div className="url-display">
                        <a
                          href={apiService.getRedirectUrl(url.shortUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="short-link"
                        >
                          {apiService.getRedirectUrl(url.shortUrl)}
                        </a>
                        <button
                          onClick={() => handleCopy(apiService.getRedirectUrl(url.shortUrl))}
                          className={`copy-btn ${copiedUrl === apiService.getRedirectUrl(url.shortUrl) ? 'copied' : ''}`}
                          title="Copy short URL"
                        >
                          {copiedUrl === apiService.getRedirectUrl(url.shortUrl) ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>

                    <div className="long-url-section">
                      <label>Original URL:</label>
                      <div className="long-url" title={url.longUrl}>
                        {truncateUrl(url.longUrl, 60)}
                      </div>
                    </div>
                  </div>

                  <div className="url-stats">
                    <div className="stat">
                      <span className="stat-label">Clicks</span>
                      <span className="stat-value">{formatNumber(url.clickCount)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Created</span>
                      <span className="stat-value">{formatDate(url.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="url-actions">
                  <a
                    href={`/analytics/${url.shortUrl}`}
                    className="analytics-btn"
                    title="View analytics"
                  >
                    📊
                  </a>
                  <a
                    href={apiService.getRedirectUrl(url.shortUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="visit-btn"
                    title="Visit URL"
                  >
                    🔗
                  </a>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="page-btn"
              >
                ← Previous
              </button>

              <div className="page-info">
                <span className="page-numbers">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`page-number ${pageNum === pagination.currentPage ? 'active' : ''}`}
                        disabled={loading}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </span>
                <span className="page-text">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .url-list {
          max-width: 800px;
          margin: 40px auto 0;
          padding: 0 20px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 0 4px;
        }

        .list-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .total-count {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .refresh-btn {
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 60px 20px;
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

        .error-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #ef4444;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .error-message .error-icon {
          margin-right: 8px;
        }

        .retry-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }

        .retry-btn:hover {
          background: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .empty-state h4 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 1.25rem;
        }

        .empty-state p {
          margin: 0;
          font-size: 1rem;
        }

        .urls-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .url-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .url-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .url-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .url-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .short-url-section, .long-url-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .short-url-section label, .long-url-section label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .url-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .short-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          font-size: 16px;
          word-break: break-all;
        }

        .short-link:hover {
          text-decoration: underline;
        }

        .copy-btn {
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          padding: 6px 8px;
          cursor: pointer;
          font-size: 12px;
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

        .long-url {
          color: #6b7280;
          font-size: 14px;
          word-break: break-all;
        }

        .url-stats {
          display: flex;
          gap: 24px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .url-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-left: 16px;
        }

        .analytics-btn, .visit-btn {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          text-decoration: none;
          font-size: 16px;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
        }

        .analytics-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .visit-btn:hover {
          background: #f0f9ff;
          border-color: #93c5fd;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-top: 1px solid #e5e7eb;
          margin-top: 20px;
        }

        .page-btn {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .page-numbers {
          display: flex;
          gap: 4px;
        }

        .page-number {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          transition: all 0.2s;
        }

        .page-number:hover:not(:disabled) {
          background: #f9fafb;
        }

        .page-number.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .page-number:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-text {
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 640px) {
          .url-list {
            padding: 0 16px;
          }

          .list-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .url-card {
            flex-direction: column;
            gap: 16px;
          }

          .url-actions {
            flex-direction: row;
            margin-left: 0;
          }

          .url-stats {
            gap: 16px;
          }

          .pagination {
            flex-direction: column;
            gap: 16px;
          }

          .page-info {
            order: -1;
          }

          .page-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UrlList;