package com.college.erp.exams.repository;

import com.college.erp.exams.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByCourseId(Long courseId);
    
    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND a.course.id = :courseId AND a.date BETWEEN :startDate AND :endDate")
    List<Attendance> findByStudentAndCourseAndDateRange(
            @Param("studentId") Long studentId,
            @Param("courseId") Long courseId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

