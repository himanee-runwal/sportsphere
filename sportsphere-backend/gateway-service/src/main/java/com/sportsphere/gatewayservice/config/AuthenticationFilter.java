package com.sportsphere.gatewayservice.config;

import com.sportsphere.gatewayservice.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final RouteValidator validator;
    private final JwtUtil jwtUtil;

    public AuthenticationFilter(RouteValidator validator, JwtUtil jwtUtil) {
        super(Config.class);
        this.validator = validator;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            if (validator.isSecured.test(exchange.getRequest())) {
                String authHeader = null;

                // 1. Try to get token from Authorization header
                String authHeaderValue = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeaderValue != null) {
                    if (authHeaderValue.startsWith("Bearer ")) {
                        authHeader = authHeaderValue.substring(7);
                    } else {
                        authHeader = authHeaderValue;
                    }
                }

                // 2. Try to get token from cookies if not in header
                if (authHeader == null && exchange.getRequest().getCookies().containsKey("accessToken")) {
                    HttpCookie cookie = exchange.getRequest().getCookies().getFirst("accessToken");
                    if (cookie != null) {
                        authHeader = cookie.getValue();
                    }
                }

                if (authHeader == null) {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }

                try {
                    // Validate token
                    jwtUtil.validateToken(authHeader);

                    // Extract claims and add headers
                    Claims claims = jwtUtil.getAllClaimsFromToken(authHeader);

                    // Claims usually maps numbers to Integer or Double by default in JJWT based on
                    // JSON
                    Long userId = null;
                    if (claims.get("userId") != null) {
                        userId = Long.valueOf(claims.get("userId").toString());
                    }

                    ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                            .header("X-User-Email", claims.getSubject())
                            .header("X-User-Role", claims.get("role", String.class))
                            .header("X-User-Id", userId != null ? String.valueOf(userId) : "")
                            .build();

                    return chain.filter(exchange.mutate().request(mutatedRequest).build());
                } catch (Exception e) {
                    System.out.println("Invalid token: " + e.getMessage());
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
            }
            return chain.filter(exchange);
        });
    }

    public static class Config {
    }
}
