package com.quizmaster.repository;

import com.quizmaster.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    
    Optional<Player> findBySessionToken(String sessionToken);
    
    List<Player> findByGameSessionId(Long gameSessionId);
    
    @Query("SELECT p FROM Player p WHERE p.gameSession.id = :gameSessionId ORDER BY p.totalScore DESC")
    List<Player> findByGameSessionIdOrderByScoreDesc(@Param("gameSessionId") Long gameSessionId);
    
    @Query("SELECT p FROM Player p WHERE p.gameSession.gameCode = :gameCode AND p.nickname = :nickname")
    Optional<Player> findByGameCodeAndNickname(@Param("gameCode") String gameCode, @Param("nickname") String nickname);
    
    @Query("SELECT p FROM Player p LEFT JOIN FETCH p.answers WHERE p.sessionToken = :sessionToken")
    Optional<Player> findBySessionTokenWithAnswers(@Param("sessionToken") String sessionToken);
    
    @Query("SELECT COUNT(p) FROM Player p WHERE p.gameSession.id = :gameSessionId")
    long countByGameSessionId(@Param("gameSessionId") Long gameSessionId);
    
    @Query("SELECT p FROM Player p WHERE p.gameSession.id = :gameSessionId AND p.isConnected = true")
    List<Player> findConnectedPlayersByGameSessionId(@Param("gameSessionId") Long gameSessionId);
    
    boolean existsByGameSessionIdAndNickname(Long gameSessionId, String nickname);
}
