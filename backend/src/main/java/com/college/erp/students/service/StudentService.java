package com.college.erp.students.service;

import com.college.erp.model.Course;
import com.college.erp.model.Student;
import com.college.erp.model.User;
import com.college.erp.repository.CourseRepository;
import com.college.erp.repository.StudentRepository;
import com.college.erp.repository.UserRepository;
import com.college.erp.students.dto.StudentCreateRequest;
import com.college.erp.students.dto.StudentDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public StudentDTO createStudent(StudentCreateRequest request) {
        // Check if email already exists
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Student with email " + request.getEmail() + " already exists");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Generate Student UID based on admission year
        String studentUid = generateStudentUid(request.getAdmissionDate());

        Student student = Student.builder()
                .studentUid(studentUid)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dob(request.getDob())
                .gender(Student.Gender.valueOf(request.getGender().toUpperCase()))
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .course(course)
                .semester(request.getSemester())
                .admissionDate(request.getAdmissionDate())
                .status(Student.StudentStatus.PENDING) // New students start as PENDING for approval
                .build();

        student = studentRepository.save(student);
        
        // Auto-create STUDENT login account when student is created
        // This ensures every student has login credentials for the student portal
        try {
            // Check if user already exists by email or username
            boolean emailExists = userRepository.existsByEmail(student.getEmail());
            boolean usernameExists = userRepository.existsByUsername(student.getStudentUid());
            
            if (!emailExists && !usernameExists) {
                // Create user account with Student UID as username and password
                User studentUser = User.builder()
                        .username(student.getStudentUid()) // Username = Student UID (e.g., STU20250001)
                        .email(student.getEmail())
                        .passwordHash(passwordEncoder.encode(student.getStudentUid())) // Default password = Student UID
                        .role(User.UserRole.STUDENT)
                        .status(User.UserStatus.ACTIVE) // Active by default, can be disabled if student is rejected
                        .build();
                
                User savedUser = userRepository.save(studentUser);
                
                // Link student to user account (if user_id column exists in database)
                try {
                    student.setUser(savedUser);
                    studentRepository.save(student);
                } catch (Exception e) {
                    // If user_id column doesn't exist, that's okay - we can match by email/username
                    System.out.println("ℹ️ Note: user_id column may not exist. Using email/username matching.");
                }
                
                System.out.println("✅ Student login created successfully:");
                System.out.println("   Username: " + savedUser.getUsername());
                System.out.println("   Password: " + student.getStudentUid() + " (Student UID)");
                System.out.println("   User ID: " + savedUser.getId());
                System.out.println("   Student can now login to Student Portal");
            } else {
                if (emailExists) {
                    System.out.println("⚠️ User with email " + student.getEmail() + " already exists. Skipping login creation.");
                }
                if (usernameExists) {
                    System.out.println("⚠️ User with username " + student.getStudentUid() + " already exists. Skipping login creation.");
                }
            }
        } catch (Exception e) {
            // Log error but don't fail student creation
            // In production, use proper logging framework (SLF4J/Logback)
            System.err.println("❌ Failed to create student login for " + student.getStudentUid() + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return mapToDTO(student);
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents(Long courseId, Integer semester, String status) {
        List<Student> students;

        if (courseId != null && semester != null) {
            if (status != null) {
                students = studentRepository.findByCourseSemesterAndStatus(
                        courseId, semester, Student.StudentStatus.valueOf(status.toUpperCase()));
            } else {
                students = studentRepository.findByCourseAndSemester(courseId, semester);
            }
        } else if (courseId != null) {
            students = studentRepository.findByCourseId(courseId);
        } else if (semester != null) {
            students = studentRepository.findBySemester(semester);
        } else if (status != null) {
            students = studentRepository.findByStatus(Student.StudentStatus.valueOf(status.toUpperCase()));
        } else {
            // Use JOIN FETCH query to eagerly load courses
            students = studentRepository.findAllWithCourse();
        }

        return students.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        // Use JOIN FETCH query to eagerly load course
        Student student = studentRepository.findByIdWithCourse(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return mapToDTO(student);
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentByUid(String studentUid) {
        // Use JOIN FETCH query to eagerly load course
        Student student = studentRepository.findByStudentUid(studentUid)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return mapToDTO(student);
    }

    @Transactional
    public StudentDTO updateStudent(Long id, StudentCreateRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String oldEmail = student.getEmail();
        String oldStudentUid = student.getStudentUid();

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setDob(request.getDob());
        student.setGender(Student.Gender.valueOf(request.getGender().toUpperCase()));
        student.setPhone(request.getPhone());
        student.setEmail(request.getEmail());
        student.setAddress(request.getAddress());
        student.setCourse(course);
        student.setSemester(request.getSemester());
        student.setAdmissionDate(request.getAdmissionDate());

        final Student savedStudent = studentRepository.save(student);
        
        // Sync user account if email or student UID changed
        try {
            final String newEmail = request.getEmail();
            final String newStudentUid = savedStudent.getStudentUid();
            
            userRepository.findByUsername(oldStudentUid).ifPresent(user -> {
                boolean needsUpdate = false;
                
                // Update email if changed
                if (!oldEmail.equals(newEmail) && !userRepository.existsByEmail(newEmail)) {
                    user.setEmail(newEmail);
                    needsUpdate = true;
                }
                
                // Update username if student UID changed (rare case)
                if (!oldStudentUid.equals(newStudentUid) && !userRepository.existsByUsername(newStudentUid)) {
                    user.setUsername(newStudentUid);
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    userRepository.save(user);
                    System.out.println("✅ Student login updated for: " + newStudentUid);
                }
            });
        } catch (Exception e) {
            System.err.println("⚠️ Failed to sync student login update: " + e.getMessage());
        }
        
        return mapToDTO(savedStudent);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setStatus(Student.StudentStatus.LEFT);
        studentRepository.save(student);
    }

    @Transactional
    public StudentDTO updateStudentPhoto(Long id, String photoPath) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setPhotoPath(photoPath);
        student = studentRepository.save(student);
        return mapToDTO(student);
    }

    @Transactional
    public StudentDTO addStudentDocument(Long id, String documentPath, String documentType) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Parse existing documents JSON or create new
        String existingDocs = student.getDocumentsPath();
        Map<String, String> documents = new HashMap<>();
        
        if (existingDocs != null && !existingDocs.isEmpty()) {
            try {
                // Simple JSON parsing - assuming format: {"type1":"path1","type2":"path2"}
                documents = parseDocumentsJson(existingDocs);
            } catch (Exception e) {
                // If parsing fails, start fresh
                documents = new HashMap<>();
            }
        }
        
        // Add or update document
        documents.put(documentType, documentPath);
        
        // Convert back to JSON string
        student.setDocumentsPath(convertDocumentsToJson(documents));
        student = studentRepository.save(student);
        return mapToDTO(student);
    }

    @Transactional
    public StudentDTO approveStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (student.getStatus() != Student.StudentStatus.PENDING) {
            throw new RuntimeException("Only PENDING students can be approved");
        }
        
        student.setStatus(Student.StudentStatus.ACTIVE);
        final Student savedStudent = studentRepository.save(student);
        final String studentUid = savedStudent.getStudentUid();
        final String studentEmail = savedStudent.getEmail();
        
        // Ensure student login account exists and is active
        try {
            userRepository.findByUsername(studentUid).ifPresentOrElse(
                user -> {
                    // Activate user account if it was disabled
                    if (user.getStatus() != User.UserStatus.ACTIVE) {
                        user.setStatus(User.UserStatus.ACTIVE);
                        userRepository.save(user);
                        System.out.println("✅ Student login activated for: " + studentUid);
                    }
                },
                () -> {
                    // Create login account if it doesn't exist (shouldn't happen, but safety check)
                    if (!userRepository.existsByEmail(studentEmail)) {
                        User studentUser = User.builder()
                                .username(studentUid)
                                .email(studentEmail)
                                .passwordHash(passwordEncoder.encode(studentUid))
                                .role(User.UserRole.STUDENT)
                                .status(User.UserStatus.ACTIVE)
                                .build();
                        userRepository.save(studentUser);
                        System.out.println("✅ Student login created during approval: " + studentUid);
                    }
                }
            );
        } catch (Exception e) {
            System.err.println("⚠️ Failed to ensure student login during approval: " + e.getMessage());
        }
        
        return mapToDTO(savedStudent);
    }

    @Transactional
    public StudentDTO rejectStudent(Long id, String reason) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (student.getStatus() != Student.StudentStatus.PENDING) {
            throw new RuntimeException("Only PENDING students can be rejected");
        }
        
        student.setStatus(Student.StudentStatus.REJECTED);
        final Student savedStudent = studentRepository.save(student);
        final String studentUid = savedStudent.getStudentUid();
        
        // Disable student login account when rejected
        try {
            userRepository.findByUsername(studentUid).ifPresent(user -> {
                user.setStatus(User.UserStatus.DISABLED);
                userRepository.save(user);
                System.out.println("🔒 Student login disabled due to rejection: " + studentUid);
            });
        } catch (Exception e) {
            System.err.println("⚠️ Failed to disable student login during rejection: " + e.getMessage());
        }
        
        return mapToDTO(savedStudent);
    }

    private Map<String, String> parseDocumentsJson(String json) {
        Map<String, String> documents = new HashMap<>();
        if (json == null || json.trim().isEmpty() || json.equals("{}")) {
            return documents;
        }
        try {
            // Use Jackson ObjectMapper for proper JSON parsing with type safety
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (JsonProcessingException e) {
            // If parsing fails, return empty map
            System.err.println("⚠️ Failed to parse documents JSON: " + e.getMessage());
            return documents;
        }
    }

    private String convertDocumentsToJson(Map<String, String> documents) {
        try {
            // Use Jackson ObjectMapper for proper JSON serialization
            // This handles escaping of special characters (backslashes, quotes, etc.)
            return objectMapper.writeValueAsString(documents);
        } catch (JsonProcessingException e) {
            // Fallback to empty JSON if serialization fails
            System.err.println("⚠️ Failed to convert documents to JSON: " + e.getMessage());
            return "{}";
        }
    }

    private String generateStudentUid(LocalDate admissionDate) {
        // Extract year from admission date (student's joining year)
        int admissionYear = admissionDate.getYear();
        String year = String.valueOf(admissionYear);
        String prefix = "STU" + year;
        
        // Find the last student UID for this admission year
        List<Student> students = studentRepository.findAll();
        int maxSeq = 0;
        
        for (Student s : students) {
            if (s.getStudentUid() != null && s.getStudentUid().startsWith(prefix)) {
                try {
                    // Extract sequence number from UID (format: STU20250001 -> 0001)
                    int seq = Integer.parseInt(s.getStudentUid().substring(7));
                    if (seq > maxSeq) {
                        maxSeq = seq;
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid UIDs
                }
            }
        }
        
        int nextSeq = maxSeq + 1;
        return prefix + String.format("%04d", nextSeq);
    }

    private StudentDTO mapToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .studentUid(student.getStudentUid())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .dob(student.getDob())
                .gender(student.getGender())
                .phone(student.getPhone())
                .email(student.getEmail())
                .address(student.getAddress())
                .courseId(student.getCourse().getId())
                .courseName(student.getCourse().getCourseName())
                .semester(student.getSemester())
                .admissionDate(student.getAdmissionDate())
                .photoPath(student.getPhotoPath())
                .documentsPath(student.getDocumentsPath())
                .status(student.getStatus())
                .build();
    }
}

