
package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.model.Appointment;
import com.medapp.citasmedicas.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.medapp.citasmedicas.service.AuditLogService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {
    @Autowired
    private AuditLogService auditLogService;
    // PATCH /api/appointments/{id} para editar fecha/hora/estado
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody Map<String, Object> updates, org.springframework.security.core.Authentication authentication) {
        try {
            Appointment apt = appointmentService.getAppointmentById(id);
            if (apt == null) {
                return ResponseEntity.status(404).body("Cita no encontrada");
            }
            String userEmail = authentication.getName();
            boolean changed = false;
            if (updates.containsKey("date") && updates.containsKey("time")) {
                String date = updates.get("date").toString();
                String time = updates.get("time").toString();
                java.time.LocalDateTime dateTime = java.time.LocalDateTime.parse(date + "T" + time);
                apt.setDateTime(dateTime);
                changed = true;
            }
            if (updates.containsKey("status")) {
                String oldStatus = apt.getStatus();
                String newStatus = updates.get("status").toString();
                apt.setStatus(newStatus);
                changed = true;
                // Log cambio de estado
                auditLogService.log(userEmail, "UPDATE_APPOINTMENT_STATUS", "Cambio de estado de cita " + id + ": " + oldStatus + " → " + newStatus);
            }
            if (changed) {
                appointmentService.saveAppointment(apt);
                auditLogService.log(userEmail, "UPDATE_APPOINTMENT", "Modificó cita " + id);
            }
            return ResponseEntity.ok("Cita actualizada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al actualizar la cita: " + e.getMessage());
        }
    }
    // PATCH /api/appointments/{id}/cancel
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            String debugInfo = appointmentService.cancelAppointmentDebug(id, userEmail);
            if ("OK".equals(debugInfo)) {
                auditLogService.log(userEmail, "CANCEL_APPOINTMENT", "Canceló cita " + id);
                return ResponseEntity.ok().body("Cita cancelada correctamente");
            } else {
                return ResponseEntity.status(403).body("No tienes permiso para cancelar esta cita o ya está cancelada. Debug: " + debugInfo);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al cancelar la cita: " + e.getMessage());
        }
    }
    // ...resto de la clase...
        // Endpoint para check-in por QR
        @GetMapping("/checkin")
        public ResponseEntity<?> checkinByQrToken(@RequestParam String token) {
            try {
                Appointment apt = appointmentService.checkinByQrToken(token);
                if (apt == null) {
                    return ResponseEntity.status(404).body("Cita no encontrada o token inválido");
                }
                // Convertir a DTO
                com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO doctorDto = null;
                if (apt.getDoctor() != null) {
                    doctorDto = new com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO(
                        apt.getDoctor().getId(),
                        apt.getDoctor().getNombre(),
                        apt.getDoctor().getEspecialidad()
                    );
                }
                com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO patientDto = null;
                if (apt.getPatient() != null) {
                    patientDto = new com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO(
                        apt.getPatient().getId(),
                        apt.getPatient().getNombre()
                    );
                }
                com.medapp.citasmedicas.dto.AppointmentDTO dto = new com.medapp.citasmedicas.dto.AppointmentDTO(
                    apt.getId(),
                    doctorDto,
                    patientDto,
                    apt.getDateTime(),
                    apt.getStatus(),
                    apt.getQrCodeUrl(),
                    apt.getNotes()
                );
                return ResponseEntity.ok(dto);
            } catch (Exception e) {
                log.error("=== ERROR checkinByQrToken: {}", e.getMessage(), e);
                return ResponseEntity.status(500).body("Error interno");
            }
        }
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<com.medapp.citasmedicas.dto.AppointmentDTO>> getAppointmentsByPatient(@PathVariable Long patientId) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByPatient(patientId);
            List<com.medapp.citasmedicas.dto.AppointmentDTO> dtos = new ArrayList<>();
            for (Appointment apt : appointments) {
                com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO doctorDto = null;
                if (apt.getDoctor() != null) {
                    doctorDto = new com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO(
                        apt.getDoctor().getId(),
                        apt.getDoctor().getNombre(),
                        apt.getDoctor().getEspecialidad()
                    );
                }
                com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO patientDto = null;
                if (apt.getPatient() != null) {
                    patientDto = new com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO(
                        apt.getPatient().getId(),
                        apt.getPatient().getNombre()
                    );
                }
                dtos.add(new com.medapp.citasmedicas.dto.AppointmentDTO(
                    apt.getId(),
                    doctorDto,
                    patientDto,
                    apt.getDateTime(),
                    apt.getStatus(),
                    apt.getQrCodeUrl(),
                    apt.getNotes()
                ));
            }
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("=== ERROR getAppointmentsByPatient: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    private static final Logger log = LoggerFactory.getLogger(AppointmentController.class);

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> request, org.springframework.security.core.Authentication authentication) { // ← Map en lugar de DTO
        try {
            log.info("=== CREATE APPOINTMENT REQUEST: {}", request);

            // ✅ VALIDAR CAMPOS BÁSICOS
            if (!request.containsKey("doctorId") || !request.containsKey("patientId") || !request.containsKey("dateTime") || !request.containsKey("notes")) {
                return ResponseEntity.badRequest().body("Faltan campos requeridos");
            }
            String notes = request.get("notes").toString().trim();
            if (notes.isEmpty()) {
                return ResponseEntity.badRequest().body("Las notas de la cita son obligatorias.");
            }

            Long doctorId = Long.valueOf(request.get("doctorId").toString());
            Long patientId = Long.valueOf(request.get("patientId").toString());
            String dateTimeStr = request.get("dateTime").toString();
            String especialidad = request.getOrDefault("especialidad", "").toString();

            // Soporta fechas con 'Z' (UTC) usando OffsetDateTime
            java.time.LocalDateTime dateTime = java.time.OffsetDateTime.parse(dateTimeStr).toLocalDateTime();

            // ✅ LLAMAR SERVICE CON TRY/CATCH
            Appointment appointment = appointmentService.createAppointment(doctorId, patientId,
                dateTime, especialidad, notes);
            // Log creación de cita
            String userEmail = authentication != null ? authentication.getName() : "anonymous";
            auditLogService.log(userEmail, "CREATE_APPOINTMENT", "Creó cita para paciente " + patientId + " con doctor " + doctorId);

            // Convertir a DTO para exponer qrCodeUrl y evitar exponer entidades
            com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO doctorDto = null;
            if (appointment.getDoctor() != null) {
                doctorDto = new com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO(
                    appointment.getDoctor().getId(),
                    appointment.getDoctor().getNombre(),
                    appointment.getDoctor().getEspecialidad()
                );
            }
            com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO patientDto = null;
            if (appointment.getPatient() != null) {
                patientDto = new com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO(
                    appointment.getPatient().getId(),
                    appointment.getPatient().getNombre()
                );
            }
            com.medapp.citasmedicas.dto.AppointmentDTO dto = new com.medapp.citasmedicas.dto.AppointmentDTO(
                appointment.getId(),
                doctorDto,
                patientDto,
                appointment.getDateTime(),
                appointment.getStatus(),
                appointment.getQrCodeUrl(),
                appointment.getNotes()
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("=== ERROR createAppointment: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/doctor/{doctorId}/range")
    public ResponseEntity<List<com.medapp.citasmedicas.dto.AppointmentDTO>> getAppointmentsByDoctorAndDateRange(
            @PathVariable Long doctorId,
            @RequestParam String start,
            @RequestParam String end) {
        try {
            log.info("=== GET SLOTS: doctorId={}, start={}, end={}", doctorId, start, end);

            LocalDateTime startDate;
            LocalDateTime endDate;
            try {
                startDate = java.time.OffsetDateTime.parse(start).toLocalDateTime();
            } catch (Exception e) {
                startDate = LocalDateTime.parse(start);
            }
            try {
                endDate = java.time.OffsetDateTime.parse(end).toLocalDateTime();
            } catch (Exception e) {
                endDate = LocalDateTime.parse(end);
            }

            List<Appointment> appointments = appointmentService.getAppointmentsByDoctorAndDateRange(doctorId, startDate, endDate);
            List<com.medapp.citasmedicas.dto.AppointmentDTO> dtos = new ArrayList<>();
            for (Appointment apt : appointments) {
                com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO doctorDto = null;
                if (apt.getDoctor() != null) {
                    doctorDto = new com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO(
                        apt.getDoctor().getId(),
                        apt.getDoctor().getNombre(),
                        apt.getDoctor().getEspecialidad()
                    );
                }
                com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO patientDto = null;
                if (apt.getPatient() != null) {
                    patientDto = new com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO(
                        apt.getPatient().getId(),
                        apt.getPatient().getNombre()
                    );
                }
                dtos.add(new com.medapp.citasmedicas.dto.AppointmentDTO(
                    apt.getId(),
                    doctorDto,
                    patientDto,
                    apt.getDateTime(),
                    apt.getStatus(),
                    apt.getQrCodeUrl(),
                    apt.getNotes()
                ));
            }
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("=== ERROR get slots: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>()); // ← RETORNA ARRAY VACÍO
        }
    }
}
