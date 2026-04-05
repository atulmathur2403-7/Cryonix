package com.Mentr_App.Mentr_V1.util;


import java.util.*;

public final class LanguageNormalizer {

    private LanguageNormalizer() {}

    public static String normalizeHumanName(String raw) {
        if (raw == null) return "";
        String t = raw.trim();
        return t.replaceAll("\\s+", " ");
    }

    public static String key(String normalizedHumanName) {
        return (normalizedHumanName == null) ? "" : normalizedHumanName.toLowerCase(Locale.ROOT);
    }

    /**
     * Stable-order dedupe: lower-key -> first-seen display name
     * Example: [" English ", "english"] => {"english":"English"}
     */
    public static LinkedHashMap<String, String> dedupeToKeyToDisplay(List<String> raw) {
        LinkedHashMap<String, String> map = new LinkedHashMap<>();
        if (raw == null) return map;

        for (String s : raw) {
            String display = normalizeHumanName(s);
            if (display.isBlank()) continue;
            String k = key(display);
            map.putIfAbsent(k, display);
        }
        return map;
    }

    public static List<String> toLowerKeys(List<String> rawTokens) {
        if (rawTokens == null) return List.of();
        LinkedHashSet<String> set = new LinkedHashSet<>();
        for (String s : rawTokens) {
            String display = normalizeHumanName(s);
            if (!display.isBlank()) set.add(key(display));
        }
        return new ArrayList<>(set);
    }
}

