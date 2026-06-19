package com.quizmaster.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class TopicRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Create {
        @NotBlank(message = "validation.required")
        @Size(min = 2, max = 100, message = "validation.name.length")
        private String name;

        @Size(max = 500)
        private String description;

        private String icon = "📚";

        private String color = "#3B82F6";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Update {
        @Size(min = 2, max = 100, message = "validation.name.length")
        private String name;

        @Size(max = 500)
        private String description;

        private String icon;

        private String color;

        private Boolean isActive;
    }
}
