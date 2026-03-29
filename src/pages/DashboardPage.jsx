import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Brain, Activity, Clock, RefreshCcw, Home } from 'lucide-react';

const DashboardPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
        if (!state?.interviewId) {
            navigate('/');
            return;
        }
        try {
            const userString = localStorage.getItem("user");
            const token = userString ? JSON.parse(userString).token : null;
            const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
            const res = await fetch(`${BASE_URL}/api/interview/result/${state.interviewId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Could not fetch interview results.");
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    fetchResult();
  }, [state, navigate]);

  if (loading) return <div className="dashboard-container center"><h2>Loading Analysis...</h2></div>;
  if (error) return <div className="dashboard-container center"><h2>{error}</h2><button className="btn" onClick={() => navigate('/')}>Home</button></div>;
  if (!result) return null;

  const { 
    confidenceScore, 
    stressScore, 
    voiceScore, 
    contentScore, 
    totalScore, 
    feedbackVisual, 
    feedbackVoice, 
    feedbackContent, 
    transcript 
  } = result;

  // Use the backend's calculated overall score (weighted)
  const overallScore = totalScore || Math.round((confidenceScore + (100 - stressScore)) / 2);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="dashboard-container">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Interview Results</h1>
        <p>Comprehensive Performance Report by SkillPulse AI</p>
      </motion.div>

      <div className="dashboard-grid">
        {/* Main Score Card */}
        <motion.div 
          className="score-card glass-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3>Overall AI Grade</h3>
          <div className="circular-graph-container">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} className="chart-bg" />
              <motion.circle
                cx="80" cy="80" r={radius}
                className="chart-progress"
                style={{ strokeDasharray: circumference }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                stroke={overallScore > 75 ? 'var(--status-good)' : overallScore > 50 ? 'var(--status-warning)' : 'var(--status-danger)'}
              />
            </svg>
            <div className="score-value">
              <span className="score-number">{overallScore}</span>
              <span className="score-symbol">%</span>
            </div>
          </div>
          <div className="score-label">
             {overallScore > 80 ? 'Exceptional' : overallScore > 60 ? 'Professional' : 'Needs Practice'}
          </div>
        </motion.div>

        {/* Detailed AI Metrics Breakdown */}
        <motion.div 
          className="metrics-details glass-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3>Performance Breakdown</h3>
          
          <div className="metric-item">
            <div className="metric-label">
              <Award size={18} /> Visual Confidence ({confidenceScore}%)
            </div>
            <div className="bar-track">
              <motion.div 
                className="bar-fill" 
                style={{ background: 'var(--status-good)' }}
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScore}%` }}
              />
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-label">
              <Activity size={18} /> Body Language Stress ({stressScore}%)
            </div>
            <div className="bar-track">
              <motion.div 
                className="bar-fill" 
                style={{ background: 'var(--status-warning)' }}
                initial={{ width: 0 }}
                animate={{ width: `${stressScore}%` }}
              />
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-label">
              <Clock size={18} /> Voice Delivery ({voiceScore}%)
            </div>
            <div className="bar-track">
              <motion.div 
                className="bar-fill" 
                style={{ background: '#00d2ff' }}
                initial={{ width: 0 }}
                animate={{ width: `${voiceScore}%` }}
              />
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-label">
              <Brain size={18} /> Content Strength ({contentScore}%)
            </div>
            <div className="bar-track">
              <motion.div 
                className="bar-fill" 
                style={{ background: '#9d50bb' }}
                initial={{ width: 0 }}
                animate={{ width: `${contentScore}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categorized Feedback Section */}
      <motion.div 
        className="feedback-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
          <div className="feedback-card glass-card">
              <h4><Activity size={16} /> Visual Feedback</h4>
              <p>{feedbackVisual || "Maintain steadier eye contact and calm presence."}</p>
          </div>
          <div className="feedback-card glass-card">
              <h4><Clock size={16} /> Spoken Flow</h4>
              <p>{feedbackVoice || "Watch your pace and filler word usage."}</p>
          </div>
          <div className="feedback-card glass-card">
              <h4><Award size={16} /> Content Quality</h4>
              <p>{feedbackContent || "Try to use the STAR method for more depth."}</p>
          </div>
      </motion.div>

      <motion.div 
          className="transcript-section glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
      >
          <h3>Interaction Logs & Transcript</h3>
          <div className="logs-panel">
             {transcript ? transcript.split(' | Next Q: ').map((t, idx) => (
                 <p key={idx}><strong>Response {idx+1}:</strong> {t}</p>
             )) : <p>No vocal transcript recorded for this session.</p>}
          </div>
      </motion.div>
      
      <div className="dashboard-actions">
         <button className="btn btn-secondary action-btn" onClick={() => navigate('/')}>
            <Home size={18} /> Home
         </button>
         <button className="btn btn-primary action-btn" onClick={() => navigate('/setup')}>
            <RefreshCcw size={18} /> Start New Interview
         </button>
      </div>

      <style>{`
        .dashboard-container { min-height: 100vh; padding: 40px 10%; display: flex; flex-direction: column; gap: 32px; }
        .center { align-items: center; justify-content: center; text-align: center; }
        .dashboard-header { text-align: center; }
        .dashboard-header h1 { font-size: 2.5rem; margin-bottom: 8px; }
        .dashboard-header p { color: var(--text-secondary); font-size: 1.1rem; font-weight: 500; }
        .dashboard-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
        .score-card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .circular-graph-container { position: relative; width: 160px; height: 160px; margin: 24px 0; }
        .chart-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 12; }
        .chart-progress { fill: none; stroke-width: 12; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50% 50%; }
        .score-value { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        .score-number { font-size: 3rem; font-weight: 700; line-height: 1; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .score-label { margin-top: 12px; font-weight: 600; font-size: 1.1rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
        .metrics-details { display: flex; flex-direction: column; gap: 20px; justify-content: center; }
        .metric-item { display: flex; flex-direction: column; gap: 8px; }
        .metric-label { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 500; }
        .bar-track { width: 100%; height: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 6px; transition: width 1s ease-out; }
        
        .feedback-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .feedback-card { padding: 24px; border-radius: 12px; display: flex; flex-direction: column; gap: 12px; }
        .feedback-card h4 { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        .feedback-card p { line-height: 1.6; font-size: 1.05rem; }
        
        .transcript-section { padding: 24px; }
        .transcript-section h3 { margin-bottom: 16px; color: var(--text-secondary); }
        .logs-panel { max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; }
        .logs-panel p { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 0; line-height: 1.6; }
        .logs-panel p:last-child { border-bottom: none; }

        .dashboard-actions { display: flex; justify-content: center; margin-top: 16px; gap: 16px; }
        .action-btn { padding: 16px 32px; font-size: 1.1rem; }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default DashboardPage;
