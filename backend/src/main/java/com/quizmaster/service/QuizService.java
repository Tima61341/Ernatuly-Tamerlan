package com.quizmaster.service;

import com.quizmaster.dto.request.QuizRequest;
import com.quizmaster.dto.response.QuizResponse;
import com.quizmaster.entity.*;
import com.quizmaster.exception.CustomExceptions.*;
import com.quizmaster.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository answerOptionRepository;
    private final TopicService topicService;
    private final UserService userService;

    public List<QuizResponse> getPublicQuizzes() {
        return quizRepository.findByIsPublicTrueAndIsActiveTrue().stream()
                .map(QuizResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<QuizResponse> getMyQuizzes(String userEmail) {
        User user = userService.getEntityByEmail(userEmail);
        return quizRepository.findActiveQuizzesByCreatorId(user.getId()).stream()
                .map(QuizResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(QuizResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public QuizResponse.QuizWithQuestions getQuizById(Long id) {
        Quiz quiz = quizRepository.findByIdWithQuestionsAndOptions(id)
                .orElseThrow(() -> new ResourceNotFoundException("quiz.not.found"));
        return QuizResponse.fromEntityWithQuestions(quiz);
    }

    public QuizResponse.QuizWithQuestions getQuizByIdForUser(Long id, String userEmail) {
        Quiz quiz = quizRepository.findByIdWithQuestionsAndOptions(id)
                .orElseThrow(() -> new ResourceNotFoundException("quiz.not.found"));
        
        User user = userService.getEntityByEmail(userEmail);
        
        if (!quiz.getCreator().getId().equals(user.getId()) && 
            user.getRole() != Role.ADMIN && !quiz.getIsPublic()) {
            throw new ForbiddenException("quiz.access.denied");
        }
        
        return QuizResponse.fromEntityWithQuestions(quiz);
    }

    @Transactional
    public QuizResponse createQuiz(QuizRequest.Create request, String userEmail) {
        User creator = userService.getEntityByEmail(userEmail);
        
        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicService.getEntityById(request.getTopicId());
        } else if (request.getNewTopicName() != null && !request.getNewTopicName().isBlank()) {
            topic = topicService.getOrCreateTopic(request.getNewTopicName());
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .creator(creator)
                .topic(topic)
                .language(request.getLanguage() != null ? request.getLanguage() : "ru")
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM")
                .defaultTimerSeconds(request.getDefaultTimerSeconds() != null ? 
                        request.getDefaultTimerSeconds() : 30)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .isActive(true)
                .timesPlayed(0)
                .build();

        quiz = quizRepository.save(quiz);

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            Quiz finalQuiz = quiz;
            AtomicInteger orderIndex = new AtomicInteger(0);
            
            for (QuizRequest.QuestionCreate qRequest : request.getQuestions()) {
                Question question = createQuestion(qRequest, finalQuiz, orderIndex.getAndIncrement());
                finalQuiz.getQuestions().add(question);
            }
            quiz = quizRepository.save(quiz);
        }

        log.info("Quiz created: {} by {}", quiz.getTitle(), userEmail);
        return QuizResponse.fromEntity(quiz);
    }

    @Transactional
    public QuizResponse updateQuiz(Long id, QuizRequest.Update request, String userEmail) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("quiz.not.found"));
        
        User user = userService.getEntityByEmail(userEmail);
        
        if (!quiz.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("quiz.access.denied");
        }

        if (request.getTitle() != null) quiz.setTitle(request.getTitle());
        if (request.getDescription() != null) quiz.setDescription(request.getDescription());
        if (request.getTopicId() != null) quiz.setTopic(topicService.getEntityById(request.getTopicId()));
        if (request.getLanguage() != null) quiz.setLanguage(request.getLanguage());
        if (request.getDifficulty() != null) quiz.setDifficulty(request.getDifficulty());
        if (request.getDefaultTimerSeconds() != null) quiz.setDefaultTimerSeconds(request.getDefaultTimerSeconds());
        if (request.getIsPublic() != null) quiz.setIsPublic(request.getIsPublic());
        if (request.getIsActive() != null) quiz.setIsActive(request.getIsActive());

        quiz = quizRepository.save(quiz);
        log.info("Quiz updated: {}", quiz.getTitle());
        return QuizResponse.fromEntity(quiz);
    }

    @Transactional
    public void deleteQuiz(Long id, String userEmail) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("quiz.not.found"));
        
        User user = userService.getEntityByEmail(userEmail);
        
        if (!quiz.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("quiz.access.denied");
        }

        quizRepository.delete(quiz);
        log.info("Quiz deleted: {}", quiz.getTitle());
    }

    @Transactional
    public QuizResponse.QuestionResponse addQuestion(Long quizId, QuizRequest.QuestionCreate request, String userEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("quiz.not.found"));
        
        User user = userService.getEntityByEmail(userEmail);
        
        if (!quiz.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("quiz.access.denied");
        }

        Integer maxOrder = questionRepository.findMaxOrderIndexByQuizId(quizId);
        int orderIndex = maxOrder != null ? maxOrder + 1 : 0;

        Question question = createQuestion(request, quiz, orderIndex);
        quiz.getQuestions().add(question);
        quizRepository.save(quiz);

        log.info("Question added to quiz {}", quiz.getTitle());
        return QuizResponse.questionToResponse(question);
    }

    @Transactional
    public QuizResponse.QuestionResponse updateQuestion(Long questionId, QuizRequest.QuestionUpdate request, String userEmail) {
        Question question = questionRepository.findByIdWithOptions(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("question.not.found"));
        
        User user = userService.getEntityByEmail(userEmail);
        Quiz quiz = question.getQuiz();
        
        if (!quiz.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("quiz.access.denied");
        }

        if (request.getText() != null) question.setText(request.getText());
        if (request.getType() != null) question.setType(request.getType());
        if (request.getTimerSeconds() != null) question.setTimerSeconds(request.getTimerSeconds());
        if (request.getPoints() != null) question.setPoints(request.getPoints());
        if (request.getImageUrl() != null) question.setImageUrl(request.getImageUrl());
        if (request.getHint() != null) question.setHint(request.getHint());
        if (request.getExplanation() != null) question.setExplanation(request.getExplanation());
        if (request.getAcceptableAnswers() != null) question.setAcceptableAnswers(request.getAcceptableAnswers());

        if (request.getOptions() != null) {
            question.getOptions().clear();
            AtomicInteger optionIndex = new AtomicInteger(0);
            for (QuizRequest.OptionCreate optRequest : request.getOptions()) {
                AnswerOption option = AnswerOption.builder()
                        .question(question)
                        .text(optRequest.getText())
                        .isCorrect(optRequest.getIsCorrect() != null ? optRequest.getIsCorrect() : false)
                        .orderIndex(optionIndex.getAndIncrement())
                        .color(optRequest.getColor())
                        .build();
                question.getOptions().add(option);
            }
        }

        question = questionRepository.save(question);
        return QuizResponse.questionToResponse(question);
    }

    @Transactional
    public void deleteQuestion(Long questionId, String userEmail) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("question.not.found"));
        
        User user = userService.getEntityByEmail(userEmail);
        Quiz quiz = question.getQuiz();
        
        if (!quiz.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("quiz.access.denied");
        }

        int deletedIndex = question.getOrderIndex();
        quiz.getQuestions().remove(question);
        questionRepository.delete(question);
        questionRepository.decrementOrderIndexAfter(quiz.getId(), deletedIndex);
    }

    @Transactional
    public void addQuestionsToQuiz(Long quizId, List<QuizRequest.QuestionCreate> questions, String userEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("quiz.not.found"));
        
        User user = userService.getEntityByEmail(userEmail);
        
        if (!quiz.getCreator().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("quiz.access.denied");
        }

        Integer maxOrder = questionRepository.findMaxOrderIndexByQuizId(quizId);
        AtomicInteger orderIndex = new AtomicInteger(maxOrder != null ? maxOrder + 1 : 0);

        for (QuizRequest.QuestionCreate qRequest : questions) {
            Question question = createQuestion(qRequest, quiz, orderIndex.getAndIncrement());
            quiz.getQuestions().add(question);
        }

        quizRepository.save(quiz);
        log.info("Added {} questions to quiz {}", questions.size(), quiz.getTitle());
    }

    private Question createQuestion(QuizRequest.QuestionCreate request, Quiz quiz, int orderIndex) {
        Question question = Question.builder()
                .quiz(quiz)
                .text(request.getText())
                .type(request.getType())
                .timerSeconds(request.getTimerSeconds() != null ? request.getTimerSeconds() : quiz.getDefaultTimerSeconds())
                .points(request.getPoints() != null ? request.getPoints() : 1000)
                .orderIndex(orderIndex)
                .imageUrl(request.getImageUrl())
                .hint(request.getHint())
                .explanation(request.getExplanation())
                .acceptableAnswers(request.getAcceptableAnswers())
                .options(new HashSet<>())
                .build();

        if (request.getOptions() != null) {
            AtomicInteger optionIndex = new AtomicInteger(0);
            for (QuizRequest.OptionCreate optRequest : request.getOptions()) {
                AnswerOption option = AnswerOption.builder()
                        .question(question)
                        .text(optRequest.getText())
                        .isCorrect(optRequest.getIsCorrect() != null ? optRequest.getIsCorrect() : false)
                        .orderIndex(optionIndex.getAndIncrement())
                        .color(optRequest.getColor())
                        .build();
                question.getOptions().add(option);
            }
        }

        return questionRepository.save(question);
    }

    public List<QuizResponse> searchPublicQuizzes(String search) {
        return quizRepository.searchPublicQuizzes(search).stream()
                .map(QuizResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<QuizResponse> getQuizzesByTopic(Long topicId) {
        return quizRepository.findPublicQuizzesByTopic(topicId).stream()
                .map(QuizResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<QuizResponse> getMostPlayedQuizzes(int limit) {
        return quizRepository.findMostPlayed(PageRequest.of(0, limit)).stream()
                .map(QuizResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Quiz getEntityById(Long id) {
        Quiz quiz = quizRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("quiz.not.found"));
        // Initialize options for each question to avoid LazyInitializationException
        quiz.getQuestions().forEach(q -> q.getOptions().size());
        return quiz;
    }

    @Transactional
    public void incrementTimesPlayed(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("quiz.not.found"));
        quiz.setTimesPlayed(quiz.getTimesPlayed() + 1);
        quizRepository.save(quiz);
    }
}
