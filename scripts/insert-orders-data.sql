-- Road Green Orders and Delivery History Data Insertion Script
USE road_green;

-- Insert sample orders using existing customer IDs (24-28)
INSERT INTO orders (order_code, customer_id, pickup_address, delivery_address, items, weight, value, delivery_fee, status) VALUES
('ORD001', 24, '123 Nguyễn Văn Linh, Quận 7, TP.HCM', '456 Lê Văn Việt, Quận 9, TP.HCM', 'Hàng điện tử', 2.5, 1500000, 50000, 'delivered'),
('ORD002', 25, '456 Lê Văn Việt, Quận 9, TP.HCM', '789 Võ Văn Tần, Quận 3, TP.HCM', 'Thực phẩm', 1.8, 850000, 35000, 'delivered'),
('ORD003', 26, '789 Võ Văn Tần, Quận 3, TP.HCM', '321 Điện Biên Phủ, Quận 1, TP.HCM', 'Quần áo', 3.2, 1200000, 45000, 'delivered'),
('ORD004', 27, '321 Điện Biên Phủ, Quận 1, TP.HCM', '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 'Sách vở', 1.5, 650000, 30000, 'delivered'),
('ORD005', 28, '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 'Đồ gia dụng', 4.0, 2200000, 60000, 'delivered'),
('ORD006', 24, '123 Nguyễn Văn Linh, Quận 7, TP.HCM', '456 Lê Văn Việt, Quận 9, TP.HCM', 'Hàng điện tử', 2.0, 1800000, 50000, 'delivered'),
('ORD007', 25, '456 Lê Văn Việt, Quận 9, TP.HCM', '789 Võ Văn Tần, Quận 3, TP.HCM', 'Thực phẩm', 2.2, 950000, 35000, 'delivered'),
('ORD008', 26, '789 Võ Văn Tần, Quận 3, TP.HCM', '321 Điện Biên Phủ, Quận 1, TP.HCM', 'Quần áo', 2.8, 1100000, 45000, 'delivered'),
('ORD009', 27, '321 Điện Biên Phủ, Quận 1, TP.HCM', '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 'Sách vở', 1.8, 750000, 30000, 'delivered'),
('ORD010', 28, '654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 'Đồ gia dụng', 3.5, 1900000, 60000, 'delivered');

-- Now insert sample delivery history with ratings and distances using existing user IDs (17-19) and customer IDs (24-28)
INSERT INTO delivery_history (order_id, driver_id, customer_id, delivery_date, delivery_time, items, customer_rating, customer_feedback, distance_km) VALUES
(1, 17, 24, CURDATE(), '09:30:00', 'Hàng điện tử', 5, 'Giao hàng nhanh, tài xế thân thiện', 5.2),
(2, 17, 25, CURDATE(), '10:15:00', 'Thực phẩm', 4, 'Giao hàng đúng giờ', 3.8),
(3, 18, 26, CURDATE(), '11:00:00', 'Quần áo', 5, 'Rất hài lòng với dịch vụ', 7.1),
(4, 19, 27, CURDATE(), '14:30:00', 'Sách vở', 4, 'Giao hàng cẩn thận', 4.5),
(5, 17, 28, CURDATE(), '16:00:00', 'Đồ gia dụng', 5, 'Tài xế chuyên nghiệp', 6.2),
(6, 18, 24, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', 'Hàng điện tử', 4, 'Giao hàng tốt', 5.0),
(7, 19, 25, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:30:00', 'Thực phẩm', 5, 'Rất nhanh', 3.5),
(8, 17, 26, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:15:00', 'Quần áo', 4, 'Đúng giờ', 7.3),
(9, 18, 27, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '14:00:00', 'Sách vở', 5, 'Tuyệt vời', 4.8),
(10, 19, 28, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '15:30:00', 'Đồ gia dụng', 4, 'Hài lòng', 6.0);

-- Show the updated data
SELECT 'Orders table:' as info;
SELECT id, order_code, customer_id, status FROM orders;

SELECT 'Delivery history table:' as info;
SELECT id, driver_id, customer_id, delivery_date, customer_rating, distance_km FROM delivery_history; 