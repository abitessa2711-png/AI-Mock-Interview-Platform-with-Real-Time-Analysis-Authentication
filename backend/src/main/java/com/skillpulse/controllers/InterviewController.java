package com.skillpulse.controllers;

import com.skillpulse.models.Interview;
import com.skillpulse.models.User;
import com.skillpulse.payload.request.InterviewSubmitRequest;
import com.skillpulse.payload.response.MessageResponse;
import com.skillpulse.repository.InterviewRepository;
import com.skillpulse.repository.UserRepository;
import com.skillpulse.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    @Autowired
    InterviewRepository interviewRepository;

    @Autowired
    UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitInterviewData(@RequestBody InterviewSubmitRequest request) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthorized session"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            User user = userRepository.findById(userDetails.getId()).orElse(null);
    
            if (user == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
            }
    
            // Safe calculation for metrics using optional and null-safe streams
            // Default to 0 if no data is provided, rather than 50 (neutral/average)
            int avgStress = (request.getStressMetrics() == null || request.getStressMetrics().isEmpty()) ? 0 : 
                (int) Math.round(request.getStressMetrics().stream()
                    .filter(java.util.Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average().orElse(0));
                
            int avgConfidence = (request.getConfidenceMetrics() == null || request.getConfidenceMetrics().isEmpty()) ? 0 : 
                (int) Math.round(request.getConfidenceMetrics().stream()
                    .filter(java.util.Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average().orElse(0));
    
            // Feedback synthesis
            StringBuilder feedback = new StringBuilder();
            if (avgConfidence > 75) feedback.append("Excellent confidence maintained! ");
            else if (avgConfidence > 0 && avgConfidence < 40) feedback.append("Try to maintain better eye contact and posture to project confidence. ");
            else if (avgConfidence == 0) feedback.append("Visual presence not detected or inconsistent. ");
            else feedback.append("Your confidence levels were steady. ");
            
            if (avgStress > 70) feedback.append("Some high-stress indicators were detected. Working on calm breathing can help. ");
            else if (avgStress > 0) feedback.append("You remained impressively calm under the pressure of the interview questions. ");
    
            // Content Analysis - Word Count Based
            int contentScore = 0;
            String fullTranscript = request.getTranscript() != null ? request.getTranscript().trim() : "";
            int wordCount = fullTranscript.isEmpty() ? 0 : fullTranscript.split("\\s+").length;
            
            // Assume 5 questions. Excellent content usually averages ~50 words per answer.
            // Target: 250 words total for a 100% content score.
            int targetWords = 250; 
            if (wordCount > 5) {
                contentScore = (int) Math.min(100, Math.round(((double)wordCount / targetWords) * 100));
            }

            // Voice Delivery Algorithm
            int voiceScore = 100;
            int totalFillers = request.getTotalFillers() != null ? request.getTotalFillers() : 0;
            int totalPauses = request.getTotalPauses() != null ? request.getTotalPauses() : 0;
            int avgWpm = (request.getWpmMetrics() == null || request.getWpmMetrics().isEmpty()) ? 0 : 
                (int) Math.round(request.getWpmMetrics().stream()
                    .filter(java.util.Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average().orElse(0));

            StringBuilder voiceFeedback = new StringBuilder();
            // Stricter no-speech detection: less than 15 words is considered "failure to engage"
            boolean hasNoSpeech = wordCount < 15 && avgWpm == 0;
            
            if (hasNoSpeech) {
                voiceScore = 0;
                contentScore = 0; // Force content to 0 as well if voice is missing
                voiceFeedback.append("No significant speech detected. Performance score heavily impacted. Please ensure your microphone is working and you participate actively. ");
            } else {
                if (totalFillers > 5) {
                    voiceScore -= Math.min(30, (totalFillers * 3)); // Increased penalty
                    voiceFeedback.append("High usage of filler words detected (").append(totalFillers).append(" times). ");
                } else if (totalFillers > 0) {
                    voiceScore -= (totalFillers * 2);
                    voiceFeedback.append("Some filler words detected. ");
                } else {
                    voiceFeedback.append("Clear speech with minimal filler words. ");
                }

                if (totalPauses > 3) {
                    voiceScore -= Math.min(30, (totalPauses * 4)); // Increased penalty
                    voiceFeedback.append("Frequent long pauses detected. ");
                } else if (totalPauses > 0) {
                    voiceScore -= (totalPauses * 2);
                    voiceFeedback.append("A few pauses detected. ");
                } else {
                    voiceFeedback.append("Good spoken pacing throughout. ");
                }

                if (avgWpm > 0 && avgWpm < 110) {
                    voiceScore -= Math.min(25, (int) Math.round((110 - avgWpm) * 0.5));
                    voiceFeedback.append("Speaking pace was a bit slow (").append(avgWpm).append(" WPM). ");
                } else if (avgWpm > 170) {
                    voiceScore -= Math.min(25, (int) Math.round((avgWpm - 170) * 0.5));
                    voiceFeedback.append("Speaking pace was quite fast (").append(avgWpm).append(" WPM). ");
                } else if (avgWpm > 0) {
                    voiceFeedback.append("Excellent speaking rate. ");
                }
            }
            voiceScore = Math.max(0, voiceScore);

            Interview interview = new Interview();
            interview.setUser(user);
            interview.setTranscript(fullTranscript);
            interview.setConfidenceScore(avgConfidence);
            interview.setStressScore(avgStress);
            interview.setVoiceScore(voiceScore);
            interview.setContentScore(contentScore);
            interview.setFeedback(feedback.toString());
            
            String visualFeedback = "Visual Analysis: ";
            if (avgConfidence == 0 && avgStress == 0) {
                visualFeedback += "No visual data recorded. ";
            } else {
                visualFeedback += (avgConfidence > 75 ? "Excellent eye contact! " : "Maintain steadier eye presence. ");
                visualFeedback += (avgStress > 70 ? "High tension detected." : "You looked calm.");
            }
            interview.setFeedbackVisual(visualFeedback);
            interview.setFeedbackVoice(voiceFeedback.toString());
            
            // Recalculate component totals for overall result
            // If data is missing (0), visual score should be 0, not (100-0)*0.4 = 40.
            double visualContribution = (avgConfidence == 0 && avgStress == 0) ? 0 : ((100 - avgStress) * 0.4 + avgConfidence * 0.6);
            int totalScore = (int) Math.round((visualContribution * 0.3) + (voiceScore * 0.3) + (contentScore * 0.4));
            interview.setTotalScore(totalScore);
            
            Interview saved = interviewRepository.save(interview);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in Interview Submission: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse("Error processing interview results: " + e.getMessage()));
        }
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<?> getInterviewResult(@PathVariable Long id) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Interview interview = interviewRepository.findById(id).orElse(null);
        
        if (interview == null || !interview.getUser().getId().equals(userDetails.getId())) {
             return ResponseEntity.badRequest().body(new MessageResponse("Error: Interview not found or unauthorized"));
        }
        
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getUserHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Interview> history = interviewRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        return ResponseEntity.ok(history);
    }
}
