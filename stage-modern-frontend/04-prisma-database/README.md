# Prisma — 数据库层的类型安全革命

> *"Data dominates. If you've chosen the right data structures and organized things well, the algorithms will almost always be self-evident."* — Rob Pike (Go 语言设计者)
>
> 数据库 Schema 是你整个应用的地基。如果地基歪了,上面的大楼(业务逻辑)再怎么修补都是歪的。传统的数据库开发是"先建表,再在代码里猜表结构"——SQL 文件和应用代码之间隔着一道类型的鸿沟,每次修改都像走钢丝,稍有不慎就是运行时错误。Prisma 的 Schema-First 方法迫使你在写第一行业务代码之前,先想清楚数据的形状。然后它做了一件魔法般的事:把这个 Schema **自动翻译**成 TypeScript 类型、SQL 迁移脚本、和一个完全类型安全的查询客户端。这不是简单的代码生成——这是端到端类型安全在数据层的最终形态。

---

## 💡 代码示例说明

本章包含大量代码示例，为了便于学习和参考，所有超过 30 行的完整代码已提取到 `examples/` 目录：

- 📂 **[`examples/schema/`](./examples/schema/)** - Prisma Schema 定义示例
- 📂 **[`examples/queries/`](./examples/queries/)** - 完整的查询操作示例（可直接运行）
- 📂 **[`examples/nextjs-integration/`](./examples/nextjs-integration/)** - Next.js 集成示例
- 📄 **[`examples/README.md`](./examples/README.md)** - 详细的使用说明

README 中保留简化的概念性代码，完整实现请查看 examples 目录。

---

## 📖 本章内容

