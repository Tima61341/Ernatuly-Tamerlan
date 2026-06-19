package com.quizmaster.repository;

import com.quizmaster.entity.PlayerAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerAnswerRepository extends JpaRepository<PlayerAnswer, Long> {
    
    List<PlayerAnswer> findByPlayerId(Long playerId);
    
    List<PlayerAnswer> findByGameSessionId(Long gameSessionId);
    
    List<PlayerAnswer> findByQuestionId(Long questionId);
    
    @Query("SELECT pa FROM PlayerAnswer pa WHERE pa.player.id = :playerId AND pa.question.id = :questionId")
    Optional<PlayerAnswer> findByPlayerIdAndQuestionId(@Param("playerId") Long playerId, @Param("questionId") Long questionId);
    
    @Query("SELECT pa FROM PlayerAnswer pa WHERE pa.gameSession.id = :gameSessionId AND pa.question.id = :questionId")
    List<PlayerAnswer> findByGameSessionIdAndQuestionId(@Param("gameSessionId") Long gameSessionId, @Param("questionId") Long questionId);
    
    @Query("SELECT COUNT(pa) FROM PlayerAnswer pa WHERE pa.player.id = :playerId AND pa.isCorrect = true")
    long countCorrectAnswersByPlayerId(@Param("playerId") Long playerId);
    
    @Query("SELECT AVG(pa.responseTimeMs) FROM PlayerAnswer pa WHERE pa.player.id = :playerId")
    Double getAverageResponseTimeByPlayerId(@Param("playerId") Long playerId);
    
    @Query("SELECT SUM(pa.pointsEarned + pa.speedBonusEarned) FROM PlayerAnswer pa WHERE pa.player.id = :playerId")
    Long getTotalPointsByPlayerId(@Param("playerId") Long playerId);
    
    @Query("SELECT pa FROM PlayerAnswer pa WHERE pa.gameSession.id = :gameSessionId AND pa.question.id = :questionId ORDER BY pa.answeredAt ASC")
    List<PlayerAnswer> findAnswersForQuestionOrderByTime(@Param("gameSessionId") Long gameSessionId, @Param("questionId") Long questionId);
    
    boolean existsByPlayerIdAndQuestionId(Long playerId, Long questionId);
}
