package com.quizmaster.util;

import com.quizmaster.entity.Gender;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class AvatarGenerator {

    private static final String DICEBEAR_BASE_URL = "https://api.dicebear.com/7.x";
    
    // Avatar styles that work well for young people (15-30 style)
    private static final String[] STYLES = {
        "adventurer",
        "avataaars",
        "big-ears",
        "lorelei",
        "micah",
        "personas"
    };

    private final Random random = new Random();

    public String generateAvatar(String nickname, Gender gender) {
        String style = STYLES[random.nextInt(STYLES.length)];
        String seed = nickname + System.currentTimeMillis();
        
        // Build URL with gender-appropriate options
        StringBuilder url = new StringBuilder();
        url.append(DICEBEAR_BASE_URL)
           .append("/")
           .append(style)
           .append("/svg?seed=")
           .append(encodeUrlParam(seed));

        // Add gender-specific options for some styles
        if (style.equals("avataaars") || style.equals("lorelei") || style.equals("personas")) {
            if (gender == Gender.MALE) {
                url.append("&hairProbability=90");
            } else if (gender == Gender.FEMALE) {
                url.append("&hairProbability=100");
            }
        }

        // Add some randomization for variety
        url.append("&backgroundColor=")
           .append(getRandomBackgroundColor());

        return url.toString();
    }

    public String generateAvatarWithStyle(String nickname, Gender gender, String preferredStyle) {
        String style = isValidStyle(preferredStyle) ? preferredStyle : STYLES[random.nextInt(STYLES.length)];
        String seed = nickname + System.currentTimeMillis();

        return DICEBEAR_BASE_URL + "/" + style + "/svg?seed=" + encodeUrlParam(seed) +
               "&backgroundColor=" + getRandomBackgroundColor();
    }

    private String getRandomBackgroundColor() {
        String[] colors = {"b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"};
        return colors[random.nextInt(colors.length)];
    }

    private boolean isValidStyle(String style) {
        for (String s : STYLES) {
            if (s.equalsIgnoreCase(style)) {
                return true;
            }
        }
        return false;
    }

    private String encodeUrlParam(String param) {
        return param.replaceAll("[^a-zA-Z0-9]", "");
    }
}
