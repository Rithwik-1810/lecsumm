package com.cvr.cse.lecturesummarizer.controllers;

import com.cvr.cse.lecturesummarizer.dto.AuthRequest;
import com.cvr.cse.lecturesummarizer.dto.AuthResponse;
import com.cvr.cse.lecturesummarizer.models.User;
import com.cvr.cse.lecturesummarizer.security.JwtUtil;
import com.cvr.cse.lecturesummarizer.services.GoogleAuthService;
import com.cvr.cse.lecturesummarizer.services.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import com.cvr.cse.lecturesummarizer.dto.OtpRequest;
import com.cvr.cse.lecturesummarizer.dto.ResetPasswordRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private GoogleAuthService googleAuthService;

    @Autowired
    private com.cvr.cse.lecturesummarizer.services.OtpService otpService;

    @PostMapping("/send-signup-otp")
    public ResponseEntity<?> sendSignupOtp(@RequestBody OtpRequest request) {
        try {
            // Check if user already exists
            try {
                userService.getUserByEmail(request.getEmail());
                return ResponseEntity.badRequest().body("User already exists with this email");
            } catch (Exception e) {
                // User doesn't exist, which is good. Proceed to send OTP.
            }
            otpService.generateAndSendOtp(request.getEmail(), "SIGNUP");
            return ResponseEntity.ok("OTP sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/send-forgot-password-otp")
    public ResponseEntity<?> sendForgotPasswordOtp(@RequestBody OtpRequest request) {
        try {
            // Check if user exists
            userService.getUserByEmail(request.getEmail());
            otpService.generateAndSendOtp(request.getEmail(), "FORGOT_PASSWORD");
            return ResponseEntity.ok("OTP sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("User not found with this email");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), "FORGOT_PASSWORD");
            if (!isValid) {
                return ResponseEntity.badRequest().body("Invalid or expired OTP");
            }
            userService.updatePassword(request.getEmail(), request.getNewPassword());
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        try {
            boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), "SIGNUP");
            if (!isValid) {
                return ResponseEntity.badRequest().body("Invalid or expired OTP");
            }
            
            User user = userService.register(request.getName(), request.getEmail(), request.getPassword());
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = userService.loadUserByUsername(request.getEmail());
            String token = jwtUtil.generateToken(userDetails.getUsername());
            User user = userService.getUserByEmail(request.getEmail());

            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.substring(7));
            User user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody java.util.Map<String, String> body) {
        try {
            String idToken = body.get("idToken");
            GoogleIdToken.Payload payload = googleAuthService.verifyToken(idToken);
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userService.findOrCreateGoogleUser(name, email);
            String token = jwtUtil.generateToken(user.getEmail());

            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Google Authentication Failed: " + e.getMessage());
        }
    }
}