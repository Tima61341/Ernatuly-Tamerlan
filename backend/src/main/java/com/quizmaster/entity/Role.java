package com.quizmaster.entity;

/**
 * User roles in the QuizMaster system
 */
public enum Role {
    ADMIN,      // Can manage all users, quizzes, topics, view statistics
    CREATOR,    // Can create and manage own quizzes
    USER        // Basic user role (same as CREATOR for backward compatibility)
}
