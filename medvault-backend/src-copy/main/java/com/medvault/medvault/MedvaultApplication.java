package com.medvault.medvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MedvaultApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedvaultApplication.class, args);
	}

}
