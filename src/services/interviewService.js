import { supabase } from './supabaseClient';

const STAR_KEYWORDS = [
  'situation', 'task', 'action', 'result', 'solved', 
  'managed', 'impact', 'delivered', 'achieved', 'improved', 
  'built', 'created', 'led', 'designed'
];

const POSITIVE_WORDS = [
  'successfully', 'confident', 'growth', 'effective', 
  'achieved', 'positive', 'good', 'great', 'learned', 'team'
];

const NEGATIVE_WORDS = [
  'failed', 'bad', 'nervous', 'terrible', 'worst', 
  'poor', 'hate', 'mistake', 'problem'
];

export const calculateInterviewScore = (payload) => {
  const {
    transcript = '',
    stressMetrics = [],
    confidenceMetrics = [],
    wpmMetrics = [],
    transcriptSections = [],
    questionsAsked = [],
    totalPauses = 0,
    totalFillers = 0
  } = payload;

  // 1. Content Scoring (STAR method + Keywords)
  let totalContentScore = 0;
  let feedbackContent = "";

  const sections = (transcriptSections && transcriptSections.length > 0) 
    ? transcriptSections 
    : (transcript ? [transcript] : []);

  const scores = sections.map((text) => {
    if (!text || text.trim().length === 0) return 0;
    const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
    const wordCount = words.length;

    let score = 50; // base score
    if (wordCount > 30) score += 20;
    else if (wordCount < 10) score -= 30;

    const starHits = words.filter(w => STAR_KEYWORDS.includes(w)).length;
    score += Math.min(25, starHits * 5);

    const posHits = words.filter(w => POSITIVE_WORDS.includes(w)).length;
    const negHits = words.filter(w => NEGATIVE_WORDS.includes(w)).length;
    if (posHits > negHits) score += 10;
    if (negHits > posHits + 2) score -= 10;

    return Math.min(100, Math.max(0, score));
  });

  totalContentScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  if (totalContentScore > 80) {
    feedbackContent = "Exceptional structural clarity! You used action-oriented language effectively.";
  } else if (totalContentScore > 50) {
    feedbackContent = "Good content, though some answers could benefit from more specific 'Result' or 'Action' metrics.";
  } else {
    feedbackContent = "Focus on the STAR method to provide more detailed, structure-rich responses.";
  }

  // 2. Visual AI Metrics
  const avgStress = stressMetrics.length 
    ? Math.round(stressMetrics.reduce((a, b) => a + b, 0) / stressMetrics.length) 
    : 35;
  const avgConfidence = confidenceMetrics.length 
    ? Math.round(confidenceMetrics.reduce((a, b) => a + b, 0) / confidenceMetrics.length) 
    : 75;

  // 3. Voice Delivery Algorithm
  let voiceScore = 100;
  const avgWpm = wpmMetrics.length 
    ? Math.round(wpmMetrics.reduce((a, b) => a + b, 0) / wpmMetrics.length) 
    : 0;
  let voiceFeedback = "";

  if ((!transcript || transcript.trim().length === 0) && avgWpm === 0) {
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

  // 4. Overall Weighted Score
  const visualTotal = (100 - avgStress) * 0.4 + avgConfidence * 0.6;
  const totalScore = Math.round((visualTotal * 0.3) + (voiceScore * 0.3) + (totalContentScore * 0.4));

  const result = {
    id: String(Date.now()),
    transcript: transcript || '',
    transcriptSections,
    questionsAsked,
    confidenceScore: avgConfidence,
    stressScore: avgStress,
    voiceScore,
    contentScore: totalContentScore,
    totalScore,
    feedbackVisual: `Visual Analysis: ${avgConfidence > 75 ? 'Excellent eye contact! ' : 'Maintain steadier eye presence. '} ${avgStress > 70 ? 'High tension detected.' : 'You looked calm.'}`,
    feedbackVoice: voiceFeedback,
    feedbackContent,
    rawMetrics: { avgWpm, totalFillers, totalPauses }
  };

  return result;
};

export const submitInterviewData = async (payload) => {
  const calculatedResult = calculateInterviewScore(payload);

  // 1. Always save to localStorage immediately for instant dashboard loading
  localStorage.setItem(`interview_${calculatedResult.id}`, JSON.stringify(calculatedResult));
  localStorage.setItem('latest_interview', JSON.stringify(calculatedResult));

  // 2. Try syncing to Supabase if database table exists
  try {
    const userString = localStorage.getItem("user");
    const userObj = userString ? JSON.parse(userString) : null;
    const userEmail = userObj?.user?.email || userObj?.email || "anonymous";

    await supabase.from('interviews').insert([{
      user_email: userEmail,
      total_score: calculatedResult.totalScore,
      confidence_score: calculatedResult.confidenceScore,
      stress_score: calculatedResult.stressScore,
      voice_score: calculatedResult.voiceScore,
      content_score: calculatedResult.contentScore,
      transcript: calculatedResult.transcript,
      feedback_visual: calculatedResult.feedbackVisual,
      feedback_voice: calculatedResult.feedbackVoice,
      feedback_content: calculatedResult.feedbackContent
    }]);
  } catch (err) {
    console.warn("Supabase table insert skipped (table may not be created yet):", err);
  }

  // 3. Fallback sync to backend API if a live backend URL is provided
  const BASE_URL = import.meta.env.VITE_API_URL;
  if (BASE_URL && !BASE_URL.includes("localhost")) {
    try {
      const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;
      await fetch(`${BASE_URL}/api/interview/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Optional backend sync warning:", e);
    }
  }

  return calculatedResult;
};

export const getInterviewResult = async (interviewId) => {
  // 1. First check localStorage (Instant 0ms retrieval)
  const localData = localStorage.getItem(`interview_${interviewId}`) || localStorage.getItem('latest_interview');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {}
  }

  // 2. Check Supabase
  try {
    const { data, error } = await supabase.from('interviews').select('*').eq('id', interviewId).single();
    if (!error && data) {
      return {
        id: data.id,
        confidenceScore: data.confidence_score,
        stressScore: data.stress_score,
        voiceScore: data.voice_score,
        contentScore: data.content_score,
        totalScore: data.total_score,
        feedbackVisual: data.feedback_visual,
        feedbackVoice: data.feedback_voice,
        feedbackContent: data.feedback_content,
        transcript: data.transcript
      };
    }
  } catch (err) {}

  // 3. Fallback to backend API if URL exists
  const BASE_URL = import.meta.env.VITE_API_URL;
  if (BASE_URL) {
    const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).token : null;
    const res = await fetch(`${BASE_URL}/api/interview/result/${interviewId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
  }

  throw new Error("Interview result not found.");
};
