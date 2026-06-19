package com.quizmaster.dto.response;

import com.quizmaster.entity.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private TopicResponse topic;
    private UserBasic creator;
    private String language;
    private String difficulty;
    private Integer defaultTimerSeconds;
    private Boolean isPublic;
    private Boolean isActive;
    private Integer questionCount;
    private Integer timesPlayed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserBasic {
        private Long id;
        private String fullName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicResponse {
        private Long id;
        private String name;
        private String icon;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizWithQuestions {
        private Long id;
        private String title;
        private String description;
        private TopicResponse topic;
        private UserBasic creator;
        private String language;
        private String difficulty;
        private Integer defaultTimerSeconds;
        private Boolean isPublic;
        private Integer timesPlayed;
        private List<QuestionResponse> questions;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResponse {
        private Long id;
        private String text;
        private QuestionType type;
        private Integer timerSeconds;
        private Integer points;
        private Integer orderIndex;
        private String imageUrl;
        private String hint;
        private String explanation;
        private String acceptableAnswers;
        private List<OptionResponse> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionResponse {
        private Long id;
        private String text;
        private Boolean isCorrect;
        private Integer orderIndex;
        private String color;
    }

    // Converter methods
    public static QuizResponse fromEntity(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .topic(quiz.getTopic() != null ? TopicResponse.builder()
                        .id(quiz.getTopic().getId())
                        .name(quiz.getTopic().getName())
                        .icon(quiz.getTopic().getIcon())
                        .color(quiz.getTopic().getColor())
                        .build() : null)
                .creator(UserBasic.builder()
                        .id(quiz.getCreator().getId())
                        .fullName(quiz.getCreator().getFullName())
                        .build())
                .language(quiz.getLanguage())
                .difficulty(quiz.getDifficulty())
                .defaultTimerSeconds(quiz.getDefaultTimerSeconds())
                .isPublic(quiz.getIsPublic())
                .isActive(quiz.getIsActive())
                .questionCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0)
                .timesPlayed(quiz.getTimesPlayed())
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
    }

    public static QuizWithQuestions fromEntityWithQuestions(Quiz quiz) {
        return QuizWithQuestions.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .topic(quiz.getTopic() != null ? TopicResponse.builder()
                        .id(quiz.getTopic().getId())
                        .name(quiz.getTopic().getName())
                        .icon(quiz.getTopic().getIcon())
                        .color(quiz.getTopic().getColor())
                        .build() : null)
                .creator(UserBasic.builder()
                        .id(quiz.getCreator().getId())
                        .fullName(quiz.getCreator().getFullName())
                        .build())
                .language(quiz.getLanguage())
                .difficulty(quiz.getDifficulty())
                .defaultTimerSeconds(quiz.getDefaultTimerSeconds())
                .isPublic(quiz.getIsPublic())
                .timesPlayed(quiz.getTimesPlayed())
                .questions(quiz.getQuestions().stream()
                        .map(QuizResponse::questionToResponse)
                        .collect(Collectors.toList()))
                .createdAt(quiz.getCreatedAt())
                .build();
    }

    public static QuestionResponse questionToResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .text(question.getText())
                .type(question.getType())
                .timerSeconds(question.getTimerSeconds())
                .points(question.getPoints())
                .orderIndex(question.getOrderIndex())
                .imageUrl(question.getImageUrl())
                .hint(question.getHint())
                .explanation(question.getExplanation())
                .acceptableAnswers(question.getAcceptableAnswers())
                .options(question.getOptions().stream()
                        .map(opt -> OptionResponse.builder()
                                .id(opt.getId())
                                .text(opt.getText())
                                .isCorrect(opt.getIsCorrect())
                                .orderIndex(opt.getOrderIndex())
                                .color(opt.getColor())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
