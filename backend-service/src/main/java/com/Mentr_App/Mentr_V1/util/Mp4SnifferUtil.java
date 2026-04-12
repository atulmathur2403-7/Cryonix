package com.Mentr_App.Mentr_V1.util;


import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class Mp4SnifferUtil {

    private Mp4SnifferUtil() {}

    /**
     * Minimal MP4 sniff:
     * MP4 typically starts with a box header:
     * [4 bytes size][4 bytes type] where type for MP4 is commonly "ftyp".
     */
    public static boolean looksLikeMp4(InputStream in) {
        try {
            byte[] header = new byte[12];
            int read = in.read(header);
            if (read < 8) return false;

            String boxType = new String(header, 4, 4, StandardCharsets.US_ASCII);
            return "ftyp".equals(boxType);
        } catch (Exception e) {
            return false;
        }
    }
}
