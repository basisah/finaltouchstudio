-- Initial database schema for FinalTouch Studio
-- This file runs automatically when the MySQL container starts for the first time

CREATE DATABASE IF NOT EXISTS finaltouchstudio;
USE finaltouchstudio;

-- Example table to verify the connection works
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed some sample data
INSERT INTO items (name, description) VALUES
  ('Sample Item 1', 'This is a sample item to verify the database is connected'),
  ('Sample Item 2', 'Edit this file to add your own initial data');
