package com.Mentr_App.Mentr_V1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class MentrV1Application {

	public static void main(String[] args) {
		SpringApplication.run(MentrV1Application.class, args);
	}

}
