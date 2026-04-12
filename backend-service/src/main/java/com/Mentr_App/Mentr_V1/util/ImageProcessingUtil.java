package com.Mentr_App.Mentr_V1.util;


import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Iterator;

public final class ImageProcessingUtil {

    private ImageProcessingUtil() {}

    static {
        // Ensures ImageIO picks up plugins (ex: TwelveMonkeys WebP)
        ImageIO.scanForPlugins();
    }

    /** Decode image bytes using ImageIO (returns null if unsupported/corrupt). */
    public static BufferedImage decodeImage(byte[] bytes) throws IOException {
        try (InputStream in = new ByteArrayInputStream(bytes)) {
            return ImageIO.read(in);
        }
    }

    /** Protect against decompression bombs / huge images. */
    public static void validateDimensions(BufferedImage img, int maxDim, long maxPixels) {
        int w = img.getWidth();
        int h = img.getHeight();
        long pixels = (long) w * (long) h;

        if (w <= 0 || h <= 0) {
            throw new IllegalArgumentException("Invalid image dimensions");
        }
        if (w > maxDim || h > maxDim) {
            throw new IllegalArgumentException("IMAGE_TOO_LARGE_DIMENSIONS");
        }
        if (pixels > maxPixels) {
            throw new IllegalArgumentException("IMAGE_TOO_LARGE_DIMENSIONS");
        }
    }

    /**
     * ✅ LinkedIn-style avatar normalization:
     * 1) Center-crop to square
     * 2) Resize to outputSize x outputSize
     * 3) Flatten alpha onto white background (safe for JPEG)
     * 4) Re-encode as JPEG (strips EXIF)
     *
     * @param input      decoded image
     * @param outputSize final avatar size (e.g., 256 / 512 / 1024)
     * @param quality    JPEG quality (0.10 to 1.0)
     */
    public static byte[] normalizeToJpegAvatar(BufferedImage input, int outputSize, float quality) throws IOException {
        if (input == null) throw new IllegalArgumentException("input image cannot be null");
        if (outputSize <= 0) throw new IllegalArgumentException("outputSize must be > 0");

        float q = clamp(quality, 0.10f, 1.0f);

        BufferedImage square = centerCropSquare(input);
        BufferedImage resized = resizeExact(square, outputSize, outputSize);

        // Convert to RGB (white background) so transparency doesn't break JPEG
        BufferedImage rgb = toRGB(resized);

        return writeJpeg(rgb, q);
    }

    /**
     * (Optional) Keep your old behavior if you still need "maxSide" resize elsewhere.
     * Not used for LinkedIn-style avatars.
     */
    public static byte[] normalizeToJpeg(BufferedImage input, int maxSide, float quality) throws IOException {
        BufferedImage rgb = toRGB(input);
        BufferedImage resized = resizeIfNeeded(rgb, maxSide);
        return writeJpeg(resized, clamp(quality, 0.10f, 1.0f));
    }

    /** Center-crop to square (keeps the middle region). */
    private static BufferedImage centerCropSquare(BufferedImage src) {
        int w = src.getWidth();
        int h = src.getHeight();
        int size = Math.min(w, h);

        int x = (w - size) / 2;
        int y = (h - size) / 2;

        BufferedImage cropped = src.getSubimage(x, y, size, size);

        // Copy to detach from original raster (prevents holding huge memory)
        BufferedImage copy = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = copy.createGraphics();
        g.setComposite(AlphaComposite.Src);
        g.drawImage(cropped, 0, 0, null);
        g.dispose();

        return copy;
    }

    /** Resize to exact width/height with good quality. */
    private static BufferedImage resizeExact(BufferedImage src, int targetW, int targetH) {
        BufferedImage out = new BufferedImage(targetW, targetH, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = out.createGraphics();

        g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g2.drawImage(src, 0, 0, targetW, targetH, null);
        g2.dispose();

        return out;
    }

    private static BufferedImage toRGB(BufferedImage src) {
        // If source has alpha, draw on white background
        BufferedImage rgb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        g.setComposite(AlphaComposite.SrcOver);
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, src.getWidth(), src.getHeight());
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return rgb;
    }

    private static BufferedImage resizeIfNeeded(BufferedImage src, int maxSide) {
        int w = src.getWidth();
        int h = src.getHeight();
        int max = Math.max(w, h);

        if (max <= maxSide) return src;

        double scale = (double) maxSide / (double) max;
        int nw = (int) Math.round(w * scale);
        int nh = (int) Math.round(h * scale);

        BufferedImage out = new BufferedImage(nw, nh, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = out.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.drawImage(src, 0, 0, nw, nh, null);
        g2.dispose();
        return out;
    }

    private static byte[] writeJpeg(BufferedImage img, float quality) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
        if (!writers.hasNext()) {
            throw new IOException("No JPEG ImageWriter found");
        }

        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        if (param.canWriteCompressed()) {
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(clamp(quality, 0.10f, 1.0f));
        }

        try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(img, null, null), param);
        } finally {
            writer.dispose();
        }

        return baos.toByteArray();
    }

    private static float clamp(float v, float min, float max) {
        return Math.max(min, Math.min(max, v));
    }
}
