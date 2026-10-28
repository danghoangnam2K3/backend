# KẾT QUẢ KIỂM THỬ VALIDATION VÀ HỒI QUY (BUỔI 06 / CHƯƠNG 05)
## DỰ ÁN: MIDDLEWARES & VALIDATION (ZOD, MORGAN)

- **Công cụ kiểm thử:** Postman & Swagger UI (`http://localhost:5000/api-docs`)
- **Tập tin ghi log:** `logs/access.log` (chế độ append)

---

## PHẦN 1: BẢNG KIỂM THỬ VALIDATION BẮT BUỘC (V01 - V12)

| Mã | Tình huống kiểm thử | Method & URL | Body đầu vào | Kỳ vọng | Thực tế | Xác minh thêm / GET kiểm chứng | Đánh giá |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **V01** | POST SV006 đủ 4 trường hợp lệ | `POST /api/v1/sinh-vien` | `{"maSV":"SV006","hoTen":"Nguyễn Minh An","email":"minhan@example.com","maLop":"25CT114"}` | 201 | 201 | Gọi `GET /SV006` đọc được đúng dữ liệu SV006 vừa tạo | **PASS** |
| **V02** | POST thiếu hoTen, mã SV khác | `POST /api/v1/sinh-vien` | `{"maSV":"SV007","email":"minhan7@example.com","maLop":"25CT114"}` | 400 | 400 | Không thêm sinh viên; `errors` có `field=hoTen` | **PASS** |
| **V03** | POST email không đúng định dạng | `POST /api/v1/sinh-vien` | `{"maSV":"SV008","hoTen":"Lê Văn Tám","email":"email-khong-hop-le","maLop":"25CT114"}` | 400 | 400 | `errors` có `field=email`, message="Email không hợp lệ" | **PASS** |
| **V04** | POST có thêm trường lạ `role: "admin"` | `POST /api/v1/sinh-vien` | `{"maSV":"SV009","hoTen":"Hacker","email":"hacker@example.com","maLop":"25CT114","role":"admin"}` | 400 | 400 | Zod `.strict()` phát hiện và từ chối trường lạ ngoài hợp đồng | **PASS** |
| **V05** | PUT SV006 thiếu email | `PUT /api/v1/sinh-vien/SV006` | `{"hoTen":"Nguyễn Minh An Hack","maLop":"25CT114"}` | 400 | 400 | Gọi `GET /SV006` kiểm chứng: email và họ tên cũ vẫn được bảo toàn nguyên vẹn | **PASS** |
| **V06** | PUT SV006 đủ 3 trường | `PUT /api/v1/sinh-vien/SV006` | `{"hoTen":"Nguyễn Minh An Updated","email":"an.updated@example.com","maLop":"25CT114"}` | 200 | 200 | Gọi `GET /SV006` kiểm chứng: họ tên và email đã đổi thành giá trị mới | **PASS** |
| **V07** | PUT SV006 email sai kiểu (số) | `PUT /api/v1/sinh-vien/SV006` | `{"hoTen":"Nguyễn Minh An","email":12345,"maLop":"25CT114"}` | 400 | 400 | Zod chặn kiểu dữ liệu số, không ghi dữ liệu sai vào CSDL | **PASS** |
| **V08** | POST maSV đã tồn tại | `POST /api/v1/sinh-vien` | `{"maSV":"SV006","hoTen":"Nguyễn Minh An","email":"minhan@example.com","maLop":"25CT114"}` | 409 | 409 | Tầng Service/Database chặn trùng mã, không tạo bản ghi trùng | **PASS** |
| **V09** | PUT mã không tồn tại, body hợp lệ | `PUT /api/v1/sinh-vien/SV9999` | `{"hoTen":"Ai Đó","email":"aido@example.com","maLop":"25CT114"}` | 404 | 404 | Báo lỗi 404, không tự động sinh mã mới | **PASS** |
| **V10** | GET danh sách sinh viên | `GET /api/v1/sinh-vien` | *Không* | 200 | 200 | Trả về `data` là mảng danh sách sinh viên hợp lệ | **PASS** |
| **V11** | GET /health và kiểm tra logs | `GET /health` | *Không* | 200 | 200 | File `logs/access.log` tự động xuất hiện dòng log mới của Morgan | **PASS** |
| **V12** | Restart server, gọi GET lần nữa | `GET /health` | *Không* | 200 | 200 | File `logs/access.log` ghi nối (append, flags='a'), không bị ghi đè | **PASS** |

