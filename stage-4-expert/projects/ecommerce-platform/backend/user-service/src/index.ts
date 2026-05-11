/**
 * User Service - 用户微服务入口文件
 * 
 * 功能：
 * - 用户注册和登录
 * - JWT 认证
 * - 个人信息管理
 * - 地址管理
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import addressRoutes from './routes/address.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();

// Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// 中间件
app.use(helmet()); // 安全头部
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP 请求日志
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🚀 User Service 运行在端口 ${PORT}`);
  logger.info(`📝 环境: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
const gracefulShutdown = async () => {
  logger.info('收到关闭信号，正在优雅关闭...');
  
  server.close(async () => {
    logger.info('HTTP 服务器已关闭');
    
    // 断开 Prisma 连接
    await prisma.$disconnect();
    logger.info('数据库连接已关闭');
    
    process.exit(0);
  });

  // 如果 10 秒后还没关闭，强制退出
  setTimeout(() => {
    logger.error('无法优雅关闭，强制退出');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝:', { reason, promise });
});

export default app;
