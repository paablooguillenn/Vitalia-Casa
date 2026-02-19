package com.medapp.citasmedicas.controller;

import com.medapp.citasmedicas.model.DoctorAvailability;
import com.medapp.citasmedicas.service.DoctorAvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctor-availability")
@CrossOrigin(origins = "*")
public class DoctorAvailabilityController {
    @Autowired
    private DoctorAvailabilityService service;

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorAvailability>> getAvailability(@PathVariable Long doctorId) {
        return ResponseEntity.ok(service.getByDoctor(doctorId));
    }

    @PostMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorAvailability>> saveAvailability(@PathVariable Long doctorId, @RequestBody List<DoctorAvailability> availabilities) {
        // For simplicity, assume the frontend sends all 7 days for the doctor
        for (DoctorAvailability a : availabilities) {
            a.setDoctor(new com.medapp.citasmedicas.model.Doctor());
            a.getDoctor().setId(doctorId);
        }
        return ResponseEntity.ok(service.saveAll(availabilities));
    }
}
