package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.exception.ApiException;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public void generateAndSendOtp(User user) {
        String otp = generateOtp();
        user.setOtpCodeHash(passwordEncoder.encode(otp));
        user.setOtpExpiresAt(Instant.now().plusSeconds(OTP_EXPIRY_MINUTES * 60L));
        userRepository.save(user);

        sendOtpEmail(user.getEmail(), user.getName(), otp);
    }

    public boolean verifyOtp(User user, String otp) {
        if (user.getOtpCodeHash() == null || user.getOtpExpiresAt() == null) {
            return false;
        }
        if (Instant.now().isAfter(user.getOtpExpiresAt())) {
            return false;
        }
        return passwordEncoder.matches(otp, user.getOtpCodeHash());
    }

    public void clearOtp(User user) {
        user.setOtpCodeHash(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
    }

    private String generateOtp() {
        int otp = SECURE_RANDOM.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", otp);
    }

    private void sendOtpEmail(String email, String name, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Mentr — Verify your email");
            helper.setText(buildEmailHtml(name, otp), true);
            mailSender.send(message);
            log.info("OTP email sent to {}", email);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}", email, e);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "MAIL_SEND_FAILED", "Failed to send verification email. Please try again.");
        }
    }

    private String buildEmailHtml(String name, String otp) {
        return """
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #1a3fc4; font-size: 28px; margin-bottom: 8px;">Mentr</h1>
                <p style="color: #555; font-size: 16px; margin-bottom: 24px;">Verify your email address</p>
                <p style="color: #333; font-size: 15px;">Hi %s,</p>
                <p style="color: #333; font-size: 15px;">Use the code below to verify your email and activate your Mentr account:</p>
                <div style="background: #f4f6fa; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a3fc4;">%s</span>
                </div>
                <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. If you didn't create a Mentr account, ignore this email.</p>
            </div>
            """.formatted(name, otp);
    }
}
