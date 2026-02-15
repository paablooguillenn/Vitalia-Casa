package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.model.Appointment;
import com.medapp.citasmedicas.service.AppointmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // GET todas las citas
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // POST nueva cita - Permitido para cualquier usuario autenticado (cualquier JWT válido)
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody AppointmentCreateRequest request) {
        Appointment created = appointmentService.createAppointment(
            request.getDoctorId(),
            request.getPatientId(),
            request.getDateTime(),
            request.getEspecialidad()
        );
        return ResponseEntity.ok(created);
    }

    // GET cita por ID
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointment(@PathVariable Long id) {
        return appointmentService.getAppointment(id);
    }

    @GetMapping("/doctor/{doctorId}/range")
    public List<Appointment> getAppointmentsByDoctorAndDateRange(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return appointmentService.getAppointmentsByDoctorAndDateRange(doctorId, start, end);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PACIENTE')")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointmentDetails) {
        return appointmentService.updateAppointment(id, appointmentDetails);
    }

    @DeleteMapping("/{id}")
    // Permitir a cualquier usuario autenticado cancelar citas
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        return appointmentService.deleteAppointment(id);
    }

    static class AppointmentCreateRequest {
        private Long doctorId;
        private Long patientId;
        private LocalDateTime dateTime;
        private String especialidad;

        public Long getDoctorId() {
            return doctorId;
        }

        public void setDoctorId(Long doctorId) {
            this.doctorId = doctorId;
        }

        public Long getPatientId() {
            return patientId;
        }

        public void setPatientId(Long patientId) {
            this.patientId = patientId;
        }

        public LocalDateTime getDateTime() {
            return dateTime;
        }

        public void setDateTime(LocalDateTime dateTime) {
            this.dateTime = dateTime;
        }

        public String getEspecialidad() {
            return especialidad;
        }

        public void setEspecialidad(String especialidad) {
            this.especialidad = especialidad;
        }
    }
}
