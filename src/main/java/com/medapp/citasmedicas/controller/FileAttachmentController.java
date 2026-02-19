package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.model.FileAttachment;
import com.medapp.citasmedicas.repository.FileAttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medapp.citasmedicas.service.AuditLogService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;

@RestController
@RequestMapping("/api/appointments/{appointmentId}/files")
@CrossOrigin(origins = "*")
@Tag(name = "file-attachment-controller", description = "Gestión de archivos adjuntos a citas médicas")
public class FileAttachmentController {
    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private FileAttachmentRepository fileAttachmentRepo;

    @GetMapping
    @Operation(summary = "Listar archivos adjuntos de una cita", description = "Devuelve la lista de archivos adjuntos para una cita médica")
    public List<FileAttachment> getFiles(@PathVariable Long appointmentId) {
        return fileAttachmentRepo.findByAppointment_Id(appointmentId);
    }

    @Autowired
    private com.medapp.citasmedicas.service.FileAttachmentService fileAttachmentService;

    // Subir archivo adjunto a una cita
    @PostMapping(consumes = "multipart/form-data")
    @Operation(summary = "Subir archivo adjunto a una cita", description = "Permite subir un archivo (receta, informe, etc.) a una cita médica")
    public ResponseEntity<FileAttachment> uploadFile(
            @PathVariable Long appointmentId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("type") String type,
            org.springframework.security.core.Authentication authentication) {
        try {
            FileAttachment saved = fileAttachmentService.saveFile(appointmentId, file, type);
            String userEmail = authentication != null ? authentication.getName() : "anonymous";
            auditLogService.log(userEmail, "UPLOAD_FILE", "Subió archivo a cita " + appointmentId + ": " + file.getOriginalFilename());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error in server logs
            return ResponseEntity.badRequest()
                .header("Content-Type", "application/json")
                .body(null);
        }
    }
}
