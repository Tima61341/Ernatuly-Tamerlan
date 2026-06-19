package com.quizmaster.dto.response;

import com.quizmaster.entity.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class GameResponse {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GameCreated {
        private Long id;
        private String gameCode;
        private String joinUrl;
        private String qrCodeBase64;
        private QuizBasic quiz;
        private Integer maxPlayers;
        private GameStatus status;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizBasic {
        private Long id;
        private String title;
        private Integer questionCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GameState {
        private Long id;
        private String gameCode;
        private GameStatus status;
        private Integer currentQuestionIndex;
        private Integer totalQuestions;
        private Integer playerCount;
        private List<PlayerInfo> players;
        private QuestionForPlayer currentQuestion;
        private LocalDateTime startedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlayerJoined {
        private Long playerId;
        private String playerToken;
        private String nickname;
        private String avatarUrl;
        private String gameCode;
        private GameStatus gameStatus;
        private Integer playerCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlayerInfo {
        private Long id;
        private String nickname;
        private String avatarUrl;
        private Gender gender;
        private Integer totalScore;
        private Integer correctAnswers;
        private Integer currentStreak;
        private Boolean isConnected;
        private Integer rank;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionForPlayer {
        private Long id;
        private String text;
        private QuestionType type;
        private Integer timerSeconds;
        private Integer points;
        private Integer questionNumber;
        private Integer totalQuestions;
        private String imageUrl;
        private String hint;
        private List<OptionForPlayer> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionForPlayer {
        private Long id;
        private String text;
        private Integer orderIndex;
        private String color;
        // Note: isCorrect is NOT included for players during game
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerResult {
        private Boolean isCorrect;
        private Integer pointsEarned;
        private Integer speedBonus;
        private Integer totalPoints;
        private Integer newTotalScore;
        private Integer newRank;
        private Integer currentStreak;
        private String explanation;
        private List<Long> correctOptionIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResults {
        private Long questionId;
        private String questionText;
        private List<Long> correctOptionIds;
        private String explanation;
        private Integer totalAnswers;
        private Integer correctAnswers;
        private Double averageResponseTime;
        private List<AnswerDistribution> answerDistribution;
        private List<PlayerRanking> topPlayers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerDistribution {
        private Long optionId;
        private String optionText;
        private Integer count;
        private Double percentage;
        private Boolean isCorrect;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlayerRanking {
        private Integer rank;
        private Long playerId;
        private String nickname;
        private String avatarUrl;
        private Integer totalScore;
        private Integer correctAnswers;
        private Integer totalAnswers;
        private Double accuracy;
        private Integer bestStreak;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Leaderboard {
        private String gameCode;
        private String quizTitle;
        private GameStatus status;
        private Integer totalQuestions;
        private Integer questionsAnswered;
        private List<PlayerRanking> rankings;
        private LocalDateTime startedAt;
        private LocalDateTime endedAt;
    }

    // Converter methods
    public static PlayerInfo playerToInfo(Player player, int rank) {
        return PlayerInfo.builder()
                .id(player.getId())
                .nickname(player.getNickname())
                .avatarUrl(player.getAvatarUrl())
                .gender(player.getGender())
                .totalScore(player.getTotalScore())
                .correctAnswers(player.getCorrectAnswers())
                .currentStreak(player.getCurrentStreak())
                .isConnected(player.getIsConnected())
                .rank(rank)
                .build();
    }

    public static QuestionForPlayer questionForPlayer(Question question, int questionNumber, int totalQuestions) {
        return QuestionForPlayer.builder()
                .id(question.getId())
                .text(question.getText())
                .type(question.getType())
                .timerSeconds(question.getTimerSeconds())
                .points(question.getPoints())
                .questionNumber(questionNumber)
                .totalQuestions(totalQuestions)
                .imageUrl(question.getImageUrl())
                .hint(question.getHint())
                .options(question.getOptions().stream()
                        .map(opt -> OptionForPlayer.builder()
                                .id(opt.getId())
                                .text(opt.getText())
                                .orderIndex(opt.getOrderIndex())
                                .color(opt.getColor())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    public static PlayerRanking playerToRanking(Player player, int rank) {
        int totalAnswers = player.getAnswers() != null ? player.getAnswers().size() : 0;
        return PlayerRanking.builder()
                .rank(rank)
                .playerId(player.getId())
                .nickname(player.getNickname())
                .avatarUrl(player.getAvatarUrl())
                .totalScore(player.getTotalScore())
                .correctAnswers(player.getCorrectAnswers())
                .totalAnswers(totalAnswers)
                .accuracy(player.getAccuracy())
                .bestStreak(player.getBestStreak())
                .build();
    }
}
