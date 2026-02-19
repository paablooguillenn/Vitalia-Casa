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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentService {
        public NotificationService getNotificationService() {
            return notificationService;
        }
    // Recordatorio automático 24h antes de la cita
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 * * * *") // Cada hora
    public void sendAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderTime = now.plusHours(24);
        List<Appointment> upcoming = appointmentRepo.findAll();
        for (Appointment apt : upcoming) {
            if (apt.getDateTime() != null &&
                apt.getStatus() != null &&
                apt.getStatus().equalsIgnoreCase("CONFIRMED") &&
                apt.getDateTime().isAfter(now) &&
                apt.getDateTime().isBefore(reminderTime)) {
                String notes = apt.getNotes() != null ? apt.getNotes() : "Sin notas";
                // Notificar paciente
                if (apt.getPatient() != null) {
                    notificationService.createNotification(
                        "Recordatorio de cita",
                        String.format("Tienes una cita con el Dr. %s el %s.\nNotas: %s", apt.getDoctor().getNombre(), apt.getDateTime(), notes),
                        "REMINDER",
                        apt.getPatient()
                    );
                }
                // Notificar doctor
                if (apt.getDoctor() != null && apt.getDoctor().getUser() != null) {
                    notificationService.createNotification(
                        "Recordatorio de cita",
                        String.format("Tienes una cita con %s el %s.\nNotas: %s", apt.getPatient().getNombre(), apt.getDateTime(), notes),
                        "REMINDER",
                        apt.getDoctor().getUser()
                    );
                }
            }
        }
    }
    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);
    
    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private DoctorRepository doctorRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private NotificationService notificationService;

    // Obtener cita por ID (null si no existe)
    public Appointment getAppointmentById(Long id) {
        try {
            return appointmentRepo.findById(id).orElse(null);
        } catch (Exception e) {
            log.error("Error getAppointmentById {}: {}", id, e.getMessage());
            return null;
        }
    }

    // Guardar cita (crear o actualizar)
    public Appointment saveAppointment(Appointment apt) {
        try {
            return appointmentRepo.save(apt);
        } catch (Exception e) {
            log.error("Error saveAppointment: {}", e.getMessage());
            throw new RuntimeException("Error al guardar la cita");
        }
    }

    // Cancelar cita: cualquier usuario autenticado puede cancelar cualquier cita
    public String cancelAppointmentDebug(Long appointmentId, String userEmail) {
        Appointment apt = appointmentRepo.findById(appointmentId).orElse(null);
        if (apt == null) return "No se encontró la cita";
        if ("CANCELLED".equalsIgnoreCase(apt.getStatus())) return "La cita ya está cancelada";
        apt.setStatus("CANCELLED");
        appointmentRepo.save(apt);
        // Notificar a paciente y doctor
        String notes = apt.getNotes() != null ? apt.getNotes() : "Sin notas";
        if (apt.getPatient() != null) {
            notificationService.createNotification(
                "Cita cancelada",
                String.format("Tu cita con el Dr. %s el %s ha sido cancelada.\nNotas: %s", apt.getDoctor().getNombre(), apt.getDateTime(), notes),
                "CANCELLATION",
                apt.getPatient()
            );
        }
        if (apt.getDoctor() != null && apt.getDoctor().getUser() != null) {
            notificationService.createNotification(
                "Cita cancelada",
                String.format("La cita con %s el %s ha sido cancelada.\nNotas: %s", apt.getPatient().getNombre(), apt.getDateTime(), notes),
                "CANCELLATION",
                apt.getDoctor().getUser()
            );
        }
        return "OK";
    }

    public Appointment checkinByQrToken(String token) {
        try {
            if (token == null || token.isEmpty()) return null;
            // Buscar cita por token en qrCodeUrl
            String urlPart = "/checkin?token=" + token;
            List<Appointment> all = appointmentRepo.findAll();
            for (Appointment apt : all) {
                if (apt.getQrCodeUrl() != null && apt.getQrCodeUrl().endsWith(urlPart)) {
                    // Cambiar estado a CHECKED_IN si no lo está
                    if (!"CHECKED_IN".equals(apt.getStatus())) {
                        apt.setStatus("CHECKED_IN");
                        appointmentRepo.save(apt);
                    }
                    return apt;
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Error checkinByQrToken: {}", e.getMessage());
            return null;
        }
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        try {
            return appointmentRepo.findByPatient_Id(patientId);
        } catch (Exception e) {
            log.error("Error getAppointmentsByPatient: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Appointment> getAllAppointments() {
        try {
            return appointmentRepo.findAll();
        } catch (Exception e) {
            log.error("Error getAllAppointments: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public Appointment createAppointment(Long doctorId, Long patientId, LocalDateTime dateTime, String especialidad, String notes) {
        log.info("=== Creando cita doctorId:{}, patientId:{}, dateTime:{}, especialidad:{}, notes:{}",
                doctorId, patientId, dateTime, especialidad, notes);
        try {
            // ✅ NULL CHECKS
            if (doctorId == null || patientId == null || dateTime == null) {
                log.error("NULL: doctorId={}, patientId={}, dateTime={}", doctorId, patientId, dateTime);
                throw new IllegalArgumentException("Campos obligatorios nulos");
            }

            // ✅ DOCTOR EXISTS
            Doctor doctor = doctorRepo.findById(doctorId).orElse(null);
            if (doctor == null) {
                log.error("Doctor NO existe: id={}", doctorId);
                throw new IllegalArgumentException("Doctor no encontrado: " + doctorId);
            }
            log.info("✅ Doctor OK: {} - {}", doctor.getNombre(), doctor.getEspecialidad());

            // ✅ PACIENTE EXISTS
            User patient = userRepo.findById(patientId).orElse(null);
            if (patient == null) {
                log.error("Paciente NO existe: id={}", patientId);
                throw new IllegalArgumentException("Paciente no encontrado: " + patientId);
            }
            log.info("✅ Paciente OK: {} - rol: {}", patient.getEmail(), patient.getRole());

            // ✅ ESPECIALIDAD CHECK (opcional)
            if (especialidad != null && !especialidad.trim().isEmpty() && 
                doctor.getEspecialidad() != null && 
                !doctor.getEspecialidad().equalsIgnoreCase(especialidad.trim())) {
                log.error("Especialidad NO coincide: doctor={}, request={}", 
                        doctor.getEspecialidad(), especialidad);
                throw new IllegalArgumentException("Especialidad no coincide");
            }

            // ✅ LIMITAR HORARIO DE CITAS: solo entre 9:00 y 18:00
            int hour = dateTime.getHour();
            if (hour < 9 || hour >= 18) {
                log.error("Intento de crear cita fuera de horario permitido: {}", dateTime);
                throw new IllegalArgumentException("Las citas solo pueden agendarse entre las 09:00 y las 18:00");
            }

            // ✅ CREAR CITA
            Appointment appointment = new Appointment();
            appointment.setDoctor(doctor);
            appointment.setPatient(patient);
            appointment.setDateTime(dateTime);
            appointment.setStatus("CONFIRMED");
            appointment.setNotes(notes); // Guardar las notas

            // Generar UUID para QR único
            String qrToken = java.util.UUID.randomUUID().toString();
            // Cambia aquí la IP por la actual de tu frontend
            String qrUrl = String.format("http://192.168.0.186:3000/checkin?token=%s", qrToken);
            appointment.setQrCodeUrl(qrUrl);

            Appointment saved = appointmentRepo.save(appointment);
            log.info("✅ Cita CREADA ID: {} QR: {}", saved.getId(), saved.getQrCodeUrl());
            // Notificar a paciente y doctor
            notificationService.createNotification(
                "Nueva cita creada",
                String.format("Tu cita con el Dr. %s está agendada para %s.\nNotas: %s", doctor.getNombre(), dateTime, notes != null ? notes : "Sin notas"),
                "NEW_APPOINTMENT",
                patient
            );
            if (doctor.getUser() != null) {
                notificationService.createNotification(
                    "Nueva cita asignada",
                    String.format("Tienes una nueva cita con %s el %s.\nNotas: %s", patient.getNombre(), dateTime, notes != null ? notes : "Sin notas"),
                    "NEW_APPOINTMENT",
                    doctor.getUser()
                );
            }
            return saved;
        } catch (IllegalArgumentException e) {
            log.error("❌ createAppointment VALIDATION: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("💥 createAppointment GENERAL: {}", e.getMessage(), e);
            throw new RuntimeException("Error interno: " + e.getMessage());
        }
    }

    public ResponseEntity<Appointment> getAppointment(Long id) {
        try {
            return appointmentRepo.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getAppointment {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // 🔥 FIX DEFINITIVO - NUNCA CRASHA
    public List<Appointment> getAppointmentsByDoctorAndDateRange(Long doctorId, LocalDateTime start, LocalDateTime end) {
        log.info("🔍 getAppointmentsByDoctorAndDateRange: doctorId={}, start={}, end={}", doctorId, start, end);
        log.info("🔍 start.toString={}, end.toString={}", start.toString(), end.toString());
        log.info("🔍 start class={}, end class={}", start.getClass().getName(), end.getClass().getName());
        
        try {
            if (doctorId == null) {
                log.warn("doctorId NULL → return empty");
                return new ArrayList<>();
            }
            
            if (start == null || end == null) {
                log.warn("start/end NULL → return empty");
                return new ArrayList<>();
            }
            
            // ✅ TRY QUERY SIMPLE
            List<Appointment> appointments = appointmentRepo.findByDoctor_IdAndDateTimeBetween(doctorId, start, end);
            log.info("✅ Encontradas {} citas", appointments.size());
            for (Appointment apt : appointments) {
                log.info("Cita encontrada: id={}, doctorId={}, patientId={}, dateTime={}, status={}", 
                    apt.getId(), apt.getDoctor().getId(), apt.getPatient().getId(), apt.getDateTime(), apt.getStatus());
            }
            return appointments;
            
        } catch (Exception e) {
            log.error("💥 ERROR getAppointmentsByDoctorAndDateRange: {}", e.getMessage(), e);
            return new ArrayList<>(); // ← SIEMPRE RETORNA VACÍO
        }
    }

    public ResponseEntity<Appointment> updateAppointment(Long id, Appointment appointmentDetails) {
        try {
            return appointmentRepo.findById(id)
                    .map(appointment -> {
                        if (appointmentDetails.getDateTime() != null) {
                            appointment.setDateTime(appointmentDetails.getDateTime());
                        }
                        if (appointmentDetails.getStatus() != null) {
                            appointment.setStatus(appointmentDetails.getStatus());
                        }
                        Appointment updated = appointmentRepo.save(appointment);
                        String notes = appointment.getNotes() != null ? appointment.getNotes() : "Sin notas";
                        // Notificar si cambia el estado o la fecha
                        if (appointmentDetails.getStatus() != null) {
                            if (appointment.getPatient() != null) {
                                notificationService.createNotification(
                                    "Estado de cita actualizado",
                                    String.format("El estado de tu cita con el Dr. %s es ahora: %s.\nNotas: %s", appointment.getDoctor().getNombre(), appointment.getStatus(), notes),
                                    "UPDATE",
                                    appointment.getPatient()
                                );
                            }
                            if (appointment.getDoctor() != null && appointment.getDoctor().getUser() != null) {
                                notificationService.createNotification(
                                    "Estado de cita actualizado",
                                    String.format("El estado de la cita con %s es ahora: %s.\nNotas: %s", appointment.getPatient().getNombre(), appointment.getStatus(), notes),
                                    "UPDATE",
                                    appointment.getDoctor().getUser()
                                );
                            }
                        }
                        if (appointmentDetails.getDateTime() != null) {
                            if (appointment.getPatient() != null) {
                                notificationService.createNotification(
                                    "Cita reprogramada",
                                    String.format("Tu cita con el Dr. %s ha sido reprogramada para %s.\nNotas: %s", appointment.getDoctor().getNombre(), appointment.getDateTime(), notes),
                                    "RESCHEDULE",
                                    appointment.getPatient()
                                );
                            }
                            if (appointment.getDoctor() != null && appointment.getDoctor().getUser() != null) {
                                notificationService.createNotification(
                                    "Cita reprogramada",
                                    String.format("La cita con %s ha sido reprogramada para %s.\nNotas: %s", appointment.getPatient().getNombre(), appointment.getDateTime(), notes),
                                    "RESCHEDULE",
                                    appointment.getDoctor().getUser()
                                );
                            }
                        }
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error updateAppointment {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> deleteAppointment(Long id) {
        try {
            return appointmentRepo.findById(id)
                    .map(appointment -> {
                        String notes = appointment.getNotes() != null ? appointment.getNotes() : "Sin notas";
                        appointmentRepo.delete(appointment);
                        // Notificar a paciente y doctor
                        if (appointment.getPatient() != null) {
                            notificationService.createNotification(
                                "Cita eliminada",
                                String.format("Tu cita con el Dr. %s el %s ha sido eliminada.\nNotas: %s", appointment.getDoctor().getNombre(), appointment.getDateTime(), notes),
                                "DELETE",
                                appointment.getPatient()
                            );
                        }
                        if (appointment.getDoctor() != null && appointment.getDoctor().getUser() != null) {
                            notificationService.createNotification(
                                "Cita eliminada",
                                String.format("La cita con %s el %s ha sido eliminada.\nNotas: %s", appointment.getPatient().getNombre(), appointment.getDateTime(), notes),
                                "DELETE",
                                appointment.getDoctor().getUser()
                            );
                        }
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error deleteAppointment {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    } 
}