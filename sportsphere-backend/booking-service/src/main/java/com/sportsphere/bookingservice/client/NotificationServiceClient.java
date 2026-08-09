package com.sportsphere.bookingservice.client;

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

    public void sendBookingConfirmation(String userId, String email, String bookingId, String venueName, String time) {
        String url = notificationServiceUrl + "/api/notifications/send";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = new HashMap<>();
            payload.put("bookingId", bookingId);
            payload.put("venueName", venueName);
            payload.put("time", time);

            Map<String, Object> request = new HashMap<>();
            request.put("userId", userId);
            request.put("recipientEmail", email);
            request.put("notificationType", "BookingConfirmation");
            request.put("channels", List.of("Email"));
            request.put("payload", payload);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            log.info("Sending booking confirmation notification to {} via {}", email, url);
            restTemplate.postForObject(url, entity, Object.class);
        } catch (Exception e) {
            log.error("Failed to send notification for booking {}: {}", bookingId, e.getMessage());
        }
    }
}
