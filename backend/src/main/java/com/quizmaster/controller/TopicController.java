package com.quizmaster.controller;

import com.quizmaster.dto.request.TopicRequest;
import com.quizmaster.dto.response.ApiResponse;
import com.quizmaster.dto.response.TopicFullResponse;
import com.quizmaster.service.TopicService;
import com.quizmaster.util.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;
    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicFullResponse>>> getAllTopics() {
        List<TopicFullResponse> topics = topicService.getAllTopics();
        return ResponseEntity.ok(ApiResponse.success(topics));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TopicFullResponse>>> getAllTopicsIncludingInactive() {
        List<TopicFullResponse> topics = topicService.getAllTopicsIncludingInactive();
        return ResponseEntity.ok(ApiResponse.success(topics));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicFullResponse>> getTopicById(@PathVariable Long id) {
        TopicFullResponse topic = topicService.getTopicById(id);
        return ResponseEntity.ok(ApiResponse.success(topic));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TopicFullResponse>>> searchTopics(
            @RequestParam String q) {
        List<TopicFullResponse> topics = topicService.searchTopics(q);
        return ResponseEntity.ok(ApiResponse.success(topics));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<TopicFullResponse>> createTopic(
            @Valid @RequestBody TopicRequest.Create request) {
        TopicFullResponse topic = topicService.createTopic(request);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("topic.created"), topic));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TopicFullResponse>> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody TopicRequest.Update request) {
        TopicFullResponse topic = topicService.updateTopic(id, request);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("topic.updated"), topic));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessage("topic.deleted")));
    }
}
