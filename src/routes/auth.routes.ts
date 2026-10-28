import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.schema.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = Router();

// 1. POST /api/auth/register -> Đăng ký tài khoản mới (Public)
router.post('/register', validate(registerSchema), register);

// 2. POST /api/auth/login -> Đăng nhập nhận Access Token JWT (Public)
router.post('/login', validate(loginSchema), login);

// 3. GET /api/auth/profile -> Xem hồ sơ người dùng đang đăng nhập (Bảo vệ bởi isAuth)
router.get('/profile', isAuth, getProfile);

export default router;
