package com.Mentr_App.Mentr_V1.dto.dashboard;



import java.time.LocalDate;

public interface DateCountProjection {
    LocalDate getDay();
    Long getCount();
    Long getMinutes(); // may be null for review queries
}

