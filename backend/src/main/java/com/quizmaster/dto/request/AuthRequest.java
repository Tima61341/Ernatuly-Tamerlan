package com.quizmaster.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Login {
        @NotBlank(message = "validation.required")
        @Email(message = "validation.email.invalid")
        private String email;

        @NotBlank(message = "validation.required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Register {
        @NotBlank(message = "validation.required")
        @Email(message = "validation.email.invalid")
        private String email;

        @NotBlank(message = "validation.required")
        @Size(min = 8, message = "validation.password.weak")
        private String password;

        @NotBlank(message = "validation.required")
        @Size(min = 2, max = 50, message = "validation.name.length")
        private String firstName;

        @NotBlank(message = "validation.required")
        @Size(min = 2, max = 50, message = "validation.name.length")
        private String lastName;

        private String preferredLanguage = "ru";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshToken {
        @NotBlank(message = "validation.required")
        private String refreshToken;
    }
}
