import 'dotenv/config';
import { Sequelize } from 'sequelize';

// 1. Kiểm tra sự tồn tại của các biến môi trường bắt buộc (không in mật khẩu ra log)
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`[Database Config] Thiếu biến môi trường bắt buộc: ${envVar}`);
  }
}

// 2. Chuyển đổi và kiểm tra giá trị cổng DB_PORT (phải là số nguyên từ 1 đến 65535)
const dbPortRaw = process.env.DB_PORT || '1433';
const dbPort = parseInt(dbPortRaw, 10);
if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error(`[Database Config] Biến DB_PORT không hợp lệ: "${dbPortRaw}". Cổng phải là số nguyên từ 1 đến 65535.`);
}

// 3. Khởi tạo instance Sequelize dùng chung kết nối tới SQL Server
export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    port: dbPort,
    dialect: 'mssql',
    logging: console.log, // Ghi log truy vấn SQL ra console
    dialectOptions: {
      options: {
        // Mã hóa kết nối (xử lý chuỗi true/false chính xác, không dùng Boolean("false"))
        encrypt: process.env.DB_ENCRYPT !== 'false',
        // Tin cậy chứng chỉ server trên môi trường phát triển local
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
      },
    },
  }
);
