package com.Mentr_App.Mentr_V1.exception;


import org.springframework.http.HttpStatus;

import java.util.Map;

public class InvalidInputException extends ApiException {
    public InvalidInputException(String error, String message) {
        super(HttpStatus.BAD_REQUEST, error, message);
    }

    public InvalidInputException(String error, String message, Map<String, Object> details) {
        super(HttpStatus.BAD_REQUEST, error, message, details);
    }
}

