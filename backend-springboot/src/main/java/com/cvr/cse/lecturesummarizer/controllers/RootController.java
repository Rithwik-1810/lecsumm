package com.cvr.cse.lecturesummarizer.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> status() {
        return Map.of(
            "status", "UP",
            "message", "AI Lecture Summarizer Backend is LIVE",
            "version", "2.0.0"
        );
    }
}
