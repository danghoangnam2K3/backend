-- ============================================================
-- 01-quan-ly-sinh-vien.sql
-- Tạo Database: QuanLySinhVienDB và Bảng: dbo.SinhVien
-- ============================================================

USE master;
GO

-- 1. Tạo Database nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLySinhVienDB')
BEGIN
    CREATE DATABASE QuanLySinhVienDB;
    PRINT N'Đã tạo mới Database QuanLySinhVienDB.';
END
ELSE
BEGIN
    PRINT N'Database QuanLySinhVienDB đã tồn tại sẵn.';
END
GO

USE QuanLySinhVienDB;
GO

-- 2. Tạo bảng dbo.SinhVien nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.SinhVien') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.SinhVien (
        maSV VARCHAR(5) NOT NULL,
        hoTen NVARCHAR(150) NOT NULL,
        email NVARCHAR(254) NOT NULL,
        maLop NVARCHAR(50) NOT NULL,
        CONSTRAINT PK_SinhVien PRIMARY KEY (maSV)
    );
    PRINT N'Đã tạo mới bảng dbo.SinhVien.';
END
ELSE
BEGIN
    PRINT N'Bảng dbo.SinhVien đã tồn tại sẵn.';
END
GO
