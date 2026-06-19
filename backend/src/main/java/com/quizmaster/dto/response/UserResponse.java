package com.quizmaster.dto.response;

import com.quizmaster.entity.Role;
import com.quizmaster.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private Role role;
    private String preferredLanguage;
    private Boolean isActive;
    private Integer quizCount;
    private Integer gamesHosted;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .preferredLanguage(user.getPreferredLanguage())
                .isActive(user.getIsActive())
                .quizCount(user.getQuizzes() != null ? user.getQuizzes().size() : 0)
                .gamesHosted(user.getHostedGames() != null ? user.getHostedGames().size() : 0)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static UserResponse basic(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
