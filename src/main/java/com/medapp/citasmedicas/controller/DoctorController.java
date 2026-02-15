
package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.model.Doctor;
import com.medapp.citasmedicas.service.DoctorService;
import com.medapp.citasmedicas.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {
    private static final Logger log = LoggerFactory.getLogger(DoctorController.class);

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    /**
     * Para crear un doctor, el JSON debe incluir el objeto user con email, passwordHash y nombre.
     * Ejemplo:
     * {
     *   "nombre": "Dr. Juan",
     *   "especialidad": "CARDIOLOGIA",
     *   "telefono": "123456789",
     *   "user": {
     *     "email": "doctor@ejemplo.com",
     *     "passwordHash": "clave123",
     *     "nombre": "Juan"
     *   }
     * }
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        log.info("[DoctorController] Petición recibida para crear doctor: {}", doctor.getNombre());
        try {
            return doctorService.createDoctor(doctor);
        } catch (IllegalArgumentException e) {
            log.error("[DoctorController] Error al crear doctor: {}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }

    @GetMapping("/especialidad/{especialidad}")
    @PreAuthorize("isAuthenticated()")
    public List<Doctor> getDoctorsByEspecialidad(@PathVariable String especialidad) {
        return doctorService.getDoctorsByEspecialidad(especialidad);
    }

    /**
     * Devuelve una lista de todas las especialidades únicas de los doctores.
     */
    @GetMapping("/specialties")
    @PreAuthorize("isAuthenticated()")
    public List<String> getAllSpecialties() {
        return doctorService.getAllSpecialties();
    }

    /**
     * Devuelve la disponibilidad de un doctor (citas agendadas) en un rango de fechas.
     * Ejemplo de uso:
     *   /api/doctors/5/availability?start=2024-06-01T00:00:00&end=2024-06-30T23:59:59
     */
    @GetMapping("/{id}/availability")
    @PreAuthorize("isAuthenticated()")
    public List<com.medapp.citasmedicas.model.Appointment> getDoctorAvailability(
            @PathVariable Long id,
            @RequestParam String start,
            @RequestParam String end) {
        java.time.LocalDateTime startDate = java.time.LocalDateTime.parse(start);
        java.time.LocalDateTime endDate = java.time.LocalDateTime.parse(end);
        return appointmentService.getAppointmentsByDoctorAndDateRange(id, startDate, endDate);
    }
}
