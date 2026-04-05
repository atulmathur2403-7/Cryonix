package com.Mentr_App.Mentr_V1.util;


import java.math.BigDecimal;
import java.math.RoundingMode;

public final class PricingCalculator {
    private PricingCalculator() {}

    public record Breakdown(
            int unitMinutes,
            BigDecimal unitPrice,
            int durationMinutes,
            BigDecimal subtotal,
            BigDecimal discountPercent,
            BigDecimal discountAmount,
            BigDecimal total
    ) {}

    public static Breakdown compute(
            BigDecimal unitPrice,
            int unitMinutes,
            int durationMinutes,
            Integer longCallThresholdMinutes,
            BigDecimal discountPercent
    ) {
        if (durationMinutes < unitMinutes || durationMinutes % unitMinutes != 0) {
            throw new IllegalArgumentException("Duration must be a multiple of " + unitMinutes + " minutes.");
        }

        int units = durationMinutes / unitMinutes;
        BigDecimal subtotal = unitPrice
                .multiply(BigDecimal.valueOf(units))
                .setScale(2, RoundingMode.HALF_UP);

        boolean applyDiscount = longCallThresholdMinutes != null
                && discountPercent != null
                && durationMinutes >= longCallThresholdMinutes
                && discountPercent.compareTo(BigDecimal.ZERO) > 0;

        BigDecimal appliedPercent = applyDiscount ? discountPercent : BigDecimal.ZERO;

        BigDecimal discountAmount = subtotal
                .multiply(appliedPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal total = subtotal.subtract(discountAmount)
                .setScale(2, RoundingMode.HALF_UP);

        return new Breakdown(
                unitMinutes,
                unitPrice.setScale(2, RoundingMode.HALF_UP),
                durationMinutes,
                subtotal,
                appliedPercent,
                discountAmount,
                total
        );
    }
}


