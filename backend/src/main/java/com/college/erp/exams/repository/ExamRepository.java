package com.college.erp.exams.repository;

import com.college.erp.exams.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByStudentId(Long studentId);
    List<Exam> findByCourseId(Long courseId);
    
    @Query("SELECT e FROM Exam e WHERE e.student.id = :studentId AND e.course.id = :courseId")
    List<Exam> findByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
    
    @Query("SELECT e FROM Exam e WHERE e.course.id = :courseId AND e.student.semester = :semester")
    List<Exam> findByCourseAndSemester(@Param("courseId") Long courseId, @Param("semester") Integer semester);
}

