# Road Green - Hệ thống tối ưu hóa giao hàng thông minh

Ứng dụng web giúp tối ưu hóa việc giao hàng với tích hợp API VietMap để tính toán tuyến đường thông minh.

## 🚀 Tính năng chính

### 1. Tích hợp VietMap API
- **Tuyến đường thông minh**: Tính toán tuyến đường tối ưu giữa 2 điểm
- **Hướng dẫn chi tiết**: Hiển thị từng bước đi với tên đường và khoảng cách
- **Đa tuyến đường**: Hỗ trợ nhiều tuyến đường thay thế
- **Thông tin thời gian thực**: Khoảng cách, thời gian di chuyển, phương tiện
- **Tìm kiếm địa chỉ**: Chuyển đổi địa chỉ thực tế thành tọa độ
- **Geocoding API**: Tích hợp API tìm kiếm địa chỉ với autocomplete

### 2. Khắc phục lỗi SSR và React Hooks
- **Dynamic Imports**: Sử dụng `next/dynamic` với `ssr: false`
- **Client-side Rendering**: Đảm bảo Leaflet chỉ chạy ở browser
- **Loading States**: Trải nghiệm mượt mà khi tải bản đồ
- **Error Prevention**: Tránh lỗi `window is not defined` trong SSR
- **Rules of Hooks**: Tuân thủ nghiêm ngặt Rules of Hooks của React
- **Hook Order**: Đảm bảo hooks luôn được gọi theo thứ tự nhất quán

### 3. Bản đồ thực tế
- **Interactive Map**: Bản đồ tương tác với tiles từ VietMap
- **Real-time Route Display**: Hiển thị tuyến đường thực tế trên bản đồ
- **Route Visualization**: Hiển thị đường đi với custom markers và polylines
- **Map Controls**: Giao diện điều khiển để nhập điểm xuất phát/đích
- **Address Search**: Tìm kiếm địa chỉ với autocomplete và geocoding
- **Preset Routes**: Tuyến đường mẫu cho các quận TP.HCM
- **Route Statistics**: Thống kê chi tiết tuyến đường với biểu đồ
- **Detailed Instructions**: Hướng dẫn từng bước đi với biểu tượng hướng
- **SSR Compatibility**: Khắc phục lỗi server-side rendering với Leaflet
- **Hooks Compliance**: Tuân thủ Rules of Hooks để tránh lỗi runtime

### 4. Giao diện người dùng
- **Bản đồ trực quan**: Hiển thị tuyến đường trên bản đồ thực tế
- **Hướng dẫn chi tiết**: Danh sách từng bước đi với biểu tượng hướng
- **Thống kê tuyến đường**: Phân tích chi tiết với biểu đồ và metrics
- **Điều khiển tương tác**: Giao diện nhập điểm và chọn phương tiện
- **Tìm kiếm địa chỉ**: Nhập địa chỉ thực tế thay vì tọa độ
- **Autocomplete**: Gợi ý địa chỉ thông minh khi nhập
- **Responsive design**: Tương thích với mọi thiết bị

### 5. Quản lý dữ liệu
- **Database MySQL**: Lưu trữ thông tin người dùng, khách hàng, đơn hàng
- **API endpoints**: RESTful API cho các chức năng chính
- **Real-time updates**: Cập nhật dữ liệu thời gian thực

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Maps API**: VietMap API
- **Map Library**: Leaflet, React-Leaflet
- **Icons**: Lucide React
- **Security**: Rate limiting, Input validation, Environment variables

## 📦 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+
- MySQL 8.0+
- npm hoặc pnpm

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd road-green-app
```

### Bước 2: Cài đặt dependencies
```bash
npm install
# hoặc
pnpm install
```

### Bước 3: Cấu hình database
1. Tạo database MySQL:
```sql
CREATE DATABASE road_green CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Chạy script setup database:
```bash
mysql -u root -p road_green < scripts/database-setup.sql
```

