-- =====================================================
-- ERP-Based Integrated Student Management System
-- Complete Database Schema
-- =====================================================

-- Drop existing database if exists (for fresh setup)
DROP DATABASE IF EXISTS college_erp;
CREATE DATABASE college_erp;
USE college_erp;

-- =====================================================
-- 1. USERS TABLE (Authentication & Authorization)
-- =====================================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'ACCOUNTS', 'ADMISSIONS', 'HOSTEL_WARDEN', 'LIBRARIAN', 'EXAM_CELL', 'STUDENT') NOT NULL,
    status ENUM('ACTIVE', 'DISABLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. COURSES TABLE
-- =====================================================
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    duration_years INT NOT NULL,
    fee_per_semester DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. STUDENTS TABLE (Master Student Database)
-- =====================================================
CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_uid VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    course_id BIGINT NOT NULL,
    semester INT NOT NULL,
    admission_date DATE NOT NULL,
    photo_path VARCHAR(500),
    documents_path JSON,
    status ENUM('PENDING', 'ACTIVE', 'GRADUATED', 'LEFT', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    INDEX idx_student_uid (student_uid),
    INDEX idx_email (email),
    INDEX idx_course (course_id),
    INDEX idx_status (status),
    INDEX idx_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. FEE TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE fee_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode ENUM('RAZORPAY', 'CASH') NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    semester INT NOT NULL,
    status ENUM('SUCCESS', 'FAILED', 'PENDING') DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    INDEX idx_student_id (student_id),
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_status (status),
    INDEX idx_paid_at (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. RECEIPTS TABLE
-- =====================================================
CREATE TABLE receipts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    transaction_id BIGINT NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    pdf_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (transaction_id) REFERENCES fee_transactions(id) ON DELETE RESTRICT,
    INDEX idx_student_id (student_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_receipt_number (receipt_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. HOSTELS TABLE
-- =====================================================
CREATE TABLE hostels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hostel_name VARCHAR(100) NOT NULL,
    warden_id BIGINT,
    total_rooms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warden_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_warden (warden_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. HOSTEL ROOMS TABLE
-- =====================================================
CREATE TABLE hostel_rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hostel_id BIGINT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    occupied_beds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_hostel_room (hostel_id, room_number),
    INDEX idx_hostel_id (hostel_id),
    INDEX idx_availability (hostel_id, capacity, occupied_beds)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. HOSTEL ALLOCATIONS TABLE
-- =====================================================
CREATE TABLE hostel_allocations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    hostel_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    allocation_date DATE NOT NULL,
    deallocation_date DATE NULL,
    status ENUM('ALLOCATED', 'VACATED') DEFAULT 'ALLOCATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(id) ON DELETE RESTRICT,
    INDEX idx_student_id (student_id),
    INDEX idx_hostel_id (hostel_id),
    INDEX idx_room_id (room_id),
    INDEX idx_status (status),
    INDEX idx_allocation_date (allocation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. EXAMS TABLE (Marks Entry)
-- =====================================================
CREATE TABLE exams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    marks DECIMAL(5, 2) NOT NULL,
    grade VARCHAR(5),
    exam_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_exam_date (exam_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_attendance (student_id, course_id, date),
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. LIBRARY BOOKS TABLE
-- =====================================================
CREATE TABLE library_books (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    author VARCHAR(200) NOT NULL,
    isbn VARCHAR(50) UNIQUE,
    quantity INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    branch VARCHAR(100) NULL COMMENT 'Department/Branch (e.g., Computer Science, Electronics)',
    subject VARCHAR(100) NULL COMMENT 'Subject/Category (e.g., Programming, Mathematics)',
    category VARCHAR(100) NULL COMMENT 'Book Category (e.g., Textbook, Reference, Fiction)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_isbn (isbn),
    INDEX idx_availability (available_quantity),
    INDEX idx_branch (branch),
    INDEX idx_subject (subject),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. LIBRARY TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE library_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    book_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    issued_date DATE NOT NULL,
    return_date DATE NULL,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('ISSUED', 'RETURNED') DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    INDEX idx_book_id (book_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_issued_date (issued_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. SYSTEM LOGS TABLE
-- =====================================================
CREATE TABLE system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 14. BACKUPS TABLE
-- =====================================================
CREATE TABLE backups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_path VARCHAR(500) NOT NULL,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS') DEFAULT 'IN_PROGRESS',
    INDEX idx_backup_date (backup_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Default Admin User (password: admin123 - should be hashed in application)
-- Password hash for 'admin123' using BCrypt (rounds=10)
INSERT INTO users (username, email, password_hash, role, status) VALUES
('admin', 'admin@college.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE');

-- Sample Courses
INSERT INTO courses (course_name, department, duration_years, fee_per_semester) VALUES
('Bachelor of Computer Science', 'Computer Science', 4, 50000.00),
('Bachelor of Engineering', 'Engineering', 4, 60000.00),
('Bachelor of Commerce', 'Commerce', 3, 40000.00),
('Bachelor of Arts', 'Arts', 3, 35000.00),
('Master of Computer Applications', 'Computer Science', 2, 75000.00);

-- Sample Hostel
INSERT INTO hostels (hostel_name, total_rooms) VALUES
('Boys Hostel A', 50),
('Girls Hostel B', 40);

-- =====================================================
-- STORED PROCEDURES & FUNCTIONS (Optional)
-- =====================================================

-- Function to generate Student UID
DELIMITER //
CREATE FUNCTION generate_student_uid() RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE new_uid VARCHAR(20);
    DECLARE year_part VARCHAR(4);
    DECLARE seq_num INT;
    
    SET year_part = YEAR(CURDATE());
    SET seq_num = (SELECT COALESCE(MAX(CAST(SUBSTRING(student_uid, 8) AS UNSIGNED)), 0) + 1 
                   FROM students 
                   WHERE student_uid LIKE CONCAT('STU', year_part, '%'));
    
    SET new_uid = CONCAT('STU', year_part, LPAD(seq_num, 4, '0'));
    RETURN new_uid;
END//
DELIMITER ;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Student Summary View
CREATE VIEW v_student_summary AS
SELECT 
    s.id,
    s.student_uid,
    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
    s.email,
    s.phone,
    c.course_name,
    s.semester,
    s.status,
    s.admission_date,
    (SELECT COUNT(*) FROM fee_transactions ft WHERE ft.student_id = s.id AND ft.status = 'SUCCESS') AS total_payments,
    (SELECT SUM(amount) FROM fee_transactions ft WHERE ft.student_id = s.id AND ft.status = 'SUCCESS') AS total_fees_paid
FROM students s
JOIN courses c ON s.course_id = c.id;

-- Hostel Occupancy View
CREATE VIEW v_hostel_occupancy AS
SELECT 
    h.id AS hostel_id,
    h.hostel_name,
    COUNT(DISTINCT hr.id) AS total_rooms,
    SUM(hr.capacity) AS total_capacity,
    SUM(hr.occupied_beds) AS total_occupied,
    SUM(hr.capacity) - SUM(hr.occupied_beds) AS available_beds,
    ROUND((SUM(hr.occupied_beds) / SUM(hr.capacity)) * 100, 2) AS occupancy_percentage
FROM hostels h
LEFT JOIN hostel_rooms hr ON h.id = hr.hostel_id
GROUP BY h.id, h.hostel_name;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

