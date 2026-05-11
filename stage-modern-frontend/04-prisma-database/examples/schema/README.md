# Prisma Schema 示例

这个目录包含了 Prisma Schema 的完整示例。

## 📁 文件列表

### `full-schema.prisma`

完整的博客系统 Schema，包含：

**关系类型**:
- ✅ **一对一**: `User ↔ Profile`
- ✅ **一对多**: `User → Posts`, `Post → Comments`
- ✅ **多对多（隐式）**: `Post ↔ Category` (Prisma 自动创建中间表)
- ✅ **多对多（显式）**: `Post ↔ Tag` (通过 PostTag 中间表)

**高级特性**:
- ✅ **枚举**: `Role`, `OrderStatus`
- ✅ **默认值**: `@default(autoincrement())`, `@default(now())`
- ✅ **自动更新**: `@updatedAt`
- ✅ **索引**: 单字段索引、复合索引
- ✅ **级联操作**: `onDelete: Cascade`
- ✅ **自定义表名**: `@@map("users")`
- ✅ **数据库特定类型**: `@db.Text`, `@db.Decimal(10, 2)`

## 🚀 如何使用

### 1. 创建新项目

```bash
# 初始化 Prisma
npx prisma init

# 将 full-schema.prisma 的内容复制到 prisma/schema.prisma
```

### 2. 配置数据库连接

编辑 `.env` 文件：

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/mydb"

# SQLite (开发环境)
DATABASE_URL="file:./dev.db"
```

### 3. 创建迁移

```bash
# 创建迁移文件并应用到数据库
npx prisma migrate dev --name init

# 这会:
# ✅ 生成 SQL 迁移脚本
# ✅ 应用迁移到数据库
# ✅ 生成 Prisma Client
```

### 4. 使用 Prisma Client

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 创建用户和资料（一对一）
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
    profile: {
      create: {
        bio: 'Software Engineer',
        avatar: 'https://example.com/avatar.jpg',
      },
    },
  },
  include: { profile: true },
});

// 创建帖子（一对多）
const post = await prisma.post.create({
  data: {
    title: 'Hello Prisma',
    content: 'This is my first post',
    published: true,
    author: { connect: { id: user.id } },
  },
});

// 多对多关系（隐式）
const postWithCategories = await prisma.post.update({
  where: { id: post.id },
  data: {
    categories: {
      connect: [
        { id: 1 },
        { id: 2 },
      ],
    },
  },
  include: { categories: true },
});

// 多对多关系（显式）
await prisma.postTag.create({
  data: {
    postId: post.id,
    tagId: 1,
    assignedAt: new Date(),  // 额外字段
  },
});
```

## 📊 ER 图

```
User (1) -------- (1) Profile
  |
  | (1:N)
  |
Post (N) -------- (N) Category  [隐式多对多]
  |
  | (1:N)
  |
Comment (N) -------- (1) User

Post (N) -------- (N) Tag  [显式多对多，通过 PostTag]
```

## 🎓 学习要点

### 一对一关系

- 外键字段必须有 `@unique` 约束
- 通常放在"从属"的一侧（Profile 依赖 User）
- 使用 `onDelete: Cascade` 确保数据一致性

### 一对多关系

- 外键放在"多"的一侧
- "一"的一侧用数组类型（`Post[]`）
- 为外键字段添加索引以提升查询性能

### 多对多关系（隐式 vs 显式）

**隐式**（Prisma 自动创建中间表）:
- ✅ 简单、快速
- ❌ 无法添加额外字段
- 适用场景: 纯粹的多对多关系

**显式**（手动定义中间表）:
- ✅ 可以添加额外字段（如时间戳）
- ✅ 完全控制中间表结构
- ❌ 代码稍微复杂
- 适用场景: 需要记录关联元数据（谁、何时、为什么）

## 🔍 常见问题

### Q: 什么时候用 `@unique`，什么时候用 `@@unique`?

```prisma
model User {
  email String @unique  // 字段级别约束
  
  @@unique([firstName, lastName])  // 模型级别复合约束
}
```

### Q: `@map` 和 `@@map` 的区别？

```prisma
model User {
  createdAt DateTime @map("created_at")  // 字段级别映射
  
  @@map("users")  // 模型级别映射（表名）
}
```

### Q: 如何选择 `onDelete` 策略？

| 策略 | 行为 | 适用场景 |
|------|------|----------|
| `Cascade` | 删除父记录时，自动删除子记录 | User → Profile（删除用户时删除资料） |
| `SetNull` | 删除父记录时，子记录外键设为 NULL | Post → Category（删除分类时，帖子保留） |
| `Restrict` | 如果有子记录，禁止删除父记录 | Order → OrderItems（有订单项时不能删除订单） |
| `NoAction` | 数据库不做检查（危险！） | 特殊场景，需要手动处理 |

## 📚 相关章节

- [查询示例](../queries/README.md) - 如何使用这个 Schema 进行 CRUD 操作
- [迁移示例](../migrations/README.md) - 如何管理 Schema 的演变
- [Next.js 集成](../nextjs-integration/README.md) - 在 Next.js 中使用 Prisma
