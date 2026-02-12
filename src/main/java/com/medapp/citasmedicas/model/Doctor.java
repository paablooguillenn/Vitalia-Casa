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
    
    @OneToMany(mappedBy = "doctor")
    @JsonManagedReference
    private List<Appointment> citas;
}
