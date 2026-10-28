import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare fullName: string;
  declare email: string;
  declare passwordHash: string;
  declare role: 'student' | 'admin';
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'fullName',
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      field: 'email',
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'passwordHash',
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'student',
      field: 'role',
    },
  },
  {
    sequelize,
    tableName: 'Users',
    schema: 'dbo',
    timestamps: false, // Bảng không có createdAt / updatedAt
  }
);
