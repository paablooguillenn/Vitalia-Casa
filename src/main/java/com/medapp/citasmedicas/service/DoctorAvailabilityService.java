package com.medapp.citasmedicas.service;

import com.medapp.citasmedicas.model.DoctorAvailability;
import com.medapp.citasmedicas.repository.DoctorAvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DoctorAvailabilityService {
    @Autowired
    private DoctorAvailabilityRepository repository;

    public List<DoctorAvailability> getByDoctor(Long doctorId) {
        return repository.findByDoctor_Id(doctorId);
    }

    public DoctorAvailability getByDoctorAndDay(Long doctorId, int dayOfWeek) {
        return repository.findByDoctor_IdAndDayOfWeek(doctorId, dayOfWeek);
    }

    public DoctorAvailability save(DoctorAvailability availability) {
        return repository.save(availability);
    }

    public List<DoctorAvailability> saveAll(List<DoctorAvailability> availabilities) {
        return repository.saveAll(availabilities);
    }
}
