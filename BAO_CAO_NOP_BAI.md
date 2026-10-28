# BÁO CÁO THỰC HÀNH BUỔI 4: KẾT NỐI SQL SERVER & SEQUELIZE ORM

- **Môn học:** Lập trình Backend

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

---

# PHẦN 4: TRẢ LỜI ĐẦY ĐỦ CÂU HỎI CUỐI BUỔI 5 (TRANG 17 & TRANG 20 ĐỀ BÀI)

### 1. PUT đi qua những file nào?
- **server.ts**: Nhận request từ client, thông qua middleware `loggerMiddleware`, `express.json()` và chuyển đến router sinh viên mount tại `/api/v1/sinh-vien`.
- **src/routes/sinhVien.routes.ts**: Nhận dạng method `PUT` tại đường dẫn con `/:maSV` và chuyển tiếp cho handler `capNhatSinhVien`.
- **src/controllers/sinhVien.controller.ts**: Trích xuất `maSV = req.params.maSV` và `req.body`, gọi tầng nghiệp vụ `sinhVienService.capNhatSinhVien(maSV, req.body)` với từ khóa `await`. Khi có kết quả, trả về HTTP 200 kèm JSON chuẩn `{ success: true, message: "Cập nhật sinh viên thành công", data: ... }`.
- **src/services/sinhVien.service.ts**: Thực hiện validation (kiểm tra đủ 3 trường `hoTen, email, maLop`, độ dài chuỗi, định dạng email), truy vấn CSDL qua `SinhVien.findByPk(maSV)`, nếu không thấy ném lỗi `AppError('Không tìm thấy sinh viên', 404)`. Nếu tìm thấy, gọi `sinhVien.update(...)` để cập nhật vào bảng `dbo.SinhVien`.
- **src/models/SinhVien.ts**: Lớp Model ánh xạ trực tiếp đến bảng `dbo.SinhVien` trong SQL Server thông qua Sequelize ORM.

### 2. Vì sao GET sau DELETE trả 404 là test đạt?
- Sau khi gửi request `DELETE /api/v1/sinh-vien/SV003`, server trả về HTTP 200 báo đã xóa thành công.
- Tuy nhiên, để chứng minh bản ghi đã thực sự bị xóa sạch khỏi cơ sở dữ liệu (thay vì server chỉ trả về phản hồi tĩnh "giả lập"), ta bắt buộc phải gọi lại `GET /api/v1/sinh-vien/SV003`.
- Khi GET trả về **HTTP 404 Not Found**, điều này xác nhận CSDL không còn tìm thấy mã `SV003`, chứng minh thao tác xóa đã diễn ra triệt để và dữ liệu không bị tồn dư.

### 3. Swagger YAML có tự xử lý nghiệp vụ không?
- **HOÀN TOÀN KHÔNG.** File `docs/openapi.yaml` chỉ đóng vai trò là bản **hợp đồng mô tả giao diện API (API Contract Specification)** theo chuẩn quốc tế OpenAPI 3.0.3.
- Thư viện `swagger-ui-express` chỉ đọc file YAML để dựng giao diện web trực quan tại `/api-docs` giúp lập trình viên xem và gửi request thử nghiệm.
- Mọi logic nghiệp vụ (validation dữ liệu, kiểm tra trùng khóa chính, tính toán, kết nối CSDL, phân quyền) 100% đều do mã nguồn TypeScript Backend (`src/services/sinhVien.service.ts` và `src/controllers/sinhVien.controller.ts`) thực thi khi nhận request.

### 4. Vì sao phải GET lại sau các thao tác ghi (POST, PUT, DELETE)?
- Một API hoàn toàn có thể trả về HTTP 200/201 với JSON rất đẹp mắt ngay cả khi logic backend bị lỗi không ghi dữ liệu xuống CSDL.
- Việc thực hiện lệnh `GET` ngay sau các thao tác ghi giúp:
  - **Sau POST:** Chứng minh bản ghi mới đã được tạo và đọc lại được đầy đủ các thuộc tính.
  - **Sau PUT:** Chứng minh các giá trị mới cập nhật đã đè lên dữ liệu cũ và dữ liệu cũ không bị giữ nguyên.
  - **Sau DELETE:** Chứng minh bản ghi đã biến mất khỏi hệ thống (nhận về 404).
