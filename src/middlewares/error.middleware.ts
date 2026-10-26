import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

// Middleware tập trung xử lý mọi lỗi trong hệ thống
export const errorMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next
): void => {
  // 1. Bắt lỗi AppError tùy chỉnh (chứa statusCode và message rõ ràng theo nghiệp vụ)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // 2. Xử lý lỗi cú pháp JSON body do client gửi sai
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu JSON gửi lên không đúng định dạng',
    });
    return;
  }

  // 3. Lỗi máy chủ chưa xác định (500)
  console.error('[ERROR] Lỗi hệ thống:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống',
  });
};
