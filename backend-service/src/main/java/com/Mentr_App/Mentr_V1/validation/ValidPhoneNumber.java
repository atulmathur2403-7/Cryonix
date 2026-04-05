package com.Mentr_App.Mentr_V1.validation;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidPhoneNumberValidator.class)
public @interface ValidPhoneNumber {

    String message() default "Invalid phone number input";

    String countryField();

    String numberField();

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

