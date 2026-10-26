// Lớp lỗi tùy chỉnh mở rộng từ Error chuẩn của JavaScript, bổ sung thuộc tính statusCode
export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // Đảm bảo prototype chain hoạt động chính xác trong TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
