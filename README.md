# ecom_project
Dự án thương mại điện tử sử dụng Spring Boot và ReactJS.

## 🚀 Công nghệ sử dụng
- **Backend:** Spring Boot, Spring Security (JWT), MySQL.
- **Frontend:** ReactJS (Vite), Tailwind CSS.
- **Infrastructure:** Docker, VPS, VNPAY/Momo API.

## 📋 Phân chia Task chi tiết (Nhóm 5 thành viên)

### 1. Nhóm Backend & Infrastructure (Tôi + Sơn)
*   **Authentication:** Hệ thống JWT, xác thực qua Email (Resend/Mailtrap).
*   **Payment System:** Tích hợp cổng thanh toán VNPAY/Momo & xử lý Webhook.
*   **Core APIs:** Viết toàn bộ API cho Sản phẩm, Danh mục, Giỏ hàng, Đơn hàng, User.
*   **Infrastructure:** Thiết kế Database, cấu hình Docker, Deploy lên VPS, quản lý bảo mật Server.
*   **Admin Backend:** API thống kê doanh thu, duyệt đơn hàng và quản trị hệ thống.

### 2. Nhóm Fullstack tập trung Frontend (Tuấn + Duy)
*   **Main UI/UX:** Thiết kế và code giao diện Trang chủ, Trang Shop (Listing), Trang chi tiết sản phẩm.
*   **Frontend Logic:** Xử lý Giỏ hàng (State management), Luồng Checkout, Tìm kiếm & Bộ lọc sản phẩm.
*   **Admin Dashboard:** Xây dựng giao diện quản trị (Quản lý sản phẩm, đơn hàng, người dùng).
*   **Small Backend:** Hỗ trợ viết các API phụ (Banner, Meta-data, UI Config).

### 3. Nhóm Hỗ trợ Frontend (Việt Anh)
*   **Minor UI:** Giao diện trang Login/Register, About Us, Contact, Footer.
*   **Static Pages:** Các trang thông báo thành công/thất bại, trang 404.
*   **Support:** Kiểm tra Responsive trên mobile, hỗ trợ nhập liệu dữ liệu mẫu (Seeding data).
*   **Documentation:** Viết tài liệu hướng dẫn sử dụng và báo cáo đồ án.

## 🛠 Quy trình phối hợp
1. **Branching:** Mỗi thành viên làm việc trên branch riêng (`feat/ten-task`).
2. **Pull Request:** Code phải được Review trước khi merge vào nhánh `main`.
3. **API Document:** Sử dụng Swagger/Postman để thống nhất đầu vào/đầu ra dữ liệu.

---
*Cập nhật lần cuối: 25/04/2026*
