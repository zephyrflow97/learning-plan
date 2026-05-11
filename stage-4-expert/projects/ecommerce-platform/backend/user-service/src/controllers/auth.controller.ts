/**
 * 认证控制器
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { logger } from '../utils/logger';

/**
 * 用户注册
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    logger.info(`新用户注册: ${email}`);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: { user }
    });
  } catch (error) {
    logger.error('注册失败:', error);
    next(error);
  }
};

/**
 * 用户登录
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 生成 Access Token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    // 生成 Refresh Token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    // 保存 Refresh Token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    logger.info(`用户登录: ${email}`);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('登录失败:', error);
    next(error);
  }
};

/**
 * 刷新 Token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    // 验证 Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { userId: string };

    // 查找 Token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh Token 无效或已过期'
      });
    }

    // 生成新的 Access Token
    const newAccessToken = jwt.sign(
      {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    logger.error('刷新 Token 失败:', error);
    next(error);
  }
};

/**
 * 登出
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // 删除 Refresh Token
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }

    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    logger.error('登出失败:', error);
    next(error);
  }
};

/**
 * 忘记密码
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // 安全考虑：不暴露用户是否存在
      return res.json({
        success: true,
        message: '如果该邮箱存在，重置链接已发送'
      });
    }

    // TODO: 生成重置 Token 并发送邮件
    // 这里应该实现邮件发送逻辑

    logger.info(`密码重置请求: ${email}`);

    res.json({
      success: true,
      message: '密码重置链接已发送到您的邮箱'
    });
  } catch (error) {
    logger.error('忘记密码处理失败:', error);
    next(error);
  }
};
