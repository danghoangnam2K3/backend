import 'dotenv/config';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { sequelize } from '../config/database.js';

async function seedAdmin(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('[Seed Admin] Kết nối CSDL thành công.');

    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`[Seed Admin] Tài khoản Admin (${adminEmail}) đã tồn tại với role='${existingAdmin.role}'.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('Admin@123456', 12);
    const newAdmin = await User.create({
      fullName: 'Quản Trị Viên Hệ Thống',
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });

    console.log(`[Seed Admin] Tạo thành công tài khoản Admin: ID=${newAdmin.id}, Email=${newAdmin.email}, Role=${newAdmin.role}`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed Admin Error] Tạo tài khoản Admin thất bại:', error);
    process.exit(1);
  }
}

seedAdmin();
