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
import { isAuth } from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = Router();

// 1. GET /api/v1/sinh-vien -> Danh sách sinh viên (Public)
router.get('/', getDanhSachSinhVien);

// 2. GET /api/v1/sinh-vien/:maSV -> Chi tiết một sinh viên (Public)
router.get('/:maSV', getSinhVienTheoMa);

// 3. POST /api/v1/sinh-vien -> Thêm mới sinh viên (Yêu cầu JWT & Quyền Admin)
router.post(
  '/',
  isAuth,
  isAdmin,
  validate(createSinhVienSchema),
  taoSinhVien
);

// 4. PUT /api/v1/sinh-vien/:maSV -> Cập nhật thông tin sinh viên (Yêu cầu JWT & Quyền Admin)
router.put(
  '/:maSV',
  isAuth,
  isAdmin,
  validate(updateSinhVienSchema),
  capNhatSinhVien
);

// 5. DELETE /api/v1/sinh-vien/:maSV -> Xóa sinh viên (Yêu cầu JWT & Quyền Admin)
router.delete('/:maSV', isAuth, isAdmin, xoaSinhVien);

export default router;
