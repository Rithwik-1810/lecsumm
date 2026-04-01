package com.cvr.cse.lecturesummarizer.services;

import com.cvr.cse.lecturesummarizer.models.OtpCode;
import com.cvr.cse.lecturesummarizer.repositories.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    // Generates a 6-digit OTP, saves it, and sends the email
    @Transactional
    public void generateAndSendOtp(String email, String type) {
        // Delete any existing OTP for this email and type
        otpRepository.findByEmailAndType(email, type).ifPresent(otp -> {
            otpRepository.deleteByEmailAndType(email, type);
        });

        // Generate 6-digit code
        String code = String.format("%06d", new Random().nextInt(1000000));
        
        // Expiry in 10 minutes
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(10);
        OtpCode otpCode = new OtpCode(email, code, expiryTime, type);
        
        otpRepository.save(otpCode);
        emailService.sendVerificationCode(email, code, type);
    }

    @Transactional
    public boolean verifyOtp(String email, String code, String type) {
        Optional<OtpCode> optionalOtp = otpRepository.findByEmailAndType(email, type);
        if (optionalOtp.isEmpty()) {
            return false;
        }
        
        OtpCode otpCode = optionalOtp.get();
        if (otpCode.isExpired()) {
            otpRepository.deleteByEmailAndType(email, type);
            return false;
        }
        
        boolean isValid = otpCode.getCode().equals(code);
        if (isValid) {
            otpRepository.deleteByEmailAndType(email, type);
        }
        return isValid;
    }
}
