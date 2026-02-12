package com.medapp.citasmedicas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("com.medapp.citasmedicas.repository")
public class CitasMedicasApplication {
	public static void main(String[] args) {
		SpringApplication.run(CitasMedicasApplication.class, args);
	}
}
