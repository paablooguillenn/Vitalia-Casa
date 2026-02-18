package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.service.AuditLogService;
import com.medapp.citasmedicas.model.Doctor;
import com.medapp.citasmedicas.model.User;
import com.medapp.citasmedicas.service.DoctorService;
import com.medapp.citasmedicas.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private AuditLogService auditLogService;
    private static final Logger log = LoggerFactory.getLogger(DoctorController.class);

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;
    // ...existing code...

    // ✅ VALIDACIÓN TOKEN ANTES DE TODO
    private User getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                throw new RuntimeException("Usuario no autenticado");
            }
            // Buscar usuario por token/email desde JWT
            // String username = auth.getName(); // email o token
            // No se puede buscar el usuario sin UserService, solo validar autenticación
            return null;
        } catch (Exception e) {
            log.error("Error validando usuario: {}", e.getMessage());
            throw new RuntimeException("Acceso denegado: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors(@RequestParam(required = false) Long userId, @RequestParam(required = false, name = "user_id") Long user_id) {
        try {
            getCurrentUser(); // ✅ VALIDACIÓN
            // Si se solicita por userId o user_id, devolver solo el doctor correspondiente
            Long resolvedUserId = userId != null ? userId : user_id;
            if (resolvedUserId != null) {
                Doctor doctor = doctorService.getDoctorByUserId(resolvedUserId);
                if (doctor != null) {
                    return ResponseEntity.ok(List.of(doctor));
                } else {
                    return ResponseEntity.ok(List.of());
                }
            }
            List<Doctor> doctors = doctorService.getAllDoctors();
            return ResponseEntity.ok(doctors);
        } catch (RuntimeException e) {
            log.error("Error getAllDoctors: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        log.info("[DoctorController] Petición recibida para crear doctor: {}", doctor.getNombre());
        try {
            Doctor created = doctorService.createDoctor(doctor);
            // Log de creación de doctor
            auditLogService.log(doctor.getUser() != null ? doctor.getUser().getEmail() : "anonymous", "CREATE_DOCTOR", "Creó doctor: " + doctor.getNombre());
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            log.error("[DoctorController] Error al crear doctor: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/especialidad/{especialidad}")
    public ResponseEntity<List<Doctor>> getDoctorsByEspecialidad(@PathVariable String especialidad) {
        try {
            getCurrentUser(); // ✅ VALIDACIÓN
            List<Doctor> doctors = doctorService.getDoctorsByEspecialidad(especialidad);
            return ResponseEntity.ok(doctors);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/specialties")
    public ResponseEntity<List<String>> getAllSpecialties() {
        try {
            getCurrentUser(); // ✅ VALIDACIÓN
            List<String> specialties = doctorService.getAllSpecialties();
            return ResponseEntity.ok(specialties);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<com.medapp.citasmedicas.model.Appointment>> getDoctorAvailability(
            @PathVariable Long id,
            @RequestParam String start,
            @RequestParam String end) {
        try {
            getCurrentUser(); // ✅ VALIDACIÓN
            java.time.LocalDateTime startDate = java.time.LocalDateTime.parse(start);
            java.time.LocalDateTime endDate = java.time.LocalDateTime.parse(end);
            List<com.medapp.citasmedicas.model.Appointment> appointments = 
                appointmentService.getAppointmentsByDoctorAndDateRange(id, startDate, endDate);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error parsing dates: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
