import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database.js';

// Định nghĩa Model SinhVien ánh xạ trực tiếp tới bảng dbo.SinhVien trong SQL Server
export class SinhVien extends Model<
  InferAttributes<SinhVien>,
  InferCreationAttributes<SinhVien>
> {
  // Dùng từ khóa declare trong TypeScript để định nghĩa kiểu thuộc tính mà không ghi đè getter/setter của Sequelize
  declare maSV: string;
  declare hoTen: string;
  declare email: string;
  declare maLop: string;
}

// Khởi tạo ánh xạ cấu trúc cột của Model với bảng dbo.SinhVien
SinhVien.init(
  {
    maSV: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    hoTen: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
    },
    maLop: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'SinhVien',
    schema: 'dbo',
    timestamps: false, // Bảng không có cột createdAt, updatedAt
  }
);
