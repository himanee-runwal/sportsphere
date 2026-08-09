package com.sportsphere.authservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationServiceClient {

    private final RestTemplate restTemplate;

    @Value("${notification-service.url}")
    private String notificationServiceUrl;

    public void sendWelcomeEmail(String userId, String email, String name) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("name", name);
        sendNotification(userId, email, "WelcomeEmail", payload);
    }

    public void sendOtpEmail(String userId, String email, String otp) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("otp", otp);
        sendNotification(userId, email, "OtpVerification", payload);
    }

    public void sendPasswordResetTokenEmail(String userId, String email, String resetToken) {
        Map<String, Object> payload = new HashMap<>();
        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
        payload.put("resetLink", resetLink);
        sendNotification(userId, email, "PasswordReset", payload);
    }

    public void sendManagerRegistrationEmail(String userId, String email, String name, String resetToken) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("name", name);
        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
        payload.put("resetLink", resetLink);
        sendNotification(userId, email, "ManagerRegistration", payload);
    }

    private void sendNotification(String userId, String email, String notificationType, Map<String, Object> payload) {
        String url = notificationServiceUrl + "/api/notifications/send";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> request = new HashMap<>();
            request.put("userId", userId);
            request.put("recipientEmail", email);
            request.put("notificationType", notificationType);
            request.put("channels", List.of("Email"));
            request.put("payload", payload);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            log.info("Sending {} notification to {} via {}", notificationType, email, url);
            restTemplate.postForObject(url, entity, Object.class);
        } catch (Exception e) {
            log.error("Failed to send {} notification to {}: {}", notificationType, email, e.getMessage());
        }
    }
}