---

## PHẦN 2: BẢNG KIỂM THỬ HỒI QUY CHƯƠNG 04 (T01 - T12)

| ID | Thao tác / Mục tiêu | Method & URL | Body đầu vào | Status mong đợi | Status thực tế | Kết quả kiểm chứng (GET / DB) | Đánh giá |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **T01** | Lấy danh sách sinh viên ban đầu | `GET /api/v1/sinh-vien` | *Không* | 200 | 200 | `data` là mảng chứa danh sách sinh viên hiện có | **PASS** |
| **T02** | Thêm mới SV003 hợp lệ | `POST /api/v1/sinh-vien` | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 201 | 201 | `GET /SV003` đọc được sinh viên vừa tạo | **PASS** |
| **T03** | Thêm lại cùng mã SV003 (trùng mã) | `POST /api/v1/sinh-vien` | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 409 | 409 | `success: false`, báo trùng mã sinh viên | **PASS** |
| **T04** | Thêm mã mới nhưng thiếu `hoTen` | `POST /api/v1/sinh-vien` | `{"maSV":"SV004","email":"thunghiem@example.com","maLop":"25CT114"}` | 400 | 400 | Bị Zod Middleware chặn trước Controller | **PASS** |
| **T05** | Đọc chi tiết SV003 vừa tạo | `GET /api/v1/sinh-vien/SV003` | *Không* | 200 | 200 | Trả về đúng cả 4 trường | **PASS** |
| **T06** | Cập nhật SV003 đủ 3 trường | `PUT /api/v1/sinh-vien/SV003` | `{"hoTen":"Ngọc Mai Updated","email":"ngocmai@example.com","maLop":"25CT114"}` | 200 | 200 | `GET /SV003` thấy họ tên đổi thành "Ngọc Mai Updated" | **PASS** |
| **T07** | Cập nhật SV003 nhưng thiếu `email` | `PUT /api/v1/sinh-vien/SV003` | `{"hoTen":"Ngọc Mai Hack","maLop":"25CT114"}` | 400 | 400 | Bị chặn, dữ liệu cũ giữ nguyên | **PASS** |
| **T08** | Cập nhật mã không tồn tại SV9999 | `PUT /api/v1/sinh-vien/SV9999` | `{"hoTen":"Ai Đó","email":"aido@example.com","maLop":"25CT114"}` | 404 | 404 | Báo lỗi 404 Not Found | **PASS** |
| **T09** | Tìm mã không tồn tại SV9999 | `GET /api/v1/sinh-vien/SV9999` | *Không* | 404 | 404 | Phản hồi chuẩn: `{"success":false,"message":"Không tìm thấy sinh viên","data":null}` | **PASS** |
| **T10** | Xóa sinh viên SV003 | `DELETE /api/v1/sinh-vien/SV003` | *Không* | 200 | 200 | `{"success":true,"message":"Xóa sinh viên thành công"}` (không có `data`) | **PASS** |
| **T11** | Kiểm tra lại SV003 sau khi xóa | `GET /api/v1/sinh-vien/SV003` | *Không* | 404 | 404 | Sinh viên không còn trong CSDL | **PASS** |
| **T12** | Xóa lại SV003 lần hai | `DELETE /api/v1/sinh-vien/SV003` | *Không* | 404 | 404 | Trả 404, không gây lỗi hệ thống | **PASS** |

---

## KẾT LUẬN & ĐÁNH GIÁ CHUYÊN MÔN
- Toàn bộ 12 ca kiểm thử Validation mới (V01 - V12) và 12 ca hồi quy (T01 - T12) đều đạt chuẩn 100%.
- Middleware Validation chặn hoàn toàn các request sai hình dạng/kiểu dữ liệu ngay tại cổng vào của Route, giúp Controller chỉ tiếp nhận dữ liệu sạch và an toàn.
- Morgan hoạt động ổn định, ghi log nối tiếp đầy đủ thông tin HTTP request vào `logs/access.log`.
