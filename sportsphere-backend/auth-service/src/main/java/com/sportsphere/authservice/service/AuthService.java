package com.sportsphere.authservice.service;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.authservice.dto.*;
import lombok.NonNull;

public interface AuthService {
    MessageResponse register(RegisterRequest request);

    AuthResponse authenticate(AuthRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    MessageResponse logout(String token);

    MessageResponse forgotPassword(ForgotPasswordRequest request);

    MessageResponse verifyOtp(VerifyOtpRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);

    MessageResponse changePassword(String email, ChangePasswordRequest request);

    UserResponse getMe(String email);

    UserResponse getUserByEmail(String email);

    UserResponse createManager(RegisterRequest request);

    MessageResponse resendManagerAccess(String email);

    MessageResponse blockUser(@NonNull Long userId);

    MessageResponse unblockUser(@NonNull Long userId);

    MessageResponse updateRole(@NonNull Long userId, RoleUpdateRequest request);

    UserResponse editUserAsAdmin(@NonNull Long userId, AdminUserEditRequest request);
}
