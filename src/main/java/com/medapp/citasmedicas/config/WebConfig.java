package com.medapp.citasmedicas.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expone la carpeta profile_pictures para acceso público
        // Usar ruta relativa universal (funciona en local y Docker)
        registry.addResourceHandler("/profile_pictures/**")
            .addResourceLocations("file:profile_pictures/");
    }
}
