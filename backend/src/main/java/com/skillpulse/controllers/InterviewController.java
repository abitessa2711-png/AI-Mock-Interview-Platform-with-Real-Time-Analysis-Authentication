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
    
            Interview interview = new Interview();
            interview.setUser(user);
            interview.setTranscript(request.getTranscript());
            interview.setConfidenceScore(avgConfidence);
            interview.setStressScore(avgStress);
            interview.setFeedback(feedback.toString());
            
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
