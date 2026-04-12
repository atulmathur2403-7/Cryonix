package com.Mentr_App.Mentr_V1.util;


import java.util.*;

public final class MentorSkillTagNormalizer {

    private MentorSkillTagNormalizer() {}

    public static String normalizeHumanName(String raw) {
        if (raw == null) return "";
        String t = raw.trim();
        return t.replaceAll("\\s+", " ");
    }

    public static String key(String normalizedHumanName) {
        return (normalizedHumanName == null) ? "" : normalizedHumanName.toLowerCase(Locale.ROOT);
    }

    public static LinkedHashMap<String, String> dedupeToKeyToDisplay(List<String> rawTags) {
        LinkedHashMap<String, String> map = new LinkedHashMap<>();
        if (rawTags == null) return map;

        for (String raw : rawTags) {
            String display = normalizeHumanName(raw);
            if (display.isBlank()) continue;
            String k = key(display);
            map.putIfAbsent(k, display); // case-insensitive dedupe with stable order
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
