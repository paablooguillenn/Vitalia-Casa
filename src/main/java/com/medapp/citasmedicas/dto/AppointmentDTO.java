package com.medapp.citasmedicas.dto;

import java.time.LocalDateTime;

public class AppointmentDTO {
    public Long id;
    public DoctorDTO doctor;
    public UserDTO patient;
    public LocalDateTime dateTime;
    public String status;
    public String qrCodeUrl;
    public String notes;

    public AppointmentDTO(Long id, DoctorDTO doctor, UserDTO patient, LocalDateTime dateTime, String status, String qrCodeUrl, String notes) {
        this.id = id;
        this.doctor = doctor;
        this.patient = patient;
        this.dateTime = dateTime;
        this.status = status;
        this.qrCodeUrl = qrCodeUrl;
        this.notes = notes;
    }

    public static class DoctorDTO {
        public Long id;
        public String nombre;
        public String especialidad;
        public DoctorDTO(Long id, String nombre, String especialidad) {
            this.id = id;
            this.nombre = nombre;
            this.especialidad = especialidad;
        }
    }

    public static class UserDTO {
        public Long id;
        public String nombre;
        public UserDTO(Long id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }
    }
}
