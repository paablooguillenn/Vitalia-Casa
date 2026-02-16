package com.medapp.citasmedicas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"citas"})
    private Doctor doctor;
    
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private User patient;
    
    @Column(name = "datetime")
    private LocalDateTime dateTime;
    
    private String status;  // PENDING, CONFIRMED, CANCELLED
    

    private String qrCodeUrl;  // Para Sprint 2

    @Column(name = "notes")
    private String notes;

    // Getters y setters manuales
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
