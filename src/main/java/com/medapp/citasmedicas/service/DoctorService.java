
package com.medapp.citasmedicas.service;

import com.medapp.citasmedicas.model.Doctor;
import com.medapp.citasmedicas.model.User;
import com.medapp.citasmedicas.repository.DoctorRepository;
import com.medapp.citasmedicas.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Service
public class DoctorService {
    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepo.findByUser_Id(userId);
    }
    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);
    @Autowired
    private DoctorRepository doctorRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Doctor> getAllDoctors() {
        return doctorRepo.findAll();
    }

    /**
     * Crea un doctor y su usuario asociado (rol DOCTOR).
     * El objeto Doctor recibido debe tener el campo user con email, passwordHash y nombre.
     */
    @SuppressWarnings("null")
    public Doctor createDoctor(Doctor doctor) {
        log.info("Intentando crear doctor: {}", doctor.getNombre());
        if (doctor.getUser() == null) {
            log.error("El usuario asociado al doctor no puede ser nulo");
            throw new IllegalArgumentException("El usuario asociado al doctor no puede ser nulo");
        }
        User user = doctor.getUser();
        log.info("Datos del usuario: email={}, nombre={}", user.getEmail(), user.getNombre());
        // Verifica si el email ya existe
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            log.error("El email ya está registrado: {}", user.getEmail());
            throw new IllegalArgumentException("El email ya está registrado");
        }
        user.setRole(User.Role.DOCTOR);
        // Encripta la contraseña si no está encriptada
        if (user.getPasswordHash() != null && !user.getPasswordHash().startsWith("$2a$")) {
            log.info("Encriptando contraseña para usuario {}", user.getEmail());
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        User savedUser = userRepo.save(user);
        log.info("Usuario guardado con id {}", savedUser.getId());
        doctor.setUser(savedUser);
        Doctor savedDoctor = doctorRepo.save(doctor);
        log.info("Doctor guardado con id {}", savedDoctor.getId());
        return savedDoctor;
    }

    public List<Doctor> getDoctorsByEspecialidad(String especialidad) {
        return doctorRepo.findByEspecialidad(especialidad);
    }

    /**
     * Devuelve una lista de todas las especialidades únicas de los doctores.
     */
    public List<String> getAllSpecialties() {
        return doctorRepo.findAllDistinctEspecialidad();
    }
}
