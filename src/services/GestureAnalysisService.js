/**
 * GestureAnalysisService.js
 * 
 * Uses TensorFlow.js + MoveNet (Light) — a real neural network model —
 * to detect 17 body keypoints from the webcam feed and extract:
 *  - Posture score     : are shoulders level & upright?
 *  - Gesture activity  : hand movements (too much = nervousness)
 *  - Head stability    : steady head = confidence
 *  - Body lean         : leaning forward = engaged, away = disinterested
 */

import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

let detector = null;
let prevNosePos = null;
let prevWristLeft = null;
let prevWristRight = null;

// Keypoint indices for MoveNet
const KP = {
  NOSE: 0,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12
};

/**
 * Load MoveNet Lightning (smallest + fastest neural network model)
 */
export const loadPoseModel = async () => {
  try {
    await tf.ready();
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true
      }
    );
    console.log('[GestureAnalysis] MoveNet model loaded successfully');
    return true;
  } catch (err) {
    console.error('[GestureAnalysis] Failed to load MoveNet:', err);
    return false;
  }
};

/**
 * Analyze a single video frame and return gesture metrics
 */
export const analyzeGesture = async (videoElement) => {
  if (!detector || !videoElement || videoElement.paused) return null;

  try {
    const poses = await detector.estimatePoses(videoElement, { flipHorizontal: true });
    if (!poses || poses.length === 0) return null;

    const keypoints = poses[0].keypoints;

    // Helper: get a specific keypoint (returns null if confidence < threshold)
    const kp = (idx, minScore = 0.3) => {
      const k = keypoints[idx];
      return k && k.score > minScore ? k : null;
    };

    const nose          = kp(KP.NOSE);
    const leftShoulder  = kp(KP.LEFT_SHOULDER);
    const rightShoulder = kp(KP.RIGHT_SHOULDER);
    const leftWrist     = kp(KP.LEFT_WRIST);
    const rightWrist    = kp(KP.RIGHT_WRIST);
    const leftHip       = kp(KP.LEFT_HIP);
    const rightHip      = kp(KP.RIGHT_HIP);

    // ── 1. POSTURE SCORE ────────────────────────────────────────────────────────
    // Good posture: shoulders roughly level (low y-difference)
    let postureScore = 100;
    let postureNote  = 'Good upright posture detected.';

    if (leftShoulder && rightShoulder) {
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      if (shoulderDiff > 30) {
        postureScore -= 30;
        postureNote = 'Uneven shoulders detected — try to sit straight.';
      }

      // Check if slouching: shoulders much higher than hips in frame ratio
      if (leftHip && rightHip) {
        const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const avgHipY      = (leftHip.y + rightHip.y) / 2;
        const torsoHeight  = avgHipY - avgShoulderY;
        if (torsoHeight < 60) {
          postureScore -= 25;
          postureNote = 'Slouching detected — sit up straight for better presence.';
        }
      }
    }
    postureScore = Math.max(0, postureScore);

    // ── 2. HAND GESTURE ACTIVITY ────────────────────────────────────────────────
    // Measure how much wrists are moving (large deltas = excessive gesturing or nervousness)
    let gestureScore  = 100;
    let gestureNote   = 'Calm, controlled hand movements.';
    let gestureActivity = 0;

    if (leftWrist && rightWrist) {
      if (prevWristLeft && prevWristRight) {
        const leftDelta  = Math.hypot(leftWrist.x  - prevWristLeft.x,  leftWrist.y  - prevWristLeft.y);
        const rightDelta = Math.hypot(rightWrist.x - prevWristRight.x, rightWrist.y - prevWristRight.y);
        gestureActivity  = (leftDelta + rightDelta) / 2;

        if (gestureActivity > 50) {
          gestureScore -= 30;
          gestureNote = 'Excessive hand movement detected — can signal nervousness.';
        } else if (gestureActivity > 20) {
          gestureNote = 'Moderate hand gestures — natural and communicative.';
        }
      }
      prevWristLeft  = leftWrist;
      prevWristRight = rightWrist;
    }
    gestureScore = Math.max(0, gestureScore);

    // ── 3. HEAD STABILITY ────────────────────────────────────────────────────────
    // Small nose movement = stable, focused. Large = distracted or anxious.
    let headScore = 100;
    let headNote  = 'Steady head position — shows focus and confidence.';

    if (nose && prevNosePos) {
      const noseDelta = Math.hypot(nose.x - prevNosePos.x, nose.y - prevNosePos.y);
      if (noseDelta > 20) {
        headScore -= 25;
        headNote = 'Frequent head movements detected — try to maintain steady eye contact.';
      }
    }
    if (nose) prevNosePos = nose;
    headScore = Math.max(0, headScore);

    // ── 4. BODY LEAN ENGAGEMENT ──────────────────────────────────────────────────
    // Compare shoulder midpoint x vs hip midpoint x to detect lean
    let engagementScore = 75; // neutral default
    let engagementNote  = 'Neutral body posture.';

    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
      const hipMidX      = (leftHip.x + rightHip.x) / 2;
      const lean         = shoulderMidX - hipMidX;

      if (Math.abs(lean) < 15) {
        engagementScore = 95;
        engagementNote = 'Well-centered, engaged posture.';
      } else if (lean < -15) {
        engagementScore = 60;
        engagementNote = 'Leaning backward — try to face the camera more directly.';
      } else {
        engagementScore = 85;
        engagementNote = 'Leaning slightly forward — shows engagement.';
      }
    }

    return {
      postureScore,
      gestureScore,
      headScore,
      engagementScore,
      gestureActivity,
      postureNote,
      gestureNote,
      headNote,
      engagementNote
    };

  } catch (err) {
    console.warn('[GestureAnalysis] Frame dropped:', err.message);
    return null;
  }
};
