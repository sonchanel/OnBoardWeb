# OnBoard Remoto

**OnBoard Remoto** là một website hỗ trợ **quy trình onboarding nhân sự** trong môi trường làm việc từ xa.  
Hệ thống cho phép quản lý các bước chào đón nhân viên mới thông qua văn bản, tài liệu, biểu mẫu và email tự động.  
Mục tiêu chính là giúp nhân viên nhanh chóng hòa nhập, đồng thời hỗ trợ nhà quản lý theo dõi tiến độ onboarding hiệu quả.

---

## 🚀 Chức năng chính

### Website Quản lý (Admin)
- Đăng nhập, đăng xuất
- Quản lý tài khoản, nhân viên
- Quản lý quy trình onboarding
- Gửi email tự động khi thêm nhân viên
- Quản lý tài liệu nội bộ

### Website Nhân viên (User)
- Đăng nhập, đăng xuất
- Xem thông tin quy trình onboarding
- Thực hiện các bước trong quy trình

---

## 🛠️ Công nghệ sử dụng
- **Backend:** Node.js, Express.js
- **Frontend:** EJS Template Engine
- **Cơ sở dữ liệu:** MongoDB
- **Thư viện khác:** Mongoose, Nodemailer, Cloudinary SDK

---

## 📂 Cấu trúc hệ thống
OnBoardWeb/
├── src/
│ ├── models/ # Các schema Mongoose (User, Process, Form…)
│ ├── routes/ # Các route cho Admin và User
│ ├── views/ # Giao diện EJS (quản lý + nhân viên)
│ ├── utils/ # Các tiện ích: gửi email, upload file
│ └── lib/ # Kết nối DB, cấu hình dịch vụ
├── public/ # Tài nguyên tĩnh (CSS, JS, ảnh)
├── app.js # Khởi tạo server Express
├── connect.js # Kết nối cơ sở dữ liệu
├── .env.example # File mẫu biến môi trường
├── package.json
└── README.md


---

## ⚙️ Cài đặt & chạy thử

1. Clone dự án

git clone https://github.com/sonchanel/OnBoardWeb.git
cd OnBoardWeb

2. Cài đặt dependencies

npm install

3. Tạo file .env

Dựa trên .env.example, tạo file .env và điền thông tin

4. Chạy ứng dụng

npm start

Truy cập: http://localhost:3000

## 🎨 Giao diện chính
Trang đăng nhập
Trang chủ quản lý
Quản lý nhân viên
Quản lý quy trình
Giao diện nhân viên thực hiện onboarding

## 🔮 Hướng phát triển

Tích hợp API để đồng bộ với HRM / CRM

Xây dựng dashboard báo cáo tiến độ onboarding

Tối ưu trải nghiệm người dùng (UI/UX)

Hỗ trợ đa ngôn ngữ


////////


