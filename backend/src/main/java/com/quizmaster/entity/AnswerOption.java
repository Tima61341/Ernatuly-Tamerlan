package com.quizmaster.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * AnswerOption entity - represents an answer option for a question
 */
@Entity
@Table(name = "answer_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false)
    private Boolean isCorrect = false;

    @Column(nullable = false)
    private Integer orderIndex = 0;

    @Column(length = 50)
    private String color; // For UI display (e.g., #FF0000)
}
