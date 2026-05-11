/**
 * 实时聊天应用 - 服务端入口
 * 
 * 初始化 Express 应用和 WebSocket 服务器
 */

import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { ChatServer } from './websocket/ChatServer';
import { Logger } from './utils/logger';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import * as authController from './controllers/auth.controller';
import * as roomController from './controllers/room.controller';

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3100;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 中间件
app.use((req, res, next) => {
  const origin = req.headers.origin || process.env.CORS_ORIGIN || 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// 请求日志中间件
app.use((req, res, next) => {
  Logger.http(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API 路由

// 认证路由（公开）
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/refresh', authController.refreshToken);

// 用户路由（需要认证）
app.get('/api/auth/me', authMiddleware, authController.getCurrentUser);

// 聊天室路由
app.get('/api/rooms', roomController.getAllRooms); // 公开
app.post('/api/rooms', authMiddleware, roomController.createRoom); // 需要认证
app.get('/api/rooms/my', authMiddleware, roomController.getMyRooms); // 需要认证
app.get('/api/rooms/:roomId', authMiddleware, roomController.getRoomById); // 需要认证
app.post('/api/rooms/:roomId/join', authMiddleware, roomController.joinRoom); // 需要认证
app.post('/api/rooms/:roomId/leave', authMiddleware, roomController.leaveRoom); // 需要认证

// 404 处理
app.use(notFoundMiddleware);

// 错误处理
app.use(errorMiddleware);

// 初始化 WebSocket 聊天服务器
const chatServer = new ChatServer(httpServer);

// 启动服务器
httpServer.listen(PORT, () => {
  Logger.info(`服务器启动成功`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
  });
  Logger.info(`HTTP API: http://localhost:${PORT}`);
  Logger.info(`WebSocket: ws://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  Logger.info('收到 SIGTERM 信号，开始优雅关闭...');
  httpServer.close(() => {
    Logger.info('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Logger.info('收到 SIGINT 信号，开始优雅关闭...');
  httpServer.close(() => {
    Logger.info('服务器已关闭');
    process.exit(0);
  });
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  Logger.error('未捕获的异常', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('未处理的 Promise 拒绝', { reason, promise });
  process.exit(1);
});

export default app;
