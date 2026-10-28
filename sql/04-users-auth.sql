-- Script 04: Tạo bảng dbo.Users phục vụ xác thực Authentication & Authorization
-- Không DROP bảng, có điều kiện bảo vệ IF NOT EXISTS

USE QuanLySinhVienDB;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        fullName NVARCHAR(150) NOT NULL,
        email NVARCHAR(254) NOT NULL UNIQUE,
        passwordHash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'student'
    );
    PRINT 'Đã tạo bảng dbo.Users thành công.';
END
ELSE
BEGIN
    PRINT 'Bảng dbo.Users đã tồn tại, bỏ qua tạo mới.';
END
GO