- Đây là nguyên tắc kiểm thử hộp đen chuẩn nhằm xác minh tính lưu trữ bền vững (Data Persistence Verification).

### 5. Sau restart server, dữ liệu có còn không?
- **DỮ LIỆU HOÀN TOÀN CÒN NGUYÊN VẸN.**
- Dự án đã kết nối trực tiếp với CSDL quan hệ **SQL Server 2019** (`QuanLySinhVienDB`).
- Khi tiến trình Node.js (Express server) bị restart (`Ctrl + C` rồi chạy lại), chỉ có bộ nhớ RAM của tiến trình Node.js được giải phóng. Toàn bộ dữ liệu sinh viên đã được ghi bền vững xuống ổ cứng của máy chủ SQL Server thông qua Sequelize ORM, do đó không bị mất đi.

### 6. Khung CTCO giúp viết Prompt rõ ràng như thế nào?
- **Context (Bối cảnh):** Khai báo rõ công nghệ (Express 5, TypeScript NodeNext, Sequelize 6, SQL Server), cấu trúc 3 tầng hiện tại. Giúp AI không tự ý đổi kiến trúc, không sinh code JavaScript cũ và không dùng nhầm thư viện khác.
- **Task (Nhiệm vụ):** Nêu rõ mục tiêu đơn lẻ cần thực hiện (ví dụ: bổ sung duy nhất API PUT hoặc chỉ viết file `docs/openapi.yaml`).
- **Constraint (Ràng buộc):** Đưa ra các ranh giới kỹ thuật bắt buộc: không đổi `maSV` qua body, mã HTTP chính xác (400, 404, 409), import có đuôi `.js`, không dùng JSDoc. Giúp AI không phá vỡ logic cũ và tuân thủ đúng yêu cầu đề bài.
- **Output (Đầu ra):** Chỉ định cụ thể những gì cần nhận về: file cần sửa, code hoàn chỉnh kèm giải thích tiếng Việt, kịch bản test kiểm chứng.

---

# PHẦN 5: BÁO CÁO THỰC HÀNH BUỔI 06 / CHƯƠNG 05 (MIDDLEWARES & VALIDATION)

## 1. ĐOẠN VĂN GIẢI THÍCH (5-7 CÂU) VỀ MIDDLEWARE, NEXT(), ZOD & MORGAN
Trong kiến trúc Express, **Middleware** đóng vai trò là trạm kiểm soát trung gian nằm giữa Route và Controller, tiếp nhận bộ ba tham số `req`, `res` và `next()`.
Hàm `next()` là cơ chế chuyển giao điều khiển; nếu dữ liệu hợp lệ, Middleware gọi `next()` để chuyển sang tầng Controller tiếp tục xử lý nghiệp vụ.
Ngược lại, nếu dữ liệu không hợp lệ, Middleware sẽ phản hồi ngay lập tức mã lỗi HTTP 400 và `return` (ngắt mạch luồng xử lý), tuyệt đối không gọi `next()` để ngăn chặn rác dữ liệu đi vào Controller và CSDL.
**Zod** được sử dụng để định nghĩa Schema hợp đồng dữ liệu cho `req.body`, sử dụng phương thức `safeParse()` để kiểm tra kiểu dữ liệu, bắt buộc chuỗi không rỗng (`trim()`) và từ chối các trường lạ ngoài hợp đồng bằng `.strict()`.
Đồng thời, **Morgan** được tích hợp ở chế độ nối tiếp (append mode: `flags: 'a'`) để tự động ghi lại toàn bộ nhật ký truy cập HTTP vào file `logs/access.log`, cung cấp dữ liệu kiểm toán hệ thống chuẩn xác mà không lưu trữ các thông tin bảo mật nhạy cảm.

---

## 2. TRẢ LỜI CÁC CÂU HỎI VẤN ĐÁP CỦA GIẢNG VIÊN (TRANG 21 ĐỀ BÀI)

