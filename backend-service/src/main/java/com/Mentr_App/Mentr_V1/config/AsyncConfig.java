package com.Mentr_App.Mentr_V1.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Uses spring.task.execution.* properties
}

