package com.quizmaster.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizmaster.dto.request.AIRequest;
import com.quizmaster.dto.request.QuizRequest;
import com.quizmaster.entity.QuestionType;
import com.quizmaster.exception.CustomExceptions.AIGenerationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final QuizService quizService;

    @Value("${ai.groq.api-key}")
    private String apiKey;

    @Value("${ai.groq.api-url}")
    private String apiUrl;

    @Value("${ai.groq.model}")
    private String model;

    @Value("${ai.groq.max-tokens}")
    private int maxTokens;

    @Value("${ai.groq.temperature}")
    private double temperature;

    public List<QuizRequest.QuestionCreate> generateQuestions(AIRequest.GenerateQuestions request) {
        // Check if difficulty distribution is specified
        boolean hasDistribution = (request.getEasyCount() != null && request.getEasyCount() > 0)
                || (request.getMediumCount() != null && request.getMediumCount() > 0)
                || (request.getHardCount() != null && request.getHardCount() > 0);

        if (hasDistribution) {
            return generateWithDistribution(request);
        }

        // Standard single-difficulty generation
        String prompt = buildPrompt(request);
        String response = callAI(prompt);
        List<QuizRequest.QuestionCreate> questions = parseAIResponse(response, request.getQuestionType());
        // Apply difficulty and points
        int points = pointsForDifficulty(request.getDifficulty(), request);
        questions.forEach(q -> {
            q.setDifficulty(request.getDifficulty());
            q.setPoints(points);
        });
        return questions;
    }

    private List<QuizRequest.QuestionCreate> generateWithDistribution(AIRequest.GenerateQuestions request) {
        List<QuizRequest.QuestionCreate> allQuestions = new ArrayList<>();

        int easy = request.getEasyCount() != null ? request.getEasyCount() : 0;
        int medium = request.getMediumCount() != null ? request.getMediumCount() : 0;
        int hard = request.getHardCount() != null ? request.getHardCount() : 0;

        if (easy > 0) {
            allQuestions.addAll(generateForDifficulty(request, "EASY", easy,
                    request.getEasyPoints() != null ? request.getEasyPoints() : 500));
        }
        if (medium > 0) {
            allQuestions.addAll(generateForDifficulty(request, "MEDIUM", medium,
                    request.getMediumPoints() != null ? request.getMediumPoints() : 1000));
        }
        if (hard > 0) {
            allQuestions.addAll(generateForDifficulty(request, "HARD", hard,
                    request.getHardPoints() != null ? request.getHardPoints() : 1500));
        }

        return allQuestions;
    }

    private List<QuizRequest.QuestionCreate> generateForDifficulty(
            AIRequest.GenerateQuestions baseRequest, String difficulty, int count, int points) {
        AIRequest.GenerateQuestions subRequest = AIRequest.GenerateQuestions.builder()
                .topic(baseRequest.getTopic())
                .difficulty(difficulty)
                .language(baseRequest.getLanguage())
                .questionType(baseRequest.getQuestionType())
                .count(count)
                .additionalContext(baseRequest.getAdditionalContext())
                .includeExplanation(baseRequest.getIncludeExplanation())
                .build();

        String prompt = buildPrompt(subRequest);
        String response = callAI(prompt);
        List<QuizRequest.QuestionCreate> questions = parseAIResponse(response, baseRequest.getQuestionType());

        // Apply difficulty and points to each question
        questions.forEach(q -> {
            q.setDifficulty(difficulty);
            q.setPoints(points);
        });

        return questions;
    }

    private int pointsForDifficulty(String difficulty, AIRequest.GenerateQuestions request) {
        return switch (difficulty) {
            case "EASY" -> request.getEasyPoints() != null ? request.getEasyPoints() : 500;
            case "HARD" -> request.getHardPoints() != null ? request.getHardPoints() : 1500;
            default -> request.getMediumPoints() != null ? request.getMediumPoints() : 1000;
        };
    }

    public List<QuizRequest.QuestionCreate> generateQuestionsForQuiz(AIRequest.GenerateForQuiz request, String userEmail) {
        var quiz = quizService.getQuizByIdForUser(request.getQuizId(), userEmail);
        
        AIRequest.GenerateQuestions generateRequest = AIRequest.GenerateQuestions.builder()
                .topic(quiz.getTopic() != null ? quiz.getTopic().getName() : quiz.getTitle())
                .difficulty(quiz.getDifficulty())
                .language(quiz.getLanguage())
                .questionType(request.getQuestionType() != null ? request.getQuestionType() : QuestionType.SINGLE_CHOICE)
                .count(request.getCount())
                .additionalContext(request.getUseExistingTopicContext() ? 
                        "Quiz title: " + quiz.getTitle() + ". Description: " + quiz.getDescription() : null)
                .includeExplanation(true)
                .build();
        
        List<QuizRequest.QuestionCreate> questions = generateQuestions(generateRequest);
        
        // Add to quiz if requested
        quizService.addQuestionsToQuiz(request.getQuizId(), questions, userEmail);
        
        return questions;
    }

    private String buildPrompt(AIRequest.GenerateQuestions request) {
        String langInstruction = switch (request.getLanguage()) {
            case "kk" -> "Отвечай ТОЛЬКО на казахском языке. ";
            case "en" -> "Respond ONLY in English. ";
            default -> "Отвечай ТОЛЬКО на русском языке. ";
        };

        String difficultyDesc = switch (request.getDifficulty()) {
            case "EASY" -> "простые, для начинающих";
            case "HARD" -> "сложные, для экспертов";
            default -> "средней сложности";
        };

        String typeInstruction = switch (request.getQuestionType()) {
            case MULTIPLE_CHOICE -> "с несколькими правильными ответами (укажи 2-3 правильных варианта)";
            case TRUE_FALSE -> "типа 'Правда или Ложь' (только 2 варианта: Правда и Ложь)";
            case OPEN_ANSWER -> "с открытым ответом (укажи несколько допустимых вариантов ответа)";
            default -> "с одним правильным ответом";
        };

        StringBuilder prompt = new StringBuilder();
        prompt.append(langInstruction);
        prompt.append("Ты - эксперт по созданию образовательных викторин. ");
        prompt.append("Создай ").append(request.getCount()).append(" вопросов по теме '").append(request.getTopic()).append("'. ");
        prompt.append("Вопросы должны быть ").append(difficultyDesc).append(", ").append(typeInstruction).append(". ");
        
        if (request.getAdditionalContext() != null && !request.getAdditionalContext().isBlank()) {
            prompt.append("Дополнительный контекст: ").append(request.getAdditionalContext()).append(". ");
        }

        prompt.append("\n\nФОРМАТ ОТВЕТА - строго JSON массив:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"text\": \"текст вопроса\",\n");
        prompt.append("    \"explanation\": \"объяснение правильного ответа\",\n");
        
        if (request.getQuestionType() == QuestionType.OPEN_ANSWER) {
            prompt.append("    \"acceptableAnswers\": \"ответ1,ответ2,ответ3\"\n");
        } else {
            prompt.append("    \"options\": [\n");
            prompt.append("      {\"text\": \"вариант 1\", \"isCorrect\": true},\n");
            prompt.append("      {\"text\": \"вариант 2\", \"isCorrect\": false},\n");
            prompt.append("      {\"text\": \"вариант 3\", \"isCorrect\": false},\n");
            prompt.append("      {\"text\": \"вариант 4\", \"isCorrect\": false}\n");
            prompt.append("    ]\n");
        }
        
        prompt.append("  }\n");
        prompt.append("]\n\n");
        prompt.append("ВАЖНО: Верни ТОЛЬКО валидный JSON без дополнительного текста.");

        return prompt.toString();
    }

    private String callAI(String prompt) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of(
                    "role", "system",
                    "content", "You are an expert quiz creator. Always respond with valid JSON only."
            ));
            messages.add(Map.of(
                    "role", "user",
                    "content", prompt
            ));
            requestBody.put("messages", messages);

            log.info("Calling AI API at {} with model '{}'", apiUrl, model);

            WebClient client = webClientBuilder.build();

            String response = client.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.isError(), clientResponse ->
                        clientResponse.bodyToMono(String.class).flatMap(body -> {
                            log.error("AI API returned error status {}: {}",
                                    clientResponse.statusCode(), body);
                            return Mono.error(new AIGenerationException(
                                    "Groq API error " + clientResponse.statusCode() + ": " + body));
                        })
                    )
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            log.debug("AI Response: {}", response);
            return response;

        } catch (AIGenerationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling AI API: {}", e.getMessage(), e);
            throw new AIGenerationException("ai.generation.failed");
        }
    }

    private List<QuizRequest.QuestionCreate> parseAIResponse(String response, QuestionType questionType) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            // Extract content from Groq response
            String content = root.path("choices").get(0).path("message").path("content").asText();
            
            // Clean up the response - remove markdown code blocks if present
            content = content.trim();
            if (content.startsWith("```json")) {
                content = content.substring(7);
            }
            if (content.startsWith("```")) {
                content = content.substring(3);
            }
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }
            content = content.trim();

            JsonNode questionsArray = objectMapper.readTree(content);
            List<QuizRequest.QuestionCreate> questions = new ArrayList<>();

            for (JsonNode qNode : questionsArray) {
                QuizRequest.QuestionCreate.QuestionCreateBuilder builder = QuizRequest.QuestionCreate.builder()
                        .text(qNode.path("text").asText())
                        .type(questionType)
                        .explanation(qNode.has("explanation") ? qNode.path("explanation").asText() : null);

                if (questionType == QuestionType.OPEN_ANSWER) {
                    builder.acceptableAnswers(qNode.path("acceptableAnswers").asText());
                } else {
                    List<QuizRequest.OptionCreate> options = new ArrayList<>();
                    String[] colors = {"#EF4444", "#3B82F6", "#10B981", "#F59E0B"};
                    int colorIndex = 0;
                    
                    for (JsonNode optNode : qNode.path("options")) {
                        options.add(QuizRequest.OptionCreate.builder()
                                .text(optNode.path("text").asText())
                                .isCorrect(optNode.path("isCorrect").asBoolean(false))
                                .color(colors[colorIndex % colors.length])
                                .build());
                        colorIndex++;
                    }
                    builder.options(options);
                }

                questions.add(builder.build());
            }

            log.info("Successfully parsed {} questions from AI response", questions.size());
            return questions;

        } catch (JsonProcessingException e) {
            log.error("Error parsing AI response: {}", e.getMessage());
            throw new AIGenerationException("ai.generation.failed");
        }
    }
}
