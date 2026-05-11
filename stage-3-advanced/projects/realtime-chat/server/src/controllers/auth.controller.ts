/**
 * 认证控制器
 * 
 * 处理用户注册、登录等认证相关的 HTTP 请求
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { Logger } from '../utils/logger';

const authService = new AuthService();

/**
 * 用户注册
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, email, password } = req.body;

    // 验证请求参数
    if (!username || !email || !password) {
      res.status(400).json({ error: '缺少必需参数' });
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: '邮箱格式不正确' });
      return;
    }

    // 验证密码强度
    if (password.length < 6) {
      res.status(400).json({ error: '密码长度至少为 6 位' });
      return;
    }

    // 注册用户
    const result = await authService.register({ username, email, password });

    Logger.info('用户注册成功', { username, email });

    res.status(201).json({
      message: '注册成功',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 用户登录
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    // 验证请求参数
    if (!email || !password) {
      res.status(400).json({ error: '缺少必需参数' });
      return;
    }

    // 登录
    const result = await authService.login({ email, password });

    Logger.info('用户登录成功', { email });

    res.json({
      message: '登录成功',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 刷新令牌
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: '缺少令牌' });
      return;
    }

    const newToken = await authService.refreshToken(token);

    res.json({
      message: '令牌刷新成功',
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取当前用户信息
 * 
 * 需要认证
 */
export function getCurrentUser(req: Request, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: '未认证' });
    return;
  }

  res.json({
    user: req.user,
  });
}
