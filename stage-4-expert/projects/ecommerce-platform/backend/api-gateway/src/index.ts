/**
 * API 网关
 * 
 * 负责请求路由、负载均衡、认证等
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// 路由到用户服务
app.use(
  '/api/users',
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/api/users',
    },
  })
);

// 路由到商品服务
app.use(
  '/api/products',
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/products': '/api/products',
    },
  })
);

// 路由到订单服务
app.use(
  '/api/orders',
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/orders': '/api/orders',
    },
  })
);

// 路由到支付服务
app.use(
  '/api/payments',
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/payments': '/api/payments',
    },
  })
);

app.listen(PORT, () => {
  console.log(`API 网关运行在端口 ${PORT}`);
  console.log(`用户服务: ${process.env.USER_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`商品服务: ${process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'}`);
  console.log(`订单服务: ${process.env.ORDER_SERVICE_URL || 'http://localhost:3003'}`);
  console.log(`支付服务: ${process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004'}`);
});
