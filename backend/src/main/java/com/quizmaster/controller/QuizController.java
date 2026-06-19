package com.quizmaster.controller;

import com.quizmaster.dto.request.QuizRequest;
import com.quizmaster.dto.response.ApiResponse;
import com.quizmaster.dto.response.QuizResponse;
import com.quizmaster.service.QuizService;
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
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final MessageService messageService;

    // Public endpoints
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getPublicQuizzes() {
        List<QuizResponse> quizzes = quizService.getPublicQuizzes();
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping("/public/search")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> searchPublicQuizzes(
            @RequestParam String q) {
        List<QuizResponse> quizzes = quizService.searchPublicQuizzes(q);
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping("/public/topic/{topicId}")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getPublicQuizzesByTopic(
            @PathVariable Long topicId) {
        List<QuizResponse> quizzes = quizService.getQuizzesByTopic(topicId);
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping("/public/popular")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getMostPlayedQuizzes(
            @RequestParam(defaultValue = "10") int limit) {
        List<QuizResponse> quizzes = quizService.getMostPlayedQuizzes(limit);
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    // Authenticated endpoints
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getMyQuizzes(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<QuizResponse> quizzes = quizService.getMyQuizzes(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<QuizResponse>>> getAllQuizzes() {
        List<QuizResponse> quizzes = quizService.getAllQuizzes();
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponse.QuizWithQuestions>> getQuizById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        QuizResponse.QuizWithQuestions quiz = userDetails != null ?
                quizService.getQuizByIdForUser(id, userDetails.getUsername()) :
                quizService.getQuizById(id);
        return ResponseEntity.ok(ApiResponse.success(quiz));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @Valid @RequestBody QuizRequest.Create request,
            @AuthenticationPrincipal UserDetails userDetails) {
        QuizResponse quiz = quizService.createQuiz(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("quiz.created"), quiz));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizRequest.Update request,
            @AuthenticationPrincipal UserDetails userDetails) {
        QuizResponse quiz = quizService.updateQuiz(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("quiz.updated"), quiz));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        quizService.deleteQuiz(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("quiz.deleted")));
    }

    // Question management
    @PostMapping("/{quizId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<QuizResponse.QuestionResponse>> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizRequest.QuestionCreate request,
            @AuthenticationPrincipal UserDetails userDetails) {
        QuizResponse.QuestionResponse question = quizService.addQuestion(
                quizId, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("question.created"), question));
    }

    @PutMapping("/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<QuizResponse.QuestionResponse>> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody QuizRequest.QuestionUpdate request,
            @AuthenticationPrincipal UserDetails userDetails) {
        QuizResponse.QuestionResponse question = quizService.updateQuestion(
                questionId, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("question.updated"), question));
    }

    @DeleteMapping("/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable Long questionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        quizService.deleteQuestion(questionId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("question.deleted")));
    }
}
