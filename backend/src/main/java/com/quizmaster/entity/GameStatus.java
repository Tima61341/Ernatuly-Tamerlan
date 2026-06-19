package com.quizmaster.entity;

/**
 * Status of a game session
 */
public enum GameStatus {
    WAITING,        // Waiting for players to join
    IN_PROGRESS,    // Game is currently running
    PAUSED,         // Game is temporarily paused
    FINISHED        // Game has ended
}
