package com.sportsphere.authservice.service.impl;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.authservice.client.NotificationServiceClient;
import com.sportsphere.authservice.dto.*;
import com.sportsphere.authservice.entity.Role;
import com.sportsphere.authservice.entity.User;
import com.sportsphere.authservice.repository.UserRepository;
import com.sportsphere.authservice.service.AuthService;
import com.sportsphere.authservice.service.JwtService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final UserRepository repository;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final PasswordEncoder passwordEncoder;
        private final NotificationServiceClient notificationClient;

        @SuppressWarnings("null")
        @Override
        public MessageResponse register(RegisterRequest request) {
                if (request.getRole() == Role.ADMIN || request.getRole() == Role.MANAGER) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN,
                                        "Cannot register as ADMIN or MANAGER");
                }

                if (repository.findByEmail(request.getEmail()).isPresent()
                                || repository.findByPhone(request.getPhone()).isPresent()) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.CONFLICT,
                                        "Email or Phone Number already exists");
                }

                @NonNull
                User user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .profileImage(request.getProfileImage())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() != null ? request.getRole() : Role.PLAYER)
                                .city(request.getCity())
                                .gender(request.getGender())
                                .experienceLevel(request.getExperienceLevel())
                                .build();

                if (request.getSports() != null && !request.getSports().isEmpty()) {
                        java.util.List<com.sportsphere.authservice.entity.UserSport> userSports = request.getSports()
                                        .stream()
                                        .map(sport -> com.sportsphere.authservice.entity.UserSport.builder()
                                                        .sport(sport)
                                                        .user(user)
                                                        .build())
                                        .toList();
                        user.setSports(userSports);
                }

                repository.save(user);

                notificationClient.sendWelcomeEmail(user.getId().toString(), user.getEmail(), user.getFirstName());

                return MessageResponse.builder().message("User registered successfully").build();
        }

        @Override
        public AuthResponse authenticate(AuthRequest request) {
                @NonNull
                User user = repository.findByEmailOrPhone(request.getEmailOrPhone(), request.getEmailOrPhone())
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "User is not registered"));

                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.getEmailOrPhone(),
                                                        request.getPassword()));
                } catch (org.springframework.security.authentication.BadCredentialsException e) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid creds");
                }

                var jwtToken = jwtService.generateToken(user);
                var refreshToken = jwtService.generateRefreshToken(user);

                // Update refresh token in database
                user.setRefreshToken(refreshToken);
                repository.save(user);

                return AuthResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        @Override
        public AuthResponse refreshToken(RefreshTokenRequest request) {
                String reqRefreshToken = request.getRefreshToken();
                String userEmail = jwtService.extractUsername(reqRefreshToken);

                if (userEmail == null) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
                }

                User user = repository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                if (!jwtService.isTokenValid(reqRefreshToken, user)
                                || !reqRefreshToken.equals(user.getRefreshToken())) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired or invalid");
                }

                var jwtToken = jwtService.generateToken(user);
                var newRefreshToken = jwtService.generateRefreshToken(user);

                user.setRefreshToken(newRefreshToken);
                repository.save(user);

                return AuthResponse.builder()
                                .token(jwtToken)
                                .refreshToken(newRefreshToken)
                                .build();
        }

        @Override
        public MessageResponse logout(String token) {
                String email = jwtService.extractUsername(token);
                if (email != null) {
                        Optional<User> userOpt = repository.findByEmail(email);
                        if (userOpt.isPresent()) {
                                User user = userOpt.get();
                                user.setRefreshToken(null);
                                repository.save(user);
                        }
                }
                return MessageResponse.builder().message("Logged out successfully").build();
        }

        @Override
        public MessageResponse forgotPassword(ForgotPasswordRequest request) {
                Optional<User> userOpt = repository.findByEmailOrPhone(request.getEmailOrPhone(),
                                request.getEmailOrPhone());

                if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        String resetToken = UUID.randomUUID().toString();
                        user.setResetToken(resetToken);
                        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
                        repository.save(user);

                        notificationClient.sendPasswordResetTokenEmail(user.getId().toString(), user.getEmail(),
                                        resetToken);
                }

                return MessageResponse.builder()
                                .message("If an account with that email exists, a password reset link has been sent.")
                                .build();
        }

        @Override
        public MessageResponse verifyOtp(VerifyOtpRequest request) {
                User user = repository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
                }

                if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired");
                }

                // OTP is valid, generate reset token
                user.setOtp(null);
                user.setOtpExpiry(null);
                String resetToken = UUID.randomUUID().toString();
                user.setResetToken(resetToken);
                user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
                repository.save(user);

                notificationClient.sendPasswordResetTokenEmail(user.getId().toString(), user.getEmail(), resetToken);

                return MessageResponse.builder()
                                .message("OTP verified successfully. Password reset link sent to your email.").build();
        }

        @Override
        public MessageResponse resetPassword(ResetPasswordRequest request) {
                String resetToken = request.getTokenOrOtp();

                User user = repository.findAll().stream()
                                .filter(u -> resetToken.equals(u.getResetToken()))
                                .findFirst()
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Invalid reset token"));

                if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has expired");
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
                repository.save(user);

                return MessageResponse.builder().message("Password reset successfully").build();
        }

        @Override
        public MessageResponse changePassword(String email, ChangePasswordRequest request) {
                User user = repository.findByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect old password");
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                repository.save(user);

                return MessageResponse.builder().message("Password changed successfully").build();
        }

        @Override
        public UserResponse getMe(String email) {
                User user = repository.findByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                java.util.List<String> sportsList = null;
                if (user.getSports() != null) {
                        sportsList = user.getSports().stream()
                                        .map(sport -> sport.getSport())
                                        .toList();
                }

                return UserResponse.builder()
                                .id(user.getId())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .profileImage(user.getProfileImage())
                                .bio(user.getBio())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .role(user.getRole())
                                .isBlocked(user.isBlocked())
                                .city(user.getCity())
                                .gender(user.getGender())
                                .experienceLevel(user.getExperienceLevel())
                                .sports(sportsList)
                                .build();
        }

        @Override
        public UserResponse getUserByEmail(String email) {
                return getMe(email);
        }

        @SuppressWarnings("null")
        @Override
        public UserResponse createManager(RegisterRequest request) {
                if (repository.findByEmail(request.getEmail()).isPresent()
                                || repository.findByPhone(request.getPhone()).isPresent()) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.CONFLICT,
                                        "Email or Phone Number already exists");
                }

                @NonNull
                User user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .profileImage(request.getProfileImage())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.MANAGER)
                                .city(request.getCity())
                                .gender(request.getGender())
                                .experienceLevel(request.getExperienceLevel())
                                .build();

                String resetToken = UUID.randomUUID().toString();
                user.setResetToken(resetToken);
                user.setResetTokenExpiry(LocalDateTime.now().plusDays(1)); // Valid for 24 hours

                repository.save(user);

                notificationClient.sendManagerRegistrationEmail(user.getId().toString(), user.getEmail(),
                                user.getFirstName(), resetToken);

                return getMe(user.getEmail());
        }

        @Override
        public MessageResponse resendManagerAccess(String email) {
                User user = repository.findByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found"));

                if (user.getRole() != Role.MANAGER) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a manager");
                }

                String resetToken = UUID.randomUUID().toString();
                user.setResetToken(resetToken);
                user.setResetTokenExpiry(LocalDateTime.now().plusDays(1)); // Valid for 24 hours
                repository.save(user);

                notificationClient.sendManagerRegistrationEmail(user.getId().toString(), user.getEmail(),
                                user.getFirstName(), resetToken);

                return MessageResponse.builder()
                                .message("Manager credentials re-sent successfully")
                                .build();
        }

        @Override
        public MessageResponse blockUser(@NonNull Long userId) {
                User user = repository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                user.setBlocked(true);
                user.setRefreshToken(null); // Force logout
                repository.save(user);
                return MessageResponse.builder().message("User blocked successfully").build();
        }

        @Override
        public MessageResponse unblockUser(@NonNull Long userId) {
                User user = repository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                user.setBlocked(false);
                repository.save(user);
                return MessageResponse.builder().message("User unblocked successfully").build();
        }

        @Override
        public MessageResponse updateRole(@NonNull Long userId, RoleUpdateRequest request) {
                User user = repository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                user.setRole(request.getRole());
                repository.save(user);
                return MessageResponse.builder().message("User role updated successfully").build();
        }

        @SuppressWarnings("null")
        @Override
        public UserResponse editUserAsAdmin(@NonNull Long userId, AdminUserEditRequest request) {
                User user = repository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                if (request.getFirstName() != null)
                        user.setFirstName(request.getFirstName());
                if (request.getLastName() != null)
                        user.setLastName(request.getLastName());
                if (request.getProfileImage() != null)
                        user.setProfileImage(request.getProfileImage());
                if (request.getBio() != null)
                        user.setBio(request.getBio());
                if (request.getCity() != null)
                        user.setCity(request.getCity());
                if (request.getGender() != null)
                        user.setGender(request.getGender());
                if (request.getExperienceLevel() != null)
                        user.setExperienceLevel(request.getExperienceLevel());
                if (request.getRole() != null)
                        user.setRole(request.getRole());

                if (request.getSports() != null) {
                        if (user.getSports() != null) {
                                user.getSports().clear();
                        } else {
                                user.setSports(new java.util.ArrayList<>());
                        }

                        java.util.List<com.sportsphere.authservice.entity.UserSport> userSports = request.getSports()
                                        .stream()
                                        .map(sport -> com.sportsphere.authservice.entity.UserSport.builder()
                                                        .sport(sport)
                                                        .user(user)
                                                        .build())
                                        .toList();
                        user.getSports().addAll(userSports);
                }

                repository.save(user);
                return getMe(user.getEmail());
        }
}
