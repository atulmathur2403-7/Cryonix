package com.Mentr_App.Mentr_V1.validation;


import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Field;

public class ValidPhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, Object> {

    private String countryField;
    private String numberField;

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
        this.countryField = constraintAnnotation.countryField();
        this.numberField = constraintAnnotation.numberField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) return true;

        try {
            Field cf = value.getClass().getDeclaredField(countryField);
            Field nf = value.getClass().getDeclaredField(numberField);
            cf.setAccessible(true);
            nf.setAccessible(true);

            Object c = cf.get(value);
            Object n = nf.get(value);

            String country = c == null ? null : c.toString().trim();
            String number = n == null ? null : n.toString().trim();

            // If both null/blank, let @NotBlank handle requiredness; here we ensure pairing
            boolean countryBlank = (country == null || country.isBlank());
            boolean numberBlank = (number == null || number.isBlank());

            if (countryBlank && numberBlank) return true;

            tokenCheck:
            {
                if (countryBlank || numberBlank) {
                    return false;
                }
                if (country.length() != 2) {
                    return false;
                }
                // basic sanity: should contain at least some digits
                int digits = 0;
                for (char ch : number.toCharArray()) {
                    if (Character.isDigit(ch)) digits++;
                }
                return digits >= 6;
            }

        } catch (Exception e) {
            // If reflection fails, don't block request
            return true;
        }
    }
}

