# Prisma 完整代码示例

本目录包含 Prisma 章节的所有可运行代码示例。所有代码包含详细注释和日志输出，可以直接复制到项目中使用。

## 📁 目录结构

```
examples/
├── schema/                    # Prisma Schema 定义
│   ├── full-schema.prisma    # 完整的博客系统 Schema
│   └── README.md             # Schema 使用说明
├── queries/                   # 查询操作示例
│   ├── basic-crud.ts         # CRUD 基础操作
│   ├── relations.ts          # 关系查询（include, select）
│   ├── transactions.ts       # 事务处理
│   ├── n-plus-one-solution.ts # N+1 问题解决方案
│   └── README.md             # 查询示例说明
├── migrations/                # 迁移管理
│   └── README.md             # 迁移最佳实践
├── nextjs-integration/        # Next.js 集成
│   ├── lib/prisma.ts         # Prisma Client 单例
│   ├── app/users/page.tsx    # Server Component 示例
│   ├── app/api/users/route.ts # API Route 示例
│   ├── app/actions.ts        # Server Actions 示例
│   └── README.md             # Next.js 集成说明
└── README.md                  # 本文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install prisma @prisma/client
npm install -D typescript @types/node ts-node
```

### 2. 初始化 Prisma

```bash
npx prisma init
```

这会创建：
- `prisma/schema.prisma` - Prisma Schema 文件
- `.env` - 环境变量文件

### 3. 配置数据库连接

编辑 `.env` 文件：

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/mydb"

# SQLite（开发环境）
DATABASE_URL="file:./dev.db"
```

### 4. 复制 Schema

将 [`schema/full-schema.prisma`](./schema/full-schema.prisma) 的内容复制到 `prisma/schema.prisma`。

### 5. 创建迁移

```bash
# 创建并应用迁移
npx prisma migrate dev --name init

# 这会:
# ✅ 生成 SQL 迁移脚本
# ✅ 执行迁移到数据库
# ✅ 生成 Prisma Client
```

### 6. 运行示例代码

```bash
# 运行 CRUD 示例
npx ts-node examples/queries/basic-crud.ts

# 运行关系查询示例
npx ts-node examples/queries/relations.ts

# 运行事务示例
npx ts-node examples/queries/transactions.ts

