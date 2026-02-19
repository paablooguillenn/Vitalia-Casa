package com.medapp.citasmedicas.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "doctor_availability")
public class DoctorAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    // 0=Domingo, 1=Lunes, ... 6=Sabado
    @Column(nullable = false)
    private int dayOfWeek;

    @Column(nullable = false)
    private boolean morningEnabled;

    @Column(nullable = false)
    private boolean afternoonEnabled;
}
