# KẾT QUẢ KIỂM THỬ 12 TEST CASE BẮT BUỘC (BUỔI 5)
## DỰ ÁN: RESTFUL CRUD VÀ SWAGGER UI

- **Công cụ kiểm thử:** Postman & Swagger UI (`http://localhost:5000/api-docs`)

---

## BẢNG KẾT QUẢ KIỂM THỬ CHI TIẾT (T01 - T12)

| ID | Thao tác / Mục tiêu | Method & URL | Body đầu vào | Status mong đợi | Status thực tế | Kết quả kiểm chứng (GET / DB) | Đánh giá |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **T01** | Lấy danh sách sinh viên ban đầu | `GET /api/v1/sinh-vien` | *Không* | 200 | 200 | `data` là mảng chứa danh sách sinh viên hiện có | **PASS** |
| **T02** | Thêm mới SV003 hợp lệ | `POST /api/v1/sinh-vien` | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 201 | 201 | Gọi `GET /SV003` đọc được thông tin sinh viên vừa tạo | **PASS** |
| **T03** | Thêm lại cùng mã SV003 (trùng mã) | `POST /api/v1/sinh-vien` | `{"maSV":"SV003","hoTen":"Ngọc Mai","email":"ngocmai@example.com","maLop":"25CT114"}` | 409 | 409 | `success: false`, message báo "Mã sinh viên đã tồn tại"; trong CSDL chỉ có 1 bản ghi SV003 | **PASS** |
| **T04** | Thêm mã mới nhưng thiếu `hoTen` | `POST /api/v1/sinh-vien` | `{"maSV":"SV004","email":"thunghiem@example.com","maLop":"25CT114"}` | 400 | 400 | Gọi `GET /SV004` trả 404, xác nhận bản ghi lỗi không bị ghi vào CSDL | **PASS** |
| **T05** | Đọc chi tiết SV003 vừa tạo | `GET /api/v1/sinh-vien/SV003` | *Không* | 200 | 200 | Trả về đúng cả 4 trường: `maSV`, `hoTen`, `email`, `maLop` | **PASS** |
| **T06** | Cập nhật SV003 đủ 3 trường hợp lệ | `PUT /api/v1/sinh-vien/SV003` | `{"hoTen":"Ngọc Mai Updated","email":"ngocmai@example.com","maLop":"25CT114"}` | 200 | 200 | Gọi `GET /SV003` thấy họ tên đã đổi thành "Ngọc Mai Updated" | **PASS** |
| **T07** | Cập nhật SV003 nhưng thiếu `email` | `PUT /api/v1/sinh-vien/SV003` | `{"hoTen":"Ngọc Mai Hack","maLop":"25CT114"}` | 400 | 400 | Bị từ chối; gọi `GET /SV003` thấy dữ liệu cũ vẫn được bảo toàn nguyên vẹn | **PASS** |
| **T08** | Cập nhật mã không tồn tại SV9999 | `PUT /api/v1/sinh-vien/SV9999` | `{"hoTen":"Ai Đó","email":"aido@example.com","maLop":"25CT114"}` | 404 | 404 | `success: false`, không tự động chèn thêm mã mới | **PASS** |
| **T09** | Tìm mã không tồn tại SV9999 | `GET /api/v1/sinh-vien/SV9999` | *Không* | 404 | 404 | Phản hồi chuẩn: `{"success":false,"message":"Không tìm thấy sinh viên","data":null}` | **PASS** |
| **T10** | Xóa sinh viên SV003 | `DELETE /api/v1/sinh-vien/SV003` | *Không* | 200 | 200 | Phản hồi chuẩn: `{"success":true,"message":"Xóa sinh viên thành công"}` (không có `data`) | **PASS** |
| **T11** | Kiểm tra lại SV003 sau khi xóa | `GET /api/v1/sinh-vien/SV003` | *Không* | 404 | 404 | Sinh viên không còn tồn tại trong hệ thống | **PASS** |
| **T12** | Xóa lại SV003 lần hai | `DELETE /api/v1/sinh-vien/SV003` | *Không* | 404 | 404 | `success: false`, không gây ảnh hưởng tới các mã sinh viên khác | **PASS** |

---

## KẾT LUẬN & ĐÁNH GIÁ CHUYÊN MÔN
- Cả 12/12 ca kiểm thử bắt buộc đều đạt tiêu chuẩn chất lượng RESTful.
- Các thao tác ghi dữ liệu (POST, PUT, DELETE) đều được kiểm chứng độc lập bằng lệnh GET ngay sau đó, bảo đảm tính toàn vẹn và lưu trữ bền vững trên CSDL.
