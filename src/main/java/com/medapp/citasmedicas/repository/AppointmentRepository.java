package com.medapp.citasmedicas.repository;

import com.medapp.citasmedicas.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctor_IdAndDateTimeBetween(Long doctorId, java.time.LocalDateTime start, java.time.LocalDateTime end);

    List<Appointment> findByDoctor_Id(Long doctorId);

    List<Appointment> findByPatient_Id(Long patientId);
}
