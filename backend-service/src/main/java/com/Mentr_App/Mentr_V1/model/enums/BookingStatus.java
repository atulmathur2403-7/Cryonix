package com.Mentr_App.Mentr_V1.model.enums;

/**
 * BOOKING STATUS ENUM
 * -------------------
 * Represents all possible states of a booking lifecycle.
 * Stored as string values in the database.
 */
public enum BookingStatus {

    // 🔹 Pre-payment
    PENDING_PAYMENT,

    // 🔹 Legacy (no longer used in FCFS, kept for backward-compat)
    WAITING_FOR_MENTOR_APPROVAL,

    // 🔹 Auto-confirm post-payment OR mentor decision (legacy)
    CONFIRMED,
    REJECTED_BY_MENTOR,

    // 🔹 FCFS: payment succeeded but lost the race against an already confirmed overlap
    REJECTED_CONFLICT,

    // 🔹 Cancellations / lifecycle
    CANCELLED,
    COMPLETED
}