1. [**ORM 的爱恨情仇**](#1-orm-的爱恨情仇) — 从 Active Record 到 Prisma 的演进史
2. [**Schema-First 设计哲学**](#2-schema-first-设计哲学) — 数据建模的声明式方式
3. [**Prisma Schema 语言**](#3-prisma-schema-语言) — Model、关系、枚举、属性
4. [**迁移管理**](#4-迁移管理) — `prisma migrate`、版本控制、团队协作
5. [**Prisma Client 基础**](#5-prisma-client-基础) — CRUD 操作、关系查询、事务
6. [**类型安全的魔力**](#6-类型安全的魔力) — 从 Schema 到 TypeScript 类型的自动生成
7. [**性能考量**](#7-性能考量) — N+1 问题、`include` vs `select`、索引策略
8. [**与 Next.js 集成**](#8-与-nextjs-集成) — Server Component 中直接查询、连接池管理
9. [**🧘 Zen of Code: 声明式的胜利**](#9--zen-of-code-声明式的胜利)
10. [**最佳实践与常见陷阱**](#10-最佳实践与常见陷阱)
11. [**章节练习**](#11-章节练习)

**前置知识**: Stage 2 TypeScript, Stage 4 Database 原理 (关系模型、索引、范式)
**学习时间**: 3-4 天
**关键术语**: ORM, Schema, Migration, Type Safety, N+1 Problem

**向前连接**: 
- Stage 4 Database/ORM 章节教你**渔**(关系模型、范式理论、索引原理)——那些是永恒的知识
- 这章教你 Prisma 这根**鱼竿**——当前最优雅的工具,但工具会变
- 理解原理的人能驾驭任何工具;只会工具的人在工具被淘汰时就迷失了

**向后连接**:
- Prisma 生成的 TypeScript 类型会流入 tRPC Router,实现端到端类型安全
- 下一章 tRPC 会复用 Prisma 的查询逻辑,构建类型安全的 API 层

---

## 1. ORM 的爱恨情仇

> 🎭 **The Drama: 越南战争隐喻**
>
> Martin Fowler 把 ORM (Object-Relational Mapping) 称为编程界的"越南战争"——容易进入,难以撤退,永远不知道什么时候该放弃。
>
> **ORM 的承诺**(2004 年,Ruby on Rails 带着 Active Record 闪亮登场):
> "你不需要写 SQL!数据库表就是一个对象,查询就是调用方法。`User.where(age: 18)` 多优雅!业务逻辑和数据库解耦了!"
>
> **ORM 的现实**(2015 年,你的项目已经运行 3 年):
> 你遇到了一个复杂的多表 JOIN 查询,ORM 生成的 SQL 慢得像蜗牛。你尝试优化,发现 ORM 的 API 根本表达不了你想要的查询。你被迫绕过 ORM,直接写原生 SQL。然后你发现:你的代码库里同时存在两种查询方式——一部分用 ORM,一部分用原生 SQL。类型安全?早就碎成渣了。你开始怀疑:当初为什么要用 ORM?
>
> 这就是**抽象泄漏定律** (Law of Leaky Abstractions) 在数据库层的经典案例。ORM 试图把 SQL 抽象成对象方法,但当你遇到复杂查询、性能调优、或数据库特有功能时,抽象就"泄漏"了——你不得不了解底层的 SQL,ORM 反而成了负担。

### 1.1 ORM 的三代人

#### 第一代: Active Record (2004 - Ruby on Rails)

```ruby
# Ruby on Rails 的魔法
user = User.find(1)
user.posts.where(published: true).order(created_at: :desc).limit(10)

# 看起来很优雅,但...
# 1. 类型安全?不存在的 (Ruby 是动态语言)
# 2. N+1 问题泛滥 (后面会详细讲)
# 3. 复杂查询很难表达
```

**贡献**: 证明了"数据库表映射成对象"的可行性,让 Web 开发效率飙升
**痛点**: 动态语言无类型、性能优化困难、抽象泄漏严重

#### 第二代: Sequelize / TypeORM (2015 - JavaScript/TypeScript)

```typescript
// Sequelize (Node.js 早期的 ORM)
const User = sequelize.define('User', {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
});

const users = await User.findAll({
  where: { age: { [Op.gte]: 18 } },
  include: [{ model: Post, where: { published: true } }]
});

// 问题:
// 1. 类型定义和 Schema 定义是两套系统,容易不同步
// 2. TypeScript 的类型推断很弱 (users 的类型是 any[])
// 3. 配置繁琐 (Decorator 地狱)
```

**贡献**: 把 ORM 带入 TypeScript 时代
**痛点**: 类型安全不完整、配置复杂、查询 API 冗长

#### 第三代: Prisma (2020 - Schema-First + 完美类型安全)

```typescript
// Prisma Schema (schema.prisma)
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}

// Prisma Client (自动生成的 TypeScript 代码)
const users = await prisma.user.findMany({
  where: { age: { gte: 18 } },
  include: { posts: { where: { published: true } } }
});
// ✅ users 的类型是 (User & { posts: Post[] })[]
// ✅ 每个字段的类型都是精确推断的
// ✅ IDE 自动补全、重构安全
```

**革命性突破**:
1. **Schema-First**: 单一数据源(`.prisma` 文件),从它生成数据库和 TypeScript 类型
2. **完美类型推断**: 每个查询的返回类型都是精确推断的,包括关系、选择字段
3. **自动化迁移**: `prisma migrate` 自动生成 SQL 迁移脚本
4. **开发者体验**: Prisma Studio (可视化数据库浏览器)、格式化、代码补全

> 🌌 **The Big Picture: "Write SQL by hand" 运动的兴起**
>
> 有趣的是,就在 Prisma 让 ORM 变得前所未有地好用的同时,另一股力量正在崛起——"反 ORM" 运动。
>
> **Go 社区**: `sqlc` (把 SQL 编译成类型安全的 Go 代码)
> **Rust 社区**: `sqlx` (编译时检查 SQL 语句的正确性)
> **TypeScript 社区**: `kysely` / `drizzle` (API 长得像 SQL,但有完整类型安全)
>
> 这些工具的哲学是:**不要抽象 SQL,而是让 SQL 本身变得类型安全。** 他们认为 SQL 已经是一门优秀的查询语言,ORM 的"翻译层"反而是累赘。
>
> **Prisma vs kysely/drizzle 的权衡**:
> - **Prisma**: 更高层的抽象,学习曲线平缓,迁移自动化,适合快速开发
> - **kysely/drizzle**: 更贴近 SQL,控制更细粒度,适合性能敏感/复杂查询的场景
>
> 没有绝对的"最佳选择",只有最适合你当前场景的妥协。本章教 Prisma,因为它是现代全栈 TypeScript 生态的主流选择。但如果你的项目有大量复杂查询,kysely 也是一个优秀的替代品。

---

## 2. Schema-First 设计哲学

> 🎭 **The Drama: 建筑蓝图 vs 搬砖**
>
> 想象两种建房子的方式:
>
> **方式 A (传统数据库开发)**:
> 1. 工头(后端工程师)直接指挥工人(写 SQL):"在这里砌一堵墙,在那里开一扇窗"
> 2. 建了一半发现房间太小,推倒重建
> 3. 建完后没有图纸,维修时靠"记忆"找承重墙
> 4. 新工人加入,只能看实物猜测结构,经常撞到已有的墙
>
> **方式 B (Prisma 的 Schema-First)**:
> 1. 建筑师(你)先画好蓝图(`schema.prisma`)——每个房间多大、墙在哪里、门窗朝向
> 2. 蓝图修改很容易(改几行代码),Prisma 自动计算"怎么改建筑"(生成迁移脚本)
> 3. 蓝图就是文档,所有人看同一份图纸
> 4. 施工队(Prisma Client)自动根据蓝图干活,不会走错

**Schema-First 的三大优势**:

### 2.1 单一数据源 (Single Source of Truth)

传统开发的痛苦:
```typescript
// 1. SQL 文件 (database.sql)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE
);

// 2. TypeScript 类型定义 (types.ts)
interface User {
  id: number;
  name: string;
  email: string;
}

// 3. ORM 模型定义 (可能还有一份!)
// 三份定义,三次维护,三倍出错概率!
```

Prisma 的解决方案:
```prisma
// schema.prisma (唯一的定义)
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}

// 从这一份定义自动生成:
// ✅ SQL 迁移脚本 (migrations/*.sql)
// ✅ TypeScript 类型 (@prisma/client)
// ✅ 查询客户端 (prisma.user.xxx)
```

### 2.2 数据建模即思考

> ⚛️ **The Physics: 数据结构 → 算法的因果关系**
>
> Rob Pike 的那句名言揭示了一个深刻的真理:**好的数据结构让算法自然涌现。**
>
> 如果你的用户表设计是这样的:
> ```prisma
> model User {
>   id       Int    @id
>   profile  Json   // { "name": "...", "email": "...", "address": {...} }
> }
> ```
> 你的查询代码会变成噩梦:
> ```typescript
> // ❌ 无类型安全、无法索引、无法关联查询
> const users = await prisma.user.findMany({
>   where: { profile: { path: ['email'], equals: 'test@example.com' } }
> });
> ```
>
> 但如果你的设计是这样的:
> ```prisma
> model User {
>   id      Int     @id
>   name    String
>   email   String  @unique
>   profile Profile?
> }
> model Profile {
>   id     Int  @id
>   userId Int  @unique
>   user   User @relation(fields: [userId], references: [id])
>   bio    String?
>   avatar String?
> }
> ```
> 查询就变得优雅且类型安全:
> ```typescript
> // ✅ 类型安全、可索引、可关联查询
> const user = await prisma.user.findUnique({
>   where: { email: 'test@example.com' },
>   include: { profile: true }
> });
> // user 的类型: User & { profile: Profile | null }
> ```
>
> **数据库设计不是技术细节,它是业务逻辑的镜子。** 好的 Schema 让代码写起来像诗,差的 Schema 让代码写起来像咒语。

### 2.3 迁移即时间机器

```prisma
// 2024-01-01: 初始 Schema
model User {
  id    Int    @id @default(autoincrement())
  name  String
}

// 运行: npx prisma migrate dev --name init
// 生成: migrations/20240101120000_init/migration.sql
```

```sql
-- 生成的 SQL
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    PRIMARY KEY ("id")
);
```

```prisma
// 2024-02-01: 需求变更,添加邮箱字段
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique // 新增!
}

// 运行: npx prisma migrate dev --name add_email
// Prisma 自动计算差异,生成迁移脚本
```

```sql
-- migrations/20240201100000_add_email/migration.sql
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

> 🌌 **The Big Picture: 迁移是数据库的 Git**
>
> Git 让你的代码有了历史——每次提交都是一个快照,你可以回滚、对比、合并。
> Prisma Migration 让你的数据库也有了历史——每次迁移都是一个版本,你可以:
> - 看到数据库是如何一步步演变成现在这样的
> - 回滚到任意历史版本
> - 在团队中同步数据库变更(把 `migrations/` 文件夹提交到 Git)
> - 在 CI/CD 中自动应用迁移(生产部署前运行 `prisma migrate deploy`)
>
> **没有迁移系统的数据库开发,就像没有版本控制的代码开发——可行,但痛苦。**

---

## 3. Prisma Schema 语言

Prisma Schema 是一种领域特定语言(DSL),专门用于定义数据模型。它的设计目标是:**可读性 > 灵活性**。

### 3.1 基本语法

```prisma
// schema.prisma - 基础结构示例

// 1. Generator: 指定生成什么
generator client {
  provider = "prisma-client-js"
}

// 2. Datasource: 指定数据库连接
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 3. Model: 定义数据表
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
}

// 4. Enum: 枚举类型
enum Role {
  USER
  ADMIN
}
```

> 📄 **完整 Schema 示例**: 查看 [`examples/schema/full-schema.prisma`](./examples/schema/full-schema.prisma) 了解包含所有关系类型的完整示例

### 3.2 字段类型映射

| Prisma 类型 | PostgreSQL | MySQL | SQLite | TypeScript 类型 |
|------------|-----------|-------|--------|----------------|
| `String` | `TEXT` | `VARCHAR(191)` | `TEXT` | `string` |
| `Int` | `INTEGER` | `INT` | `INTEGER` | `number` |
| `BigInt` | `BIGINT` | `BIGINT` | `INTEGER` | `bigint` |
| `Float` | `DOUBLE PRECISION` | `DOUBLE` | `REAL` | `number` |
| `Decimal` | `DECIMAL(65,30)` | `DECIMAL(65,30)` | — | `Prisma.Decimal` |
| `Boolean` | `BOOLEAN` | `TINYINT(1)` | `INTEGER` | `boolean` |
| `DateTime` | `TIMESTAMP(3)` | `DATETIME(3)` | `NUMERIC` | `Date` |
| `Json` | `JSONB` | `JSON` | `TEXT` | `Prisma.JsonValue` |
| `Bytes` | `BYTEA` | `LONGBLOB` | `BLOB` | `Buffer` |

### 3.3 关系类型详解

#### 一对一关系 (One-to-One)

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  profile Profile? // 可选的一对一关系
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  userId Int    @unique  // ⚠️ 必须是 unique
  user   User   @relation(fields: [userId], references: [id])
}
```

**关键点**:
- 外键字段(`userId`)必须有 `@unique` 约束
- 关系字段可以放在任意一方(这里放在 `Profile`)
- 另一方(User)的字段类型是 `Profile?`(可选)

#### 一对多关系 (One-to-Many)

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[] // 一个用户有多篇文章
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}
```

**关键点**:
- "多"的一方(`Post`)有外键字段(`authorId`)
- "一"的一方(`User`)有关系数组(`Post[]`)

#### 多对多关系 (Many-to-Many)

**隐式多对多**(Prisma 自动创建关联表):

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  title      String
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

// Prisma 自动生成中间表 _CategoryToPost
// 你不需要手动定义!
```

**显式多对多**(你控制关联表的结构):

```prisma
model Post {
  id        Int            @id @default(autoincrement())
  title     String
  postTags  PostTag[]
}

model Tag {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  postTags PostTag[]
}

// 显式的关联表,可以添加额外字段
model PostTag {
  postId    Int
  tagId     Int
  assignedAt DateTime @default(now())  // 额外字段!
  
  post Post @relation(fields: [postId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])
  
  @@id([postId, tagId])  // 复合主键
}
```

> ⚛️ **The Physics: 关系的本质是外键约束**
>
> Prisma 的 `@relation` 语法看起来像魔法,但它的底层是标准的 SQL 外键约束:
>
> ```sql
> -- Post 表的外键约束
> ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" 
>   FOREIGN KEY ("authorId") REFERENCES "User"("id") 
>   ON DELETE RESTRICT ON UPDATE CASCADE;
> ```
>
> **级联操作**:
> ```prisma
> model Post {
>   author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
> }
> ```
> - `Cascade`: 删除 User 时,自动删除其所有 Post
> - `SetNull`: 删除 User 时,Post.authorId 设为 NULL
> - `Restrict` (默认): 如果 User 有 Post,禁止删除
> - `NoAction`: 数据库级别不做检查(危险!)

### 3.4 属性 (Attributes)

#### 字段级属性

```prisma
model User {
  id        Int      @id                         // 主键
  uuid      String   @default(uuid())            // 默认值: UUID
  createdAt DateTime @default(now())             // 默认值: 当前时间
  updatedAt DateTime @updatedAt                  // 自动更新时间戳
  email     String   @unique                     // 唯一约束
  age       Int      @default(0)                 // 默认值: 0
  metadata  Json     @db.JsonB                   // 数据库级别类型指定
  name      String   @db.VarChar(255)            // 指定 VARCHAR 长度
}
```

#### 模型级属性

```prisma
model User {
  id        Int    @id
  email     String
  name      String
  
  @@unique([email, name])       // 复合唯一约束
  @@index([email])              // 索引
  @@index([name, email])        // 复合索引
  @@map("users")                // 自定义表名(默认是 "User")
}

model Post {
  id      Int    @id
  slug    String
  title   String
  
  @@unique([slug], name: "unique_slug")  // 命名约束
  @@index([title(ops: raw("gin_trgm_ops"))], type: Gin)  // PostgreSQL 全文索引
}
```

### 3.5 枚举 (Enums)

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model User {
  id   Int  @id
  role Role @default(USER)
}

model Order {
  id     Int         @id
  status OrderStatus @default(PENDING)
}
```

**TypeScript 中使用**:
```typescript
import { Role, OrderStatus } from '@prisma/client';

const user = await prisma.user.create({
  data: {
    email: 'admin@example.com',
    role: Role.ADMIN  // ✅ 类型安全,IDE 自动补全
  }
});

// ❌ TypeScript 编译错误
const invalidUser = await prisma.user.create({
  data: {
    role: 'SUPERUSER'  // Error: Type '"SUPERUSER"' is not assignable to type 'Role'
  }
});
```

---

## 4. 迁移管理

> 🎭 **The Drama: 迁移地狱 vs 迁移天堂**
>
> **没有迁移系统的团队**:
> - 开发者 A: "我在本地加了个字段,你也手动加一下吧。"
> - 开发者 B: "哦忘了...现在线上报错了。"
> - DBA: "你们谁改了生产数据库?!表结构和代码不一致了!"
>
> **有 Prisma 迁移的团队**:
> - 开发者 A: `git push` (迁移文件自动包含在提交中)
> - 开发者 B: `git pull && npx prisma migrate dev` (自动同步数据库)
> - CI/CD: `npx prisma migrate deploy` (部署时自动应用迁移)
> - 所有人的数据库结构完全一致,零手动操作

### 4.1 开发环境迁移

```bash
# 1. 初始化 Prisma
npx prisma init

# 这会创建:
# - prisma/schema.prisma
# - .env (包含 DATABASE_URL)

# 2. 编写 Schema
# (编辑 schema.prisma,定义你的模型)

# 3. 创建迁移
npx prisma migrate dev --name init

# 这会:
# ✅ 根据 Schema 生成 SQL 迁移脚本
# ✅ 执行迁移(应用到数据库)
# ✅ 生成 Prisma Client
# ✅ 创建 migrations/ 文件夹
```

**迁移文件结构**:
```
prisma/
  schema.prisma
  migrations/
    20240101120000_init/
      migration.sql
    20240115143000_add_user_email/
      migration.sql
    20240203091500_add_post_model/
      migration.sql
    migration_lock.toml
```

### 4.2 修改 Schema 并迁移

```prisma
// 初始 Schema
model User {
  id   Int    @id @default(autoincrement())
  name String
}
```

```bash
# 运行第一次迁移
npx prisma migrate dev --name init
```

```prisma
// 修改 Schema: 添加 email 字段
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique  // 新增!
}
```

```bash
# 创建第二次迁移
npx prisma migrate dev --name add_user_email

# Prisma 会:
# 1. 检测到 Schema 变化
# 2. 生成 SQL: ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;
# 3. ⚠️ 询问你: "表里已有数据,新字段是 NOT NULL,如何处理?"
#    - 选项 A: 提供默认值
#    - 选项 B: 让 Prisma 生成迁移,你手动编辑 SQL
```

**迁移脚本**:
```sql
-- migrations/20240115143000_add_user_email/migration.sql
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### 4.3 处理破坏性变更

**场景**: 重命名字段

```prisma
// 从
model User {
  name String
}

// 改为
model User {
  fullName String
}
```

**❌ Prisma 的默认行为**: 删除 `name` 列,创建 `fullName` 列 → **数据丢失!**

**✅ 正确做法**: 手动编辑迁移脚本

```bash
# 1. 生成迁移
npx prisma migrate dev --name rename_name_to_fullname --create-only

# --create-only: 只生成迁移文件,不执行
```

```sql
-- 手动编辑生成的 migration.sql
-- ❌ Prisma 默认生成的(会丢数据)
-- ALTER TABLE "User" DROP COLUMN "name";
-- ALTER TABLE "User" ADD COLUMN "fullName" TEXT NOT NULL;

-- ✅ 手动修改为(保留数据)
ALTER TABLE "User" RENAME COLUMN "name" TO "fullName";
```

```bash
# 2. 执行手动编辑后的迁移
npx prisma migrate dev
```

### 4.4 生产环境迁移

```bash
# ⚠️ 开发环境用 migrate dev (会重置数据库)
# ✅ 生产环境用 migrate deploy (只应用未执行的迁移)

# 在 CI/CD 或生产服务器上:
npx prisma migrate deploy

# 这会:
# 1. 读取 migrations/ 文件夹
# 2. 检查哪些迁移已经执行过(记录在 _prisma_migrations 表)
# 3. 按顺序执行未执行的迁移
# 4. 不会重置数据库,不会丢失数据
```

**生产部署流程**:
```yaml
# .github/workflows/deploy.yml
- name: Run database migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Deploy application
  run: npm run deploy
```

> 🧠 **CS Master's Bridge: 迁移的幂等性**
>
> 好的迁移系统必须是**幂等的**(Idempotent)——多次执行相同的迁移,结果应该相同。
>
> Prisma 通过 `_prisma_migrations` 表实现幂等性:
> ```sql
> -- Prisma 自动创建的迁移记录表
> CREATE TABLE "_prisma_migrations" (
>   id                  VARCHAR(36) PRIMARY KEY,
>   checksum            VARCHAR(64) NOT NULL,
>   finished_at         TIMESTAMP,
>   migration_name      VARCHAR(255) NOT NULL,
>   logs                TEXT,
>   rolled_back_at      TIMESTAMP,
>   started_at          TIMESTAMP DEFAULT now(),
>   applied_steps_count INTEGER DEFAULT 0
> );
> ```
>
> 每次运行 `migrate deploy` 时:
> 1. Prisma 扫描 `migrations/` 文件夹
> 2. 计算每个迁移文件的 checksum
> 3. 查询 `_prisma_migrations` 表,看哪些 checksum 已记录
> 4. 只执行未记录的迁移
> 5. 执行成功后,记录到 `_prisma_migrations`
>
> **这就是分布式系统中的 "At-Most-Once" 语义在数据库迁移中的应用。**

### 4.5 团队协作最佳实践

```bash
# ✅ DO: 迁移文件提交到 Git
git add prisma/migrations/
git commit -m "feat: add user email field"

# ✅ DO: 拉取代码后同步数据库
git pull
npx prisma migrate dev  # 自动应用新迁移

# ❌ DON'T: 不要手动编辑已提交的迁移
# 如果迁移已经提交且被团队成员应用,修改它会导致 checksum 不匹配

# ❌ DON'T: 不要在生产环境用 migrate dev
# migrate dev 会重置数据库!

# ✅ DO: 冲突解决
# 如果两个开发者同时创建迁移:
# 1. Git 会检测到 migrations/ 文件夹的冲突
# 2. 手动解决冲突,合并迁移
# 3. 或者删除你的本地迁移,重新生成
```

---

## 5. Prisma Client 基础

Prisma Client 是从你的 Schema 自动生成的查询客户端。每次修改 Schema 后,需要重新生成:

```bash
npx prisma generate
```

### 5.1 初始化 Prisma Client

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

> 📄 **完整实现**: 查看 [`examples/nextjs-integration/lib/prisma.ts`](./examples/nextjs-integration/lib/prisma.ts) 了解完整的单例模式实现和详细注释

> ⚛️ **The Physics: 为什么需要全局单例?**
>
> Next.js 开发模式下的热重载(HMR)会重新加载模块,但不会重启 Node.js 进程。如果每次重载都 `new PrismaClient()`,你会创建多个数据库连接,最终耗尽连接池:
>
> ```typescript
> // ❌ 错误示例
> export const prisma = new PrismaClient();
> // 每次热重载都创建新实例 → 连接池耗尽
>
> // ✅ 正确示例
> // 使用 globalThis 存储单例 → 热重载时复用实例
> ```

### 5.2 CRUD 操作

#### 基础示例

```typescript
// Create - 创建记录
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
  },
});

// Read - 查询记录
const users = await prisma.user.findMany({
  where: { age: { gte: 18 } },
  orderBy: { createdAt: 'desc' },
  take: 10
});

// Update - 更新记录
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Updated' }
});

// Delete - 删除记录
const deleted = await prisma.user.delete({
  where: { id: 1 }
});
```

> 📄 **完整 CRUD 示例**: 查看 [`examples/queries/basic-crud.ts`](./examples/queries/basic-crud.ts) 了解所有 CRUD 操作、聚合查询、分组查询的完整示例

### 5.3 关系查询

```typescript
// Include: 包含关联数据
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,
    profile: true,
  }
});

// Select: 精确选择字段
const userWithPostTitles = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    name: true,
    posts: {
      select: { title: true }
    }
  }
});

// 关系过滤和聚合
const usersWithPublishedPosts = await prisma.user.findMany({
  where: {
    posts: { some: { published: true } }
  },
  include: {
    _count: { select: { posts: true } }
  }
});
```

> 📄 **完整关系查询示例**: 查看 [`examples/queries/relations.ts`](./examples/queries/relations.ts) 了解嵌套查询、关系过滤、关系操作的完整示例

### 5.4 聚合与分组

```typescript
// Count: 计数
const userCount = await prisma.user.count();

// Aggregate: 聚合
const stats = await prisma.user.aggregate({
  _avg: { age: true },
  _max: { age: true },
  _count: true
});

// GroupBy: 分组
const usersByRole = await prisma.user.groupBy({
  by: ['role'],
  _count: { _all: true }
});
```

> 💡 更多聚合和分组示例见 [`examples/queries/basic-crud.ts`](./examples/queries/basic-crud.ts)

### 5.5 事务 (Transactions)

```typescript
// 顺序事务: $transaction (数组)
const [deletedPosts, deletedUser] = await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: 1 } }),
  prisma.user.delete({ where: { id: 1 } })
]);

// 交互式事务: $transaction (回调)
const result = await prisma.$transaction(async (tx) => {
  const sender = await tx.account.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } }
  });
  
  if (sender.balance < 0) {
    throw new Error('余额不足');
  }
  
  const receiver = await tx.account.update({
    where: { id: 2 },
    data: { balance: { increment: 100 } }
  });
  
  return { sender, receiver };
}, {
  isolationLevel: 'Serializable'
});
```

> 📄 **完整事务示例**: 查看 [`examples/queries/transactions.ts`](./examples/queries/transactions.ts) 了解事务处理、错误处理、隔离级别的完整示例

> 🧠 **CS Master's Bridge: 事务的 ACID 属性**
>
> - **Atomicity (原子性)**: 事务中的所有操作要么全部成功,要么全部回滚。上面的转账例子中,如果余额不足,扣款和转账记录都不会生效。
> - **Consistency (一致性)**: 事务执行前后,数据库都处于一致状态。转账前后,所有账户余额之和应该不变。
> - **Isolation (隔离性)**: 并发事务之间互不干扰。Prisma 支持 4 种隔离级别:
>   - `ReadUncommitted`: 可能读到未提交的数据(脏读)
>   - `ReadCommitted`: 只能读到已提交的数据(PostgreSQL 默认)
>   - `RepeatableRead`: 事务内多次读取同一数据结果相同
>   - `Serializable`: 最严格,完全串行化执行
> - **Durability (持久性)**: 事务提交后,数据永久保存(即使数据库崩溃)

---

## 6. 类型安全的魔力

> 🎭 **The Drama: "这个字段存在吗?"的噩梦**
>
> **传统 ORM (Sequelize) 的世界**:
> ```typescript
> const users = await User.findAll({
>   include: [Post]
> });
> 
> // users 的类型是什么? any[]? User[]? (User & { posts: Post[] })[]?
> // TypeScript 不知道! IDE 无法补全! 重构时容易遗漏!
> 
> console.log(users[0].posts[0].title);  
> // ⚠️ 编译通过,但运行时可能崩溃:
> // - users 可能是空数组
> // - posts 可能是 undefined (如果没 include)
> // - title 可能被重命名了,但 TypeScript 没提示
> ```
>
> **Prisma 的世界**:
> ```typescript
> const users = await prisma.user.findMany({
>   include: { posts: true }
> });
> 
> // users 的类型: (User & { posts: Post[] })[]
> // ✅ 完全精确! IDE 自动补全! 重构安全!
> 
> console.log(users[0].posts[0].title);
> // TypeScript 知道:
> // - users 是数组
> // - users[0] 可能是 undefined (需要检查)
> // - posts 是数组 (因为你 include 了)
> // - title 是 string
> ```

### 6.1 自动生成的类型

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
}

enum Role {
  USER
  ADMIN
}
```

**Prisma 自动生成**:

```typescript
// node_modules/@prisma/client/index.d.ts (简化版)

// 1. 基本类型
export type User = {
  id: number;
  email: string;
  name: string | null;
  role: Role;
};

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}

// 2. 创建时的输入类型
export type UserCreateInput = {
  email: string;
  name?: string | null;
  role?: Role;
  posts?: PostCreateNestedManyWithoutAuthorInput;
  profile?: ProfileCreateNestedOneWithoutUserInput;
};

// 3. 查询返回类型 (根据 include/select 动态推断)
type UserWithPosts = User & { posts: Post[] };
type UserWithProfile = User & { profile: Profile | null };
```

### 6.2 查询类型推断

```typescript
// 1. findMany 不带 include/select
const users = await prisma.user.findMany();
// 类型: User[]

// 2. findMany 带 include
const usersWithPosts = await prisma.user.findMany({
  include: { posts: true }
});
// 类型: (User & { posts: Post[] })[]

// 3. findMany 带 select
const userEmails = await prisma.user.findMany({
  select: {
    id: true,
    email: true
  }
});
// 类型: { id: number; email: string }[]

// 4. 嵌套 include + select
const result = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    posts: {
      select: {
        title: true,
        published: true
      }
    }
  }
});
// 类型: { id: number; name: string | null; posts: { title: string; published: boolean }[] }[]

// 5. 使用 Prisma 提供的类型工具
import { Prisma } from '@prisma/client';

// 获取 findMany 的返回类型
type UsersWithPosts = Prisma.PromiseReturnType<typeof prisma.user.findMany<{
  include: { posts: true }
}>>;

// 或使用更简洁的方式
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>;
```

### 6.3 类型安全的输入验证

```typescript
import { Prisma } from '@prisma/client';

// ✅ 有效输入
const validInput: Prisma.UserCreateInput = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'ADMIN'
};

// ❌ TypeScript 编译错误
const invalidInput: Prisma.UserCreateInput = {
  email: 'test@example.com',
  age: 25  // Error: Object literal may only specify known properties
};

// ❌ TypeScript 编译错误
const invalidRole: Prisma.UserCreateInput = {
  email: 'test@example.com',
  role: 'SUPERUSER'  // Error: Type '"SUPERUSER"' is not assignable to type 'Role'
};

// 在函数中使用
async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({ data });
}

// ✅ 调用时有完整的类型检查和自动补全
await createUser({
  email: 'user@example.com',
  name: 'New User',
  posts: {
    create: [
      { title: 'First Post', content: 'Hello' }
    ]
  }
});
```

> ⚛️ **The Physics: 类型系统的"光速传播"**
>
> Prisma 的类型安全是**端到端**的,就像物理学中的因果链:
>
> ```
> Schema 定义 → Prisma Generate → TypeScript 类型 → 你的代码 → 编译时检查
> ```
>
> 当你修改 `schema.prisma`:
> 1. 运行 `prisma generate`
> 2. Prisma 读取 Schema,生成新的 TypeScript 类型定义
> 3. 你的代码中所有使用旧类型的地方**立刻**出现红色波浪线
> 4. 你无法编译通过,必须修复所有类型错误
>
> **这就像光速传播——Schema 的改变瞬间传播到整个代码库,零延迟。**
>
> 对比传统方法:
> 1. 修改数据库 Schema (手写 SQL)
> 2. 忘记更新应用代码
> 3. 部署到生产
> 4. 运行时崩溃! 用户看到 500 错误
> 5. 回滚,修复,重新部署
>
> **Prisma 把这个"运行时发现错误"提前到了"编译时消灭错误"。这是左移测试 (Shift-Left Testing) 在类型系统层面的体现。**

---

## 7. 性能考量

> 🎭 **The Drama: N+1 查询地狱**
>
> 这是 ORM 世界最臭名昭著的性能杀手。一个看起来无辜的代码,可能让你的数据库爆炸:
>
> ```typescript
> // ❌ 灾难性代码
> const users = await prisma.user.findMany();  // 1 次查询
> 
> for (const user of users) {
>   const posts = await prisma.post.findMany({  // N 次查询!
>     where: { authorId: user.id }
>   });
>   console.log(`${user.name} 有 ${posts.length} 篇文章`);
> }
> 
> // 如果有 1000 个用户:
> // 总查询次数 = 1 (查用户) + 1000 (每个用户查文章) = 1001 次!
> // 如果每次查询 10ms,总耗时 = 10 秒
> ```
>
> **为什么叫 N+1?**
> - 1 次查询主表 (User)
> - N 次查询关联表 (Post,N = 用户数量)
> - 总共 N+1 次查询

### 7.1 识别 N+1 问题

**启用查询日志**:
```typescript
const prisma = new PrismaClient({
  log: ['query'],  // 打印所有 SQL 查询
});
```

**执行代码**:
```typescript
const users = await prisma.user.findMany();

for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  });
}
```

**控制台输出**:
```sql
-- 查询 1
SELECT * FROM "User";

