package com.medapp.citasmedicas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "files")
public class FileAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(nullable = false)
    private String url; // Ruta o URL del archivo

    @Column(nullable = false)
    private String type; // Tipo de archivo: receta, informe, etc.

    @Column(nullable = false)
    private String filename; // Nombre original del archivo

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters y setters manuales
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
