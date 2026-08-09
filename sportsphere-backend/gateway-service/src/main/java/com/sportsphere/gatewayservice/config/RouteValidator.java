package com.sportsphere.gatewayservice.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/eureka",
            "/v3/api-docs",
            "/swagger-ui"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> {
                if (request.getMethod().name().equals("GET") && 
                    (request.getURI().getPath().startsWith("/api/v1/sports/venues") || 
                     request.getURI().getPath().startsWith("/api/v1/sports/uploads") ||
                     request.getURI().getPath().startsWith("/uploads/"))) {
                    return false;
                }
                
                return openApiEndpoints
                        .stream()
                        .noneMatch(uri -> request.getURI().getPath().contains(uri));
            };
}
