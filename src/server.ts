import 'dotenv/config'; // Nạp các biến môi trường từ file .env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import sinhVienRoutes from './routes/sinhVien.routes.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { sequelize } from './config/database.js'; // Import instance kết nối CSDL

// Khởi tạo đối tượng ứng dụng Express
const app = express();

// Lấy cổng từ biến môi trường .env, mặc định là cổng 5000
const PORT = process.env.PORT || 5000;

// 1. Middleware ghi log yêu cầu (luôn đứng đầu để ghi nhận mọi request đến)
app.use(loggerMiddleware);

// 2. Middleware bảo mật và chia sẻ tài nguyên
app.use(helmet());
app.use(cors());

// 3. Middleware đọc JSON body (phải đứng trước các Route)
app.use(express.json());

// 4. Các route xử lý nghiệp vụ
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend quản lý sinh viên đang hoạt động',
  });
});

// Gắn tiền tố /api/v1/sinh-vien với router sinh viên
app.use('/api/v1/sinh-vien', sinhVienRoutes);

// 5. Middleware xử lý đường dẫn không tồn tại (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy đường dẫn',
  });
});

// 6. Middleware tập trung xử lý lỗi (luôn đặt ở cuối cùng)
app.use(errorMiddleware);

// Hàm khởi động an toàn: Xác thực CSDL trước khi mở cổng HTTP
async function start(): Promise<void> {
  try {
    // 1. Xác thực kết nối CSDL SQL Server trước
    await sequelize.authenticate();
    console.log('DB connected: QuanLySinhVienDB');

    // 2. Chỉ khi kết nối DB thành công mới mở cổng lắng nghe HTTP
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error: any) {
    // Báo lỗi chẩn đoán an toàn, không lộ secrets
    console.error('[Startup Error] Khởi động server thất bại:');
    if (error && error.message) {
      console.error(`- Nguyên nhân: ${error.message}`);
    } else {
      console.error('- Không xác định được lỗi kết nối CSDL.');
    }

    // Đóng kết nối nếu có và thoát tiến trình với exit code khác 0
    try {
      await sequelize.close();
    } catch (_) {}

    process.exit(1);
  }
}

start();
