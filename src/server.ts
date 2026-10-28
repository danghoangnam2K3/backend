import 'dotenv/config'; // Nạp các biến môi trường từ file .env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import sinhVienRoutes from './routes/sinhVien.routes.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { sequelize } from './config/database.js';
import { swaggerSpec } from './config/swagger.config.js'; // Cấu hình Swagger OpenAPI

// Khởi tạo đối tượng ứng dụng Express
const app = express();

// Lấy cổng từ biến môi trường .env, mặc định là cổng 5000
const PORT = process.env.PORT || 5000;

// 1. Middleware ghi log yêu cầu
app.use(loggerMiddleware);

// 2. Middleware bảo mật và chia sẻ tài nguyên
app.use(helmet());
app.use(cors());

// 3. Middleware đọc JSON body
app.use(express.json());

// 4. Tích hợp giao diện Swagger UI tài liệu API tại /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. Route kiểm tra trạng thái máy chủ
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend quản lý sinh viên đang hoạt động',
  });
});

// Gắn router nghiệp vụ sinh viên
app.use('/api/v1/sinh-vien', sinhVienRoutes);

// 6. Middleware xử lý đường dẫn không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy đường dẫn',
    data: null,
  });
});

// 7. Middleware tập trung xử lý lỗi (luôn đặt ở cuối cùng)
app.use(errorMiddleware);

// Hàm khởi động an toàn
async function start(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('DB connected: QuanLySinhVienDB');
  } catch (error: any) {
    console.warn('[DB Notice] Chưa kết nối được SQL Server (TCP 1433). Server tự động vận hành chế độ in-memory (RAM) để phục vụ Swagger UI và kiểm thử.');
  }

  app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Tài liệu Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}

start();
