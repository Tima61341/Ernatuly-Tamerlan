package com.quizmaster.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ScoreCalculator {

    @Value("${app.game.base-points:1000}")
    private int basePoints;

    @Value("${app.game.speed-bonus-max:500}")
    private int speedBonusMax;

    /**
     * Calculate points for a correct answer
     * @param questionPoints Base points for the question
     * @param responseTimeMs Time taken to answer in milliseconds
     * @param timerSeconds Total time allowed for the question
     * @return Array with [basePoints, speedBonus]
     */
    public int[] calculatePoints(int questionPoints, long responseTimeMs, int timerSeconds) {
        // Base points for correct answer
        int earnedPoints = questionPoints;

        // Calculate speed bonus
        // Faster answers get more bonus points
        long timerMs = timerSeconds * 1000L;
        double timeRatio = 1.0 - ((double) responseTimeMs / timerMs);
        
        // Ensure time ratio is between 0 and 1
        timeRatio = Math.max(0, Math.min(1, timeRatio));
        
        // Speed bonus calculation (linear)
        int speedBonus = (int) (speedBonusMax * timeRatio);

        return new int[]{earnedPoints, speedBonus};
    }

    /**
     * Calculate partial points for multiple choice questions
     * @param questionPoints Base points for the question
     * @param correctSelected Number of correct options selected
     * @param totalCorrect Total number of correct options
     * @param incorrectSelected Number of incorrect options selected
     * @return Partial points earned
     */
    public int calculatePartialPoints(int questionPoints, int correctSelected, 
                                       int totalCorrect, int incorrectSelected) {
        if (totalCorrect == 0) return 0;
        
        // Calculate base ratio
        double correctRatio = (double) correctSelected / totalCorrect;
        
        // Penalty for incorrect selections
        double penalty = incorrectSelected * 0.25;
        
        // Final ratio (min 0)
        double finalRatio = Math.max(0, correctRatio - penalty);
        
        return (int) (questionPoints * finalRatio);
    }

    /**
     * Check if open answer is correct (fuzzy matching)
     * @param userAnswer User's answer
     * @param acceptableAnswers Comma-separated list of acceptable answers
     * @return true if answer is acceptable
     */
    public boolean isOpenAnswerCorrect(String userAnswer, String acceptableAnswers) {
        if (userAnswer == null || acceptableAnswers == null) return false;
        
        String normalizedUser = normalizeAnswer(userAnswer);
        String[] acceptable = acceptableAnswers.split(",");
        
        for (String answer : acceptable) {
            String normalizedAcceptable = normalizeAnswer(answer);
            if (normalizedUser.equals(normalizedAcceptable)) {
                return true;
            }
            // Fuzzy match - allow small differences
            if (fuzzyMatch(normalizedUser, normalizedAcceptable)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeAnswer(String answer) {
        return answer.trim()
                .toLowerCase()
                .replaceAll("\\s+", " ")
                .replaceAll("[^a-zA-Zа-яА-ЯәғқңөұүһіӘҒҚҢӨҰҮҺІ0-9\\s]", "");
    }

    private boolean fuzzyMatch(String s1, String s2) {
        // Simple Levenshtein distance check
        int distance = levenshteinDistance(s1, s2);
        int maxLength = Math.max(s1.length(), s2.length());
        
        // Allow up to 15% difference
        return distance <= maxLength * 0.15;
    }

    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                    dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                    );
                }
            }
        }
        return dp[s1.length()][s2.length()];
    }
}
