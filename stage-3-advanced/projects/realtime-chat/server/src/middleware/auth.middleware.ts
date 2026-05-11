/**
 * 认证中间件
 * 
 * 用于保护需要身份验证的 HTTP 端点
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { Logger } from '../utils/logger';

/**
 * 扩展 Express Request 接口，添加用户信息
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        email: string;
      };
    }
  }
}

const authService = new AuthService();

/**
 * 认证中间件
 * 
 * 从请求头中提取 JWT 令牌并验证
 * 如果验证成功，将用户信息附加到 req.user
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // 从 Authorization 头部获取令牌
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: '缺少认证令牌' });
      return;
    }

    // 提取 Bearer 令牌
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: '令牌格式错误' });
      return;
    }

    const token = parts[1];

    // 验证令牌
    const payload = authService.verifyToken(token);

    // 将用户信息附加到请求对象
    req.user = {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
    };

    Logger.debug('HTTP 请求认证成功', { userId: payload.userId, path: req.path });
    
    next();
  } catch (error) {
    Logger.warn('HTTP 请求认证失败', { path: req.path, error });
    res.status(401).json({
      error: error instanceof Error ? error.message : '认证失败',
    });
  }
}

/**
 * 可选认证中间件
 * 
 * 尝试验证令牌，但即使失败也允许继续
 */
export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const payload = authService.verifyToken(token);
        
        req.user = {
          userId: payload.userId,
          username: payload.username,
          email: payload.email,
        };
      }
    }

    next();
  } catch (error) {
    // 忽略错误，允许继续
    next();
  }
}
