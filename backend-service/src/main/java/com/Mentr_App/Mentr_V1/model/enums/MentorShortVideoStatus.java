package com.Mentr_App.Mentr_V1.model.enums;

public enum MentorShortVideoStatus {
    RESERVED,     // signed URL issued, awaiting upload
    READY,        // finalize passed (shorts-valid + mp4-valid), worker may upload
    UPLOADING,    // worker uploading
    LIVE,         // uploaded to YouTube and available
    FAILED,       // finalize fail OR worker permanent failure
    EXPIRED,      // reservation expired
    DELETED       // user deleted (soft delete)
}

