/**
 * 支付服务 - 入口文件
 * 
 * 集成 Stripe 支付
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service' });
});

// 创建支付意图（简化版）
app.post('/api/payments', async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: '缺少必需参数' });
    }

    // 模拟支付创建
    const paymentId = `pay_${Date.now()}`;

    console.log(`支付创建成功: ${paymentId}, 订单: ${orderId}, 金额: ${amount}`);

    res.status(201).json({
      message: '支付创建成功',
      paymentId,
      clientSecret: `secret_${paymentId}`,
    });
  } catch (error) {
    console.error('创建支付失败:', error);
    res.status(500).json({ error: '创建支付失败' });
  }
});

// 获取支付详情
app.get('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 模拟获取支付详情
    res.json({
      payment: {
        id,
        status: 'succeeded',
        amount: 10000,
        currency: 'cny',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('获取支付详情失败:', error);
    res.status(500).json({ error: '获取支付详情失败' });
  }
});

// 退款
app.post('/api/payments/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    console.log(`退款请求: ${id}, 金额: ${amount || '全额'}`);

    res.json({
      message: '退款成功',
      refundId: `refund_${Date.now()}`,
    });
  } catch (error) {
    console.error('退款失败:', error);
    res.status(500).json({ error: '退款失败' });
  }
});

app.listen(PORT, () => {
  console.log(`支付服务运行在端口 ${PORT}`);
});
