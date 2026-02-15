package com.medapp.citasmedicas.repository;

import com.medapp.citasmedicas.model.FileAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileAttachmentRepository extends JpaRepository<FileAttachment, Long> {
    List<FileAttachment> findByAppointment_Id(Long appointmentId);
}
