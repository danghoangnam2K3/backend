import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.trim().length === 0) {
  throw new Error('[JWT Config Error] Biến môi trường JWT_SECRET không tồn tại hoặc bị rỗng.');
}

export interface UserTokenPayload {
  sub: string; // id của User dưới dạng string
  role: 'student' | 'admin';
}

/**
 * Hàm sinh Access Token JWT có chữ ký HS256, thời hạn 1 giờ
 */
export const generateToken = (payload: { id: number | string; role: 'student' | 'admin' }): string => {
  return jwt.sign(
    { sub: String(payload.id), role: payload.role },
    JWT_SECRET,
    { expiresIn: '1h', algorithm: 'HS256' }
  );
};

/**
 * Hàm xác minh tính hợp lệ của Token JWT bằng thuật toán HS256
 * Ném lỗi nếu chữ ký sai, token hết hạn hoặc giả mạo
 */
export const verifyToken = (token: string): UserTokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
  }) as jwt.JwtPayload;

  if (!decoded.sub || !decoded.role) {
    throw new Error('Token không chứa các claims bắt buộc (sub, role)');
  }

  return {
    sub: String(decoded.sub),
    role: decoded.role as 'student' | 'admin',
  };
};
