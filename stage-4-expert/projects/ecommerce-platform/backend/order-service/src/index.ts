/**
 * 订单服务 - 入口文件
 */

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './database/data-source';
import { Order, OrderStatus } from './entities/Order';
import { OrderItem } from './entities/OrderItem';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

// 创建订单
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, shippingAddress, notes } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ error: '缺少必需参数' });
    }

    // 验证商品并计算总价
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      // 调用商品服务验证商品
      try {
        const response = await axios.get(
          `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`
        );
        const product = response.data.product;

        if (!product) {
          return res.status(404).json({ error: `商品不存在: ${item.productId}` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            error: `商品 "${product.name}" 库存不足`,
          });
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        const orderItem = new OrderItem();
        orderItem.productId = product.id;
        orderItem.productName = product.name;
        orderItem.price = product.price;
        orderItem.quantity = item.quantity;
        orderItem.subtotal = subtotal;

        orderItems.push(orderItem);
      } catch (error) {
        console.error('验证商品失败:', error);
        return res.status(500).json({ error: '验证商品失败' });
      }
    }

    // 创建订单
    const order = new Order();
    order.userId = userId;
    order.totalAmount = totalAmount;
    order.shippingAddress = shippingAddress;
    order.notes = notes;
    order.items = orderItems;

    const orderRepository = AppDataSource.getRepository(Order);
    await orderRepository.save(order);

    // 扣减库存
    for (const item of items) {
      try {
        await axios.patch(
          `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`,
          { quantity: -item.quantity }
        );
      } catch (error) {
        console.error('扣减库存失败:', error);
        // 在生产环境中，应该实现补偿事务
      }
    }

    console.log(`订单创建成功: ${order.id}`);
    res.status(201).json({ message: '订单创建成功', order });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ error: '创建订单失败' });
  }
});

// 获取订单列表
app.get('/api/orders', async (req, res) => {
  try {
    const { userId, status, page = 1, limit = 20 } = req.query;

    const orderRepository = AppDataSource.getRepository(Order);
    const query = orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (userId) {
      query.where('order.userId = :userId', { userId });
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    const skip = (Number(page) - 1) * Number(limit);
    query.skip(skip).take(Number(limit));
    query.orderBy('order.createdAt', 'DESC');

    const [orders, total] = await query.getManyAndCount();

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ error: '获取订单列表失败' });
  }
});

// 获取订单详情
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: req.params.id },
      relations: ['items'],
    });

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    res.json({ order });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ error: '获取订单详情失败' });
  }
});

// 更新订单状态
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ error: '无效的订单状态' });
    }

    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: req.params.id },
    });

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    order.status = status;
    await orderRepository.save(order);

    console.log(`订单状态更新: ${order.id} -> ${status}`);
    res.json({ message: '订单状态更新成功', order });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ error: '更新订单状态失败' });
  }
});

// 取消订单
app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: req.params.id },
      relations: ['items'],
    });

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ error: '只能取消待支付订单' });
    }

    // 恢复库存
    for (const item of order.items) {
      try {
        await axios.patch(
          `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`,
          { quantity: item.quantity }
        );
      } catch (error) {
        console.error('恢复库存失败:', error);
      }
    }

    order.status = OrderStatus.CANCELLED;
    await orderRepository.save(order);

    console.log(`订单取消成功: ${order.id}`);
    res.json({ message: '订单取消成功', order });
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({ error: '取消订单失败' });
  }
});

// 启动服务
async function start() {
  try {
    await AppDataSource.initialize();
    console.log('数据库连接成功');

    app.listen(PORT, () => {
      console.log(`订单服务运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

start();
