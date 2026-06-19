package com.quizmaster.dto.response;

import com.quizmaster.entity.Topic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicFullResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private Boolean isActive;
    private Integer quizCount;
    private LocalDateTime createdAt;

    public static TopicFullResponse fromEntity(Topic topic) {
        return TopicFullResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .description(topic.getDescription())
                .icon(topic.getIcon())
                .color(topic.getColor())
                .isActive(topic.getIsActive())
                .quizCount(topic.getQuizzes() != null ? topic.getQuizzes().size() : 0)
                .createdAt(topic.getCreatedAt())
                .build();
    }

    public static TopicFullResponse basic(Topic topic) {
        return TopicFullResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .icon(topic.getIcon())
                .color(topic.getColor())
                .build();
    }
}
