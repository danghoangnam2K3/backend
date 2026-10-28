# NHẬT KÝ PROMPT ENGINEERING (BUỔI 06 / CHƯƠNG 05)
## NÂNG CẤP API VỚI MIDDLEWARES & VALIDATION (ZOD, MORGAN)

---

## 1. PROMPT 0 — KHẢO SÁT, CHƯA VIẾT CODE (Trang 6)
- **Context:** Tôi tiếp tục dự án quản lý sinh viên của Chương 04 bằng Express, TypeScript, pnpm; có CRUD và OpenAPI YAML.
- **Task:** Đọc các file tôi cung cấp: `package.json`, `tsconfig`, `app/server`, `Route`, `Controller`, `Service` và `OpenAPI`. Xác định luồng POST.
- **Constraint:** Không tạo project mới, không thay đổi file, không đọc/gửi bí mật từ `.env`; không phỏng đoán nội dung file chưa được cung cấp.
- **Output:** Trả bảng “File — vai trò — giữ nguyên/sửa — lý do”, vị trí phù hợp để gắn Zod/Morgan và các rủi ro cần xác nhận.
- **Kết quả thực tế:** Xác định chính xác vị trí chèn middleware vào `routes/sinhVien.routes.ts` trước Controller, giữ nguyên Service và Model.

---

## 2. PROMPT 1 — GIẢI THÍCH MIDDLEWARE (Trang 7)
- **Context:** Tôi đã có API GET `/api/v1/sinh-vien` chạy được trong Express TypeScript.
- **Task:** Giải thích bằng một Request thực tế vai trò `req`, `res`, `next()` và thứ tự `app.use` -> `router` -> `controller`.
- **Constraint:** Chỉ minh họa, không thay đổi API hay dữ liệu; nêu hai tình huống khi gọi và không gọi `next()`.
- **Output:** Trình bày sơ đồ luồng ngắn, chú thích 5 dòng code minh họa và 3 câu hỏi để tự kiểm tra.
- **Bài học rút ra:** Khi validation thất bại, Middleware gửi `res.status(400).json(...)` rồi bắt buộc phải `return`, không được gọi `next()`. Nếu không return, Express sẽ tiếp tục chuyển sang Controller gây lỗi "Cannot set headers after they are sent to the client".

---

## 3. PROMPT 2 — TẠO ZOD SCHEMA (Trang 18)
- **Context:** Tôi tiếp tục `backend-quan-ly-sinh-vien` Chương 04 bằng Express/TypeScript, có 5 API và nguồn dữ liệu hiện tại.
- **Task:** Tạo `src/validations/sinhVien.schema.ts` gồm `createSinhVienSchema` và `updateSinhVienSchema`.
- **Constraint:** POST yêu cầu 4 trường; PUT chỉ `hoTen/email/maLop`; trim chuỗi, từ chối trường lạ (`.strict()`); không đổi DB, URL hay kiến trúc.
- **Output:** Trả code đúng đường dẫn, comment tiếng Việt, giải thích từng rule và ví dụ body hợp lệ/sai.
- **Code tạo ra:** Sử dụng `z.object().strict()`, tái sử dụng `editableFields`, áp dụng `trim()` và giới hạn độ dài theo CSDL.

---

## 4. PROMPT 3 — TẠO VALIDATION MIDDLEWARE (Trang 18)
- **Context:** Tôi đã có hai Zod Schema từ bước trước và Response lỗi của Chương 04.
- **Task:** Tạo `src/middlewares/validate.middleware.ts` dùng `safeParse` để chặn body sai.
- **Constraint:** Giữ `success/message/data`; thêm `errors` (field/message) tùy chọn; HTTP 400 khi sai, `next()` khi đúng; không viết lại Controller.
- **Output:** Trả code TypeScript, vị trí file, mô tả `req.body` và cách kiểm chứng bằng một Request POST sai.
- **Điểm quan trọng:** Gán `req.body = parsed.data` để đảm bảo dữ liệu truyền vào Controller là dữ liệu đã được làm sạch và chuẩn hóa (đã trim khoảng trắng).

---