-- 查询 2
SELECT * FROM "Post" WHERE "authorId" = 1;

-- 查询 3
SELECT * FROM "Post" WHERE "authorId" = 2;

-- 查询 4
SELECT * FROM "Post" WHERE "authorId" = 3;

...
-- 查询 1001
SELECT * FROM "Post" WHERE "authorId" = 1000;

-- ⚠️ 1001 次查询!
```

### 7.2 解决 N+1 问题

**N+1 问题**是 ORM 中最常见的性能杀手：

```typescript
// ❌ 灾难性代码: 1 + N 次查询
const users = await prisma.user.findMany();  // 1 次
for (const user of users) {
  const posts = await prisma.post.findMany({  // N 次!
    where: { authorId: user.id }
  });
}

// ✅ 解决方案: 使用 include（只需 1 次查询）
const users = await prisma.user.findMany({
  include: { posts: true }
});
```

**性能对比**: N+1 查询可能需要 10 秒，include 只需 10 毫秒 —— **快了 1000 倍！**

> 📄 **N+1 问题完整分析**: 查看 [`examples/queries/n-plus-one-solution.ts`](./examples/queries/n-plus-one-solution.ts) 了解 5 种解决方案和性能对比

### 7.4 include vs select 的区别

| 特性 | `include` | `select` |
|------|-----------|----------|
| **默认字段** | 包含模型的所有字段 + 关联数据 | 只包含你明确指定的字段 |
| **组合使用** | ❌ 不能和 `select` 同时使用 | ❌ 不能和 `include` 同时使用 |
| **性能** | 可能返回冗余数据 | 只返回需要的数据,更高效 |
| **典型场景** | "我要这个模型的所有内容,顺便把关联数据也拿来" | "我只要特定字段,其他都不要" |

```typescript
// ❌ 错误: 不能同时使用
const result = await prisma.user.findMany({
  select: { id: true },
  include: { posts: true }
});
// Error: The `include` and `select` statements are mutually exclusive

