import { Router } from 'express';
import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
  capNhatSinhVien,
  xoaSinhVien,
} from '../controllers/sinhVien.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createSinhVienSchema,
  updateSinhVienSchema,
} from '../validations/sinhVien.schema.js';

const router = Router();

// 1. GET /api/v1/sinh-vien -> Danh sách sinh viên
router.get('/', getDanhSachSinhVien);

// 2. GET /api/v1/sinh-vien/:maSV -> Chi tiết một sinh viên
router.get('/:maSV', getSinhVienTheoMa);

// 3. POST /api/v1/sinh-vien -> Thêm mới sinh viên (áp dụng Validation Middleware)
router.post('/', validate(createSinhVienSchema), taoSinhVien);

// 4. PUT /api/v1/sinh-vien/:maSV -> Cập nhật thông tin sinh viên (áp dụng Validation Middleware)
router.put('/:maSV', validate(updateSinhVienSchema), capNhatSinhVien);

// 5. DELETE /api/v1/sinh-vien/:maSV -> Xóa sinh viên
router.delete('/:maSV', xoaSinhVien);

export default router;
