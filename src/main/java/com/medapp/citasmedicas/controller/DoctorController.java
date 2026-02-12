package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.model.Doctor;
import com.medapp.citasmedicas.service.DoctorService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @PostMapping
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.createDoctor(doctor);
    }

    @GetMapping("/especialidad/{especialidad}")
    public List<Doctor> getDoctorsByEspecialidad(@PathVariable String especialidad) {
        return doctorService.getDoctorsByEspecialidad(especialidad);
    }
}
