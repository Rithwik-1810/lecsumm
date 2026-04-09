package com.cvr.cse.lecturesummarizer.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.List;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(300000); // 5 minutes
        factory.setReadTimeout(300000);    // 5 minutes
        this.restTemplate = new RestTemplate(factory);
        logger.info("AIService initialized with 5-minute timeout.");
    }

    @Data
    public static class SummaryDTO {
        private String content;
        private List<String> keyPoints;
        private List<String> topics;
        private int confidence;
    }

    @Data
    public static class TaskDTO {
        private String title;
        private String description;
        private String priority;
        private String deadline;
    }

    @Data
    public static class AIResponse {
        private String transcript;
        private SummaryDTO summary;
        private List<TaskDTO> tasks;
        private double durationSeconds;
    }

    public AIResponse processLecture(String filePath, String language,
                                     boolean extractTasks, boolean generateSummary) throws Exception {

        String url = aiServiceUrl + "/process";
        logger.info("Calling AI service at: {}", url);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        File file = new File(filePath);
        logger.info("Sending file: {} (size: {} bytes)", file.getName(), file.length());

        // Use FileSystemResource to stream the file (no need to read all bytes)
        FileSystemResource fileResource = new FileSystemResource(file) {
            @Override
            public String getFilename() {
                return file.getName();
            }
        };
        body.add("file", fileResource);
        body.add("language", language);
        body.add("extractTasks", String.valueOf(extractTasks));
        body.add("generateSummary", String.valueOf(generateSummary));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        int maxRetries = 4;
        long delayMs = 30000; // 30 seconds

        for (int i = 0; i < maxRetries; i++) {
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
                logger.info("AI service responded with status: {}", response.getStatusCode());
                logger.debug("Response body: {}", response.getBody());
                return objectMapper.readValue(response.getBody(), AIResponse.class);
            } catch (org.springframework.web.client.HttpStatusCodeException e) {
                String errorBody = e.getResponseBodyAsString();
                if (errorBody != null && errorBody.contains("<!DOCTYPE html>") && i < maxRetries - 1) {
                    logger.warn("Hugging Face is sleeping/returning HTML. Retrying in {} seconds (attempt {}/{})", delayMs/1000, i + 1, maxRetries);
                    try { Thread.sleep(delayMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                } else {
                    logger.error("Error calling AI service: {}", e.getMessage(), e);
                    throw e;
                }
            } catch (Exception e) {
                logger.error("Error calling AI service: {}", e.getMessage(), e);
                throw e;
            }
        }
        throw new RuntimeException("Failed to call AI service after retries.");
    }
}