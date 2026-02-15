package com.medapp.citasmedicas.repository;

import com.medapp.citasmedicas.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByEspecialidad(String especialidad);
    Doctor findByUser_Id(Long userId);

    @Query("SELECT DISTINCT d.especialidad FROM Doctor d")
    List<String> findAllDistinctEspecialidad();
}
