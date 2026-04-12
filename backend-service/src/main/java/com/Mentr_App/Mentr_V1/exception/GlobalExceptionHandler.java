package com.Mentr_App.Mentr_V1.exception;



import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private String requestId() {
        return UUID.randomUUID().toString();
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", ex.getStatus().value());
        body.put("error", ex.getError());
        body.put("message", ex.getMessage());
        body.put("requestId", requestId());

        if (ex.getDetails() != null) {
            body.putAll(ex.getDetails());
        }

        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    /**
     * ✅ NEW: Convert invalid enum inputs (pronouns) into a clean API error instead of MALFORMED_JSON.
     *
     * Your runtime error looks like:
     * - HttpMessageNotReadableException: JSON parse error: Cannot construct instance of Pronouns,
     *   problem: No enum constant ...Pronouns.HE_HIM_KNDSLK
     *
     * In some Spring/Jackson versions this is NOT surfaced as InvalidFormatException,
     * so we also detect the "No enum constant ... Pronouns" pattern in the cause chain.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {

        if (isPronounsEnumError(ex)) {
            String allowed = Arrays.stream(Pronouns.values())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));

            Map<String, Object> body = new HashMap<>();
            body.put("timestamp", Instant.now());
            body.put("status", HttpStatus.BAD_REQUEST.value());
            body.put("error", "PRONOUNS_NOT_FOUND");
            body.put("message", "Invalid pronouns. Allowed values: " + allowed);
            body.put("requestId", requestId());

            // Best-effort: include provided value if we can extract it from message
            String provided = extractProvidedEnumToken(ex);
            if (provided != null) {
                body.put("provided", provided);
            }

            return ResponseEntity.badRequest().body(body);
        }

        // Fallback: malformed JSON or other conversion errors
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "MALFORMED_JSON");
        body.put("message", "Request body is invalid or contains invalid values.");
        body.put("requestId", requestId());
        return ResponseEntity.badRequest().body(body);
    }

    private boolean isPronounsEnumError(HttpMessageNotReadableException ex) {

        // A) If Jackson gives InvalidFormatException (some setups do)
        InvalidFormatException ife = findCause(ex, InvalidFormatException.class);
        if (ife != null) {
            boolean isPronounsType = (ife.getTargetType() != null && ife.getTargetType().equals(Pronouns.class));

            boolean isPronounsField = ife.getPath() != null && ife.getPath().stream()
                    .map(JsonMappingException.Reference::getFieldName)
                    .filter(Objects::nonNull)
                    .anyMatch("pronouns"::equals);

            if (isPronounsType || isPronounsField) return true;
        }

        // B) Your actual log shows: "No enum constant ... Pronouns.XYZ"
        // This often appears as IllegalArgumentException deeper in the cause chain
        IllegalArgumentException iae = findCause(ex, IllegalArgumentException.class);
        if (iae != null) {
            String msg = String.valueOf(iae.getMessage());
            if (msg.contains("No enum constant")
                    && msg.contains(Pronouns.class.getName())) {
                return true;
            }
        }

        // C) Last resort: match the top-level exception message too
        String topMsg = String.valueOf(ex.getMessage());
        return topMsg.contains("No enum constant") && topMsg.contains(Pronouns.class.getName());
    }

    private static <T extends Throwable> T findCause(Throwable ex, Class<T> type) {
        Throwable current = ex;
        while (current != null) {
            if (type.isInstance(current)) {
                return type.cast(current);
            }
            current = current.getCause();
        }
        return null;
    }

    /**
     * Attempts to extract the invalid enum token from messages like:
     * "No enum constant com...Pronouns.HE_HIM_KNDSLK"
     */
    private String extractProvidedEnumToken(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            String msg = current.getMessage();
            if (msg != null && msg.contains("No enum constant") && msg.contains(Pronouns.class.getName() + ".")) {
                int idx = msg.indexOf(Pronouns.class.getName() + ".");
                if (idx >= 0) {
                    return msg.substring(idx + (Pronouns.class.getName() + ".").length()).trim();
                }
            }
            current = current.getCause();
        }
        return null;
    }

    // Multipart size overflow → 413
    @ExceptionHandler({MaxUploadSizeExceededException.class, MultipartException.class})
    public ResponseEntity<Map<String, Object>> handleMultipartTooLarge(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.PAYLOAD_TOO_LARGE.value());
        body.put("error", "FILE_TOO_LARGE");
        body.put("message", "Uploaded file exceeds the maximum allowed size.");
        body.put("requestId", requestId());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(body);
    }

    // Validation errors (e.g. @Valid failures)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "VALIDATION_FAILED");
        body.put("message", "Validation failed");
        body.put("requestId", requestId());

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        body.put("fieldErrors", fieldErrors);

        return ResponseEntity.badRequest().body(body);
    }

    // Concurrency: optimistic locking failure → 409
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "CONCURRENT_UPDATE");
        body.put("message", "Resource was updated by another request. Please retry.");
        body.put("requestId", requestId());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // DB constraint violation → 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(DataIntegrityViolationException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "CONSTRAINT_VIOLATION");
        body.put("message", "Request violates a database constraint.");
        body.put("requestId", requestId());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // Existing BookingException handling
    @ExceptionHandler(BookingException.class)
    public ResponseEntity<Map<String, Object>> handleBookingException(BookingException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        body.put("requestId", requestId());
        return ResponseEntity.badRequest().body(body);
    }
}
