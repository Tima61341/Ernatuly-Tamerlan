package com.quizmaster.service;

import com.quizmaster.dto.request.GameRequest;
import com.quizmaster.dto.response.GameResponse;
import com.quizmaster.entity.*;
import com.quizmaster.exception.CustomExceptions.*;
import com.quizmaster.repository.*;
import com.quizmaster.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameSessionRepository gameSessionRepository;
    private final PlayerRepository playerRepository;
    private final PlayerAnswerRepository playerAnswerRepository;
    private final QuizService quizService;
    private final UserService userService;
    private final GameCodeGenerator codeGenerator;
    private final QRCodeGenerator qrCodeGenerator;
    private final AvatarGenerator avatarGenerator;
    private final ScoreCalculator scoreCalculator;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public GameResponse.GameCreated createGame(GameRequest.CreateGame request, String userEmail) {
        User host = userService.getEntityByEmail(userEmail);
        Quiz quiz = quizService.getEntityById(request.getQuizId());

        // Check access
        if (!quiz.getCreator().getId().equals(host.getId()) && 
            host.getRole() != Role.ADMIN && !quiz.getIsPublic()) {
            throw new ForbiddenException("quiz.access.denied");
        }

        // Generate unique game code
        String gameCode;
        do {
            gameCode = codeGenerator.generateGameCode();
        } while (gameSessionRepository.existsByGameCode(gameCode));

        // Generate QR code
        String joinUrl = frontendUrl.split(",")[0] + "/join/" + gameCode;
        String qrCode = qrCodeGenerator.generateQRCodeBase64(joinUrl);

        GameSession game = GameSession.builder()
                .gameCode(gameCode)
                .quiz(quiz)
                .host(host)
                .status(GameStatus.WAITING)
                .currentQuestionIndex(0)
                .maxPlayers(request.getMaxPlayers() != null ? request.getMaxPlayers() : 50)
                .qrCodeBase64(qrCode)
                .build();

        game = gameSessionRepository.save(game);
        log.info("Game created: {} for quiz {} by {}", gameCode, quiz.getTitle(), userEmail);

        return GameResponse.GameCreated.builder()
                .id(game.getId())
                .gameCode(game.getGameCode())
                .joinUrl(joinUrl)
                .qrCodeBase64(qrCode)
                .quiz(GameResponse.QuizBasic.builder()
                        .id(quiz.getId())
                        .title(quiz.getTitle())
                        .questionCount(quiz.getQuestions().size())
                        .build())
                .maxPlayers(game.getMaxPlayers())
                .status(game.getStatus())
                .createdAt(game.getCreatedAt())
                .build();
    }

    @Transactional
    public GameResponse.PlayerJoined joinGame(GameRequest.JoinGame request) {
        GameSession game = gameSessionRepository.findByGameCodeWithPlayers(request.getGameCode())
                .orElseThrow(() -> new ResourceNotFoundException("game.not.found"));

        // Validate game state
        if (game.getStatus() == GameStatus.FINISHED) {
            throw new GameException("game.already.ended");
        }
        if (game.getStatus() == GameStatus.IN_PROGRESS) {
            throw new GameException("game.already.started");
        }
        if (game.isFull()) {
            throw new GameFullException("game.full");
        }

        // Check nickname uniqueness
        if (playerRepository.existsByGameSessionIdAndNickname(game.getId(), request.getNickname())) {
            throw new ValidationException("player.nickname.taken");
        }

        // Generate avatar and session token
        String avatarUrl = avatarGenerator.generateAvatar(request.getNickname(), request.getGender());
        String sessionToken = codeGenerator.generatePlayerToken();

        Player player = Player.builder()
                .gameSession(game)
                .nickname(request.getNickname())
                .gender(request.getGender())
                .age(request.getAge())
                .avatarUrl(avatarUrl)
                .sessionToken(sessionToken)
                .totalScore(0)
                .correctAnswers(0)
                .currentStreak(0)
                .bestStreak(0)
                .isConnected(true)
                .build();

        player = playerRepository.save(player);
        log.info("Player {} joined game {}", request.getNickname(), request.getGameCode());

        return GameResponse.PlayerJoined.builder()
                .playerId(player.getId())
                .playerToken(player.getSessionToken())
                .nickname(player.getNickname())
                .avatarUrl(player.getAvatarUrl())
                .gameCode(game.getGameCode())
                .gameStatus(game.getStatus())
                .playerCount(game.getPlayerCount() + 1)
                .build();
    }

    @Transactional
    public GameResponse.GameState startGame(String gameCode, String userEmail) {
        GameSession game = gameSessionRepository.findByGameCodeWithPlayers(gameCode)
                .orElseThrow(() -> new ResourceNotFoundException("game.not.found"));

        // Verify host
        User host = userService.getEntityByEmail(userEmail);
        if (!game.getHost().getId().equals(host.getId()) && host.getRole() != Role.ADMIN) {
            throw new ForbiddenException("auth.access.denied");
        }

        if (game.getStatus() != GameStatus.WAITING) {
            throw new GameException("game.invalid.state");
        }

        game.setStatus(GameStatus.IN_PROGRESS);
        game.setStartedAt(LocalDateTime.now());
        game = gameSessionRepository.save(game);

        // Increment quiz play count
        quizService.incrementTimesPlayed(game.getQuiz().getId());

        log.info("Game {} started", gameCode);
        return getGameState(game);
    }

    @Transactional
    public GameResponse.GameState nextQuestion(String gameCode, String userEmail) {
        GameSession game = gameSessionRepository.findByIdWithPlayersAndQuiz(
                gameSessionRepository.findByGameCode(gameCode)
                        .orElseThrow(() -> new ResourceNotFoundException("game.not.found"))
                        .getId())
                .orElseThrow(() -> new ResourceNotFoundException("game.not.found"));

        // Verify host
        User host = userService.getEntityByEmail(userEmail);
        if (!game.getHost().getId().equals(host.getId()) && host.getRole() != Role.ADMIN) {
            throw new ForbiddenException("auth.access.denied");
        }

        if (game.getStatus() != GameStatus.IN_PROGRESS) {
            throw new GameException("game.invalid.state");
        }

        game.setCurrentQuestionIndex(game.getCurrentQuestionIndex() + 1);

        // Check if game is finished
        if (!game.hasMoreQuestions()) {
            game.setStatus(GameStatus.FINISHED);
            game.setEndedAt(LocalDateTime.now());
        }

        game = gameSessionRepository.save(game);
        log.info("Game {} moved to question {}", gameCode, game.getCurrentQuestionIndex());

        return getGameState(game);
    }

    @Transactional
    public GameResponse.AnswerResult submitAnswer(GameRequest.SubmitAnswer request) {
        Player player = playerRepository.findBySessionToken(request.getPlayerToken())
                .orElseThrow(() -> new ResourceNotFoundException("player.not.found"));

        GameSession game = player.getGameSession();

        if (game.getStatus() != GameStatus.IN_PROGRESS) {
            throw new GameException("game.not.started");
        }

        Question question = game.getQuiz().getQuestions().stream()
                .filter(q -> q.getId().equals(request.getQuestionId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("question.not.found"));

        // Check if already answered
        if (playerAnswerRepository.existsByPlayerIdAndQuestionId(player.getId(), question.getId())) {
            throw new ValidationException("player.answer.submitted");
        }

        // Calculate result
        boolean isCorrect = false;
        int pointsEarned = 0;
        int speedBonus = 0;

        if (question.getType() == QuestionType.OPEN_ANSWER) {
            isCorrect = scoreCalculator.isOpenAnswerCorrect(
                    request.getTextAnswer(), 
                    question.getAcceptableAnswers()
            );
            if (isCorrect) {
                int[] points = scoreCalculator.calculatePoints(
                        question.getPoints(),
                        request.getResponseTimeMs(),
                        question.getTimerSeconds()
                );
                pointsEarned = points[0];
                speedBonus = points[1];
            }
        } else {
            // Multiple/Single choice
            List<AnswerOption> correctOptions = question.getCorrectOptions();
            Set<Long> correctIds = correctOptions.stream()
                    .map(AnswerOption::getId)
                    .collect(Collectors.toSet());
            Set<Long> selectedIds = new HashSet<>(request.getSelectedOptionIds() != null ? 
                    request.getSelectedOptionIds() : Collections.emptyList());

            if (question.getType() == QuestionType.SINGLE_CHOICE || 
                question.getType() == QuestionType.TRUE_FALSE) {
                isCorrect = correctIds.equals(selectedIds);
                if (isCorrect) {
                    int[] points = scoreCalculator.calculatePoints(
                            question.getPoints(),
                            request.getResponseTimeMs(),
                            question.getTimerSeconds()
                    );
                    pointsEarned = points[0];
                    speedBonus = points[1];
                }
            } else {
                // Multiple choice - partial scoring
                int correctSelected = (int) selectedIds.stream().filter(correctIds::contains).count();
                int incorrectSelected = (int) selectedIds.stream().filter(id -> !correctIds.contains(id)).count();
                
                isCorrect = correctSelected == correctIds.size() && incorrectSelected == 0;
                pointsEarned = scoreCalculator.calculatePartialPoints(
                        question.getPoints(),
                        correctSelected,
                        correctIds.size(),
                        incorrectSelected
                );
                
                if (pointsEarned > 0) {
                    int[] bonus = scoreCalculator.calculatePoints(
                            pointsEarned,
                            request.getResponseTimeMs(),
                            question.getTimerSeconds()
                    );
                    speedBonus = bonus[1];
                }
            }
        }

        // Save answer
        PlayerAnswer answer = PlayerAnswer.builder()
                .player(player)
                .gameSession(game)
                .question(question)
                .selectedOptionIds(request.getSelectedOptionIds() != null ? 
                        request.getSelectedOptionIds() : new ArrayList<>())
                .textAnswer(request.getTextAnswer())
                .isCorrect(isCorrect)
                .pointsEarned(pointsEarned)
                .speedBonusEarned(speedBonus)
                .responseTimeMs(request.getResponseTimeMs())
                .build();

        playerAnswerRepository.save(answer);

        // Update player stats
        player.addScore(pointsEarned + speedBonus);
        if (isCorrect) {
            player.incrementCorrectAnswers();
        } else {
            player.resetStreak();
        }
        playerRepository.save(player);

        // Calculate new rank
        List<Player> rankedPlayers = playerRepository.findByGameSessionIdOrderByScoreDesc(game.getId());
        int newRank = 1;
        for (int i = 0; i < rankedPlayers.size(); i++) {
            if (rankedPlayers.get(i).getId().equals(player.getId())) {
                newRank = i + 1;
                break;
            }
        }

        log.info("Player {} answered question {} - correct: {}, points: {}", 
                player.getNickname(), question.getId(), isCorrect, pointsEarned + speedBonus);

        return GameResponse.AnswerResult.builder()
                .isCorrect(isCorrect)
                .pointsEarned(pointsEarned)
                .speedBonus(speedBonus)
                .totalPoints(pointsEarned + speedBonus)
                .newTotalScore(player.getTotalScore())
                .newRank(newRank)
                .currentStreak(player.getCurrentStreak())
                .explanation(question.getExplanation())
                .correctOptionIds(question.getCorrectOptions().stream()
                        .map(AnswerOption::getId)
                        .collect(Collectors.toList()))
                .build();
    }

    public GameResponse.GameState getGameStateByCode(String gameCode) {
        GameSession game = gameSessionRepository.findByIdWithPlayersAndQuiz(
                gameSessionRepository.findByGameCode(gameCode)
                        .orElseThrow(() -> new ResourceNotFoundException("game.not.found"))
                        .getId())
                .orElseThrow(() -> new ResourceNotFoundException("game.not.found"));
        return getGameState(game);
    }

    public GameResponse.GameState getGameStateForPlayer(String playerToken) {
        Player player = playerRepository.findBySessionToken(playerToken)
                .orElseThrow(() -> new ResourceNotFoundException("player.not.found"));
        
        GameSession game = gameSessionRepository.findByIdWithPlayersAndQuiz(player.getGameSession().getId())
                .orElseThrow(() -> new ResourceNotFoundException("game.not.found"));
        
        return getGameState(game);
    }

    public GameResponse.Leaderboard getLeaderboard(String gameCode) {
        GameSession game = gameSessionRepository.findByGameCodeWithPlayers(gameCode)
                .orElseThrow(() -> new ResourceNotFoundException("game.not.found"));

        List<Player> players = playerRepository.findByGameSessionIdOrderByScoreDesc(game.getId());
        List<GameResponse.PlayerRanking> rankings = new ArrayList<>();

        for (int i = 0; i < players.size(); i++) {
            rankings.add(GameResponse.playerToRanking(players.get(i), i + 1));
        }

        return GameResponse.Leaderboard.builder()
                .gameCode(gameCode)
                .quizTitle(game.getQuiz().getTitle())
                .status(game.getStatus())
                .totalQuestions(game.getQuiz().getQuestions().size())
                .questionsAnswered(game.getCurrentQuestionIndex())
                .rankings(rankings)
                .startedAt(game.getStartedAt())
                .endedAt(game.getEndedAt())
                .build();
    }

    @Transactional
    public void endGame(String gameCode, String userEmail) {
        GameSession game = gameSessionRepository.findByGameCode(gameCode)
                .orElseThrow(() -> new ResourceNotFoundException("game.not.found"));

        User host = userService.getEntityByEmail(userEmail);
        if (!game.getHost().getId().equals(host.getId()) && host.getRole() != Role.ADMIN) {
            throw new ForbiddenException("auth.access.denied");
        }

        game.setStatus(GameStatus.FINISHED);
        game.setEndedAt(LocalDateTime.now());
        gameSessionRepository.save(game);

        log.info("Game {} ended by host", gameCode);
    }

    @Transactional
    public void disconnectPlayer(String playerToken) {
        Player player = playerRepository.findBySessionToken(playerToken)
                .orElseThrow(() -> new ResourceNotFoundException("player.not.found"));
        player.setIsConnected(false);
        playerRepository.save(player);
    }

    private GameResponse.GameState getGameState(GameSession game) {
        List<Player> players = playerRepository.findByGameSessionIdOrderByScoreDesc(game.getId());
        List<GameResponse.PlayerInfo> playerInfos = new ArrayList<>();

        for (int i = 0; i < players.size(); i++) {
            playerInfos.add(GameResponse.playerToInfo(players.get(i), i + 1));
        }

        GameResponse.QuestionForPlayer currentQuestion = null;
        if (game.getStatus() == GameStatus.IN_PROGRESS && game.hasMoreQuestions()) {
            Question q = game.getCurrentQuestion();
            currentQuestion = GameResponse.questionForPlayer(
                    q,
                    game.getCurrentQuestionIndex() + 1,
                    game.getQuiz().getQuestions().size()
            );
        }

        return GameResponse.GameState.builder()
                .id(game.getId())
                .gameCode(game.getGameCode())
                .status(game.getStatus())
                .currentQuestionIndex(game.getCurrentQuestionIndex())
                .totalQuestions(game.getQuiz().getQuestions().size())
                .playerCount(players.size())
                .players(playerInfos)
                .currentQuestion(currentQuestion)
                .startedAt(game.getStartedAt())
                .build();
    }

    public List<GameResponse.GameCreated> getHostedGames(String userEmail) {
        User host = userService.getEntityByEmail(userEmail);
        return gameSessionRepository.findByHostId(host.getId()).stream()
                .map(game -> GameResponse.GameCreated.builder()
                        .id(game.getId())
                        .gameCode(game.getGameCode())
                        .quiz(GameResponse.QuizBasic.builder()
                                .id(game.getQuiz().getId())
                                .title(game.getQuiz().getTitle())
                                .questionCount(game.getQuiz().getQuestions().size())
                                .build())
                        .maxPlayers(game.getMaxPlayers())
                        .status(game.getStatus())
                        .createdAt(game.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
