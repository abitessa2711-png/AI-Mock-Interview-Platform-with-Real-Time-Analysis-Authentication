import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Mic, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

const CATEGORIES = ['HR', 'Technical', 'Behavioral', 'Leadership', 'Situational'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const SetupPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[0]);
  const [permissions, setPermissions] = useState({ camera: false, mic: false, tested: false });
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissions({ camera: true, mic: true, tested: true });
      setError(null);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setError('Camera and Microphone permissions are required to use SkillPulse AI.');
      setPermissions({ camera: false, mic: false, tested: true });
    }
  };

  const startInterview = () => {
    if (!permissions.camera || !permissions.mic) {
      setError('Please allow camera and mic access first.');
      return;
    }
    // Stop local video stream tracks before navigating so we can open it again on the next page
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    navigate('/interview', { 
      state: { 
        category: selectedCategory, 
        difficulty: selectedDifficulty 
      } 
    });
  };

  return (
    <div className="setup-container">
      <motion.div 
        className="setup-card glass-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="setup-title">Interview Configuration</h2>
        
        <div className="form-group">
          <label>Select Category</label>
          <div className="chips-container">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Select Difficulty</label>
          <div className="chips-container">
            {DIFFICULTIES.map(diff => (
              <button 
                key={diff}
                className={`chip ${selectedDifficulty === diff ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="hardware-section">
          <h3>Hardware Check</h3>
          <div className="video-preview">
            {!permissions.tested ? (
               <div className="preview-placeholder">
                 <Video size={48} color="rgba(255,255,255,0.2)" />
                 <p>Camera Off</p>
               </div>
            ) : permissions.camera ? (
               <video ref={videoRef} autoPlay playsInline muted className="live-preview" />
            ) : (
               <div className="preview-placeholder error">
                 <AlertCircle size={48} color="var(--status-danger)" />
                 <p>Hardware Error</p>
               </div>
            )}
          </div>

          <button className="btn check-btn" onClick={requestPermissions}>
            {permissions.tested && permissions.camera ? <><CheckCircle2 size={18} color="var(--status-good)" /> Hardware Connected</> : <><Mic size={18}/> Request Permissions</>}
          </button>
          
          {error && <p className="error-text">{error}</p>}
        </div>

        <button 
          className="btn btn-primary start-interview-btn"
          onClick={startInterview}
          disabled={!permissions.camera}
        >
          Proceed to Interview <ChevronRight size={20} />
        </button>

      </motion.div>

      <style>{`
        .setup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .setup-card {
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .setup-title {
          font-size: 2rem;
          margin-bottom: 8px;
          text-align: center;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }
        .chips-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chip:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .chip.active {
          background: var(--accent-gradient);
          border-color: transparent;
          font-weight: 600;
        }
        .hardware-section {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .hardware-section h3 {
          width: 100%;
          font-size: 1.1rem;
          color: var(--text-secondary);
        }
        .video-preview {
          width: 100%;
          max-width: 320px;
          aspect-ratio: 4/3;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        .preview-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.3);
          gap: 12px;
        }
        .preview-placeholder.error {
          color: var(--status-danger);
        }
        .live-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }
        .check-btn {
          width: 100%;
          max-width: 320px;
        }
        .error-text {
          color: var(--status-danger);
          font-size: 0.9rem;
          text-align: center;
        }
        .start-interview-btn {
          width: 100%;
          padding: 16px;
          font-size: 1.1rem;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

export default SetupPage;
