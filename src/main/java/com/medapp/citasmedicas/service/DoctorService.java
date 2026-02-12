package com.medapp.citasmedicas.service;

import com.medapp.citasmedicas.model.Doctor;
import com.medapp.citasmedicas.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepo;

    public List<Doctor> getAllDoctors() {
        return doctorRepo.findAll();
    }

    @SuppressWarnings("null")
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepo.save(doctor);
    }

    public List<Doctor> getDoctorsByEspecialidad(String especialidad) {
        return doctorRepo.findByEspecialidad(especialidad);
    }
}