### Câu 1: Middleware nằm trước hay sau Controller?
- **Trả lời:** Middleware nằm **TRƯỚC** Controller.
- Khi một HTTP Request đến, thứ tự thực thi là: `Route` $\rightarrow$ `Middleware (Zod validate)` $\rightarrow$ `Controller` $\rightarrow$ `Service`.
- Nếu dữ liệu hợp lệ, Middleware gọi `next()` để chuyển sang Controller. Nếu dữ liệu sai, Middleware trả về HTTP 400 kèm danh sách lỗi và `return` ngay (ngắt mạch - short-circuit), Controller phía sau hoàn toàn không bị kích hoạt.

### Câu 2: safeParse khác parse ở điểm nào?
- **parse():** Nếu dữ liệu không khớp schema, `parse()` sẽ tự động ném ra ngoại lệ (`throw Error`). Điều này buộc lập trình viên phải đặt trong khối `try/catch`, nếu không bắt được lỗi sẽ dẫn đến crash tiến trình hoặc rơi vào lỗi 500 không mong muốn.
- **safeParse():** Không bao giờ throw ngoại lệ. Phương thức này luôn trả về một đối tượng kết quả an toàn: `{ success: true, data }` khi hợp lệ hoặc `{ success: false, error }` khi thất bại. Nhờ đó, Middleware dễ dàng kiểm tra `!parsed.success` và trích xuất mảng `error.issues` để trả về HTTP 400 chi tiết và tường minh.

### Câu 3: Khi nào trả 400, 401, 403, 404, 409?
- **400 Bad Request:** Khi dữ liệu gửi lên bị sai cú pháp, thiếu trường bắt buộc, sai định dạng (ví dụ: email sai, có trường lạ ngoài hợp đồng bị Zod từ chối).
- **401 Unauthorized:** Khi client chưa xác minh được danh tính (chưa đăng nhập, thiếu JWT Token hoặc Token hết hạn).
- **403 Forbidden:** Khi client đã đăng nhập thành công (đã xác thực danh tính), nhưng không có quyền hạn đối với tài nguyên (ví dụ: sinh viên cố tình thực hiện thao tác xóa sinh viên của Admin).
- **404 Not Found:** Khi không tìm thấy tài nguyên theo mã định danh (ví dụ: tìm hoặc sửa sinh viên với mã không tồn tại `SV9999`).
- **409 Conflict:** Khi xảy ra xung đột trạng thái dữ liệu (ví dụ: thêm sinh viên với mã sinh viên đã tồn tại trong CSDL).

### Câu 4: Vì sao YAML không thay thế cho Zod?
- **OpenAPI YAML:** Chỉ là tài liệu tĩnh mô tả hợp đồng giao tiếp (Contract Description) và dựng giao diện Swagger UI ở thời điểm thiết kế. YAML không có khả năng tự động can thiệp hay kiểm tra dữ liệu ở runtime của Express.
- **Zod:** Là thư viện thực thi trực tiếp bằng mã TypeScript trong tiến trình chạy thực tế của server, đóng vai trò là "người gác cổng" ngăn chặn dữ liệu sai lọt vào hệ thống.

### Câu 5: Làm sao biết Validation không phá vỡ API cũ?
- Thực hiện **Kiểm thử hồi quy (Regression Test)**: Sau khi gắn Middleware Zod, ta chạy lại toàn bộ 12 ca kiểm thử bắt buộc (T01 - T12) của Chương 04.
- Kết hợp thực hiện lệnh `GET` kiểm chứng ngay sau mỗi thao tác ghi (POST, PUT, DELETE) để xác nhận hệ thống vẫn hoạt động chính xác và không bị lỗi phụ.

### Câu 6: Khung CTCO giúp AI không viết sai dự án như thế nào?
- **Context (Bối cảnh):** Khai báo rõ công nghệ (Express 5, TypeScript ESM, Sequelize 6, SQL Server) và các file hiện có, ngăn AI tự tiện tạo project mới hoặc dùng CommonJS.
- **Task (Tác vụ):** Nêu nhiệm vụ đơn lẻ cụ thể cho từng bước (tạo Schema, viết Middleware, gắn Route).
- **Constraint (Ràng buộc):** Đưa ra các ranh giới bất biến (không đổi DB, không sửa `maSV` qua body, từ chối trường lạ `.strict()`).
- **Output (Đầu ra):** Chỉ định cụ thể định dạng code, chú thích tiếng Việt và kịch bản test để đối chiếu.
