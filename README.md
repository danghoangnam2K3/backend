# BÁO CÁO & HƯỚNG DẪN DỰ ÁN BACKEND QUẢN LÝ SINH VIÊN
## BUỔI 4: KẾT NỐI SQL SERVER & SEQUELIZE ORM

- **Họ và tên:** Đặng Hoàng Nam
- **Mã sinh viên:** 525000384
- **Công nghệ sử dụng:** Node.js, Express 5, TypeScript (ESM, NodeNext), Sequelize 6, Tedious, pnpm.

---

## 1. Cấu hình SQL Server Local

1. **Bật giao thức TCP/IP và cổng 1433:**
   - Mở **SQL Server Configuration Manager** -> **SQL Server Network Configuration** -> **Protocols for [Tên_Instance]** (SQLEXPRESS hoặc SQL2019).
   - Bật **TCP/IP** = `Enabled`.
   - Trong tab **IP Addresses** -> cuộn xuống mục **IPAll**:
     - Xóa trống ô `TCP Dynamic Ports`.
     - Nhập `TCP Port` = `1433`.
   - Vào **SQL Server Services** -> Nhấp chuột phải vào dịch vụ SQL Server -> Chọn **Restart**.

2. **Bật chế độ xác thực kết hợp (Mixed Authentication Mode):**
   - Mở SSMS, kết nối bằng Windows Authentication.
   - Nhấp chuột phải vào Server -> **Properties** -> **Security** -> Chọn **SQL Server and Windows Authentication mode** -> Bấm OK.
   - Khởi động lại (Restart) SQL Server Database Engine.

---

## 2. Thứ tự thực thi Script SQL trong SSMS

Mở SSMS với tài khoản quản trị và chạy tuần tự 3 script trong thư mục `sql/`:

1. `sql/01-quan-ly-sinh-vien.sql`:
   - Tạo CSDL `QuanLySinhVienDB` (nếu chưa có).
   - Tạo bảng `dbo.SinhVien` với khóa chính `maSV VARCHAR(5) PRIMARY KEY`, các cột `hoTen NVARCHAR(150)`, `email NVARCHAR(254)`, `maLop NVARCHAR(50)`.
2. `sql/02-seed.sql`:
   - Nạp 2 sinh viên mẫu ban đầu: `SV001` (Minh Nhật), `SV002` (Lan Anh) dùng tiền tố Unicode `N'...'`.
   - Sử dụng `IF NOT EXISTS` đảm bảo chạy lại nhiều lần không sinh bản ghi trùng.
3. `sql/03-app-login.sql`:
   - Tạo Login và User `sv_app`.
   - Cấp đúng 2 quyền tối thiểu trên bảng: `GRANT SELECT, INSERT ON dbo.SinhVien TO sv_app`.

---

## 3. Cấu hình biến môi trường (.env)

Tạo file `.env` tại thư mục gốc của dự án (ngang hàng `package.json`):
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=1433
DB_NAME=QuanLySinhVienDB
DB_USER=sv_app
DB_PASSWORD="Mật_khẩu_của_bạn_đã_đặt_trong_03-app-login"
DB_ENCRYPT=true
DB_TRUST_CERT=true
```

---

## 4. Danh sách các lệnh pnpm trong dự án

- **`pnpm build`**: Biên dịch toàn bộ mã TypeScript trong `src/` sang JavaScript trong thư mục `dist/` bằng `tsc`.
- **`pnpm check:db`**: Chạy script độc lập `src/scripts/check-db.ts` để kiểm tra kết nối tới SQL Server mà không cần bật web server.
- **`pnpm dev`**: Khởi động web server ở chế độ phát triển bằng `tsx watch src/server.ts` (tự động reload khi sửa code).
- **`pnpm start`**: Chạy bản build sản phẩm trực tiếp bằng Node.js: `node dist/server.js`.

---

## 5. Quy trình & Điều kiện trước từng ca kiểm thử (Postman)

- **Điều kiện ban đầu:**
  - Chạy `pnpm check:db` báo thành công: `DB connected: QuanLySinhVienDB`.
  - Khởi động server bằng `pnpm dev`.
  - Biến Postman: `baseUrl = http://localhost:5000`.

| Mã ca | Phương thức & URL | Điều kiện trước khi gọi | Kết quả mong đợi |
| :---: | :--- | :--- | :--- |
| **T01** | `GET {{baseUrl}}/` | Server đang chạy | Status 200, thông báo server hoạt động |
| **T02** | `GET {{baseUrl}}/api/v1/sinh-vien` | Sau khi nạp seed ban đầu | Status 200, mảng gồm đúng 2 sinh viên (`SV001`, `SV002`) |
| **T03** | `GET {{baseUrl}}/api/v1/sinh-vien/SV001` | Mã SV001 có sẵn trong DB | Status 200, thông tin sinh viên Minh Nhật |
| **T04** | `GET {{baseUrl}}/api/v1/sinh-vien/SV999` | Mã SV999 chưa từng tạo | Status 404, message: "Không tìm thấy sinh viên" |
| **T05** | `POST {{baseUrl}}/api/v1/sinh-vien` | Mã SV003 chưa có trong DB | Status 201 Created, trả về sinh viên SV003 |
| **T06** | `POST {{baseUrl}}/api/v1/sinh-vien` | Gửi lại ngay body SV003 vừa tạo ở T05 | Status 409 Conflict, message: "Mã sinh viên đã tồn tại" |
| **T07** | `POST {{baseUrl}}/api/v1/sinh-vien` | Body thiếu trường `hoTen` | Status 400 Bad Request, không ghi vào DB |
| **T08** | `POST {{baseUrl}}/api/v1/sinh-vien` | Body có email sai định dạng | Status 400 Bad Request, không ghi vào DB |
| **T09** | `POST {{baseUrl}}/api/v1/sinh-vien` | Body có `maSV` kiểu số (4) | Status 400 Bad Request, không ghi vào DB |
| **T10** | `POST {{baseUrl}}/api/v1/sinh-vien` | Body JSON thiếu dấu ngoặc đóng `}` | Status 400 Bad Request (Error Middleware bắt lỗi JSON) |
| **T11** | `GET {{baseUrl}}/khong-co` | Đường dẫn không tồn tại | Status 404 Not Found (Middleware 404 bắt lỗi) |
| **T12** | **Kiểm tra lưu bền vững** | Bấm `Ctrl+C` tắt server, chạy lại `pnpm dev`, gọi `GET /api/v1/sinh-vien/SV003` | Status 200, sinh viên Ngọc Mai vẫn tồn tại nguyên vẹn trong CSDL SQL Server |
