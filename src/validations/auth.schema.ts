import { z } from 'zod';

// Schema xác thực dữ liệu khi Đăng ký tài khoản (POST /api/auth/register)
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Họ tên không được để trống')
      .max(150, 'Họ tên không được vượt quá 150 ký tự'),
    email: z
      .string()
      .trim()
      .email('Địa chỉ email không đúng định dạng')
      .max(254, 'Email không được vượt quá 254 ký tự'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có độ dài tối thiểu 6 ký tự'),
  })
  .strict(); // Từ chối body có thuộc tính lạ ngoài hợp đồng (đặc biệt cấm truyền role)

// Schema xác thực dữ liệu khi Đăng nhập tài khoản (POST /api/auth/login)
export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email('Địa chỉ email không đúng định dạng'),
    password: z
      .string()
      .min(1, 'Mật khẩu không được để trống'),
  })
  .strict();
