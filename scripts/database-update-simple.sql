-- Road Green Database Simple Update Script
USE road_green;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN role ENUM('driver', 'manager') DEFAULT 'driver' AFTER status;
ALTER TABLE users ADD INDEX idx_role (role);

-- Add missing column to delivery_history table
ALTER TABLE delivery_history ADD COLUMN distance_km DECIMAL(8,2) AFTER signature_url;

-- Clear existing data to avoid conflicts
DELETE FROM delivery_history;
DELETE FROM customers;
DELETE FROM users;

-- Insert sample users with hashed passwords
-- Password for all users is "123456" (hashed with bcrypt)
INSERT INTO users (username, email, password_hash, full_name, phone, vehicle_type, points, total_deliveries, role) VALUES
('manager', 'manager@roadgreen.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'Nguyễn Văn Quản Lý', '0901234567', 'car', 0, 0, 'manager'),
('driver001', 'driver1@roadgreen.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'Nguyễn Văn A', '0901234568', 'motorbike', 1250, 45, 'driver'),
('driver002', 'driver2@roadgreen.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'Trần Thị B', '0901234569', 'car', 890, 32, 'driver'),
('driver003', 'driver3@roadgreen.vn', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'Lê Văn C', '0901234570', 'motorbike', 1580, 67, 'driver');

-- Insert sample customers
INSERT INTO customers (phone, full_name, address, latitude, longitude, ward, district, city, total_orders) VALUES
('0901111111', 'Nguyễn Văn Khách', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 10.7379, 106.7017, 'Tân Thuận Đông', 'Quận 7', 'TP.HCM', 5),
('0902222222', 'Trần Thị Lan', '456 Lê Văn Việt, Quận 9, TP.HCM', 10.8411, 106.8098, 'Hiệp Phú', 'Quận 9', 'TP.HCM', 3),
('0903333333', 'Lê Văn Nam', '789 Võ Văn Tần, Quận 3, TP.HCM', 10.7769, 106.6917, 'Võ Thị Sáu', 'Quận 3', 'TP.HCM', 8),
('0904444444', 'Phạm Thị Mai', '321 Điện Biên Phủ, Quận 1, TP.HCM', 10.7729, 106.6984, 'Đa Kao', 'Quận 1', 'TP.HCM', 12),
('0905555555', 'Hoàng Văn Dũng', '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 10.7884, 106.7056, 'Phường 6', 'Quận 3', 'TP.HCM', 6);

-- Insert sample orders first
INSERT INTO orders (order_code, customer_id, pickup_address, delivery_address, items, weight, value, delivery_fee, status) VALUES
('ORD001', 1, '123 Nguyễn Văn Linh, Quận 7, TP.HCM', '456 Lê Văn Việt, Quận 9, TP.HCM', 'Hàng điện tử', 2.5, 1500000, 50000, 'delivered'),
('ORD002', 2, '456 Lê Văn Việt, Quận 9, TP.HCM', '789 Võ Văn Tần, Quận 3, TP.HCM', 'Thực phẩm', 1.8, 850000, 35000, 'delivered'),
('ORD003', 3, '789 Võ Văn Tần, Quận 3, TP.HCM', '321 Điện Biên Phủ, Quận 1, TP.HCM', 'Quần áo', 3.2, 1200000, 45000, 'delivered'),
('ORD004', 4, '321 Điện Biên Phủ, Quận 1, TP.HCM', '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 'Sách vở', 1.5, 650000, 30000, 'delivered'),
('ORD005', 5, '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 'Đồ gia dụng', 4.0, 2200000, 60000, 'delivered'),
('ORD006', 1, '123 Nguyễn Văn Linh, Quận 7, TP.HCM', '456 Lê Văn Việt, Quận 9, TP.HCM', 'Hàng điện tử', 2.0, 1800000, 50000, 'delivered'),
('ORD007', 2, '456 Lê Văn Việt, Quận 9, TP.HCM', '789 Võ Văn Tần, Quận 3, TP.HCM', 'Thực phẩm', 2.2, 950000, 35000, 'delivered'),
('ORD008', 3, '789 Võ Văn Tần, Quận 3, TP.HCM', '321 Điện Biên Phủ, Quận 1, TP.HCM', 'Quần áo', 2.8, 1100000, 45000, 'delivered'),
('ORD009', 4, '321 Điện Biên Phủ, Quận 1, TP.HCM', '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 'Sách vở', 1.8, 750000, 30000, 'delivered'),
('ORD010', 5, '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 'Đồ gia dụng', 3.5, 1900000, 60000, 'delivered');

-- Now insert sample delivery history with ratings and distances
INSERT INTO delivery_history (order_id, driver_id, customer_id, delivery_date, delivery_time, items, customer_rating, customer_feedback, distance_km) VALUES
(1, 2, 1, CURDATE(), '09:30:00', 'Hàng điện tử', 5, 'Giao hàng nhanh, tài xế thân thiện', 5.2),
(2, 2, 2, CURDATE(), '10:15:00', 'Thực phẩm', 4, 'Giao hàng đúng giờ', 3.8),
(3, 3, 3, CURDATE(), '11:00:00', 'Quần áo', 5, 'Rất hài lòng với dịch vụ', 7.1),
(4, 4, 4, CURDATE(), '14:30:00', 'Sách vở', 4, 'Giao hàng cẩn thận', 4.5),
(5, 2, 5, CURDATE(), '16:00:00', 'Đồ gia dụng', 5, 'Tài xế chuyên nghiệp', 6.2),
(6, 3, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', 'Hàng điện tử', 4, 'Giao hàng tốt', 5.0),
(7, 4, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:30:00', 'Thực phẩm', 5, 'Rất nhanh', 3.5),
(8, 2, 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:15:00', 'Quần áo', 4, 'Đúng giờ', 7.3),
(9, 3, 4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '14:00:00', 'Sách vở', 5, 'Tuyệt vời', 4.8),
(10, 4, 5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '15:30:00', 'Đồ gia dụng', 4, 'Hài lòng', 6.0);

-- Show the updated data
SELECT 'Users table:' as info;
SELECT id, username, email, role, points, total_deliveries FROM users;

SELECT 'Customers table:' as info;
SELECT id, full_name, phone, city FROM customers;

SELECT 'Orders table:' as info;
SELECT id, order_code, customer_id, status FROM orders;

SELECT 'Delivery history table:' as info;
SELECT id, driver_id, customer_id, delivery_date, customer_rating, distance_km FROM delivery_history; 