// ✅ 正确: include
const users = await prisma.user.findMany({
  include: { posts: true }
});
// 返回: User 的所有字段 + posts 数组

// ✅ 正确: select
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    posts: {  // select 里也可以包含关系
      select: {
        title: true
      }
    }
  }
});
// 返回: { id, name, posts: [{ title }, ...] }
```

### 7.5 批量查询优化

```typescript
// ❌ 逐个查询
for (const id of userIds) {
  const user = await prisma.user.findUnique({ where: { id } });
  // N 次查询
}

// ✅ 批量查询
const users = await prisma.user.findMany({
  where: {
    id: { in: userIds }  // WHERE id IN (1, 2, 3, ...)
  }
});
// 1 次查询
```

### 7.6 索引策略

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  published Boolean  @default(false)
  authorId  Int
  createdAt DateTime @default(now())
  
  author User @relation(fields: [authorId], references: [id])
  
  // ✅ 常查询的字段添加索引
  @@index([authorId])        // 加速 WHERE authorId = ?
  @@index([published])       // 加速 WHERE published = ?
  @@index([createdAt])       // 加速 ORDER BY createdAt
  @@index([authorId, published])  // 复合索引,加速 WHERE authorId = ? AND published = ?
}
```

**查看索引使用情况**:
```typescript
// PostgreSQL: EXPLAIN ANALYZE
const result = await prisma.$queryRaw`
  EXPLAIN ANALYZE 
  SELECT * FROM "Post" WHERE "authorId" = 1 AND "published" = true;
