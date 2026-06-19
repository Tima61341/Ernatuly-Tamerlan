package com.quizmaster.service;

import com.quizmaster.dto.request.TopicRequest;
import com.quizmaster.dto.response.TopicFullResponse;
import com.quizmaster.entity.Topic;
import com.quizmaster.exception.CustomExceptions.*;
import com.quizmaster.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicService {

    private final TopicRepository topicRepository;

    public List<TopicFullResponse> getAllTopics() {
        return topicRepository.findAllActiveOrderByName().stream()
                .map(TopicFullResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TopicFullResponse> getAllTopicsIncludingInactive() {
        return topicRepository.findAll().stream()
                .map(TopicFullResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TopicFullResponse getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("topic.not.found"));
        return TopicFullResponse.fromEntity(topic);
    }

    @Transactional
    public TopicFullResponse createTopic(TopicRequest.Create request) {
        if (topicRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("topic.name.exists");
        }

        Topic topic = Topic.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon() != null ? request.getIcon() : "📚")
                .color(request.getColor() != null ? request.getColor() : "#3B82F6")
                .isActive(true)
                .build();

        topic = topicRepository.save(topic);
        log.info("Topic created: {}", topic.getName());
        return TopicFullResponse.fromEntity(topic);
    }

    @Transactional
    public TopicFullResponse updateTopic(Long id, TopicRequest.Update request) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("topic.not.found"));

        if (request.getName() != null && !request.getName().equals(topic.getName())) {
            if (topicRepository.existsByName(request.getName())) {
                throw new ResourceAlreadyExistsException("topic.name.exists");
            }
            topic.setName(request.getName());
        }
        if (request.getDescription() != null) {
            topic.setDescription(request.getDescription());
        }
        if (request.getIcon() != null) {
            topic.setIcon(request.getIcon());
        }
        if (request.getColor() != null) {
            topic.setColor(request.getColor());
        }
        if (request.getIsActive() != null) {
            topic.setIsActive(request.getIsActive());
        }

        topic = topicRepository.save(topic);
        log.info("Topic updated: {}", topic.getName());
        return TopicFullResponse.fromEntity(topic);
    }

    @Transactional
    public void deleteTopic(Long id) {
        Topic topic = topicRepository.findByIdWithQuizzes(id)
                .orElseThrow(() -> new ResourceNotFoundException("topic.not.found"));

        if (!topic.getQuizzes().isEmpty()) {
            // Soft delete - just deactivate
            topic.setIsActive(false);
            topicRepository.save(topic);
            log.info("Topic deactivated (has quizzes): {}", topic.getName());
        } else {
            topicRepository.delete(topic);
            log.info("Topic deleted: {}", topic.getName());
        }
    }

    public List<TopicFullResponse> searchTopics(String search) {
        return topicRepository.searchByName(search).stream()
                .map(TopicFullResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Topic getEntityById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("topic.not.found"));
    }

    @Transactional
    public Topic getOrCreateTopic(String topicName) {
        return topicRepository.findByName(topicName)
                .orElseGet(() -> {
                    Topic newTopic = Topic.builder()
                            .name(topicName)
                            .icon("📚")
                            .color("#3B82F6")
                            .isActive(true)
                            .build();
                    return topicRepository.save(newTopic);
                });
    }
}
