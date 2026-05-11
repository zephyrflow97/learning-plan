# 电商平台微服务说明

## 服务架构

本项目采用微服务架构，各服务职责如下：

### 1. 用户服务 (User Service) - 端口 3001
- 用户注册和登录
- JWT 认证
- 用户信息管理
- 地址管理

**技术栈:** TypeScript, Express, Prisma, PostgreSQL

### 2. 商品服务 (Product Service) - 端口 3002
- 商品 CRUD
- 分类管理
- 库存管理
- 商品搜索

**技术栈:** TypeScript, Express, Mongoose, MongoDB

### 3. 订单服务 (Order Service) - 端口 3003
- 订单创建
- 订单状态管理
- 订单查询
- 库存预留

**技术栈:** TypeScript, Express, TypeORM, PostgreSQL

### 4. 支付服务 (Payment Service) - 端口 3004
- Stripe 支付集成
- 支付记录
- 退款处理

**技术栈:** TypeScript, Express, Stripe

### 5. API 网关 (API Gateway) - 端口 8000
- 请求路由
- 负载均衡
- 统一入口

**技术栈:** TypeScript, Express, http-proxy-middleware

## 快速启动

### 方式一：使用 Docker Compose

```bash
cd infra/docker
docker-compose up -d
```

### 方式二：手动启动各服务

```bash
# 1. 启动用户服务
cd backend/user-service
npm install
cp .env.example .env
npm run dev

# 2. 启动商品服务
cd backend/product-service
npm install
cp .env.example .env
npm run dev

# 3. 启动订单服务
cd backend/order-service
npm install
cp .env.example .env
npm run dev

# 4. 启动支付服务
cd backend/payment-service
npm install
cp .env.example .env
npm run dev

# 5. 启动 API 网关
cd backend/api-gateway
npm install
cp .env.example .env
npm run dev
```

## API 文档

### 用户服务 API

```
POST /api/users/register    - 用户注册
POST /api/users/login        - 用户登录
GET  /api/users/me           - 获取当前用户
PUT  /api/users/me           - 更新用户信息
POST /api/users/addresses    - 添加地址
```

### 商品服务 API

```
GET    /api/products         - 获取商品列表
GET    /api/products/:id     - 获取商品详情
POST   /api/products         - 创建商品（管理员）
PUT    /api/products/:id     - 更新商品（管理员）
DELETE /api/products/:id     - 删除商品（管理员）
PATCH  /api/products/:id/stock - 更新库存
```

### 订单服务 API

```
POST   /api/orders           - 创建订单
GET    /api/orders           - 获取订单列表
GET    /api/orders/:id       - 获取订单详情
PATCH  /api/orders/:id/status - 更新订单状态
POST   /api/orders/:id/cancel - 取消订单
```

### 支付服务 API

```
POST /api/payments           - 创建支付
GET  /api/payments/:id       - 获取支付详情
POST /api/payments/:id/refund - 退款
```

## 数据库

- **用户服务:** PostgreSQL (ecommerce_users)
- **商品服务:** MongoDB (ecommerce_products)
- **订单服务:** PostgreSQL (ecommerce_orders)
- **支付服务:** PostgreSQL (ecommerce_payments)

## 学习要点

1. **微服务架构** - 服务拆分、服务间通信
2. **多数据库** - PostgreSQL、MongoDB 的使用
3. **API 网关** - 请求路由、负载均衡
4. **分布式事务** - 订单-库存一致性问题
5. **容器化** - Docker、Docker Compose
6. **持续集成** - GitHub Actions CI/CD
