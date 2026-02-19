package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.model.FileAttachment;
import com.medapp.citasmedicas.repository.FileAttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileUploadController {
    @Autowired
    private FileAttachmentRepository fileAttachmentRepo;

    private final String uploadDir = System.getProperty("user.dir") + "/uploaded_files/";

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type) {
        try {
            Files.createDirectories(Paths.get(uploadDir));
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, filename);
            Files.write(filePath, file.getBytes());

            FileAttachment attachment = new FileAttachment();

            attachment.setAppointment(null); // No asociar a cita
            attachment.setUrl("/api/files/download/" + filename);
            attachment.setFilename(filename);
            attachment.setType(type != null ? type : file.getContentType());
            attachment.setCreatedAt(java.time.LocalDateTime.now());
            fileAttachmentRepo.save(attachment);

            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al subir archivo: " + e.getMessage());
        }
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<?> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir, filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            org.springframework.core.io.Resource fileResource = new org.springframework.core.io.UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            return ResponseEntity.ok()
                    .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                    .body(fileResource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al descargar archivo: " + e.getMessage());
        }
    }
}
