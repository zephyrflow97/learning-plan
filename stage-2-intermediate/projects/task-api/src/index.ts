/**
 * 应用入口文件
 * 配置和启动 Express 服务器
 */

import express from 'express';
import tasksRouter from './routes/tasks';

const app = express();
const PORT = process.env.PORT || 3000;

console.log('========================================');
console.log('任务管理 API 服务器');
console.log('========================================');

// ===== 中间件配置 =====

// 解析 JSON 请求体
app.use(express.json());
console.log('[App] ✓ JSON 解析中间件已加载');

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});
console.log('[App] ✓ 请求日志中间件已加载');

// ===== 路由配置 =====

/**
 * GET /
 * API 根路径，返回服务信息
 */
app.get('/', (req, res) => {
  console.log('[App] 访问根路径');
  res.json({
    name: '任务管理 API',
    version: '1.0.0',
    description: '使用 TypeScript 和 Express 构建的 RESTful API',
    endpoints: {
      tasks: {
        list: 'GET /api/tasks',
        get: 'GET /api/tasks/:id',
        create: 'POST /api/tasks',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id'
      }
    },
    documentation: '/api/tasks',
    timestamp: new Date().toISOString()
  });
});

// 任务相关路由
app.use('/api/tasks', tasksRouter);
console.log('[App] ✓ 任务路由已加载: /api/tasks');

// ===== 错误处理 =====

/**
 * 404 处理
 * 处理所有未匹配的路由
 */
app.use((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✗ 404 未找到: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false,
    error: '路由不存在',
    path: req.url,
    method: req.method
  });
});

/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误
 */
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✗ 服务器错误: ${err.message}`);
  console.error('[Error Stack]:', err.stack);
  
  res.status(500).json({ 
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== 启动服务器 =====

const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log(`[Server] ✓ 服务器启动成功`);
  console.log(`[Server] 端口: ${PORT}`);
  console.log(`[Server] 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] 访问地址: http://localhost:${PORT}`);
  console.log(`[Server] API 文档: http://localhost:${PORT}/api/tasks`);
  console.log(`[Server] 启动时间: ${new Date().toISOString()}`);
  console.log('========================================');
});

// ===== 优雅关闭处理 =====

/**
 * SIGTERM 信号处理
 * 用于生产环境的优雅关闭
 */
process.on('SIGTERM', () => {
  console.log('[Server] 收到 SIGTERM 信号，开始优雅关闭');
  server.close(() => {
    console.log('[Server] ✓ 服务器已关闭');
    process.exit(0);
  });
});

/**
 * SIGINT 信号处理
 * 用于开发环境的 Ctrl+C 关闭
 */
process.on('SIGINT', () => {
  console.log('\n[Server] 收到 SIGINT 信号，开始优雅关闭');
  server.close(() => {
    console.log('[Server] ✓ 服务器已关闭');
    process.exit(0);
  });
});

/**
 * 未捕获异常处理
 * 防止程序崩溃
 */
process.on('uncaughtException', (error) => {
  console.error('[Fatal] 未捕获的异常:', error);
  console.error('[Fatal] 堆栈:', error.stack);
  process.exit(1);
});

/**
 * 未处理的 Promise 拒绝
 * 防止静默失败
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Fatal] 未处理的 Promise 拒绝:', reason);
  console.error('[Fatal] Promise:', promise);
  process.exit(1);
});

export default app;
