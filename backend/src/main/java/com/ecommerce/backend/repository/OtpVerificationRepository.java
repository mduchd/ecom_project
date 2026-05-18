package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmailAndOtpAndType(String email, String otp, String type);
    void deleteByEmailAndType(String email, String type);
}
