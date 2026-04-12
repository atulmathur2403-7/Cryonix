package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.session.extension.*;
import java.util.Map;

public interface SessionExtensionService {

    SessionExtensionCreateResponse requestByLearner(Long sessionId, Long learnerUserId);

    SessionExtensionCreateResponse offerByMentor(Long sessionId, Long mentorUserId);

    SessionExtensionDecisionResponse approve(Long sessionId, Long extensionId, Long mentorUserId);

    SessionExtensionDecisionResponse decline(Long sessionId, Long extensionId, Long userId);

    SessionExtensionDecisionResponse acceptOffer(Long sessionId, Long extensionId, Long learnerUserId);

    SessionExtensionDecisionResponse cancel(Long sessionId, Long extensionId, Long userId);

    CreateExtensionPaymentResponse createPaymentIntent(Long sessionId, Long extensionId, Long learnerUserId);

    // ✅ NEW: webhook-facing signatures (2 args)
    void handleExtensionPaymentSuccess(String paymentIntentId, Map<String, String> metadata);
    void handleExtensionPaymentFailure(String paymentIntentId, Map<String, String> metadata);

    // ✅ OPTIONAL but recommended: keep old signatures working everywhere
    default void handleExtensionPaymentSuccess(String paymentIntentId) {
        handleExtensionPaymentSuccess(paymentIntentId, null);
    }

    default void handleExtensionPaymentFailure(String paymentIntentId) {
        handleExtensionPaymentFailure(paymentIntentId, null);
    }

    SessionExtensionActiveResponse getActive(Long sessionId, Long userId);
}