`;
console.log(result);
// 输出: Index Scan using "Post_authorId_published_idx" ... (cost=0.29..8.31)
```

> 🧠 **CS Master's Bridge: 索引的权衡**
>
> 索引是用**空间换时间**:
> - ✅ 优点: 查询快(从 O(n) 全表扫描降到 O(log n) B-Tree 查找)
> - ❌ 缺点 1: 占用磁盘空间(每个索引是原表的副本)
> - ❌ 缺点 2: 写入慢(每次 INSERT/UPDATE/DELETE 都要更新索引)
>
> **索引的黄金法则**:
> 1. 为 `WHERE` 子句中的列添加索引
> 2. 为 `ORDER BY` 的列添加索引
> 3. 为外键列添加索引(Prisma 默认会做)
> 4. 不要为低基数列(如 `boolean`)单独建索引
> 5. 不要为几乎不查询的列建索引
>
> **复合索引的顺序很重要**:
> ```prisma
> @@index([authorId, published])  // ✅ 能加速:
> // WHERE authorId = 1
> // WHERE authorId = 1 AND published = true
> 
> // ❌ 不能加速:
> // WHERE published = true (只用第二列无法利用索引)
> ```
>
> 这叫"最左前缀原则"——复合索引 `(A, B, C)` 可以加速 `(A)`, `(A, B)`, `(A, B, C)`,但不能加速 `(B)`, `(C)`, `(B, C)`。

