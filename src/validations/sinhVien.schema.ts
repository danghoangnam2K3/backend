import { z } from 'zod';

// Định nghĩa các trường thông tin sinh viên được phép chỉnh sửa
const editableFields = {
  hoTen: z.string().trim().min(1, 'Họ tên không được rỗng').max(150, 'Họ tên không được vượt quá 150 ký tự'),
  email: z.string().trim().email('Email không hợp lệ').max(254, 'Email không được vượt quá 254 ký tự'),
  maLop: z.string().trim().min(1, 'Mã lớp không được rỗng').max(50, 'Mã lớp không được vượt quá 50 ký tự'),
};

// Schema kiểm tra dữ liệu khi tạo mới sinh viên (POST)
export const createSinhVienSchema = z
  .object({
    maSV: z.string().trim().min(1, 'Mã SV không được rỗng').regex(/^SV[0-9]{3}$/, 'Mã SV phải có định dạng SVxxx (ví dụ SV001)'),
    ...editableFields,
  })
  .strict(); // Từ chối body có thuộc tính lạ ngoài hợp đồng

// Schema kiểm tra dữ liệu khi cập nhật sinh viên (PUT)
export const updateSinhVienSchema = z
  .object({
    ...editableFields,
  })
  .strict(); // Từ chối body có thuộc tính lạ ngoài hợp đồng
