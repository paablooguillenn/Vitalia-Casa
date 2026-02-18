
package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.service.AuditLogService;
import com.medapp.citasmedicas.model.User;
import com.medapp.citasmedicas.repository.UserRepository;
import com.medapp.citasmedicas.repository.DoctorRepository;
import com.medapp.citasmedicas.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints de autenticación: login y registro")
public class AuthController {

        @Autowired
        private AuditLogService auditLogService;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private UserRepository userRepository;
    

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping("/login")
    @Operation(summary = "Login de usuario", description = "Autentica un usuario con email y password, devuelve JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso"),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    })
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            final String jwt = jwtUtil.generateToken(userDetails);

            // Buscar usuario en la base de datos
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            String rol = null;
            String nombre = null;
            if (user != null) {
                log.info("[DEBUG] user.getRole() para {}: {}", user.getEmail(), user.getRole());
                if (doctorRepository.findByUser_Id(user.getId()) != null) {
                    rol = "doctor";
                } else if (user.getRole() != null) {
                    switch (user.getRole()) {
                        case ADMIN:
                            rol = "admin";
                            break;
                        case PACIENTE:
                            rol = "patient";
                            break;
                        case DOCTOR:
                            rol = "doctor";
                            break;
                        default:
                            rol = user.getRole().name().toLowerCase();
                    }
                }
                nombre = user.getNombre();
            }

            Long id = (user != null) ? user.getId() : null;
            return ResponseEntity.ok(new AuthResponseFull(jwt, rol, id, nombre));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }
    }
    
    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", description = "Crea un nuevo usuario (PACIENTE) en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente"),
        @ApiResponse(responseCode = "409", description = "Email ya registrado")
    })
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Verifica si email ya existe
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Email ya registrado");
        }
        
        // Crea nuevo usuario
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.PACIENTE);
        if (request.getNombre() != null && !request.getNombre().isEmpty()) {
            user.setNombre(request.getNombre());
        }
        
        if (request.getTelefono() != null && !request.getTelefono().isEmpty()) {
            user.setTelefono(request.getTelefono());
        }
        userRepository.save(user);
        // Log de registro
        auditLogService.log(user.getEmail(), "REGISTER", "Registro de nuevo usuario");
        return ResponseEntity.status(HttpStatus.CREATED)
            .body("Usuario creado exitosamente. Usa /login para obtener JWT");
    }
}

class RegisterRequest {
    private String email;
    private String password;
    private String nombre;
    private String telefono;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}

class AuthRequest {
    private String email;
    private String password;
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}


class AuthResponse {
    private String jwt;

    public AuthResponse(String jwt) { this.jwt = jwt; }

    public String getJwt() { return jwt; }
    public void setJwt(String jwt) { this.jwt = jwt; }
}


class AuthResponseFull {
    private String jwt;
    private String rol;
    private Long id;
    private String nombre;

    public AuthResponseFull(String jwt, String rol, Long id, String nombre) {
        this.jwt = jwt;
        this.rol = rol;
        this.id = id;
        this.nombre = nombre;
    }

    public String getJwt() { return jwt; }
    public void setJwt(String jwt) { this.jwt = jwt; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
