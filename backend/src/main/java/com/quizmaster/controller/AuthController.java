package com.quizmaster.controller;

import com.quizmaster.dto.request.AuthRequest;
import com.quizmaster.dto.response.ApiResponse;
import com.quizmaster.dto.response.AuthResponse;
import com.quizmaster.service.AuthService;
import com.quizmaster.util.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final MessageService messageService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse.Login>> register(
            @Valid @RequestBody AuthRequest.Register request) {
        AuthResponse.Login response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("auth.register.success"), response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse.Login>> login(
            @Valid @RequestBody AuthRequest.Login request) {
        AuthResponse.Login response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("auth.login.success"), response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse.TokenRefresh>> refreshToken(
            @Valid @RequestBody AuthRequest.RefreshToken request) {
        AuthResponse.TokenRefresh response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("auth.token.refresh.success"), response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        AuthResponse.UserInfo response = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
