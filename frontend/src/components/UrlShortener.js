import React, { useState } from 'react';
import { validateUrl, copyToClipboard } from '../utils/validation';
import apiService from '../services/api';

const UrlShortener = ({ onUrlShortened }) => {
  const [longUrl, setLongUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortenedUrl(null);

    // Validate URL
    const validation = validateUrl(longUrl);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.shortenUrl(validation.normalizedUrl);
      
      if (response.success) {
        setShortenedUrl(response.data);
        setLongUrl(''); // Clear input
        
        // Notify parent component if callback provided
        if (onUrlShortened) {
          onUrlShortened(response.data);
        }
      } else {
        setError('Failed to shorten URL');
      }
    } catch (err) {
      setError(err.message || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shortenedUrl) {
      const success = await copyToClipboard(shortenedUrl.fullShortUrl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleReset = () => {
    setShortenedUrl(null);
    setError('');
    setCopied(false);
  };

  return (
    <div className="url-shortener">
      <div className="shortener-card">
        <h2>Shorten Your URL</h2>
        <p className="subtitle">
          Transform long URLs into short, shareable links
        </p>

        <form onSubmit={handleSubmit} className="shortener-form">
          <div className="input-group">
            <input
              type="text"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              className={`url-input ${error ? 'error' : ''}`}
              disabled={loading}
            />
            <button
              type="submit"
              className="shorten-btn"
              disabled={loading || !longUrl.trim()}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Shortening...
                </span>
              ) : (
                'Shorten URL'
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </form>

        {shortenedUrl && (
          <div className="result-section">
            <div className="result-card">
              <h3>Your shortened URL is ready!</h3>
              
              <div className="url-result">
                <div className="short-url">
                  <label>Short URL:</label>
                  <div className="url-display">
                    <input
                      type="text"
                      value={shortenedUrl.fullShortUrl}
                      readOnly
                      className="result-input"
                    />
                    <button
                      onClick={handleCopy}
                      className={`copy-btn ${copied ? 'copied' : ''}`}
                      title="Copy to clipboard"
                    >
                      {copied ? '✓' : '📋'}
                    </button>
                  </div>
                </div>

                <div className="original-url">
                  <label>Original URL:</label>
                  <div className="original-url-text">
                    {shortenedUrl.longUrl}
                  </div>
                </div>
              </div>

              <div className="result-actions">
                <button
                  onClick={handleReset}
                  className="new-url-btn"
                >
                  Shorten Another URL
                </button>
                <a
                  href={shortenedUrl.fullShortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="test-link-btn"
                >
                  Test Link
                </a>
              </div>

              {copied && (
                <div className="copy-success">
                  ✅ Copied to clipboard!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .url-shortener {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .shortener-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        h2 {
          text-align: center;
          color: #1f2937;
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .subtitle {
          text-align: center;
          color: #6b7280;
          margin: 0 0 32px 0;
          font-size: 1.1rem;
        }

        .shortener-form {
          margin-bottom: 24px;
        }

        .input-group {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .url-input {
          flex: 1;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.2s;
          outline: none;
        }

        .url-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .url-input.error {
          border-color: #ef4444;
        }

        .url-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .shorten-btn {
          padding: 14px 24px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .shorten-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .shorten-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
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
          gap: 8px;
          color: #ef4444;
          font-size: 14px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
        }

        .result-section {
          margin-top: 24px;
        }

        .result-card {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border: 2px solid #0ea5e9;
          border-radius: 16px;
          padding: 24px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .result-card h3 {
          text-align: center;
          color: #0c4a6e;
          margin: 0 0 20px 0;
          font-size: 1.25rem;
        }

        .url-result {
          margin: 20px 0;
        }

        .short-url, .original-url {
          margin-bottom: 16px;
        }

        .short-url label, .original-url label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .url-display {
          display: flex;
          gap: 8px;
        }

        .result-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          font-size: 16px;
          color: #1f2937;
        }

        .copy-btn {
          padding: 12px 16px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 16px;
        }

        .copy-btn:hover {
          background: #059669;
          transform: scale(1.05);
        }

        .copy-btn.copied {
          background: #059669;
        }

        .original-url-text {
          padding: 12px 16px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          word-break: break-all;
          color: #6b7280;
          font-size: 14px;
        }

        .result-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 20px;
        }

        .new-url-btn, .test-link-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-size: 14px;
        }

        .new-url-btn {
          background: #6b7280;
          color: white;
        }

        .new-url-btn:hover {
          background: #4b5563;
        }

        .test-link-btn {
          background: #f59e0b;
          color: white;
          display: inline-block;
        }

        .test-link-btn:hover {
          background: #d97706;
          text-decoration: none;
        }

        .copy-success {
          text-align: center;
          color: #059669;
          font-weight: 600;
          margin-top: 12px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 640px) {
          .shortener-card {
            padding: 20px;
          }

          .input-group {
            flex-direction: column;
          }

          .result-actions {
            flex-direction: column;
          }

          .url-display {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default UrlShortener;