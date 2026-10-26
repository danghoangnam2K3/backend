import type { Request, Response, NextFunction } from 'express';

// Middleware ghi nhận nhật ký (log) phương thức và đường dẫn của từng request gửi đến
export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // In ra phương thức (GET, POST...) và đường dẫn yêu cầu
  console.log(`[LOG] ${req.method} ${req.path}`);

  // Bắt buộc gọi next() để cho phép request đi tiếp đến các thành phần tiếp theo
  next();
};
