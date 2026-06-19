package com.quizmaster.repository;

import com.quizmaster.entity.AnswerOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerOptionRepository extends JpaRepository<AnswerOption, Long> {
    
    List<AnswerOption> findByQuestionId(Long questionId);
    
    List<AnswerOption> findByQuestionIdOrderByOrderIndexAsc(Long questionId);
    
    @Query("SELECT a FROM AnswerOption a WHERE a.question.id = :questionId AND a.isCorrect = true")
    List<AnswerOption> findCorrectOptionsByQuestionId(@Param("questionId") Long questionId);
    
    @Query("SELECT COUNT(a) FROM AnswerOption a WHERE a.question.id = :questionId")
    long countByQuestionId(@Param("questionId") Long questionId);
    
    void deleteByQuestionId(Long questionId);
}
