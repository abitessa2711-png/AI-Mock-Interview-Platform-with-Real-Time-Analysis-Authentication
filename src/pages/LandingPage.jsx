import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sparkles, LogOut } from 'lucide-react';
import '../index.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload(); // refresh so nav updates
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">
          <Sparkles className="logo-icon" size={24} color="var(--accent-blue)" />
          <span className="logo-text">SkillPulse AI</span>
        </div>
        <div className="nav-auth-links">
          {user ? (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                👋 {user.user?.name || user.name || 'User'}
              </span>
              <Link to="/setup" className="btn btn-primary nav-btn">Dashboard</Link>
              <button className="btn btn-secondary nav-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary nav-btn">Login</Link>
              <Link to="/signup" className="btn btn-primary nav-btn">Sign Up</Link>
            </>
          )}
        </div>
      </nav>


      <main className="hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            Master Your Interview with <span className="gradient-text">AI</span>
          </h1>
          <p className="hero-subtitle">
            Simulate real interview environments. Get real-time feedback on confidence, stress levels, and clarity using advanced facial and speech analysis.
          </p>
          
          <div className="hero-actions">
            <button 
              className="btn btn-primary start-btn"
              onClick={() => navigate('/setup')}
            >
              Start Interview <Play size={20} />
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="hero-graphics"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="glass-card mock-dashboard">
            <div className="mock-header">
              <div className="mock-dot red"></div>
              <div className="mock-dot yellow"></div>
              <div className="mock-dot green"></div>
            </div>
            <div className="mock-body">
              <div className="mock-video">
                <div className="face-mesh-overlay"></div>
              </div>
              <div className="mock-stats">
                <div className="stat-bar">
                  <span>Confidence</span>
                  <div className="bar-track"><div className="bar-fill confidence" style={{width: '85%'}}></div></div>
                </div>
                <div className="stat-bar">
                  <span>Stress</span>
                  <div className="bar-track"><div className="bar-fill stress" style={{width: '30%'}}></div></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <style>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .navbar {
          padding: 24px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-auth-links {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .nav-btn {
          padding: 10px 22px;
          font-size: 0.95rem;
          border-radius: 8px;
          text-decoration: none;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .hero {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10%;
          gap: 60px;
        }
        .hero-content {
          flex: 1;
          max-width: 600px;
        }
        .hero-title {
          font-size: 4rem;
          margin-bottom: 24px;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .start-btn {
          font-size: 1.25rem;
          padding: 16px 32px;
          border-radius: 12px;
        }
        .hero-graphics {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .mock-dashboard {
          width: 100%;
          max-width: 500px;
          background: rgba(30,30,40,0.4);
        }
        .mock-header {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }
        .mock-dot {
          width: 12px; height: 12px; border-radius: 50%;
        }
        .mock-dot.red { background: #ff5f56; }
        .mock-dot.yellow { background: #ffbd2e; }
        .mock-dot.green { background: #27c93f; }
        .mock-video {
          width: 100%;
          height: 250px;
          background: #1a1a2e;
          border-radius: 12px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .face-mesh-overlay {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(90deg, transparent 50%, rgba(0, 245, 255, 0.05) 50%),
            linear-gradient(transparent 50%, rgba(123, 44, 191, 0.05) 50%);
          background-size: 20px 20px;
        }
        .stat-bar {
          margin-bottom: 16px;
        }
        .stat-bar span {
          display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem;
        }
        .bar-track {
          width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;
        }
        .bar-fill {
          height: 100%; border-radius: 4px;
        }
        .bar-fill.confidence { background: var(--status-good); }
        .bar-fill.stress { background: var(--status-warning); }

        @media (max-width: 900px) {
          .hero {
            flex-direction: column;
            text-align: center;
            padding: 40px 24px;
          }
          .hero-title { font-size: 3rem; }
          .hero-actions { justify-content: center; display: flex; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
