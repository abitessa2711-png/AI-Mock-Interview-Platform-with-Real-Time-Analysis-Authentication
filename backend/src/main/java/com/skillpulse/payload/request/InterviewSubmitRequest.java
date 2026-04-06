package com.skillpulse.payload.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class InterviewSubmitRequest {
    private String transcript;
    
    // Arrays sent from client for heuristic assessment
    private List<Integer> stressMetrics;
    private List<Integer> confidenceMetrics;
    private List<Integer> wpmMetrics;
    private List<String> transcriptSections;
    private List<String> questionsAsked;
    private Integer totalPauses;
    private Integer totalFillers;
}
