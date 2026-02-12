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
    @JsonBackReference
    private Doctor doctor;
    
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private User patient;
    
    @Column(name = "datetime")
    private LocalDateTime dateTime;
    
    private String status;  // PENDING, CONFIRMED, CANCELLED
    
    private String qrCodeUrl;  // Para Sprint 2
}
