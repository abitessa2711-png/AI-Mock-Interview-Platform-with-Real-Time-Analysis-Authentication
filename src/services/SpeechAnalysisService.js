export class SpeechAnalysisService {
  constructor(onResult) {
    this.recognition = null;
    this.isListening = false;
    this.onResult = onResult;
    this.startTime = null;
    this.wordCount = 0;
    this.fillerWordCount = 0;
    this.pauseCount = 0;
    this.lastWordTime = Date.now();
    
    const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically'];
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onstart = () => {
        this.isListening = true;
        this.startTime = Date.now();
        this.lastWordTime = Date.now();
      };
      
      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        const now = Date.now();
        
        // Pause detection (> 2 seconds between words)
        if (now - this.lastWordTime > 2000) {
            this.pauseCount++;
        }
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            finalTranscript += transcript;
            
            const words = transcript.trim().toLowerCase().split(/\s+/);
            this.wordCount += words.length;
            
            // Check fillers
            words.forEach(w => {
                 if(FILLER_WORDS.includes(w)) this.fillerWordCount++;
            });
            this.lastWordTime = now;
          } else {
            interimTranscript += event.results[i][0].transcript;
            this.lastWordTime = now;
          }
        }
        
        const timeElapsedMinutes = (now - this.startTime) / 60000;
        const wpm = timeElapsedMinutes > 0.05 ? Math.round(this.wordCount / timeElapsedMinutes) : 0;
        
        if (this.onResult) {
          this.onResult({
            interim: interimTranscript,
            final: finalTranscript,
            full: finalTranscript + interimTranscript, // New field
            wpm: wpm,
            pauses: this.pauseCount,
            fillers: this.fillerWordCount
          });
        }
      };
      
      this.recognition.onend = () => {
        if (this.isListening) {
          try {
             this.recognition.start();
          } catch(e) {}
        }
      };
      
      this.recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          this.isListening = false;
        }
      };
    }
  }
  
  start() {
    if (this.recognition && !this.isListening) {
      this.wordCount = 0;
      this.fillerWordCount = 0;
      this.pauseCount = 0;
      this.startTime = Date.now();
      this.lastWordTime = Date.now();
      try {
        this.recognition.start();
      } catch (err) {}
    }
  }
  
  stop() {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
}
