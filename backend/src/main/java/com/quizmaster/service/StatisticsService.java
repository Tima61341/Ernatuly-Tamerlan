package com.quizmaster.service;

import com.quizmaster.dto.response.StatisticsResponse;
import com.quizmaster.entity.GameStatus;
import com.quizmaster.entity.Role;
import com.quizmaster.entity.User;
import com.quizmaster.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final TopicRepository topicRepository;
    private final GameSessionRepository gameSessionRepository;
    private final PlayerRepository playerRepository;
    private final UserService userService;

    public StatisticsResponse.AdminDashboard getAdminDashboard() {
        // Basic counts
        long totalUsers = userRepository.count();
        long totalCreators = userRepository.countByRole(Role.CREATOR);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long totalQuizzes = quizRepository.count();
        long totalTopics = topicRepository.count();
        long totalGamesPlayed = gameSessionRepository.findByStatus(GameStatus.FINISHED).size();
        long activeGamesNow = gameSessionRepository.findByStatus(GameStatus.IN_PROGRESS).size() +
                            gameSessionRepository.findByStatus(GameStatus.WAITING).size();

        // Top quizzes
        List<StatisticsResponse.TopQuiz> topQuizzes = quizRepository.findMostPlayed(PageRequest.of(0, 10))
                .stream()
                .map(quiz -> StatisticsResponse.TopQuiz.builder()
                        .id(quiz.getId())
                        .title(quiz.getTitle())
                        .creatorName(quiz.getCreator().getFullName())
                        .timesPlayed(quiz.getTimesPlayed())
                        .questionCount(quiz.getQuestions().size())
                        .build())
                .collect(Collectors.toList());

        // Top creators
        List<StatisticsResponse.TopCreator> topCreators = userRepository.findByRole(Role.CREATOR)
                .stream()
                .map(user -> StatisticsResponse.TopCreator.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .quizCount(user.getQuizzes().size())
                        .totalGamesHosted(user.getHostedGames().size())
                        .build())
                .sorted((a, b) -> b.getQuizCount() - a.getQuizCount())
                .limit(10)
                .collect(Collectors.toList());

        // Quizzes by difficulty
        Map<String, Long> quizzesByDifficulty = new HashMap<>();
        quizzesByDifficulty.put("EASY", quizRepository.findAll().stream()
                .filter(q -> "EASY".equals(q.getDifficulty())).count());
        quizzesByDifficulty.put("MEDIUM", quizRepository.findAll().stream()
                .filter(q -> "MEDIUM".equals(q.getDifficulty())).count());
        quizzesByDifficulty.put("HARD", quizRepository.findAll().stream()
                .filter(q -> "HARD".equals(q.getDifficulty())).count());

        // Quizzes by language
        Map<String, Long> quizzesByLanguage = new HashMap<>();
        quizzesByLanguage.put("ru", quizRepository.findAll().stream()
                .filter(q -> "ru".equals(q.getLanguage())).count());
        quizzesByLanguage.put("kk", quizRepository.findAll().stream()
                .filter(q -> "kk".equals(q.getLanguage())).count());
        quizzesByLanguage.put("en", quizRepository.findAll().stream()
                .filter(q -> "en".equals(q.getLanguage())).count());

        return StatisticsResponse.AdminDashboard.builder()
                .totalUsers(totalUsers)
                .totalCreators(totalCreators)
                .totalAdmins(totalAdmins)
                .totalQuizzes(totalQuizzes)
                .totalTopics(totalTopics)
                .totalGamesPlayed(totalGamesPlayed)
                .activeGamesNow(activeGamesNow)
                .topQuizzes(topQuizzes)
                .topCreators(topCreators)
                .quizzesByDifficulty(quizzesByDifficulty)
                .quizzesByLanguage(quizzesByLanguage)
                .build();
    }

    public StatisticsResponse.CreatorDashboard getCreatorDashboard(String userEmail) {
        User user = userService.getEntityByEmail(userEmail);

        long totalQuizzes = quizRepository.countByCreatorId(user.getId());
        
        long totalQuestionsCreated = quizRepository.findByCreatorId(user.getId()).stream()
                .mapToLong(quiz -> quiz.getQuestions().size())
                .sum();

        long totalGamesHosted = gameSessionRepository.countByHostId(user.getId());

        long totalPlayersJoined = gameSessionRepository.findByHostId(user.getId()).stream()
                .mapToLong(game -> playerRepository.countByGameSessionId(game.getId()))
                .sum();

        double averagePlayersPerGame = totalGamesHosted > 0 ? 
                (double) totalPlayersJoined / totalGamesHosted : 0;

        List<StatisticsResponse.QuizStats> quizStats = quizRepository.findByCreatorId(user.getId())
                .stream()
                .map(quiz -> {
                    long gamesCount = gameSessionRepository.countFinishedGamesByQuizId(quiz.getId());
                    return StatisticsResponse.QuizStats.builder()
                            .quizId(quiz.getId())
                            .title(quiz.getTitle())
                            .timesPlayed(quiz.getTimesPlayed())
                            .totalPlayers(0) // Can be calculated if needed
                            .averageScore(0.0)
                            .completionRate(0.0)
                            .build();
                })
                .collect(Collectors.toList());

        return StatisticsResponse.CreatorDashboard.builder()
                .totalQuizzes(totalQuizzes)
                .totalQuestionsCreated(totalQuestionsCreated)
                .totalGamesHosted(totalGamesHosted)
                .totalPlayersJoined(totalPlayersJoined)
                .averagePlayersPerGame(averagePlayersPerGame)
                .quizStats(quizStats)
                .build();
    }
}
