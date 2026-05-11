# Prisma 练习题答案

本目录包含 Prisma ORM 相关练习题的答案。

## 📋 练习题列表

### 7. Schema 定义
- **文件**:
  - `07-blog-schema.prisma` - 数据模型定义
  - `07-usage-example.ts` - Prisma Client 使用示例
  - `07-migration-commands.sh` - 迁移命令
- **技术点**: Schema 定义、关系、迁移
- **关键概念**:
  - `@id` 主键
  - `@unique` 唯一约束
  - `@default()` 默认值
  - `@relation` 外键关系

### 14. Next.js API 集成
- **文件**:
  - `14-prisma-client.ts` - Prisma Client 单例模式
  - `14-api-users-route.ts` - 获取用户列表
  - `14-api-user-by-id-route.ts` - 获取单个用户
- **技术点**: API Route、Prisma Client、错误处理
- **关键概念**:
  - 单例模式防止连接池耗尽
  - `select` 只返回需要的字段
  - 错误处理和 HTTP 状态码

---

## 🎯 学习要点

### Prisma Schema 语法

#### 基本类型
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?  // 可选字段
  age       Int      @default(18)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt  // 自动更新
}
```

#### 关系类型

**一对一 (1:1)**
```prisma
model User {
  id      Int      @id
  profile Profile?  // 可选
}

model Profile {
  id     Int  @id
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
}
```

**一对多 (1:N)**
```prisma
model User {
  id    Int    @id
  posts Post[]  // 一个用户多篇文章
}

model Post {
  id       Int  @id
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}
```

**多对多 (M:N)**
```prisma
// 隐式多对多(Prisma 自动创建中间表)
model Post {
  id   Int   @id
  tags Tag[]
}

model Tag {
  id    Int    @id
  posts Post[]
}

// 显式多对多(手动控制中间表)
model Post {
  id   Int       @id
  tags PostTag[]
}

model Tag {
  id    Int       @id
  posts PostTag[]
}

model PostTag {
  postId Int
  tagId  Int
  post   Post @relation(fields: [postId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])
  
  @@id([postId, tagId])  // 复合主键
}
```

### Prisma Client 使用

#### 创建记录
```ts
// 单条
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: '张三',
  },
});

// 批量
await prisma.user.createMany({
  data: [
    { email: 'user1@example.com' },
    { email: 'user2@example.com' },
  ],
});

// 嵌套创建(包含关联)
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    posts: {
      create: [
        { title: '第一篇文章' },
        { title: '第二篇文章' },
      ],
    },
  },
});
```

#### 查询记录
```ts
// 查询所有
const users = await prisma.user.findMany();

// 条件查询
const users = await prisma.user.findMany({
  where: {
    email: { contains: '@gmail.com' },
    age: { gte: 18 },  // >= 18
  },
  orderBy: { createdAt: 'desc' },
  take: 10,  // 限制数量
  skip: 0,   // 跳过
});

// 查询单条(可能为 null)
const user = await prisma.user.findUnique({
  where: { id: 1 },
});

// 查询单条(不存在时抛错)
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 1 },
});

// 包含关联数据
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,  // 包含所有文章
  },
});

// 只选择特定字段
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
    // 不返回 password 等敏感字段
  },
});
```

#### 更新记录
```ts
// 更新单条
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: '李四' },
});

// 批量更新
await prisma.user.updateMany({
  where: { isActive: false },
  data: { isActive: true },
});

// Upsert(不存在则创建)
const user = await prisma.user.upsert({
  where: { email: 'test@example.com' },
  update: { name: '更新' },
  create: { email: 'test@example.com', name: '创建' },
});
```

#### 删除记录
```ts
// 删除单条
await prisma.user.delete({
  where: { id: 1 },
});

// 批量删除
await prisma.user.deleteMany({
  where: { createdAt: { lt: new Date('2023-01-01') } },
});
```

### 高级查询

#### 聚合查询
```ts
const result = await prisma.user.aggregate({
  _count: true,      // 计数
  _avg: { age: true },   // 平均值
  _sum: { age: true },   // 总和
  _max: { age: true },   // 最大值
  _min: { age: true },   // 最小值
});
```

#### 分组查询
```ts
const result = await prisma.user.groupBy({
  by: ['country'],
  _count: true,
  having: {
    age: { _avg: { gte: 18 } },
  },
});
```

#### 事务
```ts
// 使用 $transaction
await prisma.$transaction([
  prisma.user.create({ data: { email: 'user1@example.com' } }),
  prisma.post.create({ data: { title: '文章' } }),
]);

// 交互式事务
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'test@example.com' } });
  await tx.post.create({ data: { title: '文章', authorId: user.id } });
});
```

### 性能优化

#### 1. 使用索引
```prisma
model User {
  email String @unique  // 自动创建索引
  name  String
  
  @@index([name])  // 手动创建索引
}
```

#### 2. 只查询需要的字段
```ts
// ❌ 不好:返回所有字段
const users = await prisma.user.findMany();

// ✅ 好:只返回需要的字段
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});
```

#### 3. 批量操作
```ts
// ❌ 不好:N+1 查询
for (const user of users) {
  await prisma.post.create({ data: { authorId: user.id } });
}

// ✅ 好:批量创建
await prisma.post.createMany({
  data: users.map(user => ({ authorId: user.id })),
});
```

#### 4. Prisma Client 单例
```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 🔗 相关资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Studio](https://www.prisma.io/studio) - 数据库 GUI
