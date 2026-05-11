# 全栈电商平台项目

## 📋 项目概述

这是一个基于微服务架构的完整电商平台，包含用户管理、商品管理、订单处理、支付集成等核心功能。项目采用现代技术栈，展示了生产级应用开发的最佳实践。

### 技术栈

**后端微服务：**
- **语言：** TypeScript, Node.js
- **框架：** Express
- **数据库：** PostgreSQL (用户、订单), MongoDB (商品), Redis (缓存)
- **ORM：** Prisma, TypeORM
- **消息队列：** RabbitMQ
- **认证：** JWT

**前端：**
- **框架：** Next.js 14, React 18
- **状态管理：** Zustand
- **UI 库：** Tailwind CSS
- **数据获取：** React Query

**DevOps：**
- **容器化：** Docker, Docker Compose
- **编排：** Kubernetes
- **CI/CD：** GitHub Actions
- **监控：** Prometheus, Grafana

### 项目结构

```
ecommerce-platform/
├── backend/                      # 后端微服务
│   ├── api-gateway/             # API 网关
│   ├── user-service/            # 用户服务
│   ├── product-service/         # 商品服务
│   ├── order-service/           # 订单服务
│   └── payment-service/         # 支付服务
├── frontend/                    # Next.js 前端
├── infra/                       # 基础设施配置
│   ├── docker/                  # Docker 配置
│   └── k8s/                     # Kubernetes 配置
└── .github/workflows/           # CI/CD 配置
```

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (可选，使用 Docker)
- Redis (可选，使用 Docker)

### 本地开发

**1. 克隆项目**

```bash
git clone <repository-url>
cd ecommerce-platform
```

**2. 安装依赖**

```bash
# 安装所有服务的依赖
npm run install:all

# 或手动安装每个服务
cd backend/user-service && npm install
cd backend/product-service && npm install
cd backend/order-service && npm install
cd backend/payment-service && npm install
cd backend/api-gateway && npm install
cd frontend && npm install
```

**3. 配置环境变量**

复制示例环境变量文件：

```bash
cp backend/user-service/.env.example backend/user-service/.env
cp backend/product-service/.env.example backend/product-service/.env
# ... 其他服务
```

**4. 启动数据库（使用 Docker Compose）**

```bash
docker-compose -f infra/docker/docker-compose.dev.yml up -d
```

**5. 运行数据库迁移**

```bash
cd backend/user-service
npm run migrate

cd ../product-service
npm run migrate

cd ../order-service
npm run migrate
```

**6. 启动所有服务**

```bash
# 使用 concurrently 同时启动所有服务
npm run dev

# 或手动启动每个服务
cd backend/user-service && npm run dev
cd backend/product-service && npm run dev
cd backend/order-service && npm run dev
cd backend/payment-service && npm run dev
cd backend/api-gateway && npm run dev
cd frontend && npm run dev
```

**7. 访问应用**

- 前端：http://localhost:3000
- API 网关：http://localhost:8000
- 用户服务：http://localhost:3001
- 商品服务：http://localhost:3002
- 订单服务：http://localhost:3003
- 支付服务：http://localhost:3004

## 📚 核心功能

### 第一部分：基础服务

#### 1. 用户服务 (User Service)

**功能：**
- 用户注册和登录
- JWT 认证
- 个人信息管理
- 地址管理
- 密码重置

**端点：**
- `POST /api/users/register` - 注册
- `POST /api/users/login` - 登录
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户信息
- `POST /api/users/addresses` - 添加地址

**数据库：** PostgreSQL + Prisma

#### 2. 商品服务 (Product Service)

**功能：**
- 商品 CRUD
- 分类管理
- 商品搜索
- 库存管理

**端点：**
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品（管理员）
- `PUT /api/products/:id` - 更新商品（管理员）
- `DELETE /api/products/:id` - 删除商品（管理员）
- `GET /api/products/search` - 搜索商品

**数据库：** MongoDB + Mongoose

#### 3. 订单服务 (Order Service)

**功能：**
- 创建订单
- 订单状态管理
- 订单查询
- 库存预留

**端点：**
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `PUT /api/orders/:id/cancel` - 取消订单

**数据库：** PostgreSQL + TypeORM

#### 4. 支付服务 (Payment Service)

**功能：**
- Stripe 支付集成
- 支付记录
- 退款处理

**端点：**
- `POST /api/payments` - 创建支付
- `POST /api/payments/:id/refund` - 退款
- `GET /api/payments/:id` - 获取支付详情

**数据库：** PostgreSQL + Prisma

### 第二部分：高级功能

#### 5. API 网关

**功能：**
- 请求路由
- 负载均衡
- JWT 认证
- 限流
- 断路器

#### 6. 消息队列集成

**事件：**
- `order.created` - 订单创建
- `payment.completed` - 支付完成
- `payment.failed` - 支付失败

