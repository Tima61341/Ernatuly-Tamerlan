package com.quizmaster.dto.request;

import com.quizmaster.entity.QuestionType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AIRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenerateQuestions {
        @NotBlank(message = "validation.required")
        @Size(max = 200)
        private String topic;

        private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD

        private String language = "ru"; // ru, kk, en

        private QuestionType questionType = QuestionType.SINGLE_CHOICE;

        @Min(1)
        @Max(30)
        private Integer count = 5;

        @Size(max = 500)
        private String additionalContext;

        private Boolean includeExplanation = true;

        // Difficulty distribution (optional - if set, overrides count + difficulty)
        @Min(0)
        @Max(30)
        private Integer easyCount;

        @Min(0)
        @Max(30)
        private Integer mediumCount;

        @Min(0)
        @Max(30)
        private Integer hardCount;

        // Points per difficulty
        private Integer easyPoints = 500;
        private Integer mediumPoints = 1000;
        private Integer hardPoints = 1500;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenerateForQuiz {
        @NotNull(message = "validation.required")
        private Long quizId;

        @Min(1)
        @Max(20)
        private Integer count = 5;

        private QuestionType questionType;

        private Boolean useExistingTopicContext = true;
    }
}
