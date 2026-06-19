package com.quizmaster.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class StatisticsResponse {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminDashboard {
        private Long totalUsers;
        private Long totalCreators;
        private Long totalAdmins;
        private Long totalQuizzes;
        private Long totalTopics;
        private Long totalGamesPlayed;
        private Long activeGamesNow;
        private List<TopQuiz> topQuizzes;
        private List<TopCreator> topCreators;
        private Map<String, Long> quizzesByDifficulty;
        private Map<String, Long> quizzesByLanguage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreatorDashboard {
        private Long totalQuizzes;
        private Long totalQuestionsCreated;
        private Long totalGamesHosted;
        private Long totalPlayersJoined;
        private Double averagePlayersPerGame;
        private List<QuizStats> quizStats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopQuiz {
        private Long id;
        private String title;
        private String creatorName;
        private Integer timesPlayed;
        private Integer questionCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopCreator {
        private Long id;
        private String fullName;
        private Integer quizCount;
        private Integer totalGamesHosted;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizStats {
        private Long quizId;
        private String title;
        private Integer timesPlayed;
        private Integer totalPlayers;
        private Double averageScore;
        private Double completionRate;
    }
}
