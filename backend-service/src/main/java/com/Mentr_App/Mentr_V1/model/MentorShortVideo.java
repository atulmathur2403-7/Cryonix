package com.Mentr_App.Mentr_V1.model;

import com.Mentr_App.Mentr_V1.model.enums.MentorShortVideoStatus;
import com.Mentr_App.Mentr_V1.persistence.StringListJsonConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.lang.Integer;

@Entity
@Table(
        name = "mentor_short_video",
        indexes = {
                @Index(name = "idx_msv_user", columnList = "user_id"),
                @Index(name = "idx_msv_status", columnList = "status"),
                @Index(name = "idx_msv_reserved_until", columnList = "reserved_until"),
                @Index(name = "idx_msv_next_attempt", columnList = "next_attempt_at")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_msv_user_idem", columnNames = {"user_id", "idempotency_key"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorShortVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "slot", nullable = false)
    private Integer slot; // 1..3

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private MentorShortVideoStatus status;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    // =========================
    // New: YouTube metadata
    // =========================

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "tags_json", columnDefinition = "text")
    private List<String> tags;

    // staging (GCS)
    @Column(name = "gcs_bucket", length = 200)
    private String gcsBucket;

    @Column(name = "gcs_object_path", columnDefinition = "text")
    private String gcsObjectPath;

    @Column(name = "reserved_at")
    private Instant reservedAt;

    @Column(name = "reserved_until")
    private Instant reservedUntil;

    @Column(name = "finalized_at")
    private Instant finalizedAt;

    // Saved from finalize (fast gate)
    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "duration_seconds")
    private Double durationSeconds;

    @Column(name = "video_width")
    private Integer videoWidth;

    @Column(name = "video_height")
    private Integer videoHeight;

    // worker retry state
    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount;

    @Column(name = "next_attempt_at")
    private Instant nextAttemptAt;

    @Column(name = "last_error", columnDefinition = "text")
    private String lastError;

    // youtube result
    @Column(name = "youtube_video_id", length = 64)
    private String youtubeVideoId;

    @Column(name = "youtube_url", length = 500)
    private String youtubeUrl;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (attemptCount == null) attemptCount=0;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
