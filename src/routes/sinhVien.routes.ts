import { Router } from 'express';
import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
  capNhatSinhVien,
  xoaSinhVien,
} from '../controllers/sinhVien.controller.js';

const router = Router();

// 1. GET /api/v1/sinh-vien -> Danh sách sinh viên
router.get('/', getDanhSachSinhVien);

// 2. GET /api/v1/sinh-vien/:maSV -> Chi tiết một sinh viên
router.get('/:maSV', getSinhVienTheoMa);

// 3. POST /api/v1/sinh-vien -> Thêm mới sinh viên
router.post('/', taoSinhVien);

// 4. PUT /api/v1/sinh-vien/:maSV -> Cập nhật thông tin sinh viên
router.put('/:maSV', capNhatSinhVien);

// 5. DELETE /api/v1/sinh-vien/:maSV -> Xóa sinh viên
router.delete('/:maSV', xoaSinhVien);

export default router;
