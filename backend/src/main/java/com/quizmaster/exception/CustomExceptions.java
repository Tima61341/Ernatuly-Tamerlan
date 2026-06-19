package com.quizmaster.exception;

import org.springframework.http.HttpStatus;

public class CustomExceptions {

    public static class BaseException extends RuntimeException {
        private final HttpStatus status;
        private final String messageKey;

        public BaseException(String messageKey, HttpStatus status) {
            super(messageKey);
            this.messageKey = messageKey;
            this.status = status;
        }

        public HttpStatus getStatus() {
            return status;
        }

        public String getMessageKey() {
            return messageKey;
        }
    }

    public static class UnauthorizedException extends BaseException {
        public UnauthorizedException(String messageKey) {
            super(messageKey, HttpStatus.UNAUTHORIZED);
        }
    }

    public static class ForbiddenException extends BaseException {
        public ForbiddenException(String messageKey) {
            super(messageKey, HttpStatus.FORBIDDEN);
        }
    }

    public static class ResourceNotFoundException extends BaseException {
        public ResourceNotFoundException(String messageKey) {
            super(messageKey, HttpStatus.NOT_FOUND);
        }
    }

    public static class ResourceAlreadyExistsException extends BaseException {
        public ResourceAlreadyExistsException(String messageKey) {
            super(messageKey, HttpStatus.CONFLICT);
        }
    }

    public static class ValidationException extends BaseException {
        public ValidationException(String messageKey) {
            super(messageKey, HttpStatus.BAD_REQUEST);
        }
    }

    public static class GameException extends BaseException {
        public GameException(String messageKey) {
            super(messageKey, HttpStatus.BAD_REQUEST);
        }
    }

    public static class GameFullException extends BaseException {
        public GameFullException(String messageKey) {
            super(messageKey, HttpStatus.CONFLICT);
        }
    }

    public static class AIGenerationException extends BaseException {
        public AIGenerationException(String messageKey) {
            super(messageKey, HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
