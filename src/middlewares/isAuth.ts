import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware xác thực danh tính người dùng qua Bearer JWT Token
 * Trả về 401 Unauthorized nếu thiếu token, sai token hoặc token hết hạn
 */
export const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Kiểm tra header Authorization phải có dạng 'Bearer <token>'
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Chưa xác thực danh tính (thiếu hoặc sai định dạng Bearer Token)',
      data: null,
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token xác thực không được để trống',
      data: null,
    });
    return;
  }

  try {
    // Xác minh chữ ký số và hạn dùng của token
    const payload = verifyToken(token);
    // Bổ sung thông tin người dùng vào Request
    req.user = payload;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ, sai chữ ký hoặc đã hết hạn',
      data: null,
    });
  }
};
