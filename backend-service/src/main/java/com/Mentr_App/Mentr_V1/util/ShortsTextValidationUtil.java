package com.Mentr_App.Mentr_V1.util;


import java.nio.charset.StandardCharsets;
import java.util.*;

public final class ShortsTextValidationUtil {

    private ShortsTextValidationUtil() {}

    public static final int YT_TITLE_MAX_CHARS = 100;
    public static final int YT_DESCRIPTION_MAX_BYTES = 5000;
    public static final int YT_TAGS_TOTAL_MAX_CHARS = 500;
    public static final int MAX_TAGS_COUNT = 30;

    public static int utf8Bytes(String s) {
        return s == null ? 0 : s.getBytes(StandardCharsets.UTF_8).length;
    }

    /**
     * - trim
     * - drop blanks
     * - de-dupe case-insensitive (keep first casing)
     * - cap count
     */
    public static List<String> normalizeTags(List<String> input) {
        if (input == null) return List.of();

        LinkedHashMap<String, String> keyToDisplay = new LinkedHashMap<>();
        for (String t : input) {
            if (t == null) continue;
            String trimmed = t.trim();
            if (trimmed.isBlank()) continue;

            String key = trimmed.toLowerCase(Locale.ROOT);
            keyToDisplay.putIfAbsent(key, trimmed);
            if (keyToDisplay.size() >= MAX_TAGS_COUNT) break;
        }

        return new ArrayList<>(keyToDisplay.values());
    }

    public static int totalTagCharsCommaJoined(List<String> tags) {
        if (tags == null || tags.isEmpty()) return 0;
        // Safest heuristic from your workflow: join with commas and count chars
        return String.join(",", tags).length();
    }
}

