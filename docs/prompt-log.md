# NHẬT KÝ PROMPT ENGINEERING (BUỔI 07 / CHƯƠNG 06)
## NÂNG CẤP HỆ THỐNG VỚI AUTHENTICATION & AUTHORIZATION (JWT · BCRYPT · RBAC)

---

## 1. PROMPT 0 — KHẢO SÁT, CHƯA VIẾT CODE (Trang 5)
- **Context:** Tôi tiếp tục project quản lý sinh viên sau Chương 05, dùng Express, TypeScript, pnpm, SQL Server + Sequelize; có Zod, Morgan và docs/openapi.yaml.
- **Task:** Đọc các file tôi cung cấp; mô tả luồng Request hiện tại, cách DB kết nối và các vị trí nên thêm register/login, JWT Middleware.
- **Constraint:** Chưa sửa hay tạo file, không tạo project mới, không đoán nội dung file thiếu, không yêu cầu mật khẩu hoặc toàn bộ `.env`.
- **Output:** Trả bảng “file / đang làm gì / cần giữ hay sửa / lý do” và danh sách thông tin còn thiếu trước khi triển khai.
- **Kết quả:** Xác định cần tạo riêng bảng `dbo.Users` (không trộn vào `SinhVien`), bổ sung `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`, `jwt.ts`, `isAuth.ts`, `isAdmin.ts`.

---

## 2. PROMPT 1 — TẠO SCHEMA USER VÀ MODEL (Trang 6)
- **Context:** Backend hiện dùng SQL Server + Sequelize 6 và có bảng SinhVien thật; tôi cần bổ sung riêng bảng `dbo.Users` để học JWT.
- **Task:** Đề xuất script SQL tạo `dbo.Users` an toàn nếu chưa có và Model Sequelize gồm `id, fullName, email, passwordHash, role`; rà soát quyền DB cần thiết.
- **Constraint:** Không DROP/truncate/sync force/alter; không sửa bảng SinhVien, không lưu mật khẩu rõ; email unique; role mặc định student; giữ ESM/NodeNext.
- **Output:** Liệt kê file, script SQL có điều kiện bảo vệ `IF NOT EXISTS`, Model TypeScript, lệnh chạy trong SSMS và SELECT dùng để xác minh cấu trúc.

---

## 3. PROMPT 2 — ĐĂNG KÝ VỚI BCRYPT (Trang 7)
- **Context:** Dự án đã có User Model, Zod Middleware và mẫu response success/message/data; cần làm POST `/api/auth/register`.
- **Task:** Viết Schema, Service, Controller và khai báo Route đăng ký; kiểm tra email trùng, hash bcrypt cost 12 rồi lưu User.
- **Constraint:** Giữ kiến trúc cũ và SQL Server/Sequelize, không tạo project mới; người đăng ký chỉ là student; từ chối field role; không trả passwordHash.
- **Output:** Trả danh sách file thay đổi, code đầy đủ đúng từng file, các status 201/400/409 và hướng dẫn test cả email trùng.

---

## 4. PROMPT 3 — LOGIN + BCRYPT.COMPARE (Trang 8)
- **Context:** Tôi đã hoàn thành Register, lưu passwordHash trong SQL Server và cần đăng nhập bằng email/password.
- **Task:** Viết login Service/Controller: tìm User, dùng bcrypt.compare, đúng thì gọi generateToken và trả accessToken; sai thì 401.
- **Constraint:** Không lưu plaintext; không log mật khẩu; không phân biệt “email không tồn tại” với “mật khẩu sai”; không dùng jwt.decode để xác minh.
- **Output:** Trả file cần sửa, code TypeScript, ví dụ Request/Response 200 và 401, cùng cách kiểm thử bằng Postman.

---

## 5. PROMPT 4 — GENERATETOKEN VÀ VERIFYTOKEN (Trang 9)
- **Context:** Project Express + TypeScript ESM, đã có User Model và login; cần module `src/utils/jwt.ts` dùng jsonwebtoken.
- **Task:** Viết generateToken nhận id/role, ký HS256 hết hạn 1 giờ; viết verifyToken xác minh chữ ký, hạn dùng và kiểu claims.
- **Constraint:** Bí mật lấy từ process.env.JWT_SECRET; không hard-code; chỉ chấp nhận thuật toán HS256; không tin jwt.decode; giữ import .js của ESM.
- **Output:** Trả code module, hướng dẫn cấu hình `.env.example` an toàn, vị trí gọi từ login và các trường hợp ký/xác minh thất bại.

