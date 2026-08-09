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
                String path = request.getURI().getPath();
                if (request.getMethod().name().equals("GET") &&
                    !path.startsWith("/api/v1/sports/venues/my-venues") &&
                    (path.startsWith("/api/v1/sports/venues") ||
                     path.startsWith("/api/v1/sports/uploads") ||
                     path.startsWith("/uploads/"))) {
                    return false;
                }

                return openApiEndpoints
                        .stream()
                        .noneMatch(uri -> path.contains(uri));
            };
}
