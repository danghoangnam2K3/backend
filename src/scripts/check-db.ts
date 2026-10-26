import { sequelize } from '../config/database.js';

// Hàm kiểm tra xác thực kết nối độc lập với SQL Server
async function main(): Promise<void> {
  try {
    // Thử kết nối và xác thực tài khoản
    await sequelize.authenticate();
    console.log('DB connected: QuanLySinhVienDB');
  } catch (error: any) {
    // Báo lỗi chẩn đoán nhưng tuyệt đối không làm lộ mật khẩu/secrets
    console.error('[DB Check Error] Kết nối SQL Server thất bại:');
    if (error && error.message) {
      console.error(`- Nguyên nhân: ${error.message}`);
    } else {
      console.error('- Không xác định được lỗi cụ thể.');
    }
    process.exitCode = 1;
  } finally {
    // Luôn đóng kết nối sau khi kiểm tra xong để giải phóng tài nguyên
    await sequelize.close();
  }
}

main();
