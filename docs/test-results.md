# KẾT QUẢ KIỂM THỬ AUTHENTICATION & AUTHORIZATION (BUỔI 07 / CHƯƠNG 06)
## DỰ ÁN: JWT · MIDDLEWARE · PHÂN QUYỀN (RBAC)

- **Công cụ kiểm thử:** Postman & Swagger UI (`http://localhost:5000/api-docs`)
- **Tập tin ghi log:** `logs/access.log` (chế độ append)
- **Tài khoản kiểm thử:**
  - Student: `student.test@example.com` / `SinhVien@123`
  - Admin: `admin@example.com` / `Admin@123456`

---

## PHẦN 1: BẢNG TEST REGISTER, LOGIN VÀ JWT (A01 - A12)

| Mã | Request / Tình huống | Method & URL | Kỳ vọng | Thực tế | Bằng chứng kiểm chứng | Đánh giá |
| :---: | :--- | :--- | :---: | :---: | :--- | :---: |
| **A01** | Register email mới, body hợp lệ | `POST /api/auth/register` | 201 | 201 | User tồn tại trong SQL Server; role='student', password được hash bcrypt cost 12 | **PASS** |
| **A02** | Register trùng email A01 | `POST /api/auth/register` | 409 | 409 | `success: false`, báo lỗi "Email đã được sử dụng"; không tăng số user trong DB | **PASS** |
| **A03** | Register body thêm role=admin | `POST /api/auth/register` | 400 | 400 | Zod `.strict()` từ chối thuộc tính lạ; không cho phép client tự tạo Admin | **PASS** |
| **A04** | Register thiếu password / email sai | `POST /api/auth/register` | 400 | 400 | Bị Zod Middleware chặn trước Controller; không lưu dữ liệu lỗi | **PASS** |
| **A05** | Login đúng tài khoản student | `POST /api/auth/login` | 200 | 200 | Trả về `accessToken` JWT hợp lệ 3 phần (header.payload.signature) | **PASS** |
| **A06** | Login sai password | `POST /api/auth/login` | 401 | 401 | Thông báo chung "Email hoặc mật khẩu không chính xác"; không trả token | **PASS** |
| **A07** | Login email không tồn tại | `POST /api/auth/login` | 401 | 401 | Thông báo chung 401; không làm lộ sự tồn tại của tài khoản trong hệ thống | **PASS** |
| **A08** | GET /api/auth/profile không có token | `GET /api/auth/profile` | 401 | 401 | `isAuth` chặn lại: "Chưa xác thực danh tính (thiếu hoặc sai Bearer Token)" | **PASS** |
| **A09** | Profile với token bị sửa 1 ký tự | `GET /api/auth/profile` | 401 | 401 | `jwt.verify` phát hiện sai chữ ký số HS256, từ chối request ngay lập tức | **PASS** |
| **A10** | Profile với JWT student hợp lệ | `GET /api/auth/profile` | 200 | 200 | Nhận đúng hồ sơ của User; tuyệt đối không trả trường `passwordHash` | **PASS** |
| **A11** | Token hết hạn gọi Profile | `GET /api/auth/profile` | 401 | 401 | Báo lỗi token đã hết hạn (`jwt expired`) | **PASS** |
| **A12** | Kiểm tra an toàn SQL Server & Log | *Kiểm toán hệ thống* | PASS | PASS | SQL Server chỉ lưu chuỗi băm `$2b$12$...`; Morgan không log password/token | **PASS** |

---

## PHẦN 2: BẢNG TEST ISAUTH VÀ ISADMIN TRÊN SINHVIEN (B01 - B12)

| Mã | Request / Tài khoản | Method & URL | Kỳ vọng | Thực tế | Kiểm chứng thêm (GET / DB) | Đánh giá |
| :---: | :--- | :--- | :---: | :---: | :--- | :---: |
| **B01** | GET danh sách, không JWT | `GET /api/v1/sinh-vien` | 200 | 200 | Endpoint Public; data trả về là mảng danh sách | **PASS** |
| **B02** | POST SinhVien, không JWT | `POST /api/v1/sinh-vien` | 401 | 401 | `isAuth` chặn lại; CSDL không chèn thêm bản ghi | **PASS** |
| **B03** | PUT SinhVien, token không hợp lệ | `PUT /api/v1/sinh-vien/SV001` | 401 | 401 | `isAuth` chặn lại; giá trị cũ của SV001 giữ nguyên | **PASS** |
| **B04** | DELETE SinhVien, JWT student | `DELETE /api/v1/sinh-vien/SV001` | 403 | 403 | `isAdmin` chặn: "yêu cầu vai trò Admin"; SV001 vẫn tồn tại | **PASS** |
| **B05** | POST SinhVien, JWT student | `POST /api/v1/sinh-vien` | 403 | 403 | Bị từ chối 403; không chèn bản ghi vào SQL Server | **PASS** |
| **B06** | PUT SinhVien, JWT student | `PUT /api/v1/sinh-vien/SV001` | 403 | 403 | Bị từ chối 403; không cập nhật dữ liệu | **PASS** |
| **B07** | POST SinhVien hợp lệ, JWT admin | `POST /api/v1/sinh-vien` | 201 | 201 | Thêm thành công; gọi `GET /SV098` thấy bản ghi mới trong CSDL | **PASS** |
| **B08** | PUT SinhVien hợp lệ, JWT admin | `PUT /api/v1/sinh-vien/SV098` | 200 | 200 | Cập nhật thành công; gọi `GET /SV098` thấy dữ liệu mới thay đổi | **PASS** |
| **B09** | DELETE SinhVien, JWT admin | `DELETE /api/v1/sinh-vien/SV098` | 200 | 200 | Xóa thành công; gọi lại `GET /SV098` trả về đúng mã 404 | **PASS** |
| **B10** | Admin POST body sai Zod | `POST /api/v1/sinh-vien` | 400 | 400 | Qua được Auth nhưng bị Zod Validation chặn vì thiếu trường | **PASS** |
| **B11** | Admin POST mã bị trùng | `POST /api/v1/sinh-vien` | 409 | 409 | Tầng CSDL/Service chặn trùng mã khóa chính | **PASS** |
| **B12** | DELETE cùng mã lần thứ 2 bằng Admin | `DELETE /api/v1/sinh-vien/SV098` | 404 | 404 | Báo lỗi 404 Not Found do không còn dữ liệu để xóa | **PASS** |

---

## KẾT LUẬN & ĐÁNH GIÁ CHUYÊN MÔN
- Cả 24/24 ca kiểm thử đều đạt tiêu chuẩn chất lượng cao nhất.
- Hệ thống bảo mật 2 lớp: `isAuth` (Authentication) đứng trước xác minh tính hợp lệ của JWT, sau đó `isAdmin` (Authorization) kiểm tra quyền quản trị trước khi cho phép vào Controller thực hiện các thao tác ghi (POST/PUT/DELETE).
- Dữ liệu người dùng được bảo vệ tuyệt đối: mật khẩu băm bcrypt salt round 12, token ký HS256 với secret an toàn, không bao giờ lộ passwordHash ra ngoài client.
