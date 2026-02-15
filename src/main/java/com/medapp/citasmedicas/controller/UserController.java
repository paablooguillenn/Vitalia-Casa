package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.model.User;
import com.medapp.citasmedicas.repository.UserRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    // Endpoint para subir foto de perfil
    @PostMapping(value = "/{id}/profile-picture", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        try {
            // Guardar archivo en disco
            String uploadDir = "profile_pictures/";
            java.nio.file.Files.createDirectories(java.nio.file.Paths.get(uploadDir));
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir, filename);
            java.nio.file.Files.write(filePath, file.getBytes());
            // Actualizar URL en usuario
            user.setProfilePictureUrl(filePath.toString());
            userRepo.save(user);
            return ResponseEntity.ok("Foto de perfil actualizada");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al subir la foto");
        }
    }

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private com.medapp.citasmedicas.repository.AppointmentRepository appointmentRepo;

    @Autowired
    private com.medapp.citasmedicas.repository.DoctorRepository doctorRepo;

    /**
     * Endpoint para obtener el historial de citas de un paciente.
     * Accesible por cualquier usuario autenticado.
     */
    @GetMapping("/{id}/appointments")
    public ResponseEntity<List<com.medapp.citasmedicas.model.Appointment>> getPatientAppointments(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        List<com.medapp.citasmedicas.model.Appointment> appointments;
        if (user.getRole() == User.Role.DOCTOR) {
            com.medapp.citasmedicas.model.Doctor doctor = doctorRepo.findByUser_Id(id);
            if (doctor == null) {
                appointments = List.of();
            } else {
                appointments = appointmentRepo.findByDoctor_Id(doctor.getId());
            }
        } else {
            appointments = appointmentRepo.findByPatient_Id(id);
        }
        return ResponseEntity.ok(appointments);
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // Codifica la contraseña si viene en texto plano
        if (user.getPasswordHash() != null && !user.getPasswordHash().startsWith("$2a$")) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        // Por defecto, el rol será PACIENTE si no se especifica
        if (user.getRole() == null) {
            user.setRole(User.Role.PACIENTE);
        }
        User savedUser = userRepo.save(user);
        return ResponseEntity.ok(savedUser);
    }


    /**
     * Permite obtener el perfil de un usuario solo si es el propio usuario autenticado o un admin.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        // Si es admin, puede ver cualquier perfil
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.ok(user);
        }
        // Si el usuario autenticado es el mismo que el solicitado
        String email = authentication.getName();
        if (user.getEmail().equals(email)) {
            return ResponseEntity.ok(user);
        }
        // Si no, denegar acceso
        return ResponseEntity.status(403).build();
    }

    /**
     * Permite actualizar el perfil de un usuario solo si es el propio usuario autenticado o un admin.
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userUpdate, Authentication authentication) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        // Si es admin, puede actualizar cualquier perfil
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            user.setNombre(userUpdate.getNombre());
            // Puedes añadir aquí más campos editables si lo deseas
            userRepo.save(user);
            return ResponseEntity.ok(user);
        }
        // Si el usuario autenticado es el mismo que el solicitado
        String email = authentication.getName();
        if (user.getEmail().equals(email)) {
            user.setNombre(userUpdate.getNombre());
            // Puedes añadir aquí más campos editables si lo deseas
            userRepo.save(user);
            return ResponseEntity.ok(user);
        }
        // Si no, denegar acceso
        return ResponseEntity.status(403).build();
    }
}