### 7.7 连接池管理

```typescript
// Prisma 默认连接池配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `${process.env.DATABASE_URL}?connection_limit=10&pool_timeout=20`
    }
  }
});

// PostgreSQL URL 参数:
// connection_limit: 连接池大小(默认: unlimited,但受 DB 限制)
// pool_timeout: 获取连接的超时时间(秒)
```

**Serverless 环境的挑战**:
```typescript
// ❌ 问题: Serverless 函数每次调用可能创建新连接
// 如果并发 100 个请求,可能创建 100 个数据库连接
// PostgreSQL 默认最多 100 个连接 → 连接池耗尽!

// ✅ 解决方案 1: 使用连接池代理
// Prisma Data Proxy / PgBouncer

// ✅ 解决方案 2: 使用 Serverless 友好的数据库
// Neon / PlanetScale (内建连接池)

// ✅ 解决方案 3: 使用 Prisma Accelerate (官方推荐)
// https://www.prisma.io/accelerate
```

---

## 8. 与 Next.js 集成

### 8.1 在 Server Component 中使用

```typescript
// app/users/page.tsx
import { prisma } from '@/lib/prisma';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { posts: true } }
    },
    take: 10
  });
  
  return (
    <div>
      <h1>用户列表</h1>
      {users.map(user => (
        <div key={user.id}>
          {user.name} - {user._count.posts} 篇文章
        </div>
      ))}
    </div>
  );
}
```

> 📄 **完整 Server Component 示例**: 查看 [`examples/nextjs-integration/app/users/page.tsx`](./examples/nextjs-integration/app/users/page.tsx) 了解样式和最佳实践

### 8.2 在 Server Action 中使用

```typescript
// app/actions.ts
'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const post = await prisma.post.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      author: { connect: { id: 1 } }
    }
  });
  
  revalidatePath('/posts');
  return { success: true, postId: post.id };
}
```

```typescript
// app/posts/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="标题" required />
      <textarea name="content" placeholder="内容" required />
      <button type="submit">发布</button>
    </form>
  );
}
```

### 8.3 在 API Route 中使用

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count()
  ]);
  
  return NextResponse.json({
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: '邮箱已被使用' }, { status: 400 });
    }
    throw error;
  }
}
```

### 8.4 Prisma 错误处理

```typescript
import { Prisma } from '@prisma/client';

