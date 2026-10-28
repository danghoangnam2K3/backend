import type { RequestHandler } from 'express';
import type { z } from 'zod';

/**
 * Middleware validate dữ liệu đầu vào sử dụng Zod schema
 * Trả về HTTP 400 kèm chi tiết các trường lỗi nếu dữ liệu không khớp schema
 */
export const validate = (schema: z.ZodType): RequestHandler => {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        data: null,
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message,
        })),
      });
      return; // Dừng: không gọi next() và không đi tiếp vào Controller
    }

    // Gán dữ liệu đã chuẩn hóa (đã trim khoảng trắng) vào req.body
    req.body = parsed.data;
    next(); // Dữ liệu hợp lệ: chuyển tiếp sang handler tiếp theo
  };
};
