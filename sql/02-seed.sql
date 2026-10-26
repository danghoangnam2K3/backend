-- ============================================================
-- 02-seed.sql
-- Thêm dữ liệu mẫu ban đầu (seed) vào dbo.SinhVien
-- ============================================================

USE QuanLySinhVienDB;
GO

-- 1. Thêm SV001 nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM dbo.SinhVien WHERE maSV = 'SV001')
BEGIN
    INSERT INTO dbo.SinhVien (maSV, hoTen, email, maLop)
    VALUES ('SV001', N'Minh Nhật', N'minhnhat@example.com', N'25CT114');
    PRINT N'Đã thêm bản ghi SV001.';
END
ELSE
BEGIN
    PRINT N'Bản ghi SV001 đã có sẵn trong bảng.';
END
GO

-- 2. Thêm SV002 nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM dbo.SinhVien WHERE maSV = 'SV002')
BEGIN
    INSERT INTO dbo.SinhVien (maSV, hoTen, email, maLop)
    VALUES ('SV002', N'Lan Anh', N'lananh@example.com', N'25CT114');
    PRINT N'Đã thêm bản ghi SV002.';
END
ELSE
BEGIN
    PRINT N'Bản ghi SV002 đã có sẵn trong bảng.';
END
GO

-- 3. Kiểm tra dữ liệu sau khi seed
SELECT maSV, hoTen, email, maLop
FROM dbo.SinhVien
ORDER BY maSV ASC;
GO
