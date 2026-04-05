package com.Mentr_App.Mentr_V1.exception;


import org.springframework.http.HttpStatus;

public class ConflictException extends ApiException {
    public ConflictException(String error, String message) {
        super(HttpStatus.CONFLICT, error, message);
    }
}

