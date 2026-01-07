-- =====================================================
-- Migration: Fix students.status ENUM to include PENDING and REJECTED
-- =====================================================
-- This migration updates the students table to include
-- PENDING and REJECTED status values that are used in
-- the Java application but missing from the database schema

USE college_erp;

-- Modify the status column to include all required enum values
ALTER TABLE students 
MODIFY COLUMN status ENUM('PENDING', 'ACTIVE', 'GRADUATED', 'LEFT', 'REJECTED') 
DEFAULT 'PENDING';

-- Update existing records that might have invalid status
-- (This should not affect existing data, but ensures consistency)
UPDATE students 
SET status = 'ACTIVE' 
WHERE status NOT IN ('PENDING', 'ACTIVE', 'GRADUATED', 'LEFT', 'REJECTED');

SELECT 'Migration completed: students.status enum updated successfully' AS result;

