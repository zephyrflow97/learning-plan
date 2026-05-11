/**
 * 商品服务 - 入口文件
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Product } from './models/Product';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

// 获取商品列表
app.get('/api/products', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = { isActive: true };

    // 分类过滤
    if (category) {
      query.category = category;
    }

    // 价格范围过滤
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 搜索
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({ error: '获取商品列表失败' });
  }
});

// 获取商品详情
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    res.json({ product });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({ error: '获取商品详情失败' });
  }
});

// 创建商品（管理员）
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    console.log(`商品创建成功: ${product.id}`);
    res.status(201).json({ message: '商品创建成功', product });
  } catch (error: any) {
    console.error('创建商品失败:', error);
    res.status(400).json({ error: error.message || '创建商品失败' });
  }
});

// 更新商品（管理员）
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    console.log(`商品更新成功: ${product.id}`);
    res.json({ message: '商品更新成功', product });
  } catch (error: any) {
    console.error('更新商品失败:', error);
    res.status(400).json({ error: error.message || '更新商品失败' });
  }
});

// 删除商品（软删除 - 管理员）
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    console.log(`商品删除成功: ${product.id}`);
    res.json({ message: '商品删除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({ error: '删除商品失败' });
  }
});

// 更新库存
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: '库存数量必须是数字' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      return res.status(400).json({ error: '库存不足' });
    }

    product.stock = newStock;
    await product.save();

    console.log(`商品库存更新: ${product.id}, 新库存: ${newStock}`);
    res.json({ message: '库存更新成功', stock: newStock });
  } catch (error) {
    console.error('更新库存失败:', error);
    res.status(500).json({ error: '更新库存失败' });
  }
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('未处理的错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 连接数据库并启动服务器
async function start() {
  try {
    // 连接 MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-products');
    console.log('MongoDB 连接成功');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`商品服务运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

start();