## 5. PROMPT 4 — GẮN MIDDLEWARE VÀO ROUTER (Trang 19)
- **Context:** API Chương 04 đã khai báo POST/PUT trong `src/routes/sinhVien.routes.ts`.
- **Task:** Chỉ ra cách bổ sung `validate(createSinhVienSchema)` và `validate(updateSinhVienSchema)` trước đúng Controller.
- **Constraint:** Không tạo router/app mới; giữ GET/DELETE và các import ESM/NodeNext hiện hành (đuôi `.js`).
- **Output:** Trả diff đoạn code cần thay, kèm 3 request kiểm tra.

---

## 6. PROMPT 5 — MORGAN VÀ OPENAPI YAML (Trang 19)
- **Context:** Tôi có Express app, `docs/openapi.yaml` và Swagger UI `/api-docs` từ Chương 04.
- **Task:** Đề xuất bổ sung Morgan `access.log` (append) và mô tả `errors` Validation vào YAML hiện tại.
- **Constraint:** Không log mật khẩu/token, không tạo Swagger JSDoc hay file openapi khác, giữ response contract cũ.
- **Output:** Liệt kê file cần thay, phần code thêm tối thiểu, vị trí `app.use` và cách kiểm chứng file log/Swagger.

---

## 7. PROMPT 6 — PHÂN TÍCH CHECK QUYỀN (LIÊN THÔNG BUỔI 07) (Trang 17)
- **Context:** Tôi học Buổi 06 về Middleware và đã có API SinhVien; Buổi 07 mới triển khai JWT.
- **Task:** Giải thích cách một Middleware tương lai kiểm tra quyền admin trước PUT/DELETE.
- **Constraint:** Chưa gắn vào API thật; không tin role từ `req.body/header` của Client; chỉ dùng role đã được Authentication xác minh.
- **Output:** Bảng mã lỗi HTTP:
  - `401 Unauthorized`: Khi client chưa xác thực (chưa gửi Token hoặc Token không hợp lệ/hết hạn).
  - `403 Forbidden`: Khi client đã xác thực thành công (đã biết danh tính là sinh viên), nhưng tài nguyên yêu cầu quyền hạn cao hơn (chỉ dành cho `admin`).
  - Pseudocode:
    ```typescript
    const authorizeRole = (requiredRole: string) => {
      return (req, res, next) => {
        // req.user được Authentication Middleware gắn vào sau khi verify JWT hợp lệ
        if (!req.user || req.user.role !== requiredRole) {
          return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này' });
        }
        next();
      };
    };
    ```

---

## 8. BÀI TẬP BẮT BUỘC A & B (Trang 21)
- **Bài tập A (Mở rộng Validation):**
  - Đã đối chiếu độ dài thực tế trong bảng `dbo.SinhVien`: `hoTen <= 150`, `email <= 254`, `maLop <= 50`, `maSV` định dạng regex `^SV[0-9]{3}$` (độ dài 5 ký tự).
  - Đã tích hợp trực tiếp vào `sinhVien.schema.ts` với `.max()` và `.regex()`.
  - Giải thích: Lỗi trùng `maSV` vẫn bắt buộc phải kiểm tra ở tầng dữ liệu/nghiệp vụ vì chỉ có CSDL hoặc Model mới nắm giữ toàn bộ danh sách các mã đang tồn tại trong hệ thống; Zod Schema là hàm phi trạng thái (stateless) chỉ kiểm tra được hình dạng và kiểu dữ liệu của request hiện thời.
- **Bài tập B (Nhật ký Request Morgan):**
  - File `logs/access.log` ghi nhận đầy đủ IP, Timestamp, HTTP Method, URL, Status Code (201, 200, 400, 404, 409) theo chuẩn `combined`.
  - Cơ chế `flags: 'a'` (append) đảm bảo khi restart máy chủ, các dòng log mới tiếp tục được ghi nối vào cuối file, không bị ghi đè làm mất vết lịch sử hệ thống.
  - Không bao giờ ghi mật khẩu, JWT token hay dữ liệu nhạy cảm vào log để tuân thủ tiêu chuẩn an toàn thông tin (OWASP Logging Cheat Sheet), tránh nguy cơ rò rỉ khi file log bị chia sẻ hoặc kiểm toán.
