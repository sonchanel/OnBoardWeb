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
- Trang đăng nhập
<img width="1025" height="495" alt="image" src="https://github.com/user-attachments/assets/53ff9357-6cfd-48cc-a866-d56bc9d1fa13" />

- Trang chủ quản lý
<img width="1038" height="486" alt="image" src="https://github.com/user-attachments/assets/0425af36-149f-46cc-89a1-43c0a09cfb2d" />

- Quản lý nhân viên
<img width="1016" height="452" alt="image" src="https://github.com/user-attachments/assets/7b188c07-1553-4399-ae24-7f265f6c6f30" />

- Quản lý quy trình
<img width="1021" height="403" alt="image" src="https://github.com/user-attachments/assets/a8977747-da05-476e-9ee7-a901aedb9b76" />
<img width="1029" height="477" alt="image" src="https://github.com/user-attachments/assets/2fc8d935-1a3c-4835-a115-b4263cfd0bc4" />

- Giao diện nhân viên thực hiện onboarding
<img width="1016" height="658" alt="image" src="https://github.com/user-attachments/assets/2f58c716-42dc-47b9-bea4-ce53edf8f2b0" />
<img width="945" height="425" alt="image" src="https://github.com/user-attachments/assets/1ea5c8a5-8b0a-4407-a510-03a33aa91abe" />

## 🔮 Hướng phát triển

Tích hợp API để đồng bộ với HRM / CRM

Xây dựng dashboard báo cáo tiến độ onboarding

Tối ưu trải nghiệm người dùng (UI/UX)

Hỗ trợ đa ngôn ngữ


////////


