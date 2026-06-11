# 🛒 Snapcart - Dự án Thương mại Điện tử thông minh

Dự án website thương mại điện tử tích hợp trợ lý mua sắm AI (RAG), cổng thanh toán tự động qua SePay, tải ảnh lên Cloudinary và hệ thống gửi Email qua Resend. Hệ thống sử dụng kiến trúc phân tách rõ ràng giữa Backend (Spring Boot) và Frontend (ReactJS).

*   **Website Demo:** [https://snap-cart.app](https://snap-cart.app)

---

## 🚀 Hướng dẫn khởi chạy dự án (Quick Start)

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng - Nhanh nhất)
Bạn không cần cài đặt Java hay Node.js trên máy cá nhân, chỉ cần cài đặt **Docker Desktop**.

1.  Mở terminal tại thư mục gốc của dự án (nơi chứa file `docker-compose.yml`).
2.  Chạy lệnh khởi tạo và xây dựng container:
    ```bash
    docker-compose up --build
    ```
3.  Docker sẽ tự động tạo cơ sở dữ liệu MySQL, build ứng dụng Spring Boot và chạy giao diện ReactJS.
    *   **Frontend:** `http://localhost:5173`
    *   **Backend API:** `http://localhost:8080`
    *   **MySQL Database:** Cổng `3306` của localhost.

---

### Cách 2: Chạy trực tiếp từ mã nguồn (Yêu cầu cài đặt Java 21+ và Node.js 18+)

#### Bước 1: Khởi động Database
*   Tạo database MySQL có tên `ecom_db` trên localhost hoặc cloud.
*   Cập nhật thông số kết nối trong `application.properties`.

#### Bước 2: Chạy Backend
Mở terminal tại thư mục `backend` và chạy lệnh:
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
chmod +x mvnw
./mvnw spring-boot:run
```
*   *Backend sẽ khởi chạy ở cổng `8080`. Tài liệu API Swagger có thể truy cập tại: `http://localhost:8080/swagger-ui/index.html`*

#### Bước 3: Chạy Frontend
Mở terminal mới tại thư mục `frontend` và chạy lệnh:
```bash
npm install
npm run dev
```
*   *Frontend sẽ khởi chạy ở cổng `5173`. Bạn truy cập ứng dụng tại `http://localhost:5173`*

---

## ⚙️ Cấu hình môi trường (Environment Variables)

### 1. Backend (`backend/src/main/resources/application.properties`)
Trước khi chạy backend, bạn cần cấu hình các thông số kết nối hoặc thiết lập qua các biến môi trường:

```properties
# MySQL Connection (Chạy Local hoặc cloud)
spring.datasource.url=jdbc:mysql://localhost:3306/ecom_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JWT Configuration
ecommerce.app.jwtSecret=SnapcartSecretKeyForJWTEncryption2026SnapcartSecretKeyForJWTEncryption2026
ecommerce.app.jwtExpirationMs=86400000

# Gemini AI API (Cần thiết cho trợ lý ảo mua sắm)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google OAuth2 (Đăng nhập Google)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Cloudinary (Quản lý hình ảnh)
cloudinary.cloud-name=YOUR_CLOUDINARY_CLOUD_NAME
cloudinary.api-key=YOUR_CLOUDINARY_API_KEY
cloudinary.api-secret=YOUR_CLOUDINARY_API_SECRET

# Resend Email (Thông báo đơn hàng)
RESEND_API_KEY=YOUR_RESEND_API_KEY
APP_MAIL_FROM=no-reply@yourdomain.com

# SePay Webhook Key (Để xác thực thanh toán an toàn)
app.sepay.webhook-api-key=YOUR_SEPAY_WEBHOOK_API_KEY
```

