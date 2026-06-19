package com.quizmaster.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * PlayerAnswer entity - records a player's answer to a question
 */
@Entity
@Table(name = "player_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", nullable = false)
    private GameSession gameSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    // For single/multiple choice - stores selected option IDs
    @ElementCollection
    @CollectionTable(name = "player_answer_selections", joinColumns = @JoinColumn(name = "player_answer_id"))
    @Column(name = "option_id")
    @Builder.Default
    private List<Long> selectedOptionIds = new ArrayList<>();

    // For open answer questions
    @Column(length = 1000)
    private String textAnswer;

    @Column(nullable = false)
    private Boolean isCorrect = false;

    @Column(nullable = false)
    private Integer pointsEarned = 0;

    @Column(nullable = false)
    private Integer speedBonusEarned = 0;

    @Column(nullable = false)
    private Long responseTimeMs = 0L; // Time taken to answer in milliseconds

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime answeredAt;

    // Helper method
    public int getTotalPoints() {
        return pointsEarned + speedBonusEarned;
    }
}
