package com.Mentr_App.Mentr_V1.util;

import com.coremedia.iso.IsoFile;
import com.coremedia.iso.boxes.MovieBox;
import com.coremedia.iso.boxes.MovieHeaderBox;
import com.coremedia.iso.boxes.TrackBox;
import com.coremedia.iso.boxes.TrackHeaderBox;
import com.googlecode.mp4parser.DataSource;
import com.googlecode.mp4parser.FileDataSourceImpl;
import com.googlecode.mp4parser.util.Matrix;

import java.io.IOException;
import java.nio.file.Path;

public final class Mp4MetadataUtil {

    private Mp4MetadataUtil() {}

    public static VideoMetadata read(Path file) throws IOException {

        try (DataSource ds = new FileDataSourceImpl(file.toString())) {
            IsoFile iso = null;
            try {
                iso = new IsoFile(ds);

                MovieBox moov = iso.getBoxes(MovieBox.class).stream().findFirst().orElse(null);
                if (moov == null) throw new IOException("MP4 missing moov atom");

                MovieHeaderBox mvhd = moov.getMovieHeaderBox();
                if (mvhd == null) throw new IOException("MP4 missing mvhd");

                double durationSeconds = (double) mvhd.getDuration() / (double) mvhd.getTimescale();

                int width = 0;
                int height = 0;

                for (TrackBox tb : moov.getBoxes(TrackBox.class)) {
                    if (tb.getMediaBox() == null || tb.getMediaBox().getHandlerBox() == null) continue;

                    String handler = tb.getMediaBox().getHandlerBox().getHandlerType();
                    if (!"vide".equalsIgnoreCase(handler)) continue;

                    TrackHeaderBox tkhd = tb.getTrackHeaderBox();
                    if (tkhd == null) continue;

                    // mp4parser versions differ:
                    // - some return width/height already in pixels (e.g., 1080.0)
                    // - some return 16.16 fixed-point values (e.g., 1080<<16)
                    int w = toPixels(tkhd.getWidth());
                    int h = toPixels(tkhd.getHeight());

                    // Handle rotation metadata: portrait videos are often stored rotated
                    Matrix m = tkhd.getMatrix();
                    int rotation = rotationDegrees(m);
                    if (rotation == 90 || rotation == 270) {
                        int tmp = w; w = h; h = tmp;
                    }

                    width = w;
                    height = h;
                    break;
                }

                return new VideoMetadata(durationSeconds, width, height);

            } finally {
                if (iso != null) {
                    try { iso.close(); } catch (Exception ignore) {}
                }
            }
        }
    }

    private static int toPixels(double raw) {
        if (raw <= 0) return 0;

        // Heuristic:
        // If value is huge, it's likely 16.16 fixed point.
        // Example: 1080px as fixed-point = 1080 * 65536 = 70778880 (> 10000)
        if (raw > 10_000) {
            return (int) Math.round(raw / 65536.0);
        }

        // Already pixels
        return (int) Math.round(raw);
    }

    private static int rotationDegrees(Matrix m) {
        if (m == null) return 0;
        if (Matrix.ROTATE_90.equals(m)) return 90;
        if (Matrix.ROTATE_180.equals(m)) return 180;
        if (Matrix.ROTATE_270.equals(m)) return 270;
        return 0;
    }

    public record VideoMetadata(double durationSeconds, int width, int height) {}
}
