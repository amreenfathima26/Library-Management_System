package com.college.erp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_uid", unique = true, nullable = false, length = 20)
    private String studentUid;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(nullable = false)
    private LocalDate dob;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;
    
    @Column(nullable = false, length = 15)
    private String phone;
    
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    // Optional: Direct reference to user login account
    // This provides better mapping between student and their login credentials
    // If user_id is NULL, the system will match by email/username
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore
    private User user;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;
    
    @Column(nullable = false)
    private Integer semester;
    
    @Column(name = "admission_date", nullable = false)
    private LocalDate admissionDate;
    
    @Column(name = "photo_path", length = 500)
    private String photoPath;
    
    @Column(name = "documents_path", columnDefinition = "JSON")
    private String documentsPath;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StudentStatus status = StudentStatus.PENDING;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Gender {
        MALE, FEMALE, OTHER
    }
    
    public enum StudentStatus {
        PENDING, ACTIVE, GRADUATED, LEFT, REJECTED
    }
}

