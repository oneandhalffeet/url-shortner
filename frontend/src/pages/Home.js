import React, { useState } from 'react';
import UrlShortener from '../components/UrlShortener';
import UrlList from '../components/UrlList';

const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUrlShortened = () => {
    // Trigger refresh of URL list when a new URL is shortened
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">URL Shortener</span>
          </h1>
          <p className="hero-description">
            Create short, memorable links from long URLs. 
            Track clicks and manage all your links in one place.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Fast & Reliable</h3>
              <p>Lightning-fast URL shortening with 99.9% uptime</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Track click counts and monitor link performance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure</h3>
              <p>Enterprise-grade security with rate limiting</p>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="shortener-section">
          <UrlShortener onUrlShortened={handleUrlShortened} />
        </section>

        <section className="list-section">
          <UrlList refreshTrigger={refreshTrigger} />
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <h4>URL Shortener</h4>
            <p>A fast, secure, and reliable URL shortening service.</p>
          </div>
          
          <div className="footer-stats">
            <div className="footer-stat">
              <span className="stat-number">10M+</span>
              <span className="stat-label">URLs Shortened</span>
            </div>
            <div className="footer-stat">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="footer-stat">
              <span className="stat-number">150+</span>
              <span className="stat-label">Countries</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 URL Shortener. Built with ❤️ using React and Node.js</p>
        </div>
      </footer>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .hero-section {
          padding: 80px 20px 60px;
          text-align: center;
          color: white;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0 0 24px 0;
          line-height: 1.1;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          margin: 0 0 60px 0;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .feature-card p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .main-content {
          background: #f8fafc;
          min-height: 60vh;
          padding: 40px 0;
        }

        .shortener-section {
          margin-bottom: 40px;
        }

        .list-section {
          background: white;
          margin: 40px 20px 0;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 40px 0;
        }

        .footer {
          background: #1f2937;
          color: white;
          padding: 60px 20px 20px;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 60px;
          align-items: center;
        }

        .footer-info h4 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #f9fafb;
        }

        .footer-info p {
          margin: 0;
          color: #d1d5db;
          font-size: 1rem;
          line-height: 1.6;
        }

        .footer-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .footer-stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.25rem;
          font-weight: 800;
          color: #60a5fa;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          margin-top: 40px;
          padding-top: 20px;
          text-align: center;
        }

        .footer-bottom p {
          margin: 0;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 1.1rem;
            margin-bottom: 40px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .feature-card {
            padding: 20px;
          }

          .list-section {
            margin: 20px 16px 0;
            padding: 20px 0;
            border-radius: 16px;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }

          .footer-stats {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .hero-section {
            padding: 60px 20px 40px;
          }

          .main-content {
            padding: 20px 0;
          }

          .footer {
            padding: 40px 20px 20px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-section {
            padding: 40px 16px 30px;
          }

          .feature-card {
            padding: 16px;
          }

          .feature-icon {
            font-size: 2rem;
          }

          .stat-number {
            font-size: 1.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;