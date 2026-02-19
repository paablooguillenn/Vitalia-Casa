package com.medapp.citasmedicas.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/profile-pictures")
@CrossOrigin(origins = "*")
public class ProfilePictureController {
    @GetMapping("/{filename:.+}")
    public ResponseEntity<?> getProfilePicture(@PathVariable String filename) {
        try {
            String backendDir = System.getProperty("user.dir") + "/profile_pictures/";
            Path filePath = Path.of(backendDir, filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            Resource fileResource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            return ResponseEntity.ok()
                    .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                    .body(fileResource);
        } catch (Exception e) {
            System.err.println("[ProfilePictureController] Error al servir la foto: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al servir la foto: " + e.getMessage());
        }
    }
}
