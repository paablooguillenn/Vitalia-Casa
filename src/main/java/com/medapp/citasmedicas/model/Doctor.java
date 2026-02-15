package com.medapp.citasmedicas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
public class Doctor {
    @Id
    @GeneratedValue
    private Long id;

    private String nombre;
    private String especialidad;
    private String telefono;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private User user;

    @OneToMany(mappedBy = "doctor")
    @JsonManagedReference
    private List<Appointment> citas;

    // Getters y setters manuales
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<Appointment> getCitas() { return citas; }
    public void setCitas(List<Appointment> citas) { this.citas = citas; }
}
