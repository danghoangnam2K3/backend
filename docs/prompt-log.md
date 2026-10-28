# Prompt log - Buổi 5: RESTful CRUD & Swagger


---

## 1. Nhiệm vụ 1: Bổ sung API PUT (Cập nhật sinh viên)
- **Bối cảnh và file tôi đã đưa cho AI:**
  - Dự án Node.js, Express 5, TypeScript (NodeNext), Sequelize 6 kết nối SQL Server.
  - Cung cấp: `src/routes/sinhVien.routes.ts`, `src/controllers/sinhVien.controller.ts`, `src/services/sinhVien.service.ts`.
- **Prompt do tôi viết (theo CTCO):**
  - *Context:* Tôi đang làm dự án quản lý sinh viên bằng Express và TypeScript theo kiến trúc Route -> Controller -> Service.
  - *Task:* Hãy bổ sung PUT /api/v1/sinh-vien/:maSV.
  - *Constraint:* Lấy maSV từ URL; body có đủ hoTen, email, maLop (không cho sửa maSV qua body). Body sai trả 400, không có mã trả 404, thành công trả 200. Giữ nguyên nguồn dữ liệu và kiến trúc.
  - *Output:* Chỉ ra file cần sửa, cung cấp code đầy đủ và giải thích luồng xử lý.
- **AI đề xuất thay đổi:**
  - Thêm hàm `capNhatSinhVien` trong Service kiểm tra validation, tìm qua `SinhVien.findByPk(maSV)` và gọi `update()`.
  - Thêm `capNhatSinhVien` trong Controller dùng async/await, trả về HTTP 200.
  - Khai báo `router.put('/:maSV', capNhatSinhVien)` trong Route.
- **File / đoạn code tôi đã đọc và sửa:**
  - `src/services/sinhVien.service.ts`: bổ sung logic lọc trường chỉ cho phép `hoTen, email, maLop`.
  - `src/controllers/sinhVien.controller.ts`: đọc `req.params.maSV` và `req.body`.
  - `src/routes/sinhVien.routes.ts`: gắn phương thức PUT vào router.
- **Build thực tế:** Lệnh `pnpm build` kết thúc thành công (exit code 0).
- **Test T06 / T07 / T08:**
  - T06 (PUT hợp lệ): Expected 200 -> Actual 200.
  - T07 (PUT thiếu email): Expected 400 -> Actual 400.
  - T08 (PUT SV9999): Expected 404 -> Actual 404.
- **Cách tôi xác nhận dữ liệu:** Gọi `GET /api/v1/sinh-vien/SV003` ngay sau PUT để xác minh họ tên mới đã được ghi bền vững vào SQL Server.
- **Tôi giải thích được điều gì:** Hiểu được `maSV` phải lấy từ `req.params`, còn dữ liệu cập nhật lấy từ `req.body`. Service không được nhận trực tiếp `req/res`.
- **Vấn đề còn lại:** Không phát sinh lỗi.

---

## 2. Nhiệm vụ 2: Bổ sung API DELETE (Xóa sinh viên)
- **Bối cảnh và file tôi đã đưa cho AI:**
  - Tiếp nối 4 API đã có (GET list, GET detail, POST, PUT).
  - Cung cấp Service, Controller, Route.
- **Prompt do tôi viết (theo CTCO):**
  - *Context:* Dự án quản lý sinh viên Express 5 + Sequelize.
  - *Task:* Bổ sung DELETE /api/v1/sinh-vien/:maSV.
  - *Constraint:* Lấy maSV từ URL; tìm thấy thì xóa trả 200 kèm thông báo thành công (không có data); không tìm thấy trả 404; không làm ảnh hưởng các API khác.
  - *Output:* Cung cấp code sửa đổi và hướng dẫn kiểm thử.
- **AI đề xuất thay đổi:**
  - Thêm hàm `xoaSinhVien` trong Service: tìm bản ghi rồi gọi `destroy()`.
  - Thêm `xoaSinhVien` trong Controller trả về `{ success: true, message: "Xóa sinh viên thành công" }`.
  - Thêm `router.delete('/:maSV', xoaSinhVien)`.
