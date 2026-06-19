package com.quizmaster.repository;

import com.quizmaster.entity.Question;
import com.quizmaster.entity.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    List<Question> findByQuizId(Long quizId);
    
    List<Question> findByQuizIdOrderByOrderIndexAsc(Long quizId);
    
    List<Question> findByType(QuestionType type);
    
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.options WHERE q.id = :id")
    Optional<Question> findByIdWithOptions(@Param("id") Long id);
    
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.options WHERE q.quiz.id = :quizId ORDER BY q.orderIndex ASC")
    List<Question> findByQuizIdWithOptions(@Param("quizId") Long quizId);
    
    @Query("SELECT MAX(q.orderIndex) FROM Question q WHERE q.quiz.id = :quizId")
    Integer findMaxOrderIndexByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.quiz.id = :quizId")
    long countByQuizId(@Param("quizId") Long quizId);
    
    @Modifying
    @Query("UPDATE Question q SET q.orderIndex = q.orderIndex - 1 WHERE q.quiz.id = :quizId AND q.orderIndex > :deletedIndex")
    void decrementOrderIndexAfter(@Param("quizId") Long quizId, @Param("deletedIndex") Integer deletedIndex);
}
