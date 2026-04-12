package com.Mentr_App.Mentr_V1.exception;

public class BookingException extends RuntimeException {
    public BookingException(String message) { super(message); }
    public BookingException(String message, Throwable cause) { super(message, cause); }
}
