package com.quizmaster.controller;

import com.quizmaster.dto.request.AIRequest;
import com.quizmaster.dto.request.QuizRequest;
import com.quizmaster.dto.response.ApiResponse;
import com.quizmaster.service.AIService;
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
@RequestMapping("/ai")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
public class AIController {

    private final AIService aiService;
    private final MessageService messageService;

    @PostMapping("/generate-questions")
    public ResponseEntity<ApiResponse<List<QuizRequest.QuestionCreate>>> generateQuestions(
            @Valid @RequestBody AIRequest.GenerateQuestions request) {
        List<QuizRequest.QuestionCreate> questions = aiService.generateQuestions(request);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("ai.generation.success", new Object[]{questions.size()}),
                questions));
    }

    @PostMapping("/generate-for-quiz")
    public ResponseEntity<ApiResponse<List<QuizRequest.QuestionCreate>>> generateQuestionsForQuiz(
            @Valid @RequestBody AIRequest.GenerateForQuiz request,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<QuizRequest.QuestionCreate> questions = aiService.generateQuestionsForQuiz(
                request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("ai.generation.success", new Object[]{questions.size()}),
                questions));
    }
}
