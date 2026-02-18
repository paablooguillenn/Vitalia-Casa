package com.medapp.citasmedicas.service;

import com.medapp.citasmedicas.model.AuditLog;
import com.medapp.citasmedicas.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(String userName, String action, String details) {
        AuditLog log = new AuditLog();
        log.setUserName(userName);
        log.setAction(action);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
