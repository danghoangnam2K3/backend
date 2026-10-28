import type { Request, Response, NextFunction } from 'express';
import {
  layDanhSachSinhVien,
  timSinhVienTheoMa,
  themSinhVien,
  capNhatSinhVien as capNhatSinhVienService,
  xoaSinhVien as xoaSinhVienService,
} from '../services/sinhVien.service.js';

// 1. Lấy danh sách toàn bộ sinh viên (GET /api/v1/sinh-vien)
export const getDanhSachSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const danhSach = await layDanhSachSinhVien();
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sinh viên thành công',
      data: danhSach,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy thông tin sinh viên theo mã (GET /api/v1/sinh-vien/:maSV)
export const getSinhVienTheoMa = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const maSV = req.params.maSV;

    if (typeof maSV !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Mã sinh viên không hợp lệ',
        data: null,
      });
      return;
    }

    const sinhVien = await timSinhVienTheoMa(maSV);

    if (!sinhVien) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Tìm sinh viên thành công',
      data: sinhVien,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Thêm mới một sinh viên (POST /api/v1/sinh-vien)
export const taoSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sinhVienMoi = await themSinhVien(req.body);

    res.status(201).json({
      success: true,
      message: 'Thêm sinh viên thành công',
      data: sinhVienMoi,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Cập nhật thông tin sinh viên (PUT /api/v1/sinh-vien/:maSV)
export const capNhatSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const maSV = req.params.maSV;

    if (typeof maSV !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Mã sinh viên không hợp lệ',
        data: null,
      });
      return;
    }

    const sinhVienCapNhat = await capNhatSinhVienService(maSV, req.body);

    res.status(200).json({
      success: true,
      message: 'Cập nhật sinh viên thành công',
      data: sinhVienCapNhat,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Xóa sinh viên theo mã (DELETE /api/v1/sinh-vien/:maSV)
export const xoaSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const maSV = req.params.maSV;

    if (typeof maSV !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Mã sinh viên không hợp lệ',
        data: null,
      });
      return;
    }

    await xoaSinhVienService(maSV);

    // DELETE thành công trả về 200, không có data theo đúng quy định đề bài
    res.status(200).json({
      success: true,
      message: 'Xóa sinh viên thành công',
    });
  } catch (error) {
    next(error);
  }
};
