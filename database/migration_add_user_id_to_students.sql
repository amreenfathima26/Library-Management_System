-- =====================================================
-- Migration: Add user_id to students table
-- Purpose: Create proper foreign key relationship between students and users
-- This allows direct mapping from student to their login account
-- =====================================================

USE college_erp;

-- Add user_id column to students table
ALTER TABLE students 
ADD COLUMN user_id BIGINT NULL AFTER email,
ADD INDEX idx_user_id (user_id),
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Populate user_id for existing students by matching email
UPDATE students s
INNER JOIN users u ON s.email = u.email AND u.role = 'STUDENT'
SET s.user_id = u.id
WHERE s.user_id IS NULL;

-- Populate user_id for students by matching username (Student UID)
UPDATE students s
INNER JOIN users u ON s.student_uid = u.username AND u.role = 'STUDENT'
SET s.user_id = u.id
WHERE s.user_id IS NULL;

-- Note: After this migration, new students will have user_id set automatically
-- by the StudentService when creating the login account

