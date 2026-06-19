package com.quizmaster.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Player entity - represents a player in a game session (no registration required)
 */
@Entity
@Table(name = "players")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", nullable = false)
    private GameSession gameSession;

    @Column(nullable = false)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column
    private Integer age;

    @Column(nullable = false)
    private String avatarUrl;

    @Column(nullable = false, unique = true)
    private String sessionToken; // Unique token for player identification

    @Column(nullable = false)
    private Integer totalScore = 0;

    @Column(nullable = false)
    private Integer correctAnswers = 0;

    @Column(nullable = false)
    private Integer currentStreak = 0;

    @Column(nullable = false)
    private Integer bestStreak = 0;

    @Column(nullable = false)
    private Boolean isConnected = true;

    @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PlayerAnswer> answers = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    // Helper methods
    public void addScore(int points) {
        this.totalScore += points;
    }

    public void incrementCorrectAnswers() {
        this.correctAnswers++;
        this.currentStreak++;
        if (this.currentStreak > this.bestStreak) {
            this.bestStreak = this.currentStreak;
        }
    }

    public void resetStreak() {
        this.currentStreak = 0;
    }

    public double getAccuracy() {
        int totalAnswers = answers.size();
        if (totalAnswers == 0) return 0;
        return (double) correctAnswers / totalAnswers * 100;
    }
}
