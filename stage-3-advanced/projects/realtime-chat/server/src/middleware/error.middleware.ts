/**
 * 错误处理中间件
 * 
 * 统一处理应用中的错误
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

/**
 * 全局错误处理中间件
 * 
 * 捕获所有未处理的错误并返回统一格式的错误响应
 */
export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 记录错误
  Logger.error('请求处理错误', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
  });

  // 确定 HTTP 状态码
  let statusCode = 500;
  let message = '服务器内部错误';

  // 根据错误类型设置状态码和消息
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.message.includes('不存在') || error.message.includes('未找到')) {
    statusCode = 404;
    message = error.message;
  } else if (
    error.message.includes('无权') ||
    error.message.includes('未授权') ||
    error.message.includes('认证失败')
  ) {
    statusCode = 403;
    message = error.message;
  } else if (error.message.includes('已存在') || error.message.includes('重复')) {
    statusCode = 409;
    message = error.message;
  } else {
    message = error.message || message;
  }

  // 返回错误响应
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    }),
  });
}

/**
 * 404 处理中间件
 */
export function notFoundMiddleware(
  req: Request,
  res: Response
): void {
  res.status(404).json({
    error: `未找到路由: ${req.method} ${req.path}`,
  });
}
