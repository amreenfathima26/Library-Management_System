package com.college.erp.config;

import com.college.erp.model.User;
import com.college.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            // Create or update admin user
            User admin = userRepository.findByUsername("admin").orElse(null);
            
            if (admin == null) {
                log.info("Creating default admin user...");
                admin = User.builder()
                        .username("admin")
                        .email("admin@college.edu")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .role(User.UserRole.ADMIN)
                        .status(User.UserStatus.ACTIVE)
                        .build();
                userRepository.save(admin);
                log.info("Admin user created successfully with username: admin, password: admin123");
            } else {
                // Always update password hash to ensure it's correctly hashed with current encoder
                log.info("Updating admin password hash to ensure compatibility...");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                userRepository.save(admin);
                log.info("Admin password hash updated successfully!");
                log.info("Login credentials - Username: admin, Password: admin123");
            }

            // Define other default users
            createDefaultUser("accounts", "accounts@college.edu", "accounts123", User.UserRole.ACCOUNTS);
            createDefaultUser("admissions", "admissions@college.edu", "admissions123", User.UserRole.ADMISSIONS);
            createDefaultUser("warden", "warden@college.edu", "warden123", User.UserRole.HOSTEL_WARDEN);
            createDefaultUser("librarian", "librarian@college.edu", "librarian123", User.UserRole.LIBRARIAN);
            createDefaultUser("examcell", "examcell@college.edu", "examcell123", User.UserRole.EXAM_CELL);

        } catch (Exception e) {
            log.error("Error initializing users: {}", e.getMessage(), e);
        }
    }

    private void createDefaultUser(String username, String email, String password, User.UserRole role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            log.info("Creating default {} user...", role);
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .role(role)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(user);
            log.info("{} user created successfully with username: {}, password: {}", role, username, password);
        }
    }
}
