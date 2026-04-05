package com.Mentr_App.Mentr_V1.model.enums;


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum Pronouns {
    HE_HIM,
    SHE_HER,
    THEY_THEM,
    OTHER;

    /**
     * ✅ User-friendly normalization:
     * "He_him", "he/him", "HE_HIM" -> HE_HIM
     * "She_her", "she/her" -> SHE_HER
     * "They_them", "they/them" -> THEY_THEM
     * "Other" -> OTHER
     */
    @JsonCreator
    public static Pronouns fromJson(String raw) {
        if (raw == null) throw new IllegalArgumentException("pronouns is null");

        String v = raw.trim();
        if (v.isEmpty()) throw new IllegalArgumentException("pronouns is blank");

        // normalize separators and casing
        v = v.replace("/", "_").replace(" ", "_");
        v = v.replaceAll("_+", "_");
        v = v.toUpperCase(Locale.ROOT);

        // common variants
        if (v.equals("HE_HIM") || v.equals("HEHIM")) return HE_HIM;
        if (v.equals("SHE_HER") || v.equals("SHEHER")) return SHE_HER;
        if (v.equals("THEY_THEM") || v.equals("THEYTHEM")) return THEY_THEM;
        if (v.equals("OTHER")) return OTHER;

        // allow exact enum parsing too
        return Pronouns.valueOf(v);
    }

    @JsonValue
    public String toJson() {
        return this.name(); // canonical
    }
}

