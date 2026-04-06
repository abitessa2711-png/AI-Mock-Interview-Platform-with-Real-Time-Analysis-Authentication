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
            int avgStress = (request.getStressMetrics() == null) ? 50 : 
                (int) Math.round(request.getStressMetrics().stream()
                    .filter(java.util.Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average().orElse(50));
                
            int avgConfidence = (request.getConfidenceMetrics() == null) ? 50 : 
                (int) Math.round(request.getConfidenceMetrics().stream()
                    .filter(java.util.Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average().orElse(50));
    
            // Feedback synthesis
            StringBuilder feedback = new StringBuilder();
            if (avgConfidence > 75) feedback.append("Excellent confidence maintained! ");
            else if (avgConfidence < 40) feedback.append("Try to maintain better eye contact and posture to project confidence. ");
            else feedback.append("Your confidence levels were steady. ");
            
            if (avgStress > 70) feedback.append("Some high-stress indicators were detected. Working on calm breathing can help. ");
            else feedback.append("You remained impressively calm under the pressure of the interview questions. ");
    
            // Content score placeholder
            int contentScore = 0;
            if (request.getTranscriptSections() != null && !request.getTranscriptSections().isEmpty()) {
                contentScore = 50 + Math.min(50, request.getTranscriptSections().size() * 10);
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
            boolean hasNoSpeech = (request.getTranscript() == null || request.getTranscript().trim().isEmpty()) && avgWpm == 0;
            
            if (hasNoSpeech) {
                voiceScore = 0;
                voiceFeedback.append("No clear speech detected. Please speak clearly into the microphone. ");
            } else {
                if (totalFillers > 5) {
                    voiceScore -= Math.min(20, (totalFillers * 2));
                    voiceFeedback.append("High usage of filler words detected (").append(totalFillers).append(" times). ");
                } else if (totalFillers > 0) {
                    voiceScore -= (totalFillers * 2);
                    voiceFeedback.append("Some filler words detected. ");
                } else {
                    voiceFeedback.append("Clear speech with minimal filler words. ");
                }

                if (totalPauses > 3) {
                    voiceScore -= Math.min(20, (totalPauses * 3));
                    voiceFeedback.append("Frequent long pauses detected. ");
                } else if (totalPauses > 0) {
                    voiceScore -= (totalPauses * 2);
                    voiceFeedback.append("A few pauses detected. ");
                } else {
                    voiceFeedback.append("Good spoken pacing throughout. ");
                }

                if (avgWpm > 0 && avgWpm < 100) {
                    voiceScore -= Math.min(20, (int) Math.round((100 - avgWpm) * 0.4));
                    voiceFeedback.append("Speaking pace was a bit slow (").append(avgWpm).append(" WPM). ");
                } else if (avgWpm > 170) {
                    voiceScore -= Math.min(20, (int) Math.round((avgWpm - 170) * 0.4));
                    voiceFeedback.append("Speaking pace was quite fast (").append(avgWpm).append(" WPM). ");
                } else {
                    voiceFeedback.append("Excellent speaking rate. ");
                }
            }
            voiceScore = Math.max(0, voiceScore);

            Interview interview = new Interview();
            interview.setUser(user);
            interview.setTranscript(request.getTranscript() == null ? "" : request.getTranscript());
            interview.setConfidenceScore(avgConfidence);
            interview.setStressScore(avgStress);
            interview.setVoiceScore(voiceScore);
            interview.setContentScore(contentScore);
            interview.setFeedback(feedback.toString());
            interview.setFeedbackVisual("Visual Analysis: " + (avgConfidence > 75 ? "Excellent eye contact! " : "Maintain steadier eye presence. ") + (avgStress > 70 ? "High tension detected." : "You looked calm."));
            interview.setFeedbackVoice(voiceFeedback.toString());
            // Need total score calculation
            double visualTotal = (100 - avgStress) * 0.4 + avgConfidence * 0.6;
            int totalScore = (int) Math.round((visualTotal * 0.3) + (voiceScore * 0.3) + (contentScore * 0.4));
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
