package com.quizmaster.service;

import com.quizmaster.dto.request.AuthRequest;
import com.quizmaster.dto.response.AuthResponse;
import com.quizmaster.entity.Role;
import com.quizmaster.entity.User;
import com.quizmaster.exception.CustomExceptions.*;
import com.quizmaster.repository.UserRepository;
import com.quizmaster.security.JwtService;
import com.quizmaster.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse.Login register(AuthRequest.Register request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("auth.register.email.exists");
        }

        // Determine role - first user becomes ADMIN
        Role role = userRepository.count() == 0 ? Role.ADMIN : Role.CREATOR;

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .preferredLanguage(request.getPreferredLanguage() != null ? 
                        request.getPreferredLanguage() : "ru")
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {} with role {}", user.getEmail(), user.getRole());

        // Generate tokens
        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.Login.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(mapToUserInfo(user))
                .build();
    }

    public AuthResponse.Login login(AuthRequest.Login request) {
        // Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("auth.access.denied");
        }

        // Generate tokens
        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.Login.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(mapToUserInfo(user))
                .build();
    }

    public AuthResponse.TokenRefresh refreshToken(AuthRequest.RefreshToken request) {
        String refreshToken = request.getRefreshToken();
        
        if (!jwtService.validateToken(refreshToken)) {
            throw new UnauthorizedException("auth.token.invalid");
        }

        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String newAccessToken = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.TokenRefresh.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtService.getExpirationTime())
                .build();
    }

    public AuthResponse.UserInfo getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));
        return mapToUserInfo(user);
    }

    private AuthResponse.UserInfo mapToUserInfo(User user) {
        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }
}
