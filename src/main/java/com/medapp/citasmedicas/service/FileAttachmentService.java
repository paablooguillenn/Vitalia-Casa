package com.medapp.citasmedicas.service;

import com.medapp.citasmedicas.model.FileAttachment;
import com.medapp.citasmedicas.model.Appointment;
import com.medapp.citasmedicas.repository.FileAttachmentRepository;
import com.medapp.citasmedicas.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FileAttachmentService {
    @Autowired
    private FileAttachmentRepository fileAttachmentRepo;
    @Autowired
    private AppointmentRepository appointmentRepo;

    private final String uploadDir = "uploads/";

    public List<FileAttachment> getFilesByAppointment(Long appointmentId) {
        return fileAttachmentRepo.findByAppointment_Id(appointmentId);
    }

    public FileAttachment saveFile(Long appointmentId, MultipartFile file, String type) throws IOException {
        Appointment appointment = appointmentRepo.findById(appointmentId).orElseThrow();
        // Guardar archivo en disco
        Files.createDirectories(Paths.get(uploadDir));
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, filename);
        Files.write(filePath, file.getBytes());
        // Guardar metadata en BD
        FileAttachment attachment = new FileAttachment();
        attachment.setAppointment(appointment);
        attachment.setUrl(filePath.toString());
        attachment.setType(type);
        attachment.setFilename(file.getOriginalFilename());
        attachment.setCreatedAt(LocalDateTime.now());
        return fileAttachmentRepo.save(attachment);
    }
}
