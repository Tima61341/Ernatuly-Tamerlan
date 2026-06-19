package com.quizmaster.dto.request;

import com.quizmaster.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UserRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Update {
        @Size(min = 2, max = 50, message = "validation.name.length")
        private String firstName;

        @Size(min = 2, max = 50, message = "validation.name.length")
        private String lastName;

        @Email(message = "validation.email.invalid")
        private String email;

        private String preferredLanguage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChangePassword {
        @NotBlank(message = "validation.required")
        private String currentPassword;

        @NotBlank(message = "validation.required")
        @Size(min = 8, message = "validation.password.weak")
        private String newPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangeRole {
        @NotNull(message = "validation.required")
        private Role role;
    }
}
