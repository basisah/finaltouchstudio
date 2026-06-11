-- Initial database schema for FinalTouch Studio
-- This file runs automatically when the MySQL container starts for the first time

CREATE DATABASE IF NOT EXISTS finaltouchstudio;
USE finaltouchstudio;

/**
* Serves as primary inventory for all items and categories.
*/
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    categoryId VARCHAR(50) NOT NULL,
    subCategoryId VARCHAR(50) DEFAULT NULL,
    description TEXT,
    isAvailable BOOLEAN DEFAULT TRUE,
    unit_count INT DEFAULT 1,            -- stock update
    image VARCHAR(255) DEFAULT '✨',     -- image url for item in backend
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

/**
 * Purpose: Master billing and reservation schedule ledger tracking all client transactions.
 * Explicitly tracks logistics preferences (delivery vs. pickup) for user dashboard rendering and owner alerts.
 */
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                                 -- Establishes direct relationship with the user account
    customer_name VARCHAR(255) NOT NULL,                  -- Preserves snapshot of name provided at checkout
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,                             -- Active rental booking event date
    rental_date DATE NOT NULL,                            -- Scheduled drop-off or retrieval date
    
    -- Logistics & Fulfillment Details
    fulfillment_type ENUM('delivery', 'pickup') NOT NULL DEFAULT 'pickup',
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,             -- Holds custom logistics fuel/distance surcharge
    venue_address TEXT NOT NULL,                          -- Set to "Customer Pickup" if pickup is chosen
    special_notes TEXT NULL,                              -- Stores custom setup timings or gate codes
    
    total_amount DECIMAL(10, 2) NOT NULL,                 -- Includes (Items Cost + Package Cost + Delivery Fee)
    status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Itemized Order Details (Tracks what exact items/quantities were rented per purchase)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id VARCHAR(50) NULL,                             -- Nullable if referencing a full bundle package
    package_id INT NULL,                                  -- Nullable if referencing an isolated separate item
    quantity INT DEFAULT 1,
    price_at_rent DECIMAL(10, 2) NOT NULL,                -- Snapshot of price to preserve audit financial records
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON SET NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON SET NULL
);

-- User Persistent Shopping Carts / Wishlists (Saves cart state between logouts)
CREATE TABLE IF NOT EXISTS user_cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id VARCHAR(50) NULL,
    package_id INT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_item (user_id, item_id),       -- Prevents duplicate rows for same items
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

/**
* Users table supporting manual registration and Google OAuth with profile
*/
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE NULL,
    avatar_url VARCHAR(255) NULL,
    role VARCHAR(50) DEFAULT 'user',        -- Prevents non-admin users from accessing admin routes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

