package com.college.erp.students.dto;

import com.college.erp.model.Student;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;
    private String studentUid;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private Student.Gender gender;
    private String phone;
    private String email;
    private String address;
    private Long courseId;
    private String courseName;
    private Integer semester;
    private LocalDate admissionDate;
    private String photoPath;
    private String documentsPath;
    private Student.StudentStatus status;
}

