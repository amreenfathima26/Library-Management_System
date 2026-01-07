-- Migration: Add application status support to students table
-- This allows PENDING and REJECTED status for admission workflow

USE college_erp;

-- Update students table to support PENDING and REJECTED status
ALTER TABLE students 
MODIFY COLUMN status ENUM('PENDING', 'ACTIVE', 'GRADUATED', 'LEFT', 'REJECTED') DEFAULT 'PENDING';

-- Update existing ACTIVE students to remain ACTIVE
-- New students will default to PENDING for approval workflow

