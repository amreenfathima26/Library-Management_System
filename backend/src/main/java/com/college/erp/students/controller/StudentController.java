package com.college.erp.students.controller;

import com.college.erp.students.dto.StudentCreateRequest;
import com.college.erp.students.dto.StudentDTO;
import com.college.erp.students.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS')")
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody StudentCreateRequest request) {
        StudentDTO student = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(student);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS', 'ACCOUNTS', 'HOSTEL_WARDEN', 'LIBRARIAN', 'EXAM_CELL')")
    public ResponseEntity<List<StudentDTO>> getAllStudents(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String status) {
        List<StudentDTO> students = studentService.getAllStudents(courseId, semester, status);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS', 'ACCOUNTS', 'HOSTEL_WARDEN', 'LIBRARIAN', 'EXAM_CELL', 'STUDENT')")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        StudentDTO student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    @GetMapping("/uid/{studentUid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS', 'ACCOUNTS', 'HOSTEL_WARDEN', 'LIBRARIAN', 'EXAM_CELL', 'STUDENT')")
    public ResponseEntity<StudentDTO> getStudentByUid(@PathVariable String studentUid) {
        StudentDTO student = studentService.getStudentByUid(studentUid);
        return ResponseEntity.ok(student);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> getMyProfile() {
        // Get username from SecurityContext (set by JwtAuthFilter)
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        // For students, username is their student UID
        StudentDTO student = studentService.getStudentByUid(username);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS')")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentCreateRequest request) {
        StudentDTO student = studentService.updateStudent(id, request);
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS')")
    public ResponseEntity<StudentDTO> uploadStudentPhoto(
            @PathVariable Long id,
            @RequestParam("photoPath") String photoPath) {
        StudentDTO student = studentService.updateStudentPhoto(id, photoPath);
        return ResponseEntity.ok(student);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS')")
    public ResponseEntity<StudentDTO> approveStudent(@PathVariable Long id) {
        StudentDTO student = studentService.approveStudent(id);
        return ResponseEntity.ok(student);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS')")
    public ResponseEntity<StudentDTO> rejectStudent(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        StudentDTO student = studentService.rejectStudent(id, reason);
        return ResponseEntity.ok(student);
    }
}

