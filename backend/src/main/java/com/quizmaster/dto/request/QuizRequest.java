package com.quizmaster.dto.request;

import com.quizmaster.entity.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class QuizRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Create {
        @NotBlank(message = "validation.required")
        @Size(min = 3, max = 200, message = "validation.name.length")
        private String title;

        @Size(max = 1000)
        private String description;

        private Long topicId;

        private String newTopicName; // For creating new topic on the fly

        private String language = "ru";

        private String difficulty = "MEDIUM";

        @Min(10)
        @Max(300)
        private Integer defaultTimerSeconds = 30;

        private Boolean isPublic = false;

        @Valid
        private List<QuestionCreate> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Update {
        @Size(min = 3, max = 200, message = "validation.name.length")
        private String title;

        @Size(max = 1000)
        private String description;

        private Long topicId;

        private String language;

        private String difficulty;

        private Integer defaultTimerSeconds;

        private Boolean isPublic;

        private Boolean isActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionCreate {
        @NotBlank(message = "validation.required")
        @Size(max = 1000)
        private String text;

        @NotNull(message = "validation.required")
        private QuestionType type;

        @Min(5)
        @Max(300)
        private Integer timerSeconds = 30;

        @Min(100)
        @Max(5000)
        private Integer points = 1000;

        private String difficulty = "MEDIUM";

        private String imageUrl;

        private String hint;

        private String explanation;

        // For OPEN_ANSWER type
        private String acceptableAnswers;

        @Valid
        @Size(min = 2, message = "validation.options.minimum")
        private List<OptionCreate> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionCreate {
        @NotBlank(message = "validation.required")
        @Size(max = 500)
        private String text;

        private Boolean isCorrect = false;

        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionUpdate {
        @Size(max = 1000)
        private String text;

        private QuestionType type;

        private Integer timerSeconds;

        private Integer points;

        private String imageUrl;

        private String hint;

        private String explanation;

        private String acceptableAnswers;

        @Valid
        private List<OptionCreate> options;
    }
}
