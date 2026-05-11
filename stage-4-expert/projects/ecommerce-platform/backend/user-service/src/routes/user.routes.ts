import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

router.get('/me', userController.getCurrentUser);
router.put('/me', [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  validate
], userController.updateCurrentUser);

router.put('/me/password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate
], userController.updatePassword);

export default router;
