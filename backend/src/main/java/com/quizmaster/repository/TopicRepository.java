package com.quizmaster.repository;

import com.quizmaster.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    
    Optional<Topic> findByName(String name);
    
    boolean existsByName(String name);
    
    List<Topic> findByIsActiveTrue();
    
    @Query("SELECT t FROM Topic t LEFT JOIN FETCH t.quizzes WHERE t.id = :id")
    Optional<Topic> findByIdWithQuizzes(@Param("id") Long id);
    
    @Query("SELECT t FROM Topic t WHERE t.isActive = true ORDER BY t.name ASC")
    List<Topic> findAllActiveOrderByName();
    
    @Query("SELECT t FROM Topic t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Topic> searchByName(@Param("search") String search);
}
