import { UniqueConstraintError } from 'sequelize';
import type { ISinhVienDTO } from '../dtos/sinhVien.dto.js';
import { SinhVien } from '../models/SinhVien.js';
import { AppError } from '../utils/AppError.js';

// Mảng in-memory dự phòng (theo đúng hướng dẫn trang 2 đề bài khi CSDL chưa kết nối)
const inMemoryList: ISinhVienDTO[] = [
  {
    maSV: 'SV001',
    hoTen: 'Minh Nhật',
    email: 'minhnhat@example.com',
    maLop: '25CT114',
  },
  {
    maSV: 'SV002',
    hoTen: 'Lan Anh',
    email: 'lananh@example.com',
    maLop: '25CT114',
  },
];

// Biến cờ ghi nhận trạng thái CSDL
let dbAvailable = true;

// 1. Lấy danh sách toàn bộ sinh viên (ưu tiên SQL Server, dự phòng RAM)
export const layDanhSachSinhVien = async (): Promise<ISinhVienDTO[]> => {
  if (dbAvailable) {
    try {
      const sinhViens = await SinhVien.findAll({
        order: [['maSV', 'ASC']],
      });
      return sinhViens.map((sv) => ({
        maSV: sv.maSV,
        hoTen: sv.hoTen,
        email: sv.email,
        maLop: sv.maLop,
      }));
    } catch {
      dbAvailable = false;
    }
  }

  return inMemoryList;
};

// 2. Tìm một sinh viên theo mã sinh viên
export const timSinhVienTheoMa = async (
  maSV: string
): Promise<ISinhVienDTO | undefined> => {
  if (dbAvailable) {
    try {
      const sv = await SinhVien.findByPk(maSV);
      if (sv) {
        return {
          maSV: sv.maSV,
          hoTen: sv.hoTen,
          email: sv.email,
          maLop: sv.maLop,
        };
      }
      return undefined;
    } catch {
      dbAvailable = false;
    }
  }

  return inMemoryList.find((sv) => sv.maSV === maSV);
};

// 3. Thêm mới sinh viên
export const themSinhVien = async (input: unknown): Promise<ISinhVienDTO> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError(400, 'Dữ liệu sinh viên gửi lên không hợp lệ');
  }

  const data = input as Record<string, unknown>;

  if (
    typeof data.maSV !== 'string' ||
    typeof data.hoTen !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.maLop !== 'string'
  ) {
    throw new AppError(
      400,
      'Tất cả các trường maSV, hoTen, email, maLop đều bắt buộc và phải là chuỗi ký tự'
    );
  }

  const maSV = data.maSV.trim();
  const hoTen = data.hoTen.trim();
  const email = data.email.trim();
  const maLop = data.maLop.trim();

  const maSVRegex = /^SV[0-9]{3}$/;
  if (!maSVRegex.test(maSV)) {
    throw new AppError(
      400,
      'Mã sinh viên phải có định dạng SV kèm 3 chữ số (ví dụ: SV003)'
    );
  }

  if (hoTen.length === 0) {
    throw new AppError(400, 'Họ tên không được để trống');
  }
  if (maLop.length === 0) {
    throw new AppError(400, 'Mã lớp không được để trống');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Địa chỉ email không đúng định dạng');
  }

  if (hoTen.length > 150) {
    throw new AppError(400, 'Họ tên không được vượt quá 150 ký tự');
  }
  if (email.length > 254) {
    throw new AppError(400, 'Email không được vượt quá 254 ký tự');
  }
  if (maLop.length > 50) {
    throw new AppError(400, 'Mã lớp không được vượt quá 50 ký tự');
  }

  if (dbAvailable) {
    try {
      const tonTai = await SinhVien.findByPk(maSV);
      if (tonTai) {
        throw new AppError(409, 'Mã sinh viên đã tồn tại');
      }

      const svMoi = await SinhVien.create({
        maSV,
        hoTen,
        email,
        maLop,
      });

      return {
        maSV: svMoi.maSV,
        hoTen: svMoi.hoTen,
        email: svMoi.email,
        maLop: svMoi.maLop,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof UniqueConstraintError) {
        throw new AppError(409, 'Mã sinh viên đã tồn tại');
      }
      dbAvailable = false;
    }
  }

  // Xử lý in-memory
  const tonTai = inMemoryList.some((sv) => sv.maSV === maSV);
  if (tonTai) {
    throw new AppError(409, 'Mã sinh viên đã tồn tại');
  }

  const svMoi: ISinhVienDTO = { maSV, hoTen, email, maLop };
  inMemoryList.push(svMoi);
  return svMoi;
};

// 4. Cập nhật thông tin sinh viên (PUT)
export const capNhatSinhVien = async (
  maSV: string,
  input: unknown
): Promise<ISinhVienDTO> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError(400, 'Dữ liệu cập nhật phải là đối tượng JSON');
  }

  const data = input as Record<string, unknown>;

  const allowedKeys = ['hoTen', 'email', 'maLop'];
  for (const key of Object.keys(data)) {
    if (!allowedKeys.includes(key)) {
      throw new AppError(400, `Trường '${key}' không được phép cập nhật`);
    }
  }

  if (
    typeof data.hoTen !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.maLop !== 'string'
  ) {
    throw new AppError(
      400,
      'Cần cung cấp đủ cả 3 trường chuỗi: hoTen, email, maLop'
    );
  }

  const hoTen = data.hoTen.trim();
  const email = data.email.trim();
  const maLop = data.maLop.trim();

  if (hoTen.length === 0) {
    throw new AppError(400, 'Họ tên không được để trống');
  }
  if (maLop.length === 0) {
    throw new AppError(400, 'Mã lớp không được để trống');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Địa chỉ email không đúng định dạng');
  }

  if (hoTen.length > 150) {
    throw new AppError(400, 'Họ tên không được vượt quá 150 ký tự');
  }
  if (email.length > 254) {
    throw new AppError(400, 'Email không được vượt quá 254 ký tự');
  }
  if (maLop.length > 50) {
    throw new AppError(400, 'Mã lớp không được vượt quá 50 ký tự');
  }

  if (dbAvailable) {
    try {
      const sv = await SinhVien.findByPk(maSV);
      if (!sv) {
        throw new AppError(404, 'Không tìm thấy sinh viên');
      }

      await sv.update({ hoTen, email, maLop });

      return {
        maSV: sv.maSV,
        hoTen: sv.hoTen,
        email: sv.email,
        maLop: sv.maLop,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      dbAvailable = false;
    }
  }

  // In-memory
  const index = inMemoryList.findIndex((sv) => sv.maSV === maSV);
  if (index === -1) {
    throw new AppError(404, 'Không tìm thấy sinh viên');
  }

  inMemoryList[index] = { maSV, hoTen, email, maLop };
  return inMemoryList[index];
};

// 5. Xóa một sinh viên (DELETE)
export const xoaSinhVien = async (maSV: string): Promise<void> => {
  if (dbAvailable) {
    try {
      const sv = await SinhVien.findByPk(maSV);
      if (!sv) {
        throw new AppError(404, 'Không tìm thấy sinh viên');
      }
      await sv.destroy();
      return;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      dbAvailable = false;
    }
  }

  const index = inMemoryList.findIndex((sv) => sv.maSV === maSV);
  if (index === -1) {
    throw new AppError(404, 'Không tìm thấy sinh viên');
  }

  inMemoryList.splice(index, 1);
};
