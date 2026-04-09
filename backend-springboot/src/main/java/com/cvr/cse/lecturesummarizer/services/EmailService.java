package com.cvr.cse.lecturesummarizer.services;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    private static final String RESEND_API_KEY = "re_LfhJUv6d_DuHYDxT5jszrc5nd8dDLDXfb";

    @org.springframework.scheduling.annotation.Async
    public void sendVerificationCode(String toEmail, String code, String type) {
        String subject;
        String text;

        if ("SIGNUP".equalsIgnoreCase(type)) {
            subject = "LectureSumm - Account Verification";
            text = "Welcome to LectureSumm!\\n\\nYour verification code is: " + code + "\\n\\nThis code will expire in 10 minutes.\\n\\nHappy Learning,\\nThe LectureSumm Team";
        } else if ("FORGOT_PASSWORD".equalsIgnoreCase(type)) {
            subject = "LectureSumm - Password Reset";
            text = "You have requested to reset your password.\\n\\nYour verification code is: " + code + "\\n\\nThis code will expire in 10 minutes.\\nIf you did not request this, please ignore this email.\\n\\nThe LectureSumm Team";
        } else {
            subject = "LectureSumm - Verification Code";
            text = "Your verification code is: " + code + "\\n\\nThis code will expire in 10 minutes.";
        }

        try {
            String jsonBody = String.format(
                "{\"from\":\"LectureSumm <onboarding@resend.dev>\",\"to\":\"%s\",\"subject\":\"%s\",\"text\":\"%s\"}",
                toEmail, subject, text
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + RESEND_API_KEY)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                System.err.println("Failed to send email to " + toEmail + " via Resend. Status: " + response.statusCode() + " Body: " + response.body());
            } else {
                System.out.println("Email sent via RESEND to " + toEmail + " successfully!");
            }
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + toEmail + ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }
}
