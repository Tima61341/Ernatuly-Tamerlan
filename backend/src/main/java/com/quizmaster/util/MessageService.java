package com.quizmaster.util;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageSource messageSource;

    public String getMessage(String key) {
        Locale locale = LocaleContextHolder.getLocale();
        try {
            return messageSource.getMessage(key, null, locale);
        } catch (Exception e) {
            return key; // Return key if message not found
        }
    }

    public String getMessage(String key, Object[] args) {
        Locale locale = LocaleContextHolder.getLocale();
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            return key;
        }
    }

    public String getMessage(String key, Object[] args, Locale locale) {
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            return key;
        }
    }

    public String getMessageForLang(String key, String lang) {
        Locale locale = getLocaleFromLanguage(lang);
        try {
            return messageSource.getMessage(key, null, locale);
        } catch (Exception e) {
            return key;
        }
    }

    public static Locale getLocaleFromLanguage(String lang) {
        if (lang == null) {
            return new Locale("ru");
        }
        return switch (lang.toLowerCase()) {
            case "kk", "kz" -> new Locale("kk");
            case "en" -> Locale.ENGLISH;
            default -> new Locale("ru");
        };
    }
}
