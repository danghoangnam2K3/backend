# BÁO CÁO THỰC HÀNH BUỔI 4: KẾT NỐI SQL SERVER & SEQUELIZE ORM

- **Môn học:** Lập trình Backend
- **Họ và tên:** Đặng Hoàng Nam
- **Mã sinh viên:** 525000384
- **Dự án:** Quản lý sinh viên với Node.js, Express 5, TypeScript và Sequelize ORM

---

## PHẦN 1: BẢNG KẾT QUẢ KIỂM THỬ THỰC TẾ

| Mã ca | Thao tác / Request | Method & URL | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Kiểm tra kết nối CSDL độc lập | Terminal: `pnpm check:db` | `DB connected: QuanLySinhVienDB` | In đúng thông báo và thoát sạch tài nguyên | **ĐẠT** |
| **02** | Xem dữ liệu trong SSMS sau seed | Query: `SELECT * FROM dbo.SinhVien ORDER BY maSV` | Có 2 sinh viên `SV001` (Minh Nhật) và `SV002` (Lan Anh) | Hiển thị chuẩn tiếng Việt Unicode | **ĐẠT** |
| **03** | Lấy danh sách qua API | `GET /api/v1/sinh-vien` | Status 200, mảng 2 sinh viên từ CSDL | Status 200, `success=true`, data đủ 2 SV | **ĐẠT** |
| **04** | Tìm sinh viên tồn tại | `GET /api/v1/sinh-vien/SV001` | Status 200, thông tin Minh Nhật | Status 200, đúng mã SV001 | **ĐẠT** |
| **05** | Tìm sinh viên không có | `GET /api/v1/sinh-vien/SV999` | Status 404, "Không tìm thấy sinh viên" | Status 404, `success=false` | **ĐẠT** |
| **06** | Thêm mới sinh viên SV003 | `POST /api/v1/sinh-vien` | Status 201 Created, data là SV003 | Status 201, CSDL ghi nhận SV003 | **ĐẠT** |
| **07** | **Lưu bền vững sau restart** | Tắt server (`Ctrl+C`), bật lại `pnpm dev`, gọi `GET /SV003` | Status 200, SV003 vẫn tồn tại nguyên vẹn | Dữ liệu không bị mất, chứng minh lưu vào SQL Server | **ĐẠT** |
| **08** | Thêm trùng mã SV003 | `POST /api/v1/sinh-vien` (cùng body) | Status 409 Conflict, "Mã sinh viên đã tồn tại" | Status 409, không ghi đè dữ liệu | **ĐẠT** |
| **09** | Validation: Thiếu họ tên | `POST /api/v1/sinh-vien` (thiếu `hoTen`) | Status 400 Bad Request, báo lỗi cụ thể | Status 400, không lưu bản ghi lỗi | **ĐẠT** |
| **10** | Validation: Email sai | `POST /api/v1/sinh-vien` (`email: "khong-phai-email"`) | Status 400 Bad Request | Status 400, báo email sai định dạng | **ĐẠT** |
| **11** | Validation: Mã kiểu số | `POST /api/v1/sinh-vien` (`maSV: 4`) | Status 400 Bad Request | Status 400, báo lỗi kiểu dữ liệu | **ĐẠT** |
| **12** | Bắt lỗi JSON hỏng | `POST /api/v1/sinh-vien` (`{"maSV":"SV004"`) | Status 400 Bad Request (Error Middleware) | Status 400, báo JSON không đúng định dạng | **ĐẠT** |
| **13** | Đường dẫn không có | `GET /khong-co` | Status 404 Not Found (Middleware 404) | Status 404, "Không tìm thấy đường dẫn" | **ĐẠT** |

---

## PHẦN 2: NHẬT KÝ PROMPT VIBE CODING

1. **Yêu cầu AI làm gì?**
   - Phân tích và chuyển đổi kho lưu trữ dữ liệu từ mảng trong RAM (`sinhVienList`) sang CSDL SQL Server sử dụng thư viện `Sequelize 6` và driver `tedious`.
   - Sinh các file kịch bản SQL (`sql/01`, `sql/02`, `sql/03`), cấu hình Sequelize kết nối an toàn, chuyển đổi Service và Controller sang `async/await`, và viết hàm khởi động server an toàn trong `src/server.ts`.
2. **Tôi đã kiểm tra thế nào?**
   - Chạy `pnpm build` để kiểm tra trình biên dịch TypeScript không phát sinh lỗi kiểu hoặc thiếu `await`.
   - Chạy script `pnpm check:db` để xác thực kết nối SQL Server độc lập trước khi mở server.
   - Dùng Postman kiểm tra kịch bản lưu bền vững: `POST SV003` $\rightarrow$ Tắt server (`Ctrl + C`) $\rightarrow$ Khởi động lại server $\rightarrow$ `GET SV003` vẫn thấy dữ liệu.
