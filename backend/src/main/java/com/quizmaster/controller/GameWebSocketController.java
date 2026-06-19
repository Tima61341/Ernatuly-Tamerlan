package com.quizmaster.controller;

import com.quizmaster.dto.request.GameRequest;
import com.quizmaster.dto.response.GameResponse;
import com.quizmaster.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game/{gameCode}/join")
    @SendTo("/topic/game/{gameCode}/players")
    public GameResponse.GameState handlePlayerJoin(
            @DestinationVariable String gameCode,
            GameRequest.JoinGame request) {
        log.info("WebSocket: Player {} joining game {}", request.getNickname(), gameCode);
        gameService.joinGame(request);
        return gameService.getGameStateByCode(gameCode);
    }

    @MessageMapping("/game/{gameCode}/answer")
    public void handleAnswer(
            @DestinationVariable String gameCode,
            GameRequest.SubmitAnswer request) {
        log.info("WebSocket: Answer submitted for game {}", gameCode);
        GameResponse.AnswerResult result = gameService.submitAnswer(request);
        
        // Send result to the player
        messagingTemplate.convertAndSend(
                "/topic/game/" + gameCode + "/player/" + request.getPlayerToken() + "/result",
                result);
        
        // Update leaderboard for all
        GameResponse.Leaderboard leaderboard = gameService.getLeaderboard(gameCode);
        messagingTemplate.convertAndSend(
                "/topic/game/" + gameCode + "/leaderboard",
                leaderboard);
    }

    @MessageMapping("/game/{gameCode}/state")
    @SendTo("/topic/game/{gameCode}/state")
    public GameResponse.GameState getGameState(@DestinationVariable String gameCode) {
        return gameService.getGameStateByCode(gameCode);
    }

    // Method to broadcast game updates (called from service)
    public void broadcastGameState(String gameCode) {
        GameResponse.GameState state = gameService.getGameStateByCode(gameCode);
        messagingTemplate.convertAndSend("/topic/game/" + gameCode + "/state", state);
    }

    public void broadcastLeaderboard(String gameCode) {
        GameResponse.Leaderboard leaderboard = gameService.getLeaderboard(gameCode);
        messagingTemplate.convertAndSend("/topic/game/" + gameCode + "/leaderboard", leaderboard);
    }

    public void broadcastQuestion(String gameCode, GameResponse.QuestionForPlayer question) {
        messagingTemplate.convertAndSend("/topic/game/" + gameCode + "/question", question);
    }

    public void broadcastGameEnd(String gameCode) {
        GameResponse.Leaderboard finalLeaderboard = gameService.getLeaderboard(gameCode);
        messagingTemplate.convertAndSend("/topic/game/" + gameCode + "/ended", finalLeaderboard);
    }
}
