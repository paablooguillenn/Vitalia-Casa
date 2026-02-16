
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
    // DTO para exponer usuarios con rol en inglés/minúsculas
    public static class UserDTO {
        private Long id;
        private String email;
        private String nombre;
        private String role;
        private String profilePictureUrl;

        public UserDTO(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.nombre = user.getNombre();
            this.profilePictureUrl = user.getProfilePictureUrl();
            if (user.getRole() != null) {
                switch (user.getRole()) {
                    case ADMIN: this.role = "admin"; break;
                    case PACIENTE: this.role = "patient"; break;
                    case DOCTOR: this.role = "doctor"; break;
                    default: this.role = user.getRole().name().toLowerCase();
                }
            }
        }
        // Getters y setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getProfilePictureUrl() { return profilePictureUrl; }
        public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    }
        private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserController.class);
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
    public ResponseEntity<List<com.medapp.citasmedicas.dto.AppointmentDTO>> getPatientAppointments(@PathVariable Long id) {
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
        // LOG: Mostrar información de cada cita y su doctor
        log.info("=== LOG citas para user_id={} ===", id);
        for (com.medapp.citasmedicas.model.Appointment apt : appointments) {
            log.info("Cita id={}, doctor={}, paciente={}, fecha={}, status={}",
                apt.getId(),
                (apt.getDoctor() != null ? (apt.getDoctor().getId() + " - " + apt.getDoctor().getNombre()) : "null"),
                (apt.getPatient() != null ? (apt.getPatient().getId() + " - " + apt.getPatient().getNombre()) : "null"),
                apt.getDateTime(),
                apt.getStatus()
            );
        }
        List<com.medapp.citasmedicas.dto.AppointmentDTO> dtos = appointments.stream().map(apt ->
            new com.medapp.citasmedicas.dto.AppointmentDTO(
                apt.getId(),
                apt.getDoctor() != null ? new com.medapp.citasmedicas.dto.AppointmentDTO.DoctorDTO(
                    apt.getDoctor().getId(),
                    apt.getDoctor().getNombre(),
                    apt.getDoctor().getEspecialidad()
                ) : null,
                apt.getPatient() != null ? new com.medapp.citasmedicas.dto.AppointmentDTO.UserDTO(
                    apt.getPatient().getId(),
                    apt.getPatient().getNombre()
                ) : null,
                apt.getDateTime(),
                apt.getStatus(),
                apt.getQrCodeUrl(),
                apt.getNotes()
            )
        ).toList();
        return ResponseEntity.ok(dtos);
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO> getAllUsers() {
        return userRepo.findAll().stream().map(UserDTO::new).toList();
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
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        // Si es admin, puede ver cualquier perfil
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.ok(new UserDTO(user));
        }
        // Si el usuario autenticado es el mismo que el solicitado
        String email = authentication.getName();
        if (user.getEmail().equals(email)) {
            return ResponseEntity.ok(new UserDTO(user));
        }
        // Si no, denegar acceso
        return ResponseEntity.status(403).build();
    }

    /**
     * Permite actualizar el perfil de un usuario solo si es el propio usuario autenticado o un admin.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody User userUpdate, Authentication authentication) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        // Si es admin, puede actualizar cualquier perfil
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            user.setNombre(userUpdate.getNombre());
            // Puedes añadir aquí más campos editables si lo deseas
            userRepo.save(user);
            return ResponseEntity.ok(new UserDTO(user));
        }
        // Si el usuario autenticado es el mismo que el solicitado
        String email = authentication.getName();
        if (user.getEmail().equals(email)) {
            user.setNombre(userUpdate.getNombre());
            // Puedes añadir aquí más campos editables si lo deseas
            userRepo.save(user);
            return ResponseEntity.ok(new UserDTO(user));
        }
        // Si no, denegar acceso
        return ResponseEntity.status(403).build();
    }
}