- **Build thực tế:** `pnpm build` biên dịch chuẩn xác.
- **Test T10 / T11 / T12:**
  - T10 (DELETE lần 1): Expected 200 -> Actual 200.
  - T11 (GET sau khi xóa): Expected 404 -> Actual 404 (xác nhận bản ghi đã bị xóa sạch khỏi CSDL).
  - T12 (DELETE lần 2): Expected 404 -> Actual 404.
- **Tôi giải thích được điều gì:** Hiểu vì sao DELETE lần hai trả 404 là đúng (vì tài nguyên đã không còn tồn tại) và vì sao phải GET lại sau khi DELETE (để đảm bảo không bị lỗi "báo thành công nhưng DB vẫn còn").

---

## 3. Bài tự viết prompt mở rộng theo CTCO (Tìm sinh viên theo lớp)

### A. Phân tích trước khi viết Prompt:
- **Lý do chọn endpoint `GET /api/v1/sinh-vien/lop/:maLop`:**
  - `maLop` là một thuộc tính phân loại nhóm của sinh viên (1 lớp có nhiều sinh viên).
  - Ta đặt tiền tố `/lop/:maLop` để tránh xung đột với endpoint `/api/v1/sinh-vien/:maSV` (nếu đặt trùng mẫu đường dẫn có 1 tham số, Express sẽ không phân biệt được đâu là mã SV và đâu là mã lớp).
  - Phương thức là `GET` vì đây là thao tác đọc dữ liệu (Idempotent), kết quả trả về là một mảng danh sách sinh viên thuộc lớp đó.

### B. Prompt theo khung CTCO hoàn chỉnh:

```text
[CONTEXT]:
Tôi đang phát triển dự án Backend Quản lý sinh viên bằng Node.js, Express 5, TypeScript (chuẩn ESM/NodeNext) và Sequelize 6 kết nối CSDL SQL Server (bảng dbo.SinhVien).
Kiến trúc dự án tuân thủ nghiêm ngặt mô hình 3 tầng: Route -> Controller -> Service. Hiện tại hệ thống đã hoàn thiện 5 API RESTful CRUD cơ bản tại tiền tố /api/v1/sinh-vien.

[TASK]:
Hãy bổ sung tính năng tra cứu danh sách sinh viên theo mã lớp: GET /api/v1/sinh-vien/lop/:maLop.

[CONSTRAINT]:
1. Giữ nguyên toàn bộ 5 API CRUD hiện tại, không làm thay đổi các chức năng cũ.
2. Endpoint: GET /api/v1/sinh-vien/lop/:maLop (lấy maLop từ req.params.maLop, kiểm tra chuỗi không rỗng).
3. Service: Sử dụng SinhVien.findAll({ where: { maLop }, order: [['maSV', 'ASC']] }) để truy vấn dữ liệu từ SQL Server, chuyển đổi sang plain DTO (ISinhVienDTO[]).
4. Phản hồi:
   - Thành công: HTTP 200, format { success: true, message: "Lấy danh sách sinh viên theo lớp thành công", data: [ ... ] }. Nếu lớp không có sinh viên nào, trả về mảng rỗng [] với HTTP 200 (không trả 404 vì đây là tập hợp rỗng hợp lệ).
   - Lỗi tham số: HTTP 400 nếu maLop không hợp lệ.
5. Đảm bảo toàn bộ import nội bộ đều có đuôi .js theo chuẩn NodeNext.

[OUTPUT]:
1. Chỉ rõ các file cần chỉnh sửa (Route, Controller, Service).
2. Trả về đầy đủ nội dung code cập nhật của từng file (kèm chú thích tiếng Việt rõ ràng, không dùng dấu ba chấm thay code).
3. Hướng dẫn kịch bản kiểm thử trên Postman (ca lớp có sinh viên và ca lớp không có sinh viên).
```
