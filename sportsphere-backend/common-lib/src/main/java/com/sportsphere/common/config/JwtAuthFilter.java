package com.sportsphere.common.config;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import java.util.List;

/**
 * Reads X-User-Email, X-User-Role, and X-User-Id headers set by the
 * API Gateway and populates the Spring Security context accordingly.
 * Shared across all business microservices.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {


    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String userEmail = request.getHeader("X-User-Email");
        final String userRole = request.getHeader("X-User-Role");
        final String userIdStr = request.getHeader("X-User-Id");

        if (userEmail == null || userRole == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Long userId = null;
            if (userIdStr != null && !userIdStr.isEmpty()) {
                userId = Long.parseLong(userIdStr);
            }

            // Store userId and role as request attributes for controller access
            request.setAttribute("userId", userId);
            request.setAttribute("role", userRole);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userEmail,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + userRole)));

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            log.warn("Failed to set authentication from headers: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