**消费者：**
- 通知服务（发送邮件）
- 库存服务（扣减库存）

## 🏗️ 架构设计

### 系统架构图

```
┌─────────┐
│ 浏览器   │
└────┬────┘
     │
┌────▼────────────┐
│  Next.js 前端   │
└────┬────────────┘
     │
┌────▼────────────┐
│   API 网关      │
└────┬────────────┘
     │
     ├──────────┬──────────┬──────────┬──────────┐
     │          │          │          │          │
┌────▼────┐┌───▼────┐┌───▼────┐┌───▼────┐┌───▼────┐
│用户服务 ││商品服务││订单服务││支付服务││通知服务│
└────┬────┘└───┬────┘└───┬────┘└───┬────┘└────────┘
     │          │          │          │
┌────▼────┐┌───▼────┐┌───▼────┐┌───▼────┐
│Postgres ││MongoDB ││Postgres││Postgres│
└─────────┘└────────┘└─────────┘└────────┘

        ┌──────────────────┐
        │   RabbitMQ       │
        └──────────────────┘

        ┌──────────────────┐
        │   Redis (缓存)   │
        └──────────────────┘
```

### 数据流程

**下单流程：**

1. 用户在前端选择商品，加入购物车
2. 点击结算，创建订单
3. API 网关路由到订单服务
4. 订单服务验证用户和商品
5. 订单服务调用商品服务预留库存
6. 订单服务发布 `order.created` 事件
7. 支付服务监听事件，创建支付单
8. 用户完成支付
9. 支付服务发布 `payment.completed` 事件
10. 订单服务更新订单状态
11. 商品服务确认库存扣减
12. 通知服务发送确认邮件

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行单个服务的测试
cd backend/user-service
npm run test

# 测试覆盖率
npm run test:coverage

# E2E 测试
npm run test:e2e
```

### 测试策略

- **单元测试：** Jest
- **集成测试：** Supertest
- **E2E 测试：** Playwright
- **目标覆盖率：** 70%+

## 🚢 部署

### Docker 部署

```bash
# 构建所有镜像
docker-compose -f infra/docker/docker-compose.yml build

# 启动所有服务
docker-compose -f infra/docker/docker-compose.yml up -d
```

### Kubernetes 部署

```bash
# 应用所有配置
kubectl apply -f infra/k8s/

# 查看部署状态
kubectl get pods
kubectl get services

# 查看日志
kubectl logs <pod-name>
```

## 📊 监控

### Prometheus + Grafana

1. 启动监控服务：
```bash
docker-compose -f infra/docker/docker-compose.monitoring.yml up -d
```

2. 访问 Grafana：http://localhost:3100
3. 导入仪表板配置：`infra/monitoring/dashboards/`

## 🔒 安全

### 实现的安全措施

- ✅ JWT 认证和授权
- ✅ 密码使用 bcrypt 哈希
- ✅ 参数化查询防止 SQL 注入
- ✅ 输入验证和清理
- ✅ HTTPS (生产环境)
- ✅ 限流防止 DDoS
- ✅ CORS 配置
- ✅ 安全 HTTP 头部

## 📖 API 文档

### Swagger/OpenAPI

访问 API 文档：

- API 网关：http://localhost:8000/api-docs
- 用户服务：http://localhost:3001/api-docs
- 商品服务：http://localhost:3002/api-docs

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📝 许可证

MIT License

## 🎓 学习建议

### 学习路径

1. **理解架构**：阅读架构设计文档，理解各服务职责
2. **运行项目**：按照快速开始指南运行项目
3. **阅读代码**：从简单的服务（用户服务）开始
4. **修改功能**：尝试添加新功能或修改现有功能
5. **部署实践**：尝试部署到云平台

### 扩展练习

1. 添加商品评论和评分功能
2. 实现优惠券系统
3. 添加购物车服务
4. 实现实时库存预警
5. 添加管理后台
6. 实现多语言支持
7. 添加图片上传功能（S3/OSS）
8. 实现订单导出功能

## 🆘 常见问题

### Q: 服务无法启动？

A: 检查：
1. 数据库是否running
2. 环境变量是否配置正确
3. 端口是否被占用
4. 查看服务日志

### Q: 如何调试微服务？

A: 建议：
1. 使用分布式追踪（Jaeger）
2. 查看日志（集中化日志）
3. 使用 Postman 测试 API
4. VS Code 断点调试

### Q: 生产环境部署建议？

A: 建议：
1. 使用托管的 Kubernetes（EKS/GKE/AKS）
2. 配置自动扩展
3. 设置监控和告警
4. 启用 HTTPS
5. 配置 CI/CD
6. 定期备份数据库

---

**祝你学习愉快！有问题欢迎提 Issue！** 🚀
