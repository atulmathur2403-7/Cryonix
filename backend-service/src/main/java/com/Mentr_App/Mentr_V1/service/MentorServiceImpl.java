package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.mentor.*;
import com.Mentr_App.Mentr_V1.dto.review.MentorRatingStats;
import com.Mentr_App.Mentr_V1.dto.review.ReviewResponse;
import com.Mentr_App.Mentr_V1.exception.ConflictException;
import com.Mentr_App.Mentr_V1.exception.InvalidInputException;
import com.Mentr_App.Mentr_V1.exception.ResourceNotFoundException;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.mapper.MentorProfileMapper;
import com.Mentr_App.Mentr_V1.mapper.MentorShortVideoMapper;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.model.enums.MentorShortVideoStatus;
import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import com.Mentr_App.Mentr_V1.repository.*;
import com.Mentr_App.Mentr_V1.util.LanguageNormalizer;
import com.Mentr_App.Mentr_V1.util.MentorSkillTagNormalizer;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MentorServiceImpl implements MentorService {

    private final ReviewRepository reviewRepository;
    private final MentorRepository mentorRepository;
    private final AvailabilityRepository availabilityRepository;

    private final UserRepository userRepository;
    private final MentorProfileRepository mentorProfileRepository;

    private final TagRepository tagRepository;
    private final LanguageRepository languageRepository;

    private final MentorShortVideoRepository mentorShortVideoRepository;


    private static final PhoneNumberUtil PN = PhoneNumberUtil.getInstance();
    private static final int MAX_TAGS = 20;
    private static final int MAX_LANGUAGES = 10;

    public MentorServiceImpl(
            ReviewRepository reviewRepository,
            MentorRepository mentorRepository,
            AvailabilityRepository availabilityRepository,
            UserRepository userRepository,
            MentorProfileRepository mentorProfileRepository,
            TagRepository tagRepository,
            LanguageRepository languageRepository,
            MentorShortVideoRepository mentorShortVideoRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.mentorRepository = mentorRepository;
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
        this.mentorProfileRepository = mentorProfileRepository;
        this.tagRepository = tagRepository;
        this.languageRepository = languageRepository;
        this.mentorShortVideoRepository = mentorShortVideoRepository;
    }

    @Override
    public Page<MentorSearchResponse> searchMentors(String q, List<String> skills, List<String> languages, Pronouns pronouns, String sort, int page, int size) {

        Sort sortObj = "trending".equalsIgnoreCase(sort)
                ? Sort.by(Sort.Direction.DESC, "bookingsCount")
                : Sort.by(Sort.Direction.DESC, "bookingsCount"); // fallback

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sortObj);

        Page<Mentor> mentorsPage;

        boolean hasSkills = skills != null && !skills.isEmpty();
        boolean hasLanguages = languages != null && !languages.isEmpty();
        boolean hasPronouns = pronouns != null;

        // ✅ If any new filters are present, use cache-based query (Option A)
        if (hasSkills || hasLanguages || hasPronouns) {

            String[] tagCanon = new String[0];
            String[] langCanon = new String[0];

            // ---- tags (existing behavior) ----
            if (hasSkills) {
                List<String> lowerKeys = MentorSkillTagNormalizer.toLowerKeys(skills);
                if (lowerKeys.isEmpty()) return new PageImpl<>(List.of(), pageable, 0);

                List<MentorSkillsTag> found = tagRepository.findActiveByLowerNames(lowerKeys);
                if (found.isEmpty()) return new PageImpl<>(List.of(), pageable, 0);

                tagCanon = found.stream()
                        .map(MentorSkillsTag::getName)
                        .distinct()
                        .toArray(String[]::new);
            }

            // ---- languages (new behavior, master-list based) ----
            if (hasLanguages) {
                List<String> lowerKeys = LanguageNormalizer.toLowerKeys(languages);
                if (lowerKeys.isEmpty()) return new PageImpl<>(List.of(), pageable, 0);

                List<Language> found = languageRepository.findActiveByLowerNames(lowerKeys);
                if (found.isEmpty()) return new PageImpl<>(List.of(), pageable, 0);

                langCanon = found.stream()
                        .map(Language::getName)
                        .distinct()
                        .toArray(String[]::new);
            }

            mentorsPage = mentorRepository.searchWithCaches(
                    q,
                    !hasSkills,
                    tagCanon,
                    !hasLanguages,
                    langCanon,
                    (pronouns == null) ? null : pronouns.name(),
                    pageable
            );

        } else {
            // Keep existing behavior when no filter requested
            var spec = MentorSpecifications.searchByQueryAndSkills(q, Collections.emptyList());
            mentorsPage = mentorRepository.findAll(spec, pageable);
        }

        Map<Long, MentorRatingStats> ratingMap = reviewRepository.getMentorRatingStats().stream()
                .collect(Collectors.toMap(MentorRatingStats::getMentorId, r -> r));

        List<MentorSearchResponse> dtos = mentorsPage.stream()
                .map(m -> toSearchDtoOptimized(m, ratingMap.get(m.getMentorId())))
                .toList();

        return new PageImpl<>(dtos, pageable, mentorsPage.getTotalElements());
    }

    @Override
    public MentorProfileResponse getMentorProfile(Long mentorId) {
        Mentor m = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new BookingException("Mentor not found"));

        MentorProfileResponse resp = toProfileDto(m);

        List<AvailabilitySlot> slots = availabilityRepository
                .findByMentor_MentorIdOrderByStartTimeAsc(m.getMentorId());

        List<AvailabilityPreview> upcoming = slots.stream()
                .filter(s -> s.getEndTime().isAfter(Instant.now()) && !s.isBlocked())
                .limit(3)
                .map(s -> {
                    AvailabilityPreview ap = new AvailabilityPreview();
                    ap.setStartTime(s.getStartTime());
                    ap.setEndTime(s.getEndTime());
                    return ap;
                })
                .toList();
        resp.setAvailabilityPreview(upcoming);

        Optional<MentorRatingStats> statsOpt = reviewRepository.getRatingsSummaryForMentor(m.getMentorId());
        if (statsOpt.isPresent()) {
            MentorRatingStats stats = statsOpt.get();
            resp.setAverageRating(stats.getAverageRating());
            resp.setReviewCount(stats.getReviewCount());
        } else {
            resp.setAverageRating(null);
            resp.setReviewCount(0);
        }

        List<ReviewResponse> reviewDtos = reviewRepository.findByMentor_MentorId(m.getMentorId()).stream()
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .limit(5)
                .map(r -> {
                    ReviewResponse dto = new ReviewResponse();
                    dto.setId(r.getId());
                    dto.setRating(r.getRating());
                    dto.setComment(r.getComment());
                    dto.setLearnerName(r.getLearner().getName());
                    dto.setCreatedAt(r.getCreatedAt());
                    return dto;
                })
                .toList();
        resp.setReviews(reviewDtos);

        return resp;
    }

    // ✅ NEW: authenticated edit payload (tags come from master list)
    @Override
    public MentorEditProfileResponse getMyMentorProfile(Long userId) {
        Mentor mentor = mentorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("MENTOR_NOT_FOUND", "Mentor profile not found"));

        User user = mentor.getUser();
        if (user == null) {
            throw new InvalidInputException("USER_LINK_MISSING", "Mentor has no linked user");
        }

        var shorts = mentorShortVideoRepository
                .findByUserIdAndStatusNotOrderBySlotAscCreatedAtAsc(userId, MentorShortVideoStatus.DELETED)
                .stream()
                .filter(v -> v.getStatus() != MentorShortVideoStatus.EXPIRED)
                .map(MentorShortVideoMapper::toItem)
                .toList();

        MentorProfile mp = mentorProfileRepository.findWithTagsByUserId(userId)
                .orElseGet(() -> MentorProfile.builder()
                        .user(user)
                        .showCategory(false)
                        .languages(new LinkedHashSet<>())
                        .tags(new LinkedHashSet<>())
                        .build());

        return MentorProfileMapper.toEditResponse(user, mentor, mp,shorts);
    }

    @Override
    @Transactional
    public MentorEditProfileResponse updateMentorProfile(Long userId, UpdateMentorProfileRequest request) {

        Mentor mentor = mentorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("MENTOR_NOT_FOUND", "Mentor profile not found"));

        User user = mentor.getUser();
        if (user == null) {
            throw new InvalidInputException("USER_LINK_MISSING", "Mentor has no linked user");
        }

        // 1) Photo required rule (must exist in DB)
        boolean hasPhoto = (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isBlank())
                || (user.getProfilePic() != null && !user.getProfilePic().isBlank());
        if (!hasPhoto) {
            throw new InvalidInputException("PROFILE_PHOTO_REQUIRED",
                    "Profile photo is required. Upload via POST /api/users/me/profile-image");
        }

        // 2) Username validation + edit limit
        String newUsername = safeTrim(request.getUsername());
        if (newUsername == null || newUsername.isBlank()) {
            throw new InvalidInputException("USERNAME_REQUIRED", "Username is required");
        }

        if (!equalsIgnoreCase(user.getUsername(), newUsername)) {
            if (user.getUsernameEditCount() >= 2) {
                throw new ConflictException("USERNAME_EDIT_LIMIT", "Username can only be changed 2 times");
            }

            Optional<User> existing = userRepository.findByUsernameIgnoreCase(newUsername);
            if (existing.isPresent() && !existing.get().getUserId().equals(userId)) {
                throw new ConflictException("USERNAME_TAKEN", "Username already taken");
            }

            user.setUsername(newUsername);
            user.setUsernameEditCount(user.getUsernameEditCount() + 1);
        }

        // 3) Phone validation (libphonenumber)
        String regionIso = safeTrim(request.getPhoneCountryIso());
        String phoneRaw = safeTrim(request.getPhoneRaw());
        String normalizedE164 = normalizePhoneE164(phoneRaw, regionIso);

        Optional<User> phoneOwner = userRepository.findByPhoneE164(normalizedE164);
        if (phoneOwner.isPresent() && !phoneOwner.get().getUserId().equals(userId)) {
            throw new ConflictException("PHONE_TAKEN", "Phone number is already used");
        }

        boolean phoneChanged = !Objects.equals(user.getPhoneE164(), normalizedE164);

        // 4) Pricing validation
        requireNonNegative(request.getCallPrice(), "callPrice");
        requireNonNegative(request.getMeetingPrice(), "meetingPrice");
        requireNonNegative(request.getSubscriptionPrice(), "subscriptionPrice");

        Integer threshold = request.getLongCallThresholdMinutes();
        if (threshold == null || threshold < 1) {
            throw new InvalidInputException("INVALID_LONG_CALL_THRESHOLD", "longCallThresholdMinutes must be >= 1");
        }

        if (request.getLongCallDiscountPercent() != null) {
            if (request.getLongCallDiscountPercent().compareTo(java.math.BigDecimal.ZERO) < 0 ||
                    request.getLongCallDiscountPercent().compareTo(new java.math.BigDecimal("100")) > 0) {
                throw new InvalidInputException("INVALID_DISCOUNT", "longCallDiscountPercent must be between 0 and 100");
            }
        }

        // 5) Bios + languages
        String shortBio = safeTrim(request.getShortBio());
        if (shortBio == null || shortBio.isBlank()) {
            throw new InvalidInputException("SHORT_BIO_REQUIRED", "shortBio is required");
        }
        if (shortBio.length() > 300) {
            throw new InvalidInputException("SHORT_BIO_TOO_LONG", "shortBio max 300 chars");
        }

        // ✅ NEW: languages: DB-driven validation + inactive detection
        LanguageResolution languagesResolved = resolveLanguagesOrThrow(request.getLanguagesSpoken());

        // ✅ 6) Tags: DB-driven validation (Option B input, DB-driven)
        TagResolution tagsResolved = resolveTagsOrThrow(request.getTags());

        // 7) Category
        Boolean showCategory = request.getShowCategory();
        String categoryId = safeTrim(request.getCategoryId());
        if (Boolean.TRUE.equals(showCategory)) {
            if (categoryId == null || categoryId.isBlank()) {
                throw new InvalidInputException("CATEGORY_REQUIRED",
                        "categoryId is required when showCategory is true");
            }
        } else {
            categoryId = null;
        }

        // 8) Optional URLs
        String youtubeUrl = normalizeOptionalUrl(request.getYoutubeUrl(), "youtubeUrl");
        String instagramUrl = normalizeOptionalUrl(request.getInstagramUrl(), "instagramUrl");
        String linkedinUrl = normalizeOptionalUrl(request.getLinkedinUrl(), "linkedinUrl");

        // 9) Persist updates in one transaction
        user.setName(safeTrim(request.getFullName()));
        user.setPronouns(request.getPronouns());
        user.setDateOfBirth(request.getDateOfBirth());

        user.setPhoneE164(normalizedE164);
        user.setPhoneCountryIso(regionIso != null ? regionIso.toUpperCase() : null);
        if (phoneChanged) {
            // Mode B: save phone but mark unverified
            user.setPhoneVerified(false);
        }

        // Keep legacy fields aligned so public mentor profile still shows updated story
        user.setBio(request.getFullBioStory());

        mentor.setCallPrice(request.getCallPrice());
        mentor.setMeetingPrice(request.getMeetingPrice());
        mentor.setSubscriptionPrice(request.getSubscriptionPrice());
        mentor.setLongCallThresholdMinutes(threshold);
        mentor.setLongCallDiscountPercent(request.getLongCallDiscountPercent());

        MentorProfile mp = mentorProfileRepository.findWithTagsByUserId(userId)
                .orElseGet(() -> MentorProfile.builder()
                        .user(user)
                        .showCategory(false)
                        .languages(new LinkedHashSet<>())
                        .tags(new LinkedHashSet<>())
                        .build());

        mp.setLocationCountry(safeTrim(request.getLocationCountry()));
        mp.setExperienceYears(request.getExperienceYears());
        mp.setShortBio(shortBio);
        mp.setFullBioStory(request.getFullBioStory());
        mp.setShowCategory(Boolean.TRUE.equals(showCategory));
        mp.setCategoryId(categoryId);
        mp.setYoutubeUrl(youtubeUrl);
        mp.setInstagramUrl(instagramUrl);
        mp.setLinkedinUrl(linkedinUrl);

        // ✅ Replace junction rows (languages)
        mp.getLanguages().clear();
        mp.getLanguages().addAll(languagesResolved.orderedLanguages);

        // ✅ Cache sync (canonical names sorted)
        List<String> langCache = languagesResolved.orderedLanguages.stream()
                .map(Language::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
        mp.setLanguagesCache(langCache.toArray(new String[0]));

        // ✅ Replace junction rows (tags)
        mp.getTags().clear();
        mp.getTags().addAll(tagsResolved.orderedTags);

        // ✅ Cache sync (canonical names sorted)
        List<String> tagCache = tagsResolved.orderedTags.stream()
                .map(MentorSkillsTag::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
        mp.setTagsCache(tagCache.toArray(new String[0]));

        var shorts = mentorShortVideoRepository
                .findByUserIdAndStatusNotOrderBySlotAscCreatedAtAsc(userId, MentorShortVideoStatus.DELETED)
                .stream()
                .filter(v -> v.getStatus() != MentorShortVideoStatus.EXPIRED)
                .map(MentorShortVideoMapper::toItem)
                .toList();

        userRepository.save(user);
        mentorRepository.save(mentor);
        mentorProfileRepository.save(mp);

        return MentorProfileMapper.toEditResponse(user, mentor, mp,shorts);
    }

    // ------------------- Language resolution helpers -------------------

    private static class LanguageResolution {
        private final List<Language> orderedLanguages;
        LanguageResolution(List<Language> orderedLanguages) { this.orderedLanguages = orderedLanguages; }
    }

    private LanguageResolution resolveLanguagesOrThrow(List<String> inputLanguages) {
        if (inputLanguages == null) {
            throw new InvalidInputException("LANGUAGES_REQUIRED", "At least one language is required");
        }
        if (inputLanguages.size() > MAX_LANGUAGES) {
            throw new InvalidInputException("LANGUAGES_LIMIT_EXCEEDED", "Too many languages. Max allowed is " + MAX_LANGUAGES);
        }

        LinkedHashMap<String, String> keyToDisplay = LanguageNormalizer.dedupeToKeyToDisplay(inputLanguages);
        if (keyToDisplay.isEmpty()) {
            throw new InvalidInputException("LANGUAGES_REQUIRED", "At least one language is required");
        }

        // fetch all matches (active + inactive)
        List<Language> foundAll = languageRepository.findByLowerNames(keyToDisplay.keySet());

        Map<String, Language> foundByKey = new HashMap<>();
        for (Language l : foundAll) {
            foundByKey.put(l.getName().toLowerCase(Locale.ROOT), l);
        }

        List<String> missing = new ArrayList<>();
        List<String> inactive = new ArrayList<>();
        List<Language> ordered = new ArrayList<>();

        for (String key : keyToDisplay.keySet()) {
            Language l = foundByKey.get(key);
            if (l == null) {
                missing.add(keyToDisplay.get(key));
            } else if (!l.isActive()) {
                inactive.add(l.getName());
            } else {
                ordered.add(l);
            }
        }

        if (!missing.isEmpty()) {
            Map<String, Object> details = new HashMap<>();
            details.put("missing", missing);
            throw new InvalidInputException("LANGUAGE_NOT_FOUND", "Some languages do not exist in master list", details);
        }

        if (!inactive.isEmpty()) {
            Map<String, Object> details = new HashMap<>();
            details.put("inactive", inactive);
            throw new InvalidInputException("LANGUAGE_INACTIVE", "Some languages are inactive", details);
        }

        return new LanguageResolution(ordered);
    }

    // ------------------- Tag resolution helpers -------------------

    private static class TagResolution {
        private final List<MentorSkillsTag> orderedTags;
        TagResolution(List<MentorSkillsTag> orderedTags) { this.orderedTags = orderedTags; }
    }

    private TagResolution resolveTagsOrThrow(List<String> inputTags) {
        if (inputTags == null) {
            throw new InvalidInputException("TAGS_REQUIRED", "At least one tag is required");
        }
        if (inputTags.size() > MAX_TAGS) {
            throw new InvalidInputException("TAGS_LIMIT_EXCEEDED", "Too many tags. Max allowed is " + MAX_TAGS);
        }

        LinkedHashMap<String, String> keyToDisplay = MentorSkillTagNormalizer.dedupeToKeyToDisplay(inputTags);
        if (keyToDisplay.isEmpty()) {
            throw new InvalidInputException("TAGS_REQUIRED", "At least one tag is required");
        }

        List<MentorSkillsTag> found = tagRepository.findActiveByLowerNames(keyToDisplay.keySet());

        Map<String, MentorSkillsTag> foundByKey = new HashMap<>();
        for (MentorSkillsTag t : found) {
            foundByKey.put(t.getName().toLowerCase(Locale.ROOT), t);
        }

        List<String> missing = new ArrayList<>();
        List<MentorSkillsTag> ordered = new ArrayList<>();
        for (String key : keyToDisplay.keySet()) {
            MentorSkillsTag t = foundByKey.get(key);
            if (t == null) missing.add(keyToDisplay.get(key));
            else ordered.add(t);
        }

        if (!missing.isEmpty()) {
            Map<String, Object> details = new HashMap<>();
            details.put("missing", missing);
            throw new InvalidInputException("TAG_NOT_FOUND", "Some tags do not exist in master list", details);
        }

        return new TagResolution(ordered);
    }

    // ------------------- existing helpers (kept, minimal refactor) -------------------

    private MentorSearchResponse toSearchDtoOptimized(Mentor m, MentorRatingStats stats) {
        MentorSearchResponse dto = new MentorSearchResponse();
        dto.setMentorId(m.getMentorId());
        dto.setName(m.getUser() != null ? m.getUser().getName() : null);
        dto.setProfilePic(m.getUser() != null ? m.getUser().getProfilePic() : null);

        String expertise = m.getExpertise() == null ? "" : m.getExpertise();
        dto.setExpertiseSummary(expertise.length() > 160 ? expertise.substring(0, 157) + "..." : expertise);

        dto.setBookingsCount(m.getBookingsCount() == null ? 0 : m.getBookingsCount());
        dto.setCallPrice(m.getCallPrice());

        if (stats != null) {
            dto.setAverageRating(stats.getAverageRating());
            dto.setReviewCount(stats.getReviewCount());
        } else {
            dto.setAverageRating(null);
            dto.setReviewCount(0);
        }

        return dto;
    }

    private MentorProfileResponse toProfileDto(Mentor m) {
        MentorProfileResponse dto = new MentorProfileResponse();
        dto.setMentorId(m.getMentorId());
        if (m.getUser() != null) {
            dto.setName(m.getUser().getName());
            dto.setProfilePic(m.getUser().getProfilePic());
            dto.setBio(m.getUser().getBio());
        }
        dto.setExpertise(m.getExpertise());
        dto.setCallPrice(m.getCallPrice());
        dto.setLongCallThresholdMinutes(m.getLongCallThresholdMinutes());
        dto.setLongCallDiscountPercent(m.getLongCallDiscountPercent());
        dto.setMeetingPrice(m.getMeetingPrice());
        dto.setSubscriptionPrice(m.getSubscriptionPrice());
        dto.setSocialLinks(m.getSocialLinks());
        dto.setProfileVideo(m.getProfileVideo());
        dto.setBookingsCount(m.getBookingsCount() == null ? 0 : m.getBookingsCount());
        return dto;
    }

    private static String safeTrim(String s) {
        return s == null ? null : s.trim();
    }

    private static boolean equalsIgnoreCase(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equalsIgnoreCase(b);
    }

    private static void requireNonNegative(java.math.BigDecimal v, String field) {
        if (v == null) {
            throw new InvalidInputException("MISSING_" + field.toUpperCase(), field + " is required");
        }
        if (v.compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new InvalidInputException("NEGATIVE_" + field.toUpperCase(), field + " must be >= 0");
        }
    }

    private static String normalizeOptionalUrl(String value, String fieldName) {
        String v = safeTrim(value);
        if (v == null || v.isBlank()) return null;

        try {
            URI uri = URI.create(v);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                throw new IllegalArgumentException("Invalid scheme");
            }
            return v;
        } catch (Exception e) {
            throw new InvalidInputException("INVALID_URL", fieldName + " is invalid");
        }
    }

    private static String normalizePhoneE164(String phoneRaw, String regionIso) {
        if (phoneRaw == null || phoneRaw.isBlank()) {
            throw new InvalidInputException("PHONE_REQUIRED", "phoneRaw is required");
        }
        if (regionIso == null || regionIso.isBlank() || regionIso.length() != 2) {
            throw new InvalidInputException("PHONE_COUNTRY_REQUIRED", "phoneCountryIso is required");
        }

        String region = regionIso.toUpperCase(Locale.ROOT);
        try {
            Phonenumber.PhoneNumber num = PN.parse(phoneRaw, region);

            if (!PN.isPossibleNumber(num)) {
                throw new InvalidInputException("PHONE_NOT_POSSIBLE", "Phone number is not possible");
            }
            if (!PN.isValidNumberForRegion(num, region)) {
                throw new InvalidInputException("PHONE_NOT_VALID", "Phone number is not valid for region");
            }

            PhoneNumberUtil.PhoneNumberType type = PN.getNumberType(num);
            if (!(type == PhoneNumberUtil.PhoneNumberType.MOBILE
                    || type == PhoneNumberUtil.PhoneNumberType.FIXED_LINE_OR_MOBILE)) {
                throw new InvalidInputException("PHONE_NOT_MOBILE", "Only mobile numbers are allowed");
            }

            return PN.format(num, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException e) {
            throw new InvalidInputException("PHONE_PARSE_ERROR", "Invalid phone number format");
        }
    }

    @Override
    public List<MentorSearchResponse> getTrendingMentors(int limit) {
        List<Mentor> mentors = mentorRepository.findAllByOrderByBookingsCountDesc();

        Map<Long, MentorRatingStats> ratingMap = reviewRepository.getMentorRatingStats().stream()
                .collect(Collectors.toMap(MentorRatingStats::getMentorId, r -> r));

        return mentors.stream()
                .limit(limit)
                .map(m -> toSearchDtoOptimized(m, ratingMap.get(m.getMentorId())))
                .toList();
    }

    @Override
    public RatingsSummaryResponse getRatingsSummary(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new BookingException("Mentor not found"));

        List<Review> reviews = reviewRepository.findByMentor_MentorId(mentorId);

        double avg = reviews.isEmpty()
                ? 0.0
                : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        return new RatingsSummaryResponse(
                mentor.getMentorId(),
                reviews.isEmpty() ? null : avg,
                reviews.size()
        );
    }
}
