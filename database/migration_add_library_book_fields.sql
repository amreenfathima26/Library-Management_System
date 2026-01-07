-- Migration: Add branch, subject, and category fields to library_books table
-- Date: 2025-12-13

USE college_erp;

-- Add new columns to library_books table
ALTER TABLE library_books
ADD COLUMN branch VARCHAR(100) NULL COMMENT 'Department/Branch (e.g., Computer Science, Electronics)',
ADD COLUMN subject VARCHAR(100) NULL COMMENT 'Subject/Category (e.g., Programming, Mathematics)',
ADD COLUMN category VARCHAR(100) NULL COMMENT 'Book Category (e.g., Textbook, Reference, Fiction)';

-- Add indexes for better query performance
CREATE INDEX idx_branch ON library_books(branch);
CREATE INDEX idx_subject ON library_books(subject);
CREATE INDEX idx_category ON library_books(category);

-- Update existing records with default values if needed (optional)
-- UPDATE library_books SET branch = 'General' WHERE branch IS NULL;
-- UPDATE library_books SET subject = 'General' WHERE subject IS NULL;
-- UPDATE library_books SET category = 'Textbook' WHERE category IS NULL;

