package com.Mentr_App.Mentr_V1.util;




public final class FirebaseIdentityUtil {

    private FirebaseIdentityUtil() {}

    /**
     * Our contract: Firebase UID is just String.valueOf(userId).
     */
    public static String toFirebaseUid(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null for Firebase UID");
        }
        return String.valueOf(userId);
    }
}