async function handlePrismaErrors() {
  try {
    await prisma.user.create({
      data: {
        email: 'duplicate@example.com'  // 假设已存在
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 已知的 Prisma 错误
      switch (error.code) {
        case 'P2002':
          console.error('唯一约束冲突:', error.meta?.target);
          // meta.target: ['email'] (哪个字段冲突)
          break;
        case 'P2003':
          console.error('外键约束失败');
          break;
        case 'P2025':
          console.error('记录未找到');
          break;
      }
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      console.error('未知数据库错误:', error.message);
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('查询参数验证失败:', error.message);
    } else {
      console.error('其他错误:', error);
    }
  }
}
```

**常见错误代码**:

| 错误代码 | 含义 | 示例场景 |
|---------|------|---------|
| `P2002` | 唯一约束冲突 | 尝试创建重复的 email |
| `P2003` | 外键约束失败 | 引用了不存在的关联记录 |
| `P2025` | 记录未找到 | `findUniqueOrThrow` 找不到记录 |
| `P2014` | 关系约束失败 | 删除有关联数据的记录(onDelete: Restrict) |
| `P1001` | 数据库连接失败 | DATABASE_URL 错误 |

---

## 9. 🧘 Zen of Code: 声明式的胜利

> **从 SQL 到 React,声明式思维是贯穿现代前端的哲学主线**

回顾我们在这个学习路径中遇到的所有声明式工具:

```typescript
// 1. CSS: 描述"应该是什么样子"
.container {
  display: flex;
  justify-content: center;
}
// 你不告诉浏览器"如何"计算布局,你只描述约束

// 2. React: 描述"UI 应该是什么"
function UserList({ users }) {
  return <ul>{users.map(u => <li>{u.name}</li>)}</ul>;
}
// 你不操作 DOM,你只描述 UI 与数据的映射关系

// 3. Prisma Schema: 描述"数据应该是什么形状"
model User {
  id    Int    @id
  posts Post[]
}
// 你不写 CREATE TABLE,你只描述数据结构

// 4. Tailwind: 描述"这个元素的样式"
<div className="flex items-center gap-4">
// 你不写 CSS 文件,你只声明样式

// 5. tRPC (下一章): 描述"API 的输入输出类型"
const userRouter = router({
  getById: procedure.input(z.number()).query(({ input }) => ...)
});
// 你不写 API 文档,你只描述类型
```

**声明式的本质**: 你告诉系统**目标**(What),让系统决定**过程**(How)。

**命令式的本质**: 你告诉系统每一步怎么做。

> ⚛️ **The Physics: 声明式 = 约束求解**
>
> 声明式编程在底层本质上是**约束求解** (Constraint Solving):
>
> **CSS Flexbox**:
> ```css
> .container {
>   display: flex;
>   justify-content: space-between;
>   align-items: center;
> }
> ```
> 浏览器要解一个方程组:
> - 约束 1: 元素在主轴上均匀分布
> - 约束 2: 元素在交叉轴上居中
> - 约束 3: 容器宽度 = 父容器宽度
> - 求解: 每个元素的 x, y 坐标
>
> **Prisma Migration**:
> ```prisma
> model User {
>   email String @unique
> }
> ```
> Prisma 要解:
> - 约束 1: email 列必须存在
> - 约束 2: email 必须是 unique
> - 约束 3: 现有数据库状态 = XYZ
> - 求解: 需要执行什么 SQL 才能从现状到达目标状态
>
> **这和 AI 的约束满足问题(CSP)、逻辑编程(Prolog)、甚至量子力学的路径积分,在数学本质上是同构的——都是"给定约束,求解满足约束的状态"。**

**声明式的代价**:
- ❌ 失去精细控制(你无法优化 Flexbox 的布局算法)
- ❌ 抽象泄漏(当 Prisma 生成的 SQL 很慢时,你必须理解底层)
- ❌ 学习曲线(你需要理解约束系统的规则)

**声明式的回报**:
- ✅ 认知负荷降低(你思考"是什么"而非"怎么做")
- ✅ 可维护性提升(修改约束比修改过程容易)
- ✅ 正确性保障(约束系统保证了不变量)

**Prisma 在声明式光谱上的位置**:

```
完全命令式 ←────────────────────────→ 完全声明式
手写 SQL    Knex.js    TypeORM    Prisma    GraphQL
    ↑                              ↑           ↑
    |                              |           |
  最大控制                        平衡点    最高抽象
  最低抽象                                最小控制
```

Prisma 的设计哲学:**在声明式和控制力之间找到甜蜜点**:
- 90% 的查询用 Prisma Client (声明式)
- 10% 的复杂查询用 `$queryRaw` (原生 SQL)

---

## 10. 最佳实践与常见陷阱

### ✅ 最佳实践

#### 1. 使用全局单例

```typescript
// ✅ lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### 2. 使用 include/select 避免 N+1

```typescript
// ✅ 一次查询
const users = await prisma.user.findMany({
  include: { posts: true }
});

// ❌ N+1 查询
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { authorId: user.id } });
}
```

#### 3. 为常查询的字段添加索引

```prisma
model Post {
  @@index([authorId])
  @@index([published, createdAt])
}
```

#### 4. 使用类型导入

```typescript
import { Prisma } from '@prisma/client';

// ✅ 使用 Prisma 提供的类型
type UserCreateInput = Prisma.UserCreateInput;
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>;
```

#### 5. 处理 Prisma 错误

```typescript
try {
  await prisma.user.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // 处理唯一约束冲突
    }
  }
}
```

### ❌ 常见陷阱

#### 陷阱 1: 在循环中查询

```typescript
// ❌ 极慢
const userIds = [1, 2, 3, 4, 5];
const users = [];
for (const id of userIds) {
  users.push(await prisma.user.findUnique({ where: { id } }));
}

// ✅ 批量查询
const users = await prisma.user.findMany({
  where: { id: { in: userIds } }
});
```

#### 陷阱 2: 忘记处理 null

```typescript
const user = await prisma.user.findUnique({ where: { id: 1 } });
console.log(user.name);  // ❌ 如果 user 是 null,运行时崩溃

// ✅ 处理 null
const user = await prisma.user.findUnique({ where: { id: 1 } });
if (user) {
  console.log(user.name);
}

// ✅ 或使用 findUniqueOrThrow
const user = await prisma.user.findUniqueOrThrow({ where: { id: 1 } });
```

#### 陷阱 3: 过度使用 include

```typescript
// ❌ 返回大量冗余数据
const users = await prisma.user.findMany({
  include: {
    posts: {
      include: {
        comments: {
          include: {
            author: true
          }
        }
      }
    }
  }
});
// 可能返回数 MB 的数据!

// ✅ 只取需要的字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    posts: {
      select: {
        id: true,
        title: true
      },
      take: 5  // 只取最近 5 篇
    }
  }
});
```

#### 陷阱 4: 不使用事务处理关联操作

```typescript
// ❌ 可能导致数据不一致
await prisma.user.delete({ where: { id: 1 } });
await prisma.post.deleteMany({ where: { authorId: 1 } });
// 如果第二个操作失败,用户已被删除但文章还在!

// ✅ 使用事务
await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: 1 } }),
  prisma.user.delete({ where: { id: 1 } })
]);
```

#### 陷阱 5: 在客户端组件中使用 Prisma

```typescript
// ❌ 错误: Prisma 只能在服务端使用
'use client';
import { prisma } from '@/lib/prisma';

export default function UserList() {
  const users = await prisma.user.findMany();  // ❌ 编译错误!
}

// ✅ 正确: 在 Server Component 中使用
// (去掉 'use client')
export default async function UserList() {
  const users = await prisma.user.findMany();
  return <ul>{users.map(...)}</ul>;
}
```

---

## 11. 章节练习

### 练习 1: 设计博客 Schema

**任务**: 设计一个博客系统的数据模型,包含:
- 用户(User): id, email, name, role(USER/ADMIN)
- 文章(Post): id, title, content, published, createdAt
- 分类(Category): id, name
- 文章和分类是多对多关系
- 用户和文章是一对多关系

<details>
<summary>💡 答案</summary>

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id         Int        @id @default(autoincrement())
  title      String
  content    String?
  published  Boolean    @default(false)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  authorId   Int
  author     User       @relation(fields: [authorId], references: [id])
  categories Category[]
  
  @@index([authorId])
  @@index([published, createdAt])
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

enum Role {
  USER
  ADMIN
}
```

</details>

### 练习 2: 识别并修复 N+1 问题

**任务**: 以下代码有 N+1 问题,请优化:

```typescript
const categories = await prisma.category.findMany();

for (const category of categories) {
  const posts = await prisma.post.findMany({
    where: { 
      categories: {
        some: { id: category.id }
      }
    }
  });
  console.log(`${category.name}: ${posts.length} 篇文章`);
}
```

<details>
<summary>💡 答案</summary>

```typescript
// ✅ 优化方案: 使用 include + _count
const categories = await prisma.category.findMany({
  include: {
    _count: {
      select: { posts: true }
    }
  }
});

for (const category of categories) {
  console.log(`${category.name}: ${category._count.posts} 篇文章`);
}

// 查询次数: 从 N+1 次降到 1 次
```

</details>

### 练习 3: 实现复杂查询

**任务**: 查询"最近 30 天内发布了至少 5 篇文章的用户,并返回他们的文章标题"。

<details>
<summary>💡 答案</summary>

```typescript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const activeUsers = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        createdAt: { gte: thirtyDaysAgo },
        published: true
      }
    }
  },
  include: {
    posts: {
      where: {
        createdAt: { gte: thirtyDaysAgo },
        published: true
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    },
    _count: {
      select: {
        posts: {
          where: {
            createdAt: { gte: thirtyDaysAgo },
            published: true
          }
        }
      }
    }
  }
});

