import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../index';
import { logger } from '../utils/logger';

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('获取用户信息失败:', error);
    next(error);
  }
};

export const updateCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    logger.info(`用户更新信息: ${user.email}`);

    res.json({
      success: true,
      message: '更新成功',
      data: { user }
    });
  } catch (error) {
    logger.error('更新用户信息失败:', error);
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '当前密码错误'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    logger.info(`用户修改密码: ${user.email}`);

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    logger.error('修改密码失败:', error);
    next(error);
  }
};
