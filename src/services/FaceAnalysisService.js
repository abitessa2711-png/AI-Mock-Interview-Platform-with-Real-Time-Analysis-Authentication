import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    return true;
  } catch (error) {
    console.error("Failed to load face-api models:", error);
    return false;
  }
};

export const analyzeFace = async (videoElement) => {
  if (!videoElement || videoElement.paused || videoElement.ended) return null;
  
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
      .withFaceLandmarks()
      .withFaceExpressions();

    if (!detection) {
      return { facePresence: false, stress: 100, confidence: 0 };
    }

    const expressions = detection.expressions;
    // High stress = fear, angry, sad
    const stressScore = Math.min((expressions.fear + expressions.angry + expressions.sad) * 100, 100);
    // Confidence = neutral + happy
    const confidenceScore = Math.min((expressions.neutral + expressions.happy) * 100, 100);

    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const eyeDistance = (eye) => {
      const top = eye[1].y + eye[2].y;
      const bottom = eye[4].y + eye[5].y;
      return bottom - top;
    };
    
    // Check if looking straight based on horizontal positions (heuristics)
    const nose = landmarks.getNose();
    const jawOutline = landmarks.getJawOutline();
    const isLookingAway = nose[0].x < jawOutline[3].x || nose[0].x > jawOutline[13].x;

    const blink = (eyeDistance(leftEye) + eyeDistance(rightEye)) < 5;

    return {
      facePresence: true,
      stress: stressScore,
      confidence: confidenceScore,
      isBlinking: blink,
      eyeContact: !isLookingAway
    };
  } catch (err) {
    console.warn("Face analysis loop dropped frame");
    return null;
  }
};
