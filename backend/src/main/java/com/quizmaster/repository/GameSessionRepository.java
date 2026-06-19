package com.quizmaster.repository;

import com.quizmaster.entity.GameSession;
import com.quizmaster.entity.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    
    Optional<GameSession> findByGameCode(String gameCode);
    
    boolean existsByGameCode(String gameCode);
    
    List<GameSession> findByHostId(Long hostId);
    
    List<GameSession> findByQuizId(Long quizId);
    
    List<GameSession> findByStatus(GameStatus status);
    
    @Query("SELECT g FROM GameSession g WHERE g.host.id = :hostId AND g.status = :status")
    List<GameSession> findByHostIdAndStatus(@Param("hostId") Long hostId, @Param("status") GameStatus status);
    
    @Query("SELECT g FROM GameSession g LEFT JOIN FETCH g.players WHERE g.gameCode = :gameCode")
    Optional<GameSession> findByGameCodeWithPlayers(@Param("gameCode") String gameCode);
    
    @Query("SELECT g FROM GameSession g LEFT JOIN FETCH g.players LEFT JOIN FETCH g.quiz q LEFT JOIN FETCH q.questions WHERE g.id = :id")
    Optional<GameSession> findByIdWithPlayersAndQuiz(@Param("id") Long id);
    
    @Query("SELECT g FROM GameSession g WHERE g.status IN ('WAITING', 'IN_PROGRESS') AND g.createdAt < :threshold")
    List<GameSession> findStaleGames(@Param("threshold") LocalDateTime threshold);
    
    @Query("SELECT COUNT(g) FROM GameSession g WHERE g.host.id = :hostId")
    long countByHostId(@Param("hostId") Long hostId);
    
    @Query("SELECT COUNT(g) FROM GameSession g WHERE g.quiz.id = :quizId AND g.status = 'FINISHED'")
    long countFinishedGamesByQuizId(@Param("quizId") Long quizId);
}
