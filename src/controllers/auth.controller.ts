import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';

/**
 * Controller đăng ký tài khoản (POST /api/auth/register)
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.dangKy(req.body);
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller đăng nhập và cấp Access Token (POST /api/auth/login)
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.dangNhap(req.body);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller lấy thông tin hồ sơ người dùng (GET /api/auth/profile)
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user được gán từ middleware isAuth
    const userId = req.user!.sub;
    const profile = await authService.layHoSo(userId);
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin hồ sơ thành công',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
