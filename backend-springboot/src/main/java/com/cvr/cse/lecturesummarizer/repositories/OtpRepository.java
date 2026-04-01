package com.cvr.cse.lecturesummarizer.repositories;

import com.cvr.cse.lecturesummarizer.models.OtpCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends MongoRepository<OtpCode, String> {
    Optional<OtpCode> findByEmailAndType(String email, String type);
    void deleteByEmailAndType(String email, String type);
}
