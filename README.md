# ecom_project
Dự án thương mại điện tử sử dụng Spring Boot và ReactJS.

## 🚀 Công nghệ sử dụng
- **Backend:** Spring Boot, Spring Security (JWT), MySQL.
- **Frontend:** ReactJS (Vite), Tailwind CSS.
- **AI Integration:** Gemini API / OpenAI API (Cơ chế RAG).

## 🚀 Hạ tầng & Deploy
- **Backend & Database:** Deploy trên **Railway** (Tự động hóa CI/CD từ GitHub).
- **Frontend:** Deploy trên **Vercel** (Tối ưu tốc độ tải trang và SSL).
- **Payment API:** VNPAY / Momo.

## 📋 Phân chia Task chi tiết (Từng cá nhân)

### 1. Đức - Backend Security, Infrastructure & AI Integration
*   **AI Shopping Assistant:** Tích hợp Gemini/OpenAI API, xây dựng cơ chế **RAG (Retrieval-Augmented Generation)** để AI tư vấn sản phẩm dựa trên dữ liệu từ Database.
*   **Security:** Thiết lập hệ thống JWT, mã hóa mật khẩu, phân quyền Role-based (Admin/User).
*   **Email:** Tích hợp dịch vụ gửi Mail (Resend/Nodemailer) để xác thực tài khoản và báo đơn hàng.
*   **Infrastructure:** Chủ trì cấu hình môi trường **Railway** cho Backend, quản lý biến môi trường (Env).
*   **Payment Logic:** Viết API Webhook/IPN để nhận kết quả thanh toán từ VNPAY/Momo và cập nhật đơn hàng.

### 2. Sơn - Backend Core & Payment SDK
*   **Database:** Thiết lập cấu trúc MySQL/PostgreSQL trên Railway, tối ưu hóa Index và các câu truy vấn phức tạp.
*   **Payment SDK:** Tích hợp SDK VNPAY/Momo để tạo URL thanh toán.
*   **Order Service:** Viết API xử lý logic đặt hàng, tính phí vận chuyển và áp dụng mã giảm giá.
*   **User API:** Viết các API quản lý thông tin cá nhân khách hàng.

### 3. Tuấn - Main UI & Fullstack Module 1
*   **Frontend Home:** Code giao diện Trang chủ (Banner, Hero Section, Sản phẩm nổi bật).
*   **Frontend Shop:** Code trang danh sách sản phẩm (Product Listing) và logic gọi dữ liệu từ API.
*   **Fullstack Product:** Chịu trách nhiệm cả API Backend và Giao diện Frontend cho phần quản lý sản phẩm (CRUD).
*   **Vercel:** Cấu hình và quản lý việc deploy Frontend lên Vercel.

### 4. Duy - Shopping Flow & Fullstack Module 2
*   **Shopping UI:** Code giao diện trang Chi tiết sản phẩm, Giỏ hàng và trang Thanh toán (Checkout).
*   **Frontend Logic:** Quản lý State toàn cục (Redux/Zustand), logic cộng dồn giỏ hàng.
*   **Admin Dashboard:** Code giao diện quản trị (Bảng điều khiển doanh thu, quản lý đơn hàng).
*   **Fullstack Category:** Chịu trách nhiệm cả API Backend và Giao diện Frontend cho phần quản lý danh mục (Category).

### 5. Việt Anh - UI Static & UX Enhancement
*   **AI UI:** Thiết kế giao diện khung chat (Chat bubble) và giao diện tin nhắn AI mượt mà.
*   **Static Pages:** Code giao diện trang Đăng nhập/Đăng ký, Contact, About Us, Footer và trang 404.
*   **UX Components:** Xây dựng hệ thống **Toast Notifications** và **Loading Skeletons** cho toàn bộ web.
*   **Search & Filter UI:** Code giao diện Thanh tìm kiếm và Sidebar lọc sản phẩm (Visual).
*   **SEO & Support:** Tối ưu Meta tags, ảnh. Nhập liệu dữ liệu mẫu và viết báo cáo dự án.

## 🛠 Quy trình phối hợp
1. **GitHub Flow:** Mỗi người tạo 1 branch `feat/[tên-mình]-[tên-task]`.
2. **Auto-Deploy:** Khi code được merge vào `main`, Railway và Vercel sẽ tự động deploy.
3. **API Document:** Sử dụng Swagger để thống nhất cấu trúc dữ liệu.

---
*Cập nhật lần cuối: 25/04/2026*
