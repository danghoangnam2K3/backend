import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware phân quyền yêu cầu vai trò quản trị viên (Admin)
 * Trả về 403 Forbidden nếu người dùng không có vai trò admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // Kiểm tra an toàn: req.user phải tồn tại và có role là admin
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện thao tác này (yêu cầu vai trò Admin)',
      data: null,
    });
    return;
  }

  next(); // Đúng quyền Admin: tiếp tục xử lý
};