// 筛选出至少 5 篇文章的用户
const result = activeUsers.filter(user => user._count.posts >= 5);

console.log('活跃用户:', result.map(u => ({
  name: u.name,
  postCount: u._count.posts,
  posts: u.posts.map(p => p.title)
})));
```

</details>

### 练习 4: 实现转账事务

**任务**: 实现一个转账功能,从账户 A 转 100 元到账户 B,使用事务保证原子性。

<details>
<summary>💡 答案</summary>

```typescript
async function transfer(fromId: number, toId: number, amount: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. 扣减发送者余额
    const sender = await tx.account.update({
      where: { id: fromId },
      data: {
        balance: { decrement: amount }
      }
    });
    
    // 2. 验证余额
    if (sender.balance < 0) {
      throw new Error('余额不足');
    }
    
    // 3. 增加接收者余额
    const receiver = await tx.account.update({
      where: { id: toId },
      data: {
        balance: { increment: amount }
      }
    });
    
    // 4. 记录转账
    const transaction = await tx.transaction.create({
      data: {
        fromId,
        toId,
        amount,
        type: 'TRANSFER'
      }
    });
    
    console.log('转账成功:', {
      from: sender.id,
      to: receiver.id,
      amount,
      transactionId: transaction.id
    });
    
    return transaction;
  }, {
    isolationLevel: 'Serializable'  // 最严格的隔离级别
  });
}

// 使用
try {
  await transfer(1, 2, 100);
} catch (error) {
  console.error('转账失败:', error.message);
}
```

</details>

### 练习 5: 添加全文搜索

**任务**: 为 Post 模型添加全文搜索功能(PostgreSQL)。

<details>
<summary>💡 答案</summary>

```prisma
// schema.prisma
model Post {
  id      Int    @id @default(autoincrement())
  title   String
  content String
  
  // PostgreSQL 全文搜索索引
  @@index([title, content], type: Gin, map: "post_search_idx")
}
```

```typescript
// 全文搜索查询
const searchPosts = await prisma.$queryRaw<Post[]>`
  SELECT * FROM "Post"
  WHERE to_tsvector('english', title || ' ' || content) 
    @@ to_tsquery('english', ${searchTerm})
  ORDER BY ts_rank(
    to_tsvector('english', title || ' ' || content),
    to_tsquery('english', ${searchTerm})
  ) DESC
  LIMIT 10
`;

console.log('搜索结果:', searchPosts);
```

**或使用 Prisma 的类型安全方式** (需要 PostgreSQL 扩展):

```typescript
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { content: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }
});
```

</details>

---

## 🎓 章节总结

你已经掌握了 Prisma 的核心能力:

**核心概念**:
- ✅ Schema-First 设计哲学
- ✅ 迁移即时间机器
- ✅ 端到端类型安全
- ✅ 关系建模与查询
- ✅ N+1 问题识别与解决

**实践技能**:
- ✅ 编写 Prisma Schema
- ✅ 管理数据库迁移
- ✅ CRUD 操作与关系查询
- ✅ 事务处理
- ✅ 性能优化(索引、批量查询)
- ✅ 与 Next.js 集成

**📂 完整代码示例**:

本章所有代码已提取到 `examples/` 目录，包含详细注释和使用说明：

- 📄 [`examples/schema/`](./examples/schema/) - Schema 定义示例
- 📄 [`examples/queries/`](./examples/queries/) - 查询操作示例
- 📄 [`examples/nextjs-integration/`](./examples/nextjs-integration/) - Next.js 集成示例
- 📄 [`examples/README.md`](./examples/README.md) - 完整使用说明

**下一步**:
- 📖 **下一章**: tRPC + TanStack Query——Prisma 生成的类型将流入 tRPC,构建端到端类型安全的 API 层
- 🔗 **连接点**: 你在这一章定义的 Schema 和查询逻辑,将成为下一章 tRPC Procedure 的输入输出

---

> 🌌 **最后的思考**
>
> Prisma 不是完美的。它在极端复杂的查询场景下可能不如手写 SQL 灵活,在高频查询场景下可能有 IPC 开销。但它解决了一个更本质的问题:**在 90% 的场景下,让数据库开发从痛苦变成愉悦。**
>
> 工具的价值不在于它能解决所有问题,而在于它能让常见问题变得简单,让罕见问题依然可解决。Prisma 在这个光谱上找到了一个优雅的平衡点。
>
> **记住 Rob Pike 的名言**:"数据结构主导一切。" 花时间设计好你的 Schema,剩下的代码会自然涌现。

**继续前进** → [Chapter 05: tRPC + TanStack Query](../05-trpc-tanstack-query/README.md)
