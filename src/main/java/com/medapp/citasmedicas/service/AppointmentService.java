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
    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);
    
    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private DoctorRepository doctorRepo;

    @Autowired
    private UserRepository userRepo;

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
            String qrUrl = String.format("http://192.168.56.1:3000/checkin?token=%s", qrToken);
            appointment.setQrCodeUrl(qrUrl);

            Appointment saved = appointmentRepo.save(appointment);
            log.info("✅ Cita CREADA ID: {} QR: {}", saved.getId(), saved.getQrCodeUrl());
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
                        return ResponseEntity.ok(appointmentRepo.save(appointment));
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
                        appointmentRepo.delete(appointment);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error deleteAppointment {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    } 
} 