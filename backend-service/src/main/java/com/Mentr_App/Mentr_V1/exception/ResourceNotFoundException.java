package com.Mentr_App.Mentr_V1.exception;



import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String error, String message) {
        super(HttpStatus.NOT_FOUND, error, message);
    }
}

