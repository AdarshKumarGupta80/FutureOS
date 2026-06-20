package com.futureos.api.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;


@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);


    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<Map<String, String>> aiServiceError(RestClientResponseException ex) {
        log.error("AI service HTTP error: status={} body={}",
                ex.getStatusCode().value(), ex.getResponseBodyAsString());
        String message;
        HttpStatus status;
        if (ex.getStatusCode().value() == 422) {
            message = "The AI service rejected the request payload (422). "
                    + "This is an internal contract error — please contact support.";
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else if (ex.getStatusCode().is4xxClientError()) {
            message = "The AI service could not process the request. "
                    + "Please check your inputs and try again.";
            status = HttpStatus.BAD_GATEWAY;
        } else {
            message = "The AI service is temporarily unavailable. Please try again in a moment.";
            status = HttpStatus.BAD_GATEWAY;
        }
        return ResponseEntity.status(status).body(Map.of("message", message));
    }


    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, String>> aiServiceUnreachable(ResourceAccessException ex) {
        log.error("AI service is unreachable: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("message",
                        "The AI service is currently unreachable. "
                                + "Please wait a moment and try again."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> illegalArgument(IllegalArgumentException ex) {
        log.warn("Business rule violation: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> illegalState(IllegalStateException ex) {
        log.error("Internal state error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validationError(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + " " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> generic(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An unexpected error occurred. Please try again."));
    }
}