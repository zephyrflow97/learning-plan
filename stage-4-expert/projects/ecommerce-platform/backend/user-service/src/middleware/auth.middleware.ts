/**
 * JWT 认证中间件
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// 扩展 Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * 验证 JWT Token
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从 Header 获取 Token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '缺少认证 Token'
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer "

    // 验证 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    // 将用户信息附加到请求对象
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token 已过期'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token 无效'
      });
    }

    logger.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

/**
 * 检查用户角色
 */
export const checkRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未认证'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    next();
  };
};
