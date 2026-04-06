import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sentiment from 'sentiment';
import natural from 'natural';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// ── Simple file-based DB (no MongoDB required) ─────────────────────────────────
const DB_PATH = path.join(__dirname, 'db.json');

const readDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], interviews: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// ── NLP Deep Analysis Helpers ─────────────────────────────────────────────────

const analyzeTranscript = (transcriptBlocks) => {
    let totalContentScore = 0;
    let feedback = "";
    
    // 1. STAR METHOD KEYWORDS
    const STAR_KEYWORDS = ['situation', 'task', 'action', 'result', 'solved', 'managed', 'impact', 'delivered', 'achieved'];
    
    // 2. POSITIVE/CONFIDENT KEYWORDS
    const CONFIDENCE_KEYWORDS = ['definitely', 'successfully', 'learned', 'confident', 'experience', 'growth', 'challenge', 'team'];

    let scores = transcriptBlocks.map((text, idx) => {
        if (!text || text.trim().length === 0) return 0;
        
        const tokens = tokenizer.tokenize(text.toLowerCase());
        const wordCount = tokens.length;
        
        let blockScore = 50; // Base score for having an answer

        // length heuristic
        if (wordCount > 30) blockScore += 20; 
        else if (wordCount < 10) blockScore -= 30;

        // Keyword matching (STAR Method)
        let starMatch = tokens.filter(t => STAR_KEYWORDS.includes(t)).length;
        blockScore += Math.min(20, starMatch * 5);

        // Sentiment Analysis
        const sentResult = sentiment.analyze(text);
        if (sentResult.score > 0) blockScore += 10;
        if (sentResult.score < -2) blockScore -= 10; // High negative sentiment deduction

        return Math.min(100, Math.max(0, blockScore));
    });

    totalContentScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0) / scores.length) : 0;
    
    if (totalContentScore > 80) feedback = "Exceptional structural clarity! You used action-oriented language effectively.";
    else if (totalContentScore > 50) feedback = "Good content, though some answers could benefit from more specific 'Result' or 'Action' metrics.";
    else feedback = "Focus on the STAR method to provide more detailed, structure-rich responses.";

    return { score: totalContentScore, feedback };
};

// ── Auth Routes ────────────────────────────────────────────────────────────────

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('[Signup] Incoming request:', { name, email });

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields (name, email, password) are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const db = readDB();
        const exists = db.users.find(u => u.email === email.toLowerCase());
        if (exists) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        writeDB(db);

        return res.status(201).json({
            message: 'User registered successfully!',
            token: 'jwt-' + newUser.id,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });

    } catch (err) {
        console.error('[Signup] Server error:', err.message);
        return res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const db = readDB();
        const user = db.users.find(u => u.email === email.toLowerCase());

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        return res.status(200).json({
            message: 'Login successful!',
            token: 'jwt-' + user.id,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        return res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// ── Interview Routes ──────────────────────────────────────────────────────────

app.post('/api/interview/submit', (req, res) => {
    try {
        const { 
            transcript, 
            stressMetrics = [], 
            confidenceMetrics = [],
            wpmMetrics = [],
            transcriptSections = [],
            questionsAsked = [],
            totalPauses = 0,
            totalFillers = 0
        } = req.body;

        // Deep Content Analysis
        const contentAnalysis = analyzeTranscript(transcriptSections);
        const contentScore = contentAnalysis.score;
        const contentFeedback = contentAnalysis.feedback;

        // Visual AI Metrics
        const avgStress = stressMetrics.length ? Math.round(stressMetrics.reduce((a, b) => a + b, 0) / stressMetrics.length) : 45;
        const avgConfidence = confidenceMetrics.length ? Math.round(confidenceMetrics.reduce((a, b) => a + b, 0) / confidenceMetrics.length) : 72;

        // -----------------------------------------------------
        // 1. Voice Delivery Algorithm (How you said it)
        // -----------------------------------------------------
        let voiceScore = 100;
        const avgWpm = wpmMetrics.length ? Math.round(wpmMetrics.reduce((a, b) => a + b, 0) / wpmMetrics.length) : 0;
        
        let voiceFeedback = "";
        
        // Base penalty if there is very little speech or silence
        const hasNoSpeech = (!transcript || transcript.trim().length === 0) && avgWpm === 0;

        if (hasNoSpeech) {
             voiceScore = 0;
             voiceFeedback = "No clear speech detected. Please speak clearly into the microphone. ";
        } else {
            if (totalFillers > 5) {
                 voiceScore -= Math.min(20, (totalFillers * 2));
                 voiceFeedback += `High usage of filler words detected (${totalFillers} times). `;
            } else if (totalFillers > 0) {
                 voiceScore -= (totalFillers * 2);
                 voiceFeedback += `Some filler words detected. `;
            } else {
                 voiceFeedback += `Clear speech with minimal filler words. `;
            }

            if (totalPauses > 3) {
                 voiceScore -= Math.min(20, (totalPauses * 3));
                 voiceFeedback += `Frequent long pauses detected. `;
            } else if (totalPauses > 0) {
                 voiceScore -= (totalPauses * 2);
                 voiceFeedback += `A few pauses detected. `;
            } else {
                 voiceFeedback += `Good spoken pacing throughout. `;
            }

            if (avgWpm > 0 && avgWpm < 100) {
                 voiceScore -= Math.min(20, Math.round((100 - avgWpm) * 0.4));
                 voiceFeedback += `Speaking pace was a bit slow (${avgWpm} WPM). `;
            } else if (avgWpm > 170) {
                 voiceScore -= Math.min(20, Math.round((avgWpm - 170) * 0.4));
                 voiceFeedback += `Speaking pace was quite fast (${avgWpm} WPM). `;
            } else {
                 voiceFeedback += `Excellent speaking rate. `;
            }
        }
        voiceScore = Math.max(0, voiceScore);

        // Final weighted calculation
        let visualTotal = (100 - avgStress) * 0.4 + avgConfidence * 0.6;
        let totalScore = Math.round((visualTotal * 0.3) + (voiceScore * 0.3) + (contentScore * 0.4));

        const interview = {
            id: Date.now(),
            transcript: transcript || '',
            transcriptSections: transcriptSections || [],
            questionsAsked: questionsAsked || [],
            confidenceScore: avgConfidence,
            stressScore: avgStress,
            voiceScore: voiceScore,
            contentScore: contentScore,
            totalScore: totalScore,
            feedbackVisual: `Visual Analysis: ${avgConfidence > 75 ? 'Excellent eye contact! ' : 'Maintain steadier eye presence. '} ${avgStress > 70 ? 'High tension detected.' : 'You looked calm.'}`,
            feedbackVoice: voiceFeedback,
            feedbackContent: contentFeedback,
            rawMetrics: { avgWpm, totalFillers, totalPauses }
        };

        const db = readDB();
        db.interviews.push(interview);
        writeDB(db);

        return res.status(200).json(interview);
    } catch (err) {
        console.error('[Submit] Error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/interview/result/:id', (req, res) => {
    try {
        const db = readDB();
        const interview = db.interviews.find(i => String(i.id) === String(req.params.id));
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        return res.status(200).json(interview);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ SkillPulse algorithmic backend running on http://localhost:${PORT}`);
    console.log(`📁 User data stored in: ${DB_PATH}`);
});
