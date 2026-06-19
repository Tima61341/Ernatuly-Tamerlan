package com.quizmaster.controller;

import com.quizmaster.dto.request.GameRequest;
import com.quizmaster.dto.response.ApiResponse;
import com.quizmaster.dto.response.GameResponse;
import com.quizmaster.service.GameService;
import com.quizmaster.util.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final MessageService messageService;

    // Host endpoints (authenticated)
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<GameResponse.GameCreated>> createGame(
            @Valid @RequestBody GameRequest.CreateGame request,
            @AuthenticationPrincipal UserDetails userDetails) {
        GameResponse.GameCreated game = gameService.createGame(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("game.created", new Object[]{game.getGameCode()}), game));
    }

    @PostMapping("/{gameCode}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<GameResponse.GameState>> startGame(
            @PathVariable String gameCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        GameResponse.GameState state = gameService.startGame(gameCode, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("game.started"), state));
    }

    @PostMapping("/{gameCode}/next")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<GameResponse.GameState>> nextQuestion(
            @PathVariable String gameCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        GameResponse.GameState state = gameService.nextQuestion(gameCode, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(state));
    }

    @PostMapping("/{gameCode}/end")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<Void>> endGame(
            @PathVariable String gameCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        gameService.endGame(gameCode, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("game.ended")));
    }

    @GetMapping("/{gameCode}/state")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<GameResponse.GameState>> getGameState(
            @PathVariable String gameCode) {
        GameResponse.GameState state = gameService.getGameStateByCode(gameCode);
        return ResponseEntity.ok(ApiResponse.success(state));
    }

    @GetMapping("/hosted")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<List<GameResponse.GameCreated>>> getHostedGames(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<GameResponse.GameCreated> games = gameService.getHostedGames(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(games));
    }

    // Player endpoints (public)
    @PostMapping("/join")
    public ResponseEntity<ApiResponse<GameResponse.PlayerJoined>> joinGame(
            @Valid @RequestBody GameRequest.JoinGame request) {
        GameResponse.PlayerJoined result = gameService.joinGame(request);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("player.joined"), result));
    }

    @PostMapping("/play/answer")
    public ResponseEntity<ApiResponse<GameResponse.AnswerResult>> submitAnswer(
            @Valid @RequestBody GameRequest.SubmitAnswer request) {
        GameResponse.AnswerResult result = gameService.submitAnswer(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/play/{playerToken}/state")
    public ResponseEntity<ApiResponse<GameResponse.GameState>> getGameStateForPlayer(
            @PathVariable String playerToken) {
        GameResponse.GameState state = gameService.getGameStateForPlayer(playerToken);
        return ResponseEntity.ok(ApiResponse.success(state));
    }

    @PostMapping("/play/{playerToken}/disconnect")
    public ResponseEntity<ApiResponse<Void>> disconnectPlayer(
            @PathVariable String playerToken) {
        gameService.disconnectPlayer(playerToken);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("game.player.left")));
    }

    // Public leaderboard
    @GetMapping("/{gameCode}/leaderboard")
    public ResponseEntity<ApiResponse<GameResponse.Leaderboard>> getLeaderboard(
            @PathVariable String gameCode) {
        GameResponse.Leaderboard leaderboard = gameService.getLeaderboard(gameCode);
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }
}
