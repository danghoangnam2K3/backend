import fs from 'node:fs';
import path from 'node:path';
import morgan from 'morgan';

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.resolve(process.cwd(), 'logs');
fs.mkdirSync(logsDir, { recursive: true });

// Tạo luồng ghi file logs/access.log ở chế độ nối tiếp (append: flags 'a')
const logFile = path.join(logsDir, 'access.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Middleware ghi log truy cập HTTP theo chuẩn 'combined'
export const accessLogger = morgan('combined', {
  stream: logStream,
});
