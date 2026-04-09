package com.cvr.cse.lecturesummarizer.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.scheduling.annotation.Async
    public void sendVerificationCode(String toEmail, String code, String type) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);

        if ("SIGNUP".equalsIgnoreCase(type)) {
            message.setSubject("LectureSumm - Account Verification");
            message.setText("Welcome to LectureSumm!\n\nYour verification code is: " + code + "\n\nThis code will expire in 10 minutes.\n\nHappy Learning,\nThe LectureSumm Team");
        } else if ("FORGOT_PASSWORD".equalsIgnoreCase(type)) {
            message.setSubject("LectureSumm - Password Reset");
            message.setText("You have requested to reset your password.\n\nYour verification code is: " + code + "\n\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this email.\n\nThe LectureSumm Team");
        } else {
            message.setSubject("LectureSumm - Verification Code");
            message.setText("Your verification code is: " + code + "\n\nThis code will expire in 10 minutes.");
        }

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + toEmail + ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }
}