### 2. Frontend (`frontend/.env`)
Tạo file `.env` trong thư mục `frontend` và cấu hình:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
VITE_API_URL=http://localhost:8080/api
VITE_BANK_NAME=MB
VITE_BANK_ACC=0368163301
```
*(Thay thế ngân hàng và số tài khoản nhận tiền thực tế khi chạy thử thanh toán QR)*

---

## 🛠️ Công nghệ & Hạ tầng sử dụng

### 1. Công nghệ cốt lõi
*   **Backend:** Spring Boot 3.2.4, Spring Security, Spring Data JPA, JWT (JSON Web Token), Lombok, Swagger/OpenAPI.
*   **Frontend:** ReactJS 19 (Vite), Tailwind CSS, Framer Motion, React Icons, Axios, React Router.
*   **Database:** MySQL (lưu trữ thông tin người dùng, đơn hàng, sản phẩm).

### 2. Tích hợp bên thứ ba (Third-party Services)
*   **Gemini AI (Cơ chế RAG):** Tích hợp Gemini 2.5 Flash thông qua API để tư vấn sản phẩm thông minh dựa trên dữ liệu sản phẩm thực tế được đồng bộ (đọc từ file `docs/products.jsonl`).
*   **SePay (Thanh toán tự động):** Tự động tạo mã QR VietQR (thông qua cổng SePay), bắt webhook phản hồi từ SePay để cập nhật trạng thái đơn hàng ngay khi khách hàng chuyển khoản thành công.
*   **Cloudinary:** Lưu trữ và quản lý hình ảnh sản phẩm tải lên từ Admin Dashboard.
*   **Resend Email:** Gửi email tự động thông báo đơn hàng và xác thực tài khoản.

### 3. Hạ tầng & Deploy
*   **Backend:** Deploy lên **Railway** (kết nối trực tiếp với database MySQL lưu trữ trên mây).
*   **Frontend:** Deploy lên **Vercel** để tối ưu hóa tốc độ tải trang toàn cầu và SSL miễn phí.
*   **Containerization:** Hỗ trợ **Docker & Docker Compose** giúp khởi chạy toàn bộ dự án (Database + Backend + Frontend) chỉ với 1 câu lệnh duy nhất.

---

## 📋 Phân chia công việc (Thành viên nhóm)

### 1. Đức - Backend Security, Infrastructure & AI Integration
*   **AI Shopping Assistant:** Tích hợp Gemini/OpenAI API, xây dựng cơ chế **RAG (Retrieval-Augmented Generation)** để AI tư vấn sản phẩm dựa trên dữ liệu từ Database.
*   **Security:** Thiết lập hệ thống JWT, mã hóa mật khẩu, phân quyền Role-based (Admin/User).
*   **Email:** Tích hợp dịch vụ gửi Mail (Resend/Nodemailer) để xác thực tài khoản và báo đơn hàng.
*   **Infrastructure:** Chủ trì cấu hình môi trường **Railway** cho Backend, quản lý biến môi trường (Env).
*   **Payment Logic:** Viết API Webhook/IPN để nhận kết quả thanh toán từ SePay/Momo và cập nhật đơn hàng.

### 2. Sơn - Backend Core & Payment SDK
*   **Database:** Thiết lập cấu trúc MySQL trên Railway, tối ưu hóa Index và các câu truy vấn phức tạp.
*   **Payment SDK:** Tích hợp SDK SePay/QR để tạo mã thanh toán chuyển khoản nhanh.
*   **Order Service:** Viết API xử lý logic đặt hàng, tính phí vận chuyển và áp dụng mã giảm giá.
*   **User API:** Viết các API quản lý thông tin cá nhân khách hàng.

### 3. Tuấn - Main UI & Fullstack Module 1
*   **Frontend Home:** Code giao diện Trang chủ (Banner, Hero Section, Sản phẩm nổi bật).
*   **Frontend Shop:** Code trang danh sách sản phẩm (Product Listing) và logic gọi dữ liệu từ API.
*   **Fullstack Product:** Chịu trách nhiệm cả API Backend và Giao diện Frontend cho phần quản lý sản phẩm (CRUD).
*   **Vercel:** Cấu hình và quản lý việc deploy Frontend lên Vercel.

### 4. Duy - Shopping Flow & Fullstack Module 2
*   **Shopping UI:** Code giao diện trang Chi tiết sản phẩm, Giỏ hàng và trang Thanh toán (Checkout).
*   **Frontend Logic:** Quản lý State toàn cục, logic cộng dồn giỏ hàng.
*   **Admin Dashboard:** Code giao diện quản trị (Bảng điều khiển doanh thu, quản lý đơn hàng).
*   **Fullstack Category:** Chịu trách nhiệm cả API Backend và Giao diện Frontend cho phần quản lý danh mục (Category).

### 5. Việt Anh - UI Static & UX Enhancement
*   **AI UI:** Thiết kế giao diện khung chat (Chat bubble) và giao diện tin nhắn AI mượt mà.
*   **Static Pages:** Code giao diện trang Đăng nhập/Đăng ký, Contact, About Us, Footer và trang 404.
*   **UX Components:** Xây dựng hệ thống **Toast Notifications** và **Loading Skeletons** cho toàn bộ web.
*   **Search & Filter UI:** Code giao diện Thanh tìm kiếm và Sidebar lọc sản phẩm (Visual).
*   **SEO & Support:** Tối ưu Meta tags, ảnh. Nhập liệu dữ liệu mẫu và viết báo cáo dự án.

---
*Cập nhật lần cuối chuẩn bị nộp bài: 11/06/2026*
