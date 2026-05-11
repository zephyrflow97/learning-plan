/**
 * 认证路由
 */

import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('密码至少 8 位'),
    body('name').trim().notEmpty().withMessage('姓名不能为空'),
    validate
  ],
  authController.register
);

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate
  ],
  authController.login
);

/**
 * POST /api/auth/refresh
 * 刷新 Token
 */
router.post('/refresh',
  [
    body('refreshToken').notEmpty(),
    validate
  ],
  authController.refreshToken
);

/**
 * POST /api/auth/logout
 * 登出
 */
router.post('/logout',
  authMiddleware,
  authController.logout
);

/**
 * POST /api/auth/forgot-password
 * 忘记密码
 */
router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
    validate
  ],
  authController.forgotPassword
);

export default router;
