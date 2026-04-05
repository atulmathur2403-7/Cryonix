package com.Mentr_App.Mentr_V1.model.enums;


public enum SessionExtensionStatus {
    PENDING_DECISION,          // waiting for mentor approve/decline OR learner accept/decline
    APPROVED_AWAITING_PAYMENT, // decision accepted, waiting for learner payment intent + payment
    PAYMENT_PENDING,           // payment intent created, waiting webhook
    SUCCEEDED,                 // paid (webhook succeeded) but not yet applied
    APPLIED,                   // session + daily exp extended
    DECLINED,
    CANCELLED,
    EXPIRED,
    FAILED,
    REFUNDED                   // paid but could not apply → refunded to original method
}
