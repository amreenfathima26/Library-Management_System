package com.college.erp.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes
 * Run this main method to generate a hash for "admin123"
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "admin123";
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("\nSQL INSERT statement:");
        System.out.println("INSERT INTO users (username, email, password_hash, role, status) VALUES");
        System.out.println("('admin', 'admin@college.edu', '" + hash + "', 'ADMIN', 'ACTIVE');");
    }
}

