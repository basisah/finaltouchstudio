-- Initial database schema for FinalTouch Studio
-- This file runs automatically when the MySQL container starts for the first time

CREATE DATABASE IF NOT EXISTS finaltouchstudio;
USE finaltouchstudio;

-- Items table matching frontend items structure
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    categoryId VARCHAR(50) NOT NULL,
    subCategoryId VARCHAR(50) DEFAULT NULL,
    description TEXT,
    isAvailable BOOLEAN DEFAULT TRUE,
    image VARCHAR(255) DEFAULT '✨',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category_id VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Package Items association table
CREATE TABLE IF NOT EXISTS package_items (
    package_id INT NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (package_id, item_id),
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Orders table (retained from initial schema)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
