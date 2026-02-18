package com.medapp.citasmedicas.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import com.medapp.citasmedicas.repository.UserRepository;
import com.medapp.citasmedicas.repository.DoctorRepository;
import com.medapp.citasmedicas.repository.AppointmentRepository;
import com.medapp.citasmedicas.model.User;
import com.medapp.citasmedicas.model.Doctor;
import com.medapp.citasmedicas.model.Appointment;
import java.util.*;
import java.time.format.TextStyle;
import java.time.Month;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.Locale;

@RestController
@RequestMapping("/api/admin/statistics")
public class AdminStatisticsController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        // Total de usuarios
        stats.put("totalUsers", userRepository.count());
        // Total de citas
        stats.put("totalAppointments", appointmentRepository.count());
        // Doctores activos
        stats.put("activeDoctors", doctorRepository.count());
        // Ingresos simulados (ejemplo: 100 por cita)
        stats.put("revenue", appointmentRepository.count() * 100);

        // Citas por mes (últimos 12 meses)
        List<Appointment> allAppointments = appointmentRepository.findAll();
        Map<Integer, Long> monthCounts = allAppointments.stream()
            .filter(a -> a.getDateTime() != null)
            .collect(Collectors.groupingBy(a -> a.getDateTime().getMonthValue(), Collectors.counting()));
        List<Map<String, Object>> appointmentsPerMonth = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String monthName = Month.of(m).getDisplayName(TextStyle.FULL, new Locale("es"));
            long count = monthCounts.getOrDefault(m, 0L);
            appointmentsPerMonth.add(Map.of("month", monthName, "count", count));
        }
        stats.put("appointmentsPerMonth", appointmentsPerMonth);

        // Citas por especialidad
        Map<String, Long> citasPorEspecialidad = allAppointments.stream()
            .filter(a -> a.getDoctor() != null && a.getDoctor().getEspecialidad() != null)
            .collect(Collectors.groupingBy(
                a -> a.getDoctor().getEspecialidad(),
                Collectors.counting()
            ));
        List<Map<String, Object>> citasPorEspecialidadList = citasPorEspecialidad.entrySet().stream()
            .map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("especialidad", e.getKey());
                m.put("count", e.getValue());
                return m;
            })
            .collect(Collectors.toList());
        stats.put("citasPorEspecialidad", citasPorEspecialidadList);

        return ResponseEntity.ok(stats);
    }
}