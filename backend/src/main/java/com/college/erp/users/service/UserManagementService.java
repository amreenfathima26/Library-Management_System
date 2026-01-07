package com.college.erp.users.service;

import com.college.erp.model.User;
import com.college.erp.repository.UserRepository;
import com.college.erp.repository.StudentRepository;
import com.college.erp.users.dto.UserCreateRequest;
import com.college.erp.users.dto.UserDTO;
import com.college.erp.users.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToDTO(user);
    }

    @Transactional
    public UserDTO createUser(UserCreateRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Validate role
        try {
            User.UserRole role = User.UserRole.valueOf(request.getRole().toUpperCase());
            User.UserStatus status = request.getStatus() != null 
                    ? User.UserStatus.valueOf(request.getStatus().toUpperCase())
                    : User.UserStatus.ACTIVE;

            User user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .role(role)
                    .status(status)
                    .build();

            user = userRepository.save(user);
            return mapToDTO(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole());
        }
    }

    @Transactional
    public UserDTO updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check if email is being changed and if new email already exists
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        user.setEmail(request.getEmail());

        // Update password only if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        // Update role
        try {
            user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole());
        }

        // Update status
        try {
            user.setStatus(User.UserStatus.valueOf(request.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + request.getStatus());
        }

        user = userRepository.save(user);
        return mapToDTO(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Prevent deleting the last admin user
        if (user.getRole() == User.UserRole.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.UserRole.ADMIN && u.getStatus() == User.UserStatus.ACTIVE)
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last active admin user");
            }
        }

        // Soft delete by setting status to DISABLED
        user.setStatus(User.UserStatus.DISABLED);
        userRepository.save(user);
    }

    @Transactional
    public void enableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void disableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Prevent disabling the last admin user
        if (user.getRole() == User.UserRole.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.UserRole.ADMIN && u.getStatus() == User.UserStatus.ACTIVE)
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot disable the last active admin user");
            }
        }
        
        user.setStatus(User.UserStatus.DISABLED);
        userRepository.save(user);
    }

    public List<Map<String, Object>> getStudentsWithoutLogin() {
        // Get all active students
        List<com.college.erp.model.Student> allStudents = studentRepository.findByStatus(
                com.college.erp.model.Student.StudentStatus.ACTIVE);
        
        // Get all user emails
        List<String> userEmails = userRepository.findAll().stream()
                .map(User::getEmail)
                .collect(Collectors.toList());
        
        // Filter students who don't have login accounts
        return allStudents.stream()
                .filter(student -> !userEmails.contains(student.getEmail()))
                .map(student -> {
                    Map<String, Object> studentMap = new HashMap<>();
                    studentMap.put("id", student.getId());
                    studentMap.put("studentUid", student.getStudentUid());
                    studentMap.put("firstName", student.getFirstName());
                    studentMap.put("lastName", student.getLastName());
                    studentMap.put("email", student.getEmail());
                    studentMap.put("courseName", student.getCourse().getCourseName());
                    studentMap.put("semester", student.getSemester());
                    return studentMap;
                })
                .collect(Collectors.toList());
    }

    private UserDTO mapToDTO(User user) {
        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());
        
        // If user is a STUDENT, try to find linked student record
        if (user.getRole() == User.UserRole.STUDENT) {
            studentRepository.findByEmail(user.getEmail()).ifPresent(student -> {
                builder.studentUid(student.getStudentUid());
                builder.studentName(student.getFirstName() + " " + student.getLastName());
            });
        }
        
        return builder.build();
    }
}

