package com.college.erp.repository;

import com.college.erp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    @Query("SELECT s FROM Student s JOIN FETCH s.course WHERE s.studentUid = :studentUid")
    Optional<Student> findByStudentUid(@Param("studentUid") String studentUid);
    
    Optional<Student> findByEmail(String email);
    
    @Query("SELECT s FROM Student s JOIN FETCH s.course WHERE s.course.id = :courseId")
    List<Student> findByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT s FROM Student s JOIN FETCH s.course WHERE s.semester = :semester")
    List<Student> findBySemester(@Param("semester") Integer semester);
    
    @Query("SELECT s FROM Student s JOIN FETCH s.course WHERE s.status = :status")
    List<Student> findByStatus(@Param("status") Student.StudentStatus status);
    
    @Query("SELECT s FROM Student s JOIN FETCH s.course WHERE s.course.id = :courseId AND s.semester = :semester")
    List<Student> findByCourseAndSemester(@Param("courseId") Long courseId, @Param("semester") Integer semester);
    
    @Query("SELECT s FROM Student s JOIN FETCH s.course WHERE s.course.id = :courseId AND s.semester = :semester AND s.status = :status")
    List<Student> findByCourseSemesterAndStatus(
            @Param("courseId") Long courseId, 
            @Param("semester") Integer semester,
            @Param("status") Student.StudentStatus status
    );
    
    @Query("SELECT s FROM Student s JOIN FETCH s.course WHERE s.id = :id")
    Optional<Student> findByIdWithCourse(@Param("id") Long id);
    
    @Query("SELECT DISTINCT s FROM Student s JOIN FETCH s.course")
    List<Student> findAllWithCourse();
}