3. **Tôi hiểu thêm điều gì?**
   - Hiểu rõ sự khác biệt giữa lưu trữ tạm thời trên bộ nhớ RAM và lưu trữ bền vững (persistent storage) trong CSDL quan hệ.
   - Hiểu cách thức ORM (Sequelize) chuyển đổi các phương thức JavaScript (`findAll`, `findByPk`, `create`) thành câu lệnh SQL tương ứng mà không cần phải viết SQL thủ công trong code backend.
4. **Phần tôi đã điều chỉnh:**
   - Cấu hình chuẩn xác cờ `encrypt` và `trustServerCertificate` trong `dialectOptions` của Sequelize để tương thích với môi trường SQL Server trên Windows.
   - Bổ sung kiểm tra độ dài các trường (`hoTen <= 150`, `email <= 254`, `maLop <= 50`) để khớp hoàn toàn với giới hạn kích thước cột đã thiết kế trong bảng SQL.

---

## PHẦN 3: TỰ TRẢ LỜI CÁC CÂU HỎI BẢN CHẤT (Mục 22 đề bài)

### 1. DTO và Model khác nhau thế nào?
- **DTO (Data Transfer Object):** Là khuôn mẫu (interface) dùng để **mô tả cấu trúc dữ liệu trao đổi** giữa các tầng trong ứng dụng hoặc giữa Client và Server (ở đây là `ISinhVienDTO` gồm 4 trường chuỗi). DTO tồn tại ở mức ứng dụng và bị xóa bỏ sau khi biên dịch sang JavaScript.
- **Model (Sequelize Model):** Là lớp đối tượng đại diện và **ánh xạ trực tiếp tới bảng CSDL** (`dbo.SinhVien` trong SQL Server). Model chứa định nghĩa về kiểu dữ liệu SQL (VARCHAR, NVARCHAR), khóa chính (primaryKey), khóa ngoại (foreignKey) và cung cấp các hàm tương tác với cơ sở dữ liệu (`findAll`, `create`, `update`, `destroy`).

### 2. Vì sao Controller cần `await` sau khi đổi Service?
- Khi làm việc với mảng trong RAM, các thao tác đọc/ghi diễn ra đồng bộ tức thì trên bộ nhớ.
- Khi chuyển sang SQL Server, mọi thao tác truy vấn mạng và đọc/ghi đĩa đều là **bất đồng bộ (asynchronous)**, các hàm Service trả về đối tượng `Promise`.
- Controller bắt buộc phải có từ khóa `await` để chờ CSDL phản hồi dữ liệu thực tế về trước khi đóng gói thành JSON trả cho client. Nếu thiếu `await`, client sẽ nhận về một đối tượng `Promise {}` rỗng thay vì dữ liệu sinh viên.

### 3. Vì sao `restart server` không dùng để reset test nữa?
- Ở các bài trước, dữ liệu nằm trong biến mảng trên bộ nhớ RAM của tiến trình Node.js; khi restart server, RAM bị xóa trắng và mảng được gán lại 2 phần tử seed ban đầu.
- Khi đã kết nối SQL Server, dữ liệu được ghi bền vững xuống ổ cứng (hard drive) của máy chủ CSDL. Việc restart tiến trình Node.js chỉ khởi động lại web server Express chứ không làm mất hay thay đổi bất kỳ bản ghi nào trong Database. Muốn reset dữ liệu, ta phải thao tác trực tiếp trên CSDL (bằng SQL script).

### 4. Khóa chính (Primary Key - PK) bảo vệ trùng mã thế nào?
- Thuộc tính `maSV` được cấu hình là `PRIMARY KEY` trong bảng `dbo.SinhVien`. Cơ chế của hệ quản trị CSDL SQL Server đảm bảo tính duy nhất tuyệt đối (Unique Constraint) cho khóa chính.
- Ngay cả khi xảy ra trường hợp 2 request gửi đồng thời (race condition) vượt qua được bước kiểm tra `findByPk` ở tầng ứng dụng, SQL Server vẫn sẽ chặn bản ghi thứ hai ở mức Database và ném ra lỗi `UniqueConstraintError`. Service bắt lỗi này và trả về `409 Conflict`, bảo vệ tính toàn vẹn dữ liệu.

### 5. Tại sao POST và GET phải đọc/ghi cùng một nguồn?
- Nguyên tắc nhất quán dữ liệu (Data Consistency): Nếu API `POST` ghi dữ liệu vào một nơi (ví dụ ghi vào mảng RAM), trong khi API `GET` lại truy vấn từ một nơi khác (ví dụ đọc từ SQL Server), thì sau khi client thêm sinh viên thành công, gọi lệnh xem danh sách sẽ không bao giờ thấy sinh viên đó xuất hiện.
- Việc đọc và ghi cùng một nguồn CSDL duy nhất bảo đảm trạng thái của hệ thống luôn đồng bộ, chính xác và phản ánh đúng những gì người dùng đã thực hiện.
