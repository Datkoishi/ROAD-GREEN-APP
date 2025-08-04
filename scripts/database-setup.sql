-- Road Green Database Schema
CREATE DATABASE IF NOT EXISTS road_green CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE road_green;

-- Users table (drivers)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    avatar_url VARCHAR(255),
    driver_license VARCHAR(50),
    vehicle_type ENUM('motorbike', 'car', 'truck') DEFAULT 'motorbike',
    vehicle_plate VARCHAR(20),
    points INT DEFAULT 0,
    total_deliveries INT DEFAULT 0,
    total_distance DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.00,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_location_lat DECIMAL(10,8),
    last_location_lng DECIMAL(11,8),
    last_location_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_location (last_location_lat, last_location_lng)
);

-- Customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    ward VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    notes TEXT,
    total_orders INT DEFAULT 0,
    last_order_date TIMESTAMP,
    customer_type ENUM('individual', 'business') DEFAULT 'individual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_location (latitude, longitude),
    INDEX idx_address (address(100))
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    driver_id INT,
    pickup_address TEXT,
    pickup_latitude DECIMAL(10,8),
    pickup_longitude DECIMAL(11,8),
    delivery_address TEXT NOT NULL,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    items TEXT NOT NULL,
    weight DECIMAL(8,2),
    value DECIMAL(12,2),
    delivery_fee DECIMAL(10,2),
    special_instructions TEXT,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed') DEFAULT 'pending',
    scheduled_time TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    estimated_delivery_time INT, -- minutes
    actual_delivery_time INT, -- minutes
    distance_km DECIMAL(8,2),
    route_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_code (order_code),
    INDEX idx_customer (customer_id),
    INDEX idx_driver (driver_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_time (scheduled_time)
);

-- Routes table (optimized delivery routes)
CREATE TABLE routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    driver_id INT NOT NULL,
    route_name VARCHAR(100),
    start_latitude DECIMAL(10,8),
    start_longitude DECIMAL(11,8),
    start_address TEXT,
    total_orders INT DEFAULT 0,
    total_distance_km DECIMAL(8,2),
    estimated_time_minutes INT,
    actual_time_minutes INT,
    fuel_cost DECIMAL(10,2),
    status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
    optimization_algorithm VARCHAR(50) DEFAULT 'nearest_neighbor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_driver (driver_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Route orders (junction table for routes and orders)
CREATE TABLE route_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    order_id INT NOT NULL,
    sequence_number INT NOT NULL,
    estimated_arrival_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    distance_from_previous_km DECIMAL(8,2),
    time_from_previous_minutes INT,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_route_order (route_id, order_id),
    INDEX idx_route_sequence (route_id, sequence_number)
);

-- Traffic reports table
CREATE TABLE traffic_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    type ENUM('flood', 'traffic_jam', 'accident', 'road_closure', 'construction') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    expires_at TIMESTAMP,
    status ENUM('active', 'resolved', 'false_report') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_location (latitude, longitude),
    INDEX idx_type_severity (type, severity),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Traffic report votes table
CREATE TABLE traffic_report_votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_type ENUM('upvote', 'downvote') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES traffic_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_report_vote (report_id, user_id)
);

-- Delivery history table
CREATE TABLE delivery_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    driver_id INT NOT NULL,
    customer_id INT NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_time TIME NOT NULL,
    items TEXT NOT NULL,
    delivery_notes TEXT,
    customer_rating INT CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    delivery_photo_url VARCHAR(255),
    signature_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_driver_date (driver_id, delivery_date),
    INDEX idx_customer_date (customer_id, delivery_date)
);

-- User points history table
CREATE TABLE user_points_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    points_change INT NOT NULL,
    reason ENUM('delivery_completed', 'traffic_report', 'report_verified', 'false_report_penalty', 'bonus', 'penalty') NOT NULL,
    reference_id INT, -- Can reference order_id, traffic_report_id, etc.
    reference_type ENUM('order', 'traffic_report', 'manual') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_reason (reason)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error', 'traffic_alert') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    reference_id INT,
    reference_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created_at (created_at)
);

-- Analytics table for daily statistics
CREATE TABLE daily_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    completed_orders INT DEFAULT 0,
    cancelled_orders INT DEFAULT 0,
    total_drivers INT DEFAULT 0,
    active_drivers INT DEFAULT 0,
    total_distance_km DECIMAL(10,2) DEFAULT 0,
    total_delivery_time_minutes INT DEFAULT 0,
    average_delivery_time_minutes DECIMAL(8,2) DEFAULT 0,
    total_traffic_reports INT DEFAULT 0,
    verified_traffic_reports INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date),
    INDEX idx_date (date)
);

-- User sessions table for authentication
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_user_active (user_id, expires_at)
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, full_name, phone, vehicle_type, points, total_deliveries) VALUES
('driver001', 'driver1@roadgreen.vn', '$2b$10$example_hash_1', 'Nguyễn Văn A', '0901234567', 'motorbike', 1250, 45),
('driver002', 'driver2@roadgreen.vn', '$2b$10$example_hash_2', 'Trần Thị B', '0912345678', 'car', 890, 32),
('driver003', 'driver3@roadgreen.vn', '$2b$10$example_hash_3', 'Lê Văn C', '0923456789', 'motorbike', 1580, 67);

INSERT INTO customers (phone, full_name, address, latitude, longitude, ward, district, city, total_orders) VALUES
('0901111111', 'Nguyễn Văn Khách', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 10.7379, 106.7017, 'Tân Thuận Đông', 'Quận 7', 'TP.HCM', 5),
('0902222222', 'Trần Thị Lan', '456 Lê Văn Việt, Quận 9, TP.HCM', 10.8411, 106.8098, 'Hiệp Phú', 'Quận 9', 'TP.HCM', 3),
('0903333333', 'Lê Văn Nam', '789 Võ Văn Tần, Quận 3, TP.HCM', 10.7769, 106.6917, 'Võ Thị Sáu', 'Quận 3', 'TP.HCM', 8);
