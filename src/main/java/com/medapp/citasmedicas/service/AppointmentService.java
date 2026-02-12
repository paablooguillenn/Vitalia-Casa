package com.medapp.citasmedicas.service;

import com.medapp.citasmedicas.model.Appointment;
import com.medapp.citasmedicas.model.Doctor;
import com.medapp.citasmedicas.model.User;
import com.medapp.citasmedicas.repository.AppointmentRepository;
import com.medapp.citasmedicas.repository.DoctorRepository;
import com.medapp.citasmedicas.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    
    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);
    
    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private DoctorRepository doctorRepo;

    @Autowired
    private UserRepository userRepo;

    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    public Appointment createAppointment(Long doctorId, Long patientId, LocalDateTime dateTime, String especialidad) {
        log.info("=== Creando cita ===");
        log.info("doctorId: {}, patientId: {}, dateTime: {}, especialidad: {}", 
                 doctorId, patientId, dateTime, especialidad);
        
        if (doctorId == null || patientId == null || dateTime == null) {
            log.error("doctorId, patientId o dateTime es null");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "doctorId, patientId y dateTime son obligatorios");
        }

        // Buscar el doctor
        Doctor doctor = doctorRepo.findById(doctorId)
            .orElseThrow(() -> {
                log.error("Doctor no encontrado: id={}", doctorId);
                return new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor no encontrado");
            });
        
        log.info("Doctor encontrado: {} - {}", doctor.getNombre(), doctor.getEspecialidad());

        // Validar especialidad si se proporciona
        if (especialidad != null && !especialidad.trim().isEmpty()) {
            String expected = especialidad.trim();
            if (doctor.getEspecialidad() == null) {
                log.error("Doctor sin especialidad");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La especialidad no coincide con el doctor");
            }
            if (!doctor.getEspecialidad().equalsIgnoreCase(expected)) {
                log.error("Especialidad no coincide: doctor={}, esperado={}", 
                         doctor.getEspecialidad(), expected);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La especialidad no coincide con el doctor");
            }
        }

        // Buscar el paciente en la tabla USERS (no patients)
        User patient = userRepo.findById(patientId)
            .orElseThrow(() -> {
                log.error("Usuario/Paciente no encontrado: id={}", patientId);
                return new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado");
            });
        
        log.info("Usuario encontrado: {} - Rol: {}", patient.getEmail(), patient.getRole());
        
        // Validar que el usuario tenga rol PACIENTE
        if (patient.getRole() != User.Role.PACIENTE) {
            log.error("El usuario no tiene rol PACIENTE: id={}, rol={}", patientId, patient.getRole());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario no tiene rol PACIENTE");
        }

        // Crear la cita
        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setDateTime(dateTime);
        appointment.setStatus("CONFIRMED");

        Appointment saved = appointmentRepo.save(appointment);
        log.info("Cita creada exitosamente con ID: {}", saved.getId());
        
        return saved;
    }

    public ResponseEntity<Appointment> getAppointment(Long id) {
        return appointmentRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public List<Appointment> getAppointmentsByDoctorAndDateRange(Long doctorId, LocalDateTime start, LocalDateTime end) {
        return appointmentRepo.findByDoctor_IdAndDateTimeBetween(doctorId, start, end);
    }

    public ResponseEntity<Appointment> updateAppointment(Long id, Appointment appointmentDetails) {
        return appointmentRepo.findById(id)
                .map(appointment -> {
                    appointment.setDateTime(appointmentDetails.getDateTime());
                    appointment.setStatus(appointmentDetails.getStatus());
                    Appointment updated = appointmentRepo.save(appointment);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> deleteAppointment(Long id) {
        return appointmentRepo.findById(id)
                .map(appointment -> {
                    appointmentRepo.delete(appointment);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
