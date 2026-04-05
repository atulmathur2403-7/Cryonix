package com.Mentr_App.Mentr_V1.exception;


import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String error;

    // ✅ Optional extra structured fields (e.g., missing tags list)
    private final Map<String, Object> details;

    public ApiException(HttpStatus status, String error, String message) {
        this(status, error, message, null);
    }

    public ApiException(HttpStatus status, String error, String message, Map<String, Object> details) {
        super(message);
        this.status = status;
        this.error = error;
        this.details = (details == null) ? null
                : Collections.unmodifiableMap(new LinkedHashMap<>(details));
    }

    public HttpStatus getStatus() { return status; }
    public String getError() { return error; }
    public Map<String, Object> getDetails() { return details; }
}