3. Tạo file `.env.local`:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=roadgreen
DB_PASSWORD=
DB_NAME=road_green

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# VietMap API Configuration
VIETMAP_API_KEY=your-vietmap-api-key-here
VIETMAP_API_VERSION=1.1
```

### Bước 4: Khởi động ứng dụng
```bash
npm run dev
# hoặc
pnpm dev
```

Truy cập ứng dụng tại: http://localhost:3000

## 🗺️ API Endpoints

### VietMap API Proxy
- `GET /api/vietmap` - Proxy đến VietMap API
- Parameters:
  - `point1`: Điểm xuất phát (lat,lng)
  - `point2`: Điểm đến (lat,lng)
  - `vehicle`: Loại phương tiện (car, motorbike, etc.)

### Database Test
- `GET /api/database-test` - Kiểm tra kết nối database

## 📊 Cấu trúc dữ liệu

### Bảng chính
- **users**: Thông tin tài xế
- **customers**: Thông tin khách hàng
- **orders**: Đơn hàng giao hàng
- **routes**: Tuyến đường tối ưu
- **traffic_reports**: Báo cáo giao thông

## 🎯 Sử dụng VietMap API

### Tích hợp API
```typescript
// Gọi API thông qua proxy
const response = await fetch('/api/vietmap?point1=10.7729,106.6984&point2=10.7884,106.7056&vehicle=car')
const data = await response.json()
```

### Dữ liệu trả về
```json
{
  "success": true,
  "data": {
    "license": "vietmap",
    "code": "OK",
    "paths": [
      {
        "distance": 2981.6,
        "time": 379300,
        "instructions": [...]
      }
    ]
  }
}
```

## 🔧 Tùy chỉnh

### Thay đổi điểm xuất phát/đích
Chỉnh sửa trong component `VietMapRoute` và `VietMapMap`:
```typescript
const response = await fetch(
  "/api/vietmap?point1=YOUR_START_POINT&point2=YOUR_END_POINT&vehicle=car"
)
```

### Thêm phương tiện mới
Cập nhật parameter `vehicle` trong API call:
- `car`: Ô tô
- `motorbike`: Xe máy
- `bike`: Xe đạp

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với:
- **Desktop**: Layout 2 cột cho bản đồ và hướng dẫn
- **Tablet**: Layout thích ứng với màn hình trung bình
- **Mobile**: Layout 1 cột tối ưu cho màn hình nhỏ

## 🔒 Bảo mật

### Nguyên tắc bảo mật VietMap API
- **Backend Proxy**: API key được bảo vệ bởi backend server
- **Environment Variables**: API key được lưu trong biến môi trường
- **Rate Limiting**: Giới hạn 100 requests/phút cho mỗi IP
- **Input Validation**: Kiểm tra tọa độ và loại phương tiện
- **HTTPS**: Tất cả giao tiếp được mã hóa

### Lưu ý quan trọng
- Không bao giờ hiển thị API key trên frontend
- Luôn sử dụng HTTPS cho production
- Triển khai SSL pinning cho mobile apps
- Giới hạn quyền truy cập API key

## 🚨 Xử lý lỗi

### Lỗi kết nối database
- Kiểm tra MySQL service đang chạy
- Xác minh thông tin kết nối trong `.env.local`
- Test kết nối qua `/api/database-test`

### Lỗi VietMap API
- Kiểm tra API key có hợp lệ trong `.env.local`
- Xác minh tọa độ điểm xuất phát/đích
- Kiểm tra kết nối internet
- Xem log lỗi trong console server

## 📈 Phát triển tiếp theo

- [ ] Tích hợp bản đồ thực tế (Google Maps, OpenStreetMap)
- [ ] Tính năng tìm kiếm địa chỉ
- [ ] Lưu lịch sử tuyến đường
- [ ] Thông báo real-time
- [ ] Tối ưu hóa tuyến đường cho nhiều điểm
- [ ] Tích hợp với hệ thống GPS

## 📄 License

Dự án này sử dụng VietMap API với license tương ứng.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

---

**Road Green** - Tối ưu hóa giao hàng thông minh cho tương lai xanh! 🌱 