package com.cvr.cse.lecturesummarizer.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "otps")
public class OtpCode {
    @Id
    private String id;

    @Indexed
    private String email;

    private String code;

    private LocalDateTime expiryTime;

    private String type; // e.g. "SIGNUP", "FORGOT_PASSWORD"

    public OtpCode(String email, String code, LocalDateTime expiryTime, String type) {
        this.email = email;
        this.code = code;
        this.expiryTime = expiryTime;
        this.type = type;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryTime);
    }
}
