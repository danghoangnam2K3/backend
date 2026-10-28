import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { generateToken } from '../utils/jwt.js';

export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  role: 'student' | 'admin';
}

export interface LoginResponseDTO {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponseDTO;
}

/**
 * Đăng ký tài khoản người dùng mới (mặc định luôn là role student)
 */
export const dangKy = async (input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<UserResponseDTO> => {
  const emailNormalized = input.email.trim().toLowerCase();

  // 1. Kiểm tra email đã tồn tại hay chưa
  const userTonTai = await User.findOne({ where: { email: emailNormalized } });
  if (userTonTai) {
    throw new AppError(409, 'Email đã được sử dụng');
  }

  // 2. Băm mật khẩu với bcrypt chi phí salt cost = 12
  const passwordHash = await bcrypt.hash(input.password, 12);

  // 3. Lưu vào cơ sở dữ liệu (role mặc định luôn là student)
  const userMoi = await User.create({
    fullName: input.fullName.trim(),
    email: emailNormalized,
    passwordHash,
    role: 'student',
  });

  // 4. Trả về thông tin công khai, tuyệt đối không trả passwordHash
  return {
    id: userMoi.id,
    fullName: userMoi.fullName,
    email: userMoi.email,
    role: userMoi.role,
  };
};

/**
 * Đăng nhập và cấp Access Token JWT
 */
export const dangNhap = async (input: {
  email: string;
  password: string;
}): Promise<LoginResponseDTO> => {
  const emailNormalized = input.email.trim().toLowerCase();

  // 1. Tìm người dùng theo email
  const user = await User.findOne({ where: { email: emailNormalized } });

  // 2. Kiểm tra mật khẩu bằng bcrypt.compare (thông báo lỗi chung 401 không lộ thông tin)
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'Email hoặc mật khẩu không chính xác');
  }

  // 3. Cấp Token JWT với thời hạn 1 giờ (3600 giây)
  const accessToken = generateToken({ id: user.id, role: user.role });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Lấy thông tin hồ sơ của người dùng hiện tại
 */
export const layHoSo = async (userId: number | string): Promise<UserResponseDTO> => {
  const user = await User.findByPk(Number(userId));
  if (!user) {
    throw new AppError(404, 'Không tìm thấy hồ sơ người dùng');
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
};
