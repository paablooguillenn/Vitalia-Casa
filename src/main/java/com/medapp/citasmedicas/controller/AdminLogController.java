package com.medapp.citasmedicas.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import com.medapp.citasmedicas.repository.AuditLogRepository;
import com.medapp.citasmedicas.model.AuditLog;
import java.util.*;

@RestController
@RequestMapping("/api/admin/logs")
public class AdminLogController {
    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getLogs() {
        List<AuditLog> logList = auditLogRepository.findAll();
        // Ordenar por timestamp descendente (más reciente primero) y luego invertir por si acaso
        logList.sort((a, b) -> {
            if (a.getTimestamp() == null && b.getTimestamp() == null) return 0;
            if (a.getTimestamp() == null) return 1;
            if (b.getTimestamp() == null) return -1;
            return b.getTimestamp().compareTo(a.getTimestamp());
        });
        Collections.reverse(logList);
        List<Map<String, Object>> logs = new ArrayList<>();
        for (AuditLog log : logList) {
            Map<String, Object> l = new HashMap<>();
            l.put("id", log.getId());
            l.put("userName", log.getUserName());
            l.put("action", log.getAction());
            l.put("details", log.getDetails());
            l.put("timestamp", log.getTimestamp());
            logs.add(l);
        }
        return ResponseEntity.ok(logs);
    }
}