// Khai báo cấu trúc truyền nhận dữ liệu cho thực thể Sinh Viên (DTO - Data Transfer Object)
export interface ISinhVienDTO {
  // Mã sinh viên (ví dụ: 'SV001')
  maSV: string;

  // Họ và tên sinh viên (ví dụ: 'Minh Nhật')
  hoTen: string;

  // Địa chỉ email liên hệ (ví dụ: 'minhnhat@example.com')
  email: string;

  // Mã lớp sinh hoạt (ví dụ: '25CT114')
  maLop: string;
}
