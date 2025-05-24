import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics/:shortUrl" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

// 404 Not Found Component
const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" className="home-link">
          Go Back Home
        </a>
      </div>
      
      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .not-found-content {
          text-align: center;
          color: white;
          max-width: 500px;
        }

        .not-found-icon {
          font-size: 4rem;
          margin-bottom: 24px;
        }

        .not-found-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 12px 0;
        }

        .not-found-content p {
          font-size: 1.1rem;
          margin: 0 0 32px 0;
          opacity: 0.9;
        }

        .home-link {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.2s;
        }

        .home-link:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .not-found-content h1 {
            font-size: 2rem;
          }

          .not-found-icon {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default App;