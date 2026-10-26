-- ============================================================
-- 03-app-login.sql
-- Tạo Login sv_app và cấp quyền SELECT, INSERT trên dbo.SinhVien
-- LƯU Ý: Thay thế "MAT_KHAU_MANH_CUA_BAN_123" bằng mật khẩu thật của bạn trước khi chạy!
-- ============================================================

USE master;
GO

-- 1. Tạo Login sv_app ở cấp máy chủ SQL Server nếu chưa có
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'sv_app')
BEGIN
    CREATE LOGIN sv_app WITH PASSWORD = 'MAT_KHAU_MANH_CUA_BAN_123', CHECK_POLICY = OFF;
    PRINT N'Đã tạo mới Login sv_app.';
END
ELSE
BEGIN
    PRINT N'Login sv_app đã tồn tại sẵn.';
END
GO

USE QuanLySinhVienDB;
GO

-- 2. Tạo User sv_app tương ứng trong Database QuanLySinhVienDB nếu chưa có
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'sv_app')
BEGIN
    CREATE USER sv_app FOR LOGIN sv_app;
    PRINT N'Đã tạo User sv_app trong QuanLySinhVienDB.';
END
ELSE
BEGIN
    PRINT N'User sv_app đã có trong QuanLySinhVienDB.';
END
GO

-- 3. Chỉ cấp quyền tối thiểu: SELECT và INSERT trên bảng dbo.SinhVien (nguyên tắc đặc quyền tối thiểu)
GRANT SELECT, INSERT ON dbo.SinhVien TO sv_app;
PRINT N'Đã cấp quyền SELECT và INSERT trên dbo.SinhVien cho sv_app.';
GO
