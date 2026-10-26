import type { Request, Response, NextFunction } from 'express';
import {
  layDanhSachSinhVien,
  timSinhVienTheoMa,
  themSinhVien,
} from '../services/sinhVien.service.js';

// 1. Controller lấy toàn bộ danh sách sinh viên (async / await)
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

// 2. Controller tìm một sinh viên theo mã sinh viên (async / await)
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
      });
      return;
    }

    const sinhVien = await timSinhVienTheoMa(maSV);

    if (!sinhVien) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên',
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

// 3. Controller thêm mới một sinh viên (async / await)
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
