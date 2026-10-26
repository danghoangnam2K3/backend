import { Router } from 'express';
import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
} from '../controllers/sinhVien.controller.js';

const router = Router();

// GET /api/v1/sinh-vien -> Lấy danh sách toàn bộ sinh viên
router.get('/', getDanhSachSinhVien);

// GET /api/v1/sinh-vien/:maSV -> Tìm kiếm sinh viên theo mã sinh viên
router.get('/:maSV', getSinhVienTheoMa);

// POST /api/v1/sinh-vien -> Thêm mới một sinh viên
router.post('/', taoSinhVien);

export default router;
