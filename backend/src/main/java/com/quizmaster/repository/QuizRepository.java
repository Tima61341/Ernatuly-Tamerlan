package com.quizmaster.repository;

import com.quizmaster.entity.Quiz;
import com.quizmaster.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    List<Quiz> findByCreator(User creator);
    
    List<Quiz> findByCreatorId(Long creatorId);
    
    List<Quiz> findByTopicId(Long topicId);
    
    List<Quiz> findByIsPublicTrueAndIsActiveTrue();
    
    Page<Quiz> findByIsPublicTrueAndIsActiveTrue(Pageable pageable);
    
    @Query("SELECT q FROM Quiz q WHERE q.creator.id = :creatorId AND q.isActive = true")
    List<Quiz> findActiveQuizzesByCreatorId(@Param("creatorId") Long creatorId);
    
    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :id")
    Optional<Quiz> findByIdWithQuestions(@Param("id") Long id);
    
    // Simple fetch - options will be loaded lazily when needed
    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :id")
    Optional<Quiz> findByIdWithQuestionsAndOptions(@Param("id") Long id);
    
    @Query("SELECT q FROM Quiz q WHERE q.isPublic = true AND q.isActive = true " +
           "AND (LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Quiz> searchPublicQuizzes(@Param("search") String search);
    
    @Query("SELECT q FROM Quiz q WHERE q.topic.id = :topicId AND q.isPublic = true AND q.isActive = true")
    List<Quiz> findPublicQuizzesByTopic(@Param("topicId") Long topicId);
    
    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.creator.id = :creatorId")
    long countByCreatorId(@Param("creatorId") Long creatorId);
    
    @Query("SELECT q FROM Quiz q ORDER BY q.timesPlayed DESC")
    List<Quiz> findMostPlayed(Pageable pageable);
}
