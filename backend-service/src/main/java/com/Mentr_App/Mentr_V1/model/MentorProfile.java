package com.Mentr_App.Mentr_V1.model;




import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "mentor_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Version
    private Long version;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "location_country", length = 100)
    private String locationCountry;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "short_bio", length = 300)
    private String shortBio;

    @Column(name = "full_bio_story", columnDefinition = "text")
    private String fullBioStory;

    @Column(name = "show_category", nullable = false)
    private boolean showCategory;

    @Column(name = "category_id", length = 100)
    private String categoryId;

    @Column(name = "youtube_url", length = 500)
    private String youtubeUrl;

    @Column(name = "instagram_url", length = 500)
    private String instagramUrl;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    // ✅ NEW: Junction mentor_languages(user_id, language_id)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "mentor_languages",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "language_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "language_id"})
    )
    @Builder.Default
    private Set<Language> languages = new LinkedHashSet<>();

    // ✅ NEW: Cache column (Option A)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "languages_cache", columnDefinition = "text[]")
    private String[] languagesCache;

    // ✅ NEW: Junction mentor_tags(user_id, tag_id)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "mentor_tags",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "tag_id"})
    )
    @Builder.Default
    private Set<MentorSkillsTag> tags = new LinkedHashSet<>();

    // ✅ NEW: Cache column (Option A)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags_cache", columnDefinition = "text[]")
    private String[] tagsCache;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
