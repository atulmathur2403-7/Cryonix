package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.model.User;

public interface FirebaseTokenService {

    /**
     * Create a Firebase custom token for the given platform user.
     * Token is used by the frontend to sign in to Firebase.
     */
    String createCustomToken(User user);
}

