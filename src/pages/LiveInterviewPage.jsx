import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowRight, SkipForward, TriangleAlert, StopCircle } from 'lucide-react';
import { getQuestions } from '../services/InterviewManager';
import { loadModels, analyzeFace } from '../services/FaceAnalysisService';
import { SpeechAnalysisService } from '../services/SpeechAnalysisService';

const LiveInterviewPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const category = state?.category || 'HR';
  const difficulty = state?.difficulty || 'Medium';
  const [questions] = useState(() => getQuestions(category, difficulty));
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); 
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);
  
  // AI State (SILENT ACCUMULATION)
  const [sessionData, setSessionData] = useState({
      stressMetrics: [],
      confidenceMetrics: [],
      wpmMetrics: [],
      transcripts: [],
      pauses: [],
      fillers: [],
      questionsAsked: []
  });
  
  const [currentTranscript, setCurrentTranscript] = useState('');

  const videoRef = useRef(null);
  const analysisInterval = useRef(null);
  const speechService = useRef(null);
  
  // Temporary vars for intervals to push into sessionData reliably
  const latestStress = useRef(25);
  const latestConfidence = useRef(80);
  const latestWpm = useRef(0);
  const latestPauses = useRef(0);
  const latestFillers = useRef(0);

  useEffect(() => {
    let stream = null;
    
    // Add first question to session Data mapping automatically
    setSessionData(prev => ({ ...prev, questionsAsked: [...prev.questionsAsked, questions[0]] }));

    const initSystem = async () => {
      const isLoaded = await loadModels();
      setModelsLoaded(isLoaded);
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error", err);
      }
      
      if (isLoaded) {
        analysisInterval.current = setInterval(async () => {
          if (videoRef.current) {
             const results = await analyzeFace(videoRef.current);
             if (results) {
                 let immediateStress = results.stress;
                 if (results.isBlinking) immediateStress += 15;
                 if (!results.facePresence) immediateStress += 20;
                 
                 let immediateConfidence = results.confidence;
                 if (results.eyeContact) immediateConfidence += 20;
                 
                 latestStress.current = Math.min(100, Math.max(0, immediateStress));
                 latestConfidence.current = Math.min(100, Math.max(0, immediateConfidence));
             }
          }
        }, 1000);
      }
      
      speechService.current = new SpeechAnalysisService((res) => {
         setCurrentTranscript(res.full || ''); // Capture everything (final + interim)
         latestWpm.current = res.wpm;
         latestPauses.current = res.pauses;
         latestFillers.current = res.fillers;
      });
      speechService.current.start();
    };

    initSystem();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (analysisInterval.current) clearInterval(analysisInterval.current);
      if (speechService.current) speechService.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Record silent metrics every 5 seconds
  useEffect(() => {
    const metricTimer = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        stressMetrics: [...prev.stressMetrics, latestStress.current],
        confidenceMetrics: [...prev.confidenceMetrics, latestConfidence.current],
        wpmMetrics: [...prev.wpmMetrics, latestWpm.current]
      }));
    }, 5000);
    return () => clearInterval(metricTimer);
  }, []);

  // Text-To-Speech for reading questions
  useEffect(() => {
    if (questions && questions[currentQuestionIdx]) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        setIsReadingQuestion(true);
        
        const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIdx]);
        utterance.rate = 0.85; // medium speed as requested
        utterance.pitch = 1.0;
        
        // Find a natural sounding voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Google')));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
             setIsReadingQuestion(false); // start the timer when finished
        };
        
        utterance.onerror = () => {
             setIsReadingQuestion(false); // fallback to start timer if audio fails
        };

        window.speechSynthesis.speak(utterance);
    }
    
    // Clean up if unmounted
    return () => window.speechSynthesis.cancel();
  }, [currentQuestionIdx, questions]);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isReadingQuestion) {
        setTimeLeft(prev => {
          if (prev <= 1) {
             handleNextQuestion(false);
             return 120;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIdx, isReadingQuestion]);

  const handleNextQuestion = (forceSubmit = false) => {
    if (speechService.current) {
        setSessionData(prev => {
           let updatedTranscripts = [...prev.transcripts];
           updatedTranscripts.push(currentTranscript);
           
           let updatedPauses = [...prev.pauses];
           updatedPauses.push(latestPauses.current);
           
           let updatedFillers = [...prev.fillers];
           updatedFillers.push(latestFillers.current);
           
           // Fetch next question text directly onto array
           const nextIdx = currentQuestionIdx + 1;
           const newQuestions = [...prev.questionsAsked];
           if (nextIdx < questions.length && !forceSubmit) {
               newQuestions.push(questions[nextIdx]);
           }
           
           return { ...prev, transcripts: updatedTranscripts, pauses: updatedPauses, fillers: updatedFillers, questionsAsked: newQuestions };
        });
        
        // Reset tracking vars for next question
        setCurrentTranscript('');
        latestPauses.current = 0;
        latestFillers.current = 0;
        if(speechService.current) {
            speechService.current.wordCount = 0;
            speechService.current.pauseCount = 0;
            speechService.current.fillerWordCount = 0;
        }
    }
    
    if (!forceSubmit && currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setTimeLeft(120);
    } else {
        submitInterview();
    }
  };

  const submitInterview = async () => {
    setIsSubmitting(true);
    window.speechSynthesis.cancel();
    if (speechService.current) speechService.current.stop();
    if (analysisInterval.current) clearInterval(analysisInterval.current);

    const userString = localStorage.getItem("user");
    const token = userString ? JSON.parse(userString).token : null;
    
    // Process final metric payloads immediately
    const finalTranscripts = [...sessionData.transcripts, currentTranscript].filter(t => t.trim().length > 0);
    const combinedTranscript = finalTranscripts.join(" | Next Q: ");
    const finalFillers = sessionData.fillers.reduce((a,b)=>a+b,0) + latestFillers.current;
    const finalPauses = sessionData.pauses.reduce((a,b)=>a+b,0) + latestPauses.current;

    const payload = {
        transcript: combinedTranscript,
        stressMetrics: sessionData.stressMetrics,
        confidenceMetrics: sessionData.confidenceMetrics,
        wpmMetrics: sessionData.wpmMetrics,
        transcriptSections: finalTranscripts,
        questionsAsked: sessionData.questionsAsked,
        totalPauses: finalPauses,
        totalFillers: finalFillers
    };

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    try {
        const response = await fetch(`${BASE_URL}/api/interview/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Submission Failed");
        const data = await response.json();
        
        navigate(`/dashboard`, { state: { interviewId: data.id } });
    } catch (err) {
        console.error(err);
        alert("Failed to submit interview data.");
        setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isSubmitting) {
      return (
          <div className="interview-layout saving-layout">
             <h2>Analyzing Algorithm Metrics...</h2>
             <p>Our AI is strictly calculating your voice and answer strength grades.</p>
             <div className="recording-dot recording-pulse" style={{width: 30, height: 30, margin: '20px auto'}}></div>
          </div>
      );
  }

  return (
    <div className="interview-layout">
      {/* Header */}
      <header className="interview-header glass-card">
        <div className="status-indicators">
          <div className="recording-indicator">
            <div className="recording-dot recording-pulse"></div> Live Session
          </div>
          {!modelsLoaded && <div className="loading-models"><TriangleAlert size={14} color="#ffaa00" /> Loading AI Models...</div>}
        </div>
        
        <div className="timer-display glass-card">
           <Timer size={20} className={timeLeft < 30 && !isReadingQuestion ? 'pulse-red' : ''} />
           <span className={timeLeft < 30 && !isReadingQuestion ? 'text-red' : ''}>
             {isReadingQuestion ? 'Reading...' : formatTime(timeLeft)}
           </span>
        </div>
      </header>

      {/* Picture-in-Picture Integrated Layout */}
      <main className="interview-main unified-layout">
        
        <div className="interaction-section">
          <div className="question-card glass-card">
            
            {/* New Flex Row fixing Webcam strictly into smaller PIP orientation beside the question */}
            <div className="pip-wrapper">
                <div className="question-text-area">
                    <span className="question-number">Question {currentQuestionIdx + 1} of {questions.length}</span>
                    <AnimatePresence mode="wait">
                    <motion.h2 
                        key={currentQuestionIdx}
                        className="current-question gradient-text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {questions[currentQuestionIdx]}
                    </motion.h2>
                    </AnimatePresence>
                </div>

                <div className="video-section">
                    <div className="video-container mini-video">
                        <video ref={videoRef} autoPlay playsInline muted className="main-video" />
                        <div className="video-overlays">
                        <div className="focus-border"></div>
                        </div>
                    </div>
                </div>
            </div>

          </div>

          <div className="controls">
            <button className="btn btn-secondary skip-btn" onClick={() => handleNextQuestion(false)}>
              <SkipForward size={18} /> Skip
            </button>

            <button className="btn btn-primary next-btn center-btn" onClick={() => handleNextQuestion(false)}>
              Next Question <ArrowRight size={18} />
            </button>

            <button className="btn end-btn" onClick={() => handleNextQuestion(true)}>
              <StopCircle size={18} /> End Interview
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .interview-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 24px;
          gap: 24px;
        }

        .saving-layout {
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        
        .interview-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-radius: 12px; }
        .status-indicators { display: flex; gap: 16px; align-items: center; }
        .recording-indicator { display: flex; align-items: center; gap: 8px; font-weight: 500; color: #ff3366; }
        .recording-dot { width: 10px; height: 10px; background: #ff3366; border-radius: 50%; }
        .loading-models { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .timer-display { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; font-family: monospace; font-size: 1.25rem; font-weight: 700; }
        .pulse-red { animation: pulseRed 1s infinite; color: var(--status-danger); }
        .text-red { color: var(--status-danger); }
        @keyframes pulseRed { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

        .unified-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
        }

        .interaction-section { display: flex; flex-direction: column; gap: 24px; align-items: center; }
        .question-card {
          width: 100%;
          max-width: 900px;
          padding: 40px;
          border-radius: 16px;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          text-align: left;
        }
        
        /* Picture-in-Picture Flex Container */
        .pip-wrapper {
            display: flex;
            width: 100%;
            gap: 40px;
            align-items: center;
            justify-content: space-between;
        }

        .question-text-area { flex: 1; }

        .question-number { display: block; color: var(--text-secondary); font-size: 1rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 24px; }
        .current-question { font-size: 2.2rem; line-height: 1.4; font-weight: 700; }

        /* Modified Video Class mapping strictly small footprint */
        .video-section { flex-shrink: 0; }
        .video-container.mini-video {
          width: 250px; /* Force video extremely smaller (user requested shrinking) */
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 12px;
          position: relative;
          border: 1px solid var(--glass-border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .main-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .video-overlays { position: absolute; inset: 0; pointer-events: none; border: 2px solid rgba(255,255,255,0.05); }

        .controls {
          width: 100%;
          max-width: 900px;
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 16px;
        }
        .controls .btn { padding: 18px; font-size: 1.1rem; border-radius: 12px; }
        .btn-secondary { background: rgba(255,255,255,0.05); }
        .end-btn { background: rgba(255, 51, 102, 0.1); color: var(--status-danger); border-color: rgba(255, 51, 102, 0.3); }
        .end-btn:hover { background: rgba(255, 51, 102, 0.2); transform: none; box-shadow: none; }
        
        @media (max-width: 768px) {
            .pip-wrapper { flex-direction: column; text-align: center; }
            .question-card { padding: 24px; }
            .controls { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default LiveInterviewPage;