# 运行 N+1 问题解决方案
npx ts-node examples/queries/n-plus-one-solution.ts
```

## 📚 章节索引

### 1. Schema 定义

**文件**: [`schema/full-schema.prisma`](./schema/full-schema.prisma)

**包含**:
- ✅ 所有关系类型（一对一、一对多、多对多）
- ✅ 枚举类型
- ✅ 索引优化
- ✅ 默认值和自动更新
- ✅ 级联操作

**适用场景**: 新项目设计数据库 Schema

---

### 2. CRUD 操作

**文件**: [`queries/basic-crud.ts`](./queries/basic-crud.ts)

**包含**:
- ✅ 创建记录（create, createMany, upsert）
- ✅ 查询记录（findMany, findUnique, findFirst）
- ✅ 更新记录（update, updateMany）
- ✅ 删除记录（delete, deleteMany）
- ✅ 聚合查询（count, aggregate, groupBy）
- ✅ 分页查询（skip, take）

**适用场景**: 学习 Prisma 的基础 API

---

### 3. 关系查询

**文件**: [`queries/relations.ts`](./queries/relations.ts)

**包含**:
- ✅ `include` - 包含关联数据
- ✅ `select` - 精确选择字段
- ✅ 嵌套查询（多层 include/select）
- ✅ 关系过滤（some, every, none）
- ✅ 关系操作（connect, disconnect, create）
- ✅ 多对多关系（隐式 vs 显式）

**适用场景**: 处理复杂的关联查询

---

### 4. 事务处理

**文件**: [`queries/transactions.ts`](./queries/transactions.ts)

**包含**:
- ✅ 顺序事务（数组形式）
- ✅ 交互式事务（回调形式）
- ✅ 事务错误处理和回滚
- ✅ 隔离级别（Read Committed, Serializable 等）
- ✅ 实际业务场景（订单创建）

**适用场景**: 需要保证数据一致性的操作

---

### 5. N+1 问题解决

**文件**: [`queries/n-plus-one-solution.ts`](./queries/n-plus-one-solution.ts)

**包含**:
- ❌ N+1 问题示例（查询 1001 次）
- ✅ 解决方案 1: 使用 `include`（查询 1-2 次）
- ✅ 解决方案 2: 使用 `select`（减少数据传输）
- ✅ 解决方案 3: 手动批量查询（WHERE ... IN）
- ✅ 解决方案 4: 使用 `_count`（只需要数量时）
- ✅ 解决方案 5: 关系过滤 + 限制数量
- ✅ 性能对比和选择建议

**适用场景**: 优化查询性能，避免数据库爆炸

---

### 6. 迁移管理

**文件**: [`migrations/README.md`](./migrations/README.md)

**包含**:
- ✅ 迁移基本流程
- ✅ 添加/删除字段
- ✅ 重命名字段（保留数据）
- ✅ 修改字段类型
- ✅ 添加关系和索引
- ✅ 生产环境迁移（migrate deploy）
- ✅ 团队协作最佳实践
- ✅ 破坏性变更处理

**适用场景**: 管理数据库 Schema 演变

---

### 7. Next.js 集成

#### 7.1 Prisma Client 单例

**文件**: [`nextjs-integration/lib/prisma.ts`](./nextjs-integration/lib/prisma.ts)

**包含**:
- ✅ 全局单例模式（防止热重载创建多个实例）
- ✅ 开发/生产环境配置
- ✅ 日志配置
- ✅ 优雅关闭

**适用场景**: 在 Next.js 中初始化 Prisma

---

#### 7.2 Server Component

**文件**: [`nextjs-integration/app/users/page.tsx`](./nextjs-integration/app/users/page.tsx)

**包含**:
- ✅ 在 Server Component 中直接使用 Prisma
- ✅ 异步查询和渲染
- ✅ 元数据（SEO 优化）
- ✅ Streaming 和 Suspense

**适用场景**: 页面级别的数据查询

---

#### 7.3 API Route

**文件**: [`nextjs-integration/app/api/users/route.ts`](./nextjs-integration/app/api/users/route.ts)

**包含**:
- ✅ GET 请求（查询列表、分页、搜索）
- ✅ POST 请求（创建记录）
- ✅ DELETE 请求（批量删除）
- ✅ 错误处理（Prisma 错误码）
- ✅ 返回 JSON 响应

**适用场景**: 提供 RESTful API

---

#### 7.4 Server Actions

**文件**: [`nextjs-integration/app/actions.ts`](./nextjs-integration/app/actions.ts)

**包含**:
- ✅ 表单提交处理
- ✅ 数据验证
- ✅ 创建、更新、删除操作
- ✅ `revalidatePath`（缓存刷新）
- ✅ `redirect`（页面跳转）
- ✅ 事务处理

**适用场景**: 表单提交和数据修改

---

## 🎯 学习路径

### 初学者

1. **Schema 设计** → [`schema/full-schema.prisma`](./schema/full-schema.prisma)
2. **CRUD 操作** → [`queries/basic-crud.ts`](./queries/basic-crud.ts)
3. **关系查询** → [`queries/relations.ts`](./queries/relations.ts)
4. **Next.js 集成** → [`nextjs-integration/`](./nextjs-integration/)

### 进阶者

1. **事务处理** → [`queries/transactions.ts`](./queries/transactions.ts)
2. **性能优化** → [`queries/n-plus-one-solution.ts`](./queries/n-plus-one-solution.ts)
3. **迁移管理** → [`migrations/README.md`](./migrations/README.md)

## 💡 常见问题

### Q: 如何在 Next.js 中使用这些示例？

1. 复制 [`nextjs-integration/lib/prisma.ts`](./nextjs-integration/lib/prisma.ts) 到项目的 `lib/prisma.ts`
2. 在 Server Component、API Route 或 Server Actions 中导入：
   ```typescript
   import { prisma } from '@/lib/prisma';
   ```
3. 直接使用 Prisma Client

### Q: 为什么需要全局单例？

Next.js 开发模式下，热重载会重新加载模块，每次都 `new PrismaClient()` 会创建新的数据库连接，最终耗尽连接池。使用 `globalThis` 存储实例可以在热重载时复用。

### Q: 如何处理 Prisma 错误？

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed
    if (error.code === 'P2002') {
      console.error('邮箱已存在:', error.meta?.target);
    }
  }
}
```

### Q: 如何优化查询性能？

1. **避免 N+1 问题** → 使用 `include` 或手动批量查询
2. **减少数据传输** → 使用 `select` 只查询需要的字段
3. **添加索引** → 为 WHERE、ORDER BY 的字段添加 `@@index`
4. **使用 `_count`** → 只需要数量时，不拉取完整数据

### Q: 开发环境和生产环境的迁移有什么区别？

| 环境 | 命令 | 行为 |
|------|------|------|
| 开发 | `migrate dev` | 创建迁移 + 执行 + 生成 Client |
| 生产 | `migrate deploy` | 只执行未应用的迁移 |

**⚠️ 重要**: 生产环境绝不能用 `migrate dev`，它会重置数据库！

## 🔗 相关章节

- [Chapter 03: Prisma Database](../README.md) - 主章节
- [Chapter 04: tRPC](../../05-trpc-tanstack-query/examples/README.md) - tRPC 会复用 Prisma 的查询逻辑

## 📖 更多资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma Examples](https://github.com/prisma/prisma-examples)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
