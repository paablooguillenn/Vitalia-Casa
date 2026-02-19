package com.medapp.citasmedicas.repository;

import com.medapp.citasmedicas.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    List<DoctorAvailability> findByDoctor_Id(Long doctorId);
    DoctorAvailability findByDoctor_IdAndDayOfWeek(Long doctorId, int dayOfWeek);
}
