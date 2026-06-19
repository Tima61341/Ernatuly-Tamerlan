package com.quizmaster.service;

import com.quizmaster.dto.request.UserRequest;
import com.quizmaster.dto.response.UserResponse;
import com.quizmaster.entity.Role;
import com.quizmaster.entity.User;
import com.quizmaster.exception.CustomExceptions.*;
import com.quizmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));
        return UserResponse.fromEntity(user);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest.Update request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResourceAlreadyExistsException("auth.register.email.exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPreferredLanguage() != null) {
            user.setPreferredLanguage(request.getPreferredLanguage());
        }

        user = userRepository.save(user);
        log.info("User updated: {}", user.getEmail());
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateCurrentUser(String email, UserRequest.Update request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));
        return updateUser(user.getId(), request);
    }

    @Transactional
    public void changePassword(String email, UserRequest.ChangePassword request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ValidationException("auth.login.failed");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    @Transactional
    public UserResponse changeUserRole(Long id, UserRequest.ChangeRole request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));

        // Prevent removing last admin
        if (user.getRole() == Role.ADMIN && request.getRole() != Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new ValidationException("user.role.invalid");
            }
        }

        user.setRole(request.getRole());
        user = userRepository.save(user);
        log.info("User role changed: {} -> {}", user.getEmail(), user.getRole());
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void toggleUserActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));

        // Prevent deactivating last admin
        if (user.getRole() == Role.ADMIN && user.getIsActive()) {
            long activeAdminCount = userRepository.findActiveUsersByRole(Role.ADMIN).size();
            if (activeAdminCount <= 1) {
                throw new ValidationException("user.role.invalid");
            }
        }

        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        log.info("User {} status: {}", user.getEmail(), user.getIsActive() ? "activated" : "deactivated");
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));

        // Prevent deleting last admin
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new ValidationException("user.role.invalid");
            }
        }

        userRepository.delete(user);
        log.info("User deleted: {}", user.getEmail());
    }

    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public User getEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found"));
    }
}