---

## 6. PROMPT 5 — TẠO ISAUTH VÀ REQ.USER (Trang 10)
- **Context:** Tôi đã có verifyToken, TypeScript Express và GET `/api/auth/profile` chưa được bảo vệ.
- **Task:** Viết Middleware isAuth kiểm tra header Bearer, jwt.verify, xác minh payload rồi gán `req.user`; minh họa khai báo TypeScript cho `req.user`.
- **Constraint:** 401 cho thiếu/sai/hết hạn token; không gọi next sau khi gửi lỗi; không trust payload chưa verify; không dùng any hay in secret ra log.
- **Output:** Trả các file cần thêm/sửa và cách test: không token -> 401, token hợp lệ -> `req.user`; giải thích vì sao phải đặt isAuth trước controller.

---

## 7. PROMPT 6 — TẠO ISADMIN VÀ GIẢI THÍCH 403 (Trang 11)
- **Context:** Middleware isAuth đã gán req.user từ JWT được xác minh; hệ thống học vụ có role student/admin.
- **Task:** Viết isAdmin kiểm tra role là admin, không đủ quyền trả 403; nếu hợp lệ gọi next(); minh họa dùng chung với isAuth.
- **Constraint:** Không nhận role từ req.body/req.query; không đổi 403 thành 401; nếu thiếu req.user phải xử lý an toàn, không gây lỗi 500.
- **Output:** Cho code `src/middlewares/isAdmin.ts`, ví dụ gắn vào một Route cũ và 3 ca test thiếu token / student / admin.

---

## 8. PROMPT 7 — TÍCH HỢP KHÔNG LÀM HỎNG CRUD (Trang 12)
- **Context:** Tôi có `routes/sinhVien.routes.ts` của Chương 05 với năm API CRUD và Zod Validation; nay đã có isAuth/isAdmin.
- **Task:** Đặt isAuth rồi isAdmin vào POST/PUT/DELETE; giữ GET public, giữ nguyên handler, Service, endpoint và quy tắc dữ liệu cũ.
- **Constraint:** Không tạo router, bảng, database hay app Express thứ hai; không bỏ Zod/Morgan/Swagger; không sửa response thành công của Admin.
- **Output:** Trả diff file Route sau khi ghép và bảng ca test bảo đảm Admin đúng quyền, student bị chặn, CRUD cũ không hồi quy.

---

## 9. PROMPT 11 — ĐÓNG VAI SECURITY REVIEWER (Trang 18)
- **Context:** Review bảo mật toàn bộ mã nguồn Authentication & Authorization trước khi nghiệm thu.
- **Các nguy cơ bảo mật phát hiện và phương án khắc phục:**
  1. *Lỗ hổng mật khẩu rõ (Plaintext password):* Khắc phục bằng việc sử dụng `bcrypt.hash(password, 12)` khi đăng ký và `bcrypt.compare()` khi đăng nhập.
  2. *Lỗ hổng lộ khóa bí mật (Hard-coded secret):* Khắc phục bằng việc đọc `JWT_SECRET` từ `.env`, kiểm tra chuỗi rỗng và đưa vào `.gitignore`.
  3. *Lỗ hổng tin tưởng role từ client:* Khắc phục bằng việc schema Register dùng `.strict()` từ chối thuộc tính `role`, gán cứng `role: 'student'` trong backend.
  4. *Lỗ hổng dùng jwt.decode():* Tuyệt đối không dùng `jwt.decode` để xét quyền vì hàm này không kiểm tra chữ ký số (bất kỳ ai cũng sửa được payload); bắt buộc phải dùng `jwt.verify` với thuật toán `HS256`.
  5. *Lỗ hổng rò rỉ dữ liệu nhạy cảm:* Model User và Service không bao giờ trả về trường `passwordHash` trong response hoặc token payload.
