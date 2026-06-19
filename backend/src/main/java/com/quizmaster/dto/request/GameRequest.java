package com.quizmaster.dto.request;

import com.quizmaster.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class GameRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateGame {
        @NotNull(message = "validation.required")
        private Long quizId;

        @Min(2)
        @Max(100)
        private Integer maxPlayers = 50;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JoinGame {
        @NotBlank(message = "validation.required")
        private String gameCode;

        @NotBlank(message = "player.nickname.required")
        @Size(min = 2, max = 30)
        private String nickname;

        @NotNull(message = "validation.required")
        private Gender gender;

        @Min(5)
        @Max(100)
        private Integer age;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitAnswer {
        @NotBlank(message = "validation.required")
        private String playerToken;

        @NotNull(message = "validation.required")
        private Long questionId;

        // For single/multiple choice questions
        private List<Long> selectedOptionIds;

        // For open answer questions
        private String textAnswer;

        @NotNull(message = "validation.required")
        private Long responseTimeMs;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StartGame {
        // Can include additional settings in the future
        private Boolean shuffleQuestions = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NextQuestion {
        // For admin control
        private Boolean skipCurrent = false;
    }
}
