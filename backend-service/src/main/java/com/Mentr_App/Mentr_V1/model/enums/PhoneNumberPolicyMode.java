package com.Mentr_App.Mentr_V1.model.enums;


/**
 * PHONE NUMBER POLICY MODE
 * ------------------------
 * Controls how we treat phone numbers in chat messages.
 *
 * BLOCK - Reject messages that contain phone numbers.
 * MASK  - Allow messages but mask phone numbers before sending to Firebase.
 */
public enum PhoneNumberPolicyMode {
    BLOCK,
    MASK
}

