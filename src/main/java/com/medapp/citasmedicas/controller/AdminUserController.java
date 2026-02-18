package com.medapp.citasmedicas.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import com.medapp.citasmedicas.repository.UserRepository;
import com.medapp.citasmedicas.model.User;
import java.util.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        List<User> userList = userRepository.findAll();
        List<Map<String, Object>> users = new ArrayList<>();
        for (User user : userList) {
            Map<String, Object> u = new HashMap<>();
            u.put("id", user.getId());
            // El frontend espera 'name', pero en modelo es 'nombre'
            u.put("name", user.getNombre() != null ? user.getNombre() : user.getEmail());
            u.put("email", user.getEmail());
            // Mapear roles a minúsculas en inglés
            String role = "patient";
            if (user.getRole() != null) {
                switch (user.getRole()) {
                    case ADMIN: role = "admin"; break;
                    case DOCTOR: role = "doctor"; break;
                    case PACIENTE: role = "patient"; break;
                }
            }
            u.put("role", role);
            users.add(u);
        }
        return ResponseEntity.ok(users);
    }
}