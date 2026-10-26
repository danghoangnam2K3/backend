import { UniqueConstraintError } from 'sequelize';
import type { ISinhVienDTO } from '../dtos/sinhVien.dto.js';
import { SinhVien } from '../models/SinhVien.js';
import { AppError } from '../utils/AppError.js';

// 1. Hàm lấy toàn bộ danh sách sinh viên từ CSDL SQL Server (sắp xếp tăng dần theo maSV)
export const layDanhSachSinhVien = async (): Promise<ISinhVienDTO[]> => {
  const sinhViens = await SinhVien.findAll({
    order: [['maSV', 'ASC']],
  });

  // Chuyển đổi Model instance thành plain DTO chứa đúng 4 trường dữ liệu
  return sinhViens.map((sv) => ({
    maSV: sv.maSV,
    hoTen: sv.hoTen,
    email: sv.email,
    maLop: sv.maLop,
  }));
};

// 2. Hàm tìm một sinh viên theo mã sinh viên (primary key)
export const timSinhVienTheoMa = async (
  maSV: string
): Promise<ISinhVienDTO | undefined> => {
  const sv = await SinhVien.findByPk(maSV);

  // Nếu không tìm thấy, Sequelize trả về null; chuyển thành undefined để Controller xử lý 404
  if (!sv) {
    return undefined;
  }

  return {
    maSV: sv.maSV,
    hoTen: sv.hoTen,
    email: sv.email,
    maLop: sv.maLop,
  };
};

// 3. Hàm thêm mới sinh viên với đầy đủ validation nghiệp vụ và giới hạn cột CSDL
export const themSinhVien = async (input: unknown): Promise<ISinhVienDTO> => {
  // Kiểm tra đầu vào phải là đối tượng hợp lệ
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError(400, 'Dữ liệu sinh viên gửi lên không hợp lệ');
  }

  const data = input as Record<string, unknown>;

  // Kiểm tra đủ 4 trường và đúng kiểu chuỗi
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

  // Cắt bỏ khoảng trắng ở hai đầu (trim)
  const maSV = data.maSV.trim();
  const hoTen = data.hoTen.trim();
  const email = data.email.trim();
  const maLop = data.maLop.trim();

  // Kiểm tra định dạng maSV: bắt đầu bằng SV và 3 chữ số
  const maSVRegex = /^SV[0-9]{3}$/;
  if (!maSVRegex.test(maSV)) {
    throw new AppError(
      400,
      'Mã sinh viên phải có định dạng SV kèm 3 chữ số (ví dụ: SV003)'
    );
  }

  // Kiểm tra không để rỗng
  if (hoTen.length === 0) {
    throw new AppError(400, 'Họ tên không được để trống');
  }
  if (maLop.length === 0) {
    throw new AppError(400, 'Mã lớp không được để trống');
  }

  // Kiểm tra định dạng email cơ bản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Địa chỉ email không đúng định dạng');
  }

  // Giới hạn độ dài mới bổ sung theo kích thước cột SQL Server
  if (hoTen.length > 150) {
    throw new AppError(400, 'Họ tên không được vượt quá 150 ký tự');
  }
  if (email.length > 254) {
    throw new AppError(400, 'Email không được vượt quá 254 ký tự');
  }
  if (maLop.length > 50) {
    throw new AppError(400, 'Mã lớp không được vượt quá 50 ký tự');
  }

  // Kiểm tra mã sinh viên đã tồn tại chưa trước khi ghi
  const tonTai = await SinhVien.findByPk(maSV);
  if (tonTai) {
    throw new AppError(409, 'Mã sinh viên đã tồn tại');
  }

  try {
    // Lưu vào SQL Server qua Sequelize Model
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
    // Nếu xảy ra lỗi trùng khóa chính (do 2 request gửi đồng thời)
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, 'Mã sinh viên đã tồn tại');
    }
    // Các lỗi DB khác chuyển tiếp cho Error Middleware xử lý thành 500
    throw error;
  }
};
