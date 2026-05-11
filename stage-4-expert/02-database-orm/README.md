# 第 2 章：数据库和 ORM

## 📋 本章概述

在微服务架构中，数据库设计和管理至关重要。本章将深入学习关系型数据库（PostgreSQL）和非关系型数据库（MongoDB）的高级特性，掌握 ORM 工具的使用，学习数据库设计模式、查询优化和性能调优技巧。

### 学习目标

完成本章后，你将能够：

- ✅ 掌握 PostgreSQL 高级特性（索引、视图、触发器、存储过程）
- ✅ 理解 MongoDB 文档数据库和聚合管道
- ✅ 熟练使用 TypeORM 和 Prisma ORM 框架
- ✅ 设计高效的数据库模式
- ✅ 进行数据库查询优化和性能调优
- ✅ 实现数据库迁移和版本控制
- ✅ 掌握数据库安全和备份策略

### 前置知识

- ✅ 熟悉基本的 SQL 语法
- ✅ 理解数据库的基本概念（表、索引、事务）
- ✅ 掌握 TypeScript 和 Node.js
- ✅ 了解异步编程

---

## 1. PostgreSQL 高级特性

### 1.1 索引优化

> **📖 The Metaphor: The Library Index**
> 数据库表就像是一本**没有页码的巨型书**。
> 如果没有索引，你想找“张三”的记录，你必须从第一页翻到最后一页（Full Table Scan）。这在数据量大时是灾难。
> **索引 (Index)** 就是书后的**索引页**。它按顺序记录了“张三 -> 第 456 页”。
> 你只需要二分查找索引（B-Tree），就能瞬间定位到数据。
> *   **代价**: 每次写新书（Insert/Update）时，你都得同时更新索引页。写操作变慢了。

> **🔧 Under the Hood: B-Tree vs LSM Tree**
>
> *   **B+ Tree (PostgreSQL/MySQL)**:
>     *   针对**读多写少**优化。
>     *   数据存储在叶子节点，支持范围查询。
>     *   原地更新 (Update-in-place)，写操作可能导致随机 I/O (页分裂)。
> *   **LSM Tree (Log-Structured Merge Tree) (Cassandra/RocksDB/LevelDB)**:
>     *   针对**写多读少**优化。
>     *   所有写入都是追加 (Append-only)，转化为顺序 I/O (极快)。
>     *   读取需要合并 MemTable 和多个 SSTables (较慢，需要 Bloom Filter 优化)。
>
> **ACID Implementation**:
> *   **WAL (Write-Ahead Logging)**: 先写日志，再写数据页。保证 Durability (Crash Recovery)。
> *   **MVCC (Multi-Version Concurrency Control)**: 读写不阻塞。每个事务看到数据的不同版本 (Snapshot)。解决 Isolation 问题。

**索引类型和使用场景：**

PostgreSQL 支持多种索引类型，每种都有其适用场景：

- **B-Tree 索引**：最常用的索引类型，适合等值查询和范围查询
- **Hash 索引**：只支持等值查询，速度快但功能有限
- **GiST 索引**：通用搜索树，支持几何数据和全文搜索
- **GIN 索引**：倒排索引，适合数组、JSONB、全文搜索
- **BRIN 索引**：块范围索引，适合大型表的顺序数据

**何时创建索引：**

```sql
-- ✅ 应该创建索引的场景
-- 1. WHERE 子句中频繁使用的列
CREATE INDEX idx_users_email ON users(email);

-- 2. JOIN 连接的列
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 3. ORDER BY 排序的列
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- 4. 唯一约束（自动创建唯一索引）
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- 5. 复合索引 - 查询多列时
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 6. 部分索引 - 只索引满足条件的行
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- 7. 表达式索引 - 索引计算结果
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
```

**索引维护：**

索引需要维护成本，不是越多越好。定期分析和清理无用索引：

```sql
-- 查找未使用的索引
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 AND indexrelname NOT LIKE 'pg_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 删除无用索引
DROP INDEX IF EXISTS idx_unused_index;

-- 重建索引（减少碎片）
REINDEX INDEX idx_users_email;
```

### 1.2 查询优化

**使用 EXPLAIN 分析查询：**

```sql
-- 查看查询执行计划
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- 查看实际执行情况（包含实际时间）
EXPLAIN ANALYZE 
SELECT u.*, o.total 
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
ORDER BY o.created_at DESC
LIMIT 10;
```

**常见优化技巧：**

1. **避免 SELECT ***：只查询需要的列
2. **使用 JOIN 替代子查询**：JOIN 通常性能更好
3. **合理使用索引**：确保 WHERE、JOIN、ORDER BY 的列有索引
4. **分页优化**：使用游标或 OFFSET 优化
5. **避免在 WHERE 中使用函数**：会导致索引失效

### 1.3 视图和物化视图

**普通视图**：虚拟表，不存储数据

```sql
-- 创建视图 - 封装复杂查询
CREATE VIEW user_order_summary AS
SELECT 
  u.id,
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- 使用视图
SELECT * FROM user_order_summary WHERE total_spent > 1000;
```

**物化视图**：存储查询结果，提升性能

```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW product_stats AS
SELECT 
  p.id,
  p.name,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name;

-- 创建索引加速查询
CREATE INDEX idx_product_stats_times_ordered 
ON product_stats(times_ordered DESC);

-- 刷新物化视图
REFRESH MATERIALIZED VIEW product_stats;

-- 并发刷新（不阻塞查询）
REFRESH MATERIALIZED VIEW CONCURRENTLY product_stats;
```

### 1.4 事务和并发控制

> **🤝 The Metaphor: The All-or-Nothing Bet**
> 数据库事务 (Transaction) 就像是一场**豪赌**。
> 你把所有的筹码（操作）都押在桌上。
> *   **Commit**: 赢了，所有筹码翻倍（所有操作生效）。
> *   **Rollback**: 输了，所有筹码收回（所有操作撤销），就像你从未下注一样。
> 
> 这种机制保证了数据的**原子性**。在金融系统中，这不仅仅是技术，更是法律。你不能只扣了 A 的钱，却没给 B 加钱。

PostgreSQL 支持 ACID 事务和多种隔离级别：

- **READ UNCOMMITTED**：读未提交（PostgreSQL 实际使用 READ COMMITTED）
- **READ COMMITTED**：读已提交（默认）
- **REPEATABLE READ**：可重复读
- **SERIALIZABLE**：串行化

**事务示例：**

```sql
BEGIN;

-- 更新库存
UPDATE inventory SET quantity = quantity - 5 WHERE product_id = 123;

-- 创建订单
INSERT INTO orders (user_id, total) VALUES (456, 99.99);

-- 提交事务
COMMIT;

-- 如果出错，回滚
ROLLBACK;
```

---

## 2. MongoDB 文档数据库

### 2.1 文档模型设计

MongoDB 使用灵活的文档模型，不同于关系型数据库的表结构。

**嵌入式文档 vs 引用：**

```javascript
// ✅ 嵌入式 - 一对少量的关系
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "addresses": [
    { "type": "home", "street": "123 Main St", "city": "NYC" },
    { "type": "work", "street": "456 Office Ave", "city": "NYC" }
  ]
}

// ✅ 引用 - 一对多或多对多关系
// 用户文档
{
  "_id": ObjectId("user123"),
  "name": "John Doe",
  "email": "john@example.com"
}

// 订单文档（引用用户）
{
  "_id": ObjectId("order456"),
  "userId": ObjectId("user123"),
  "items": [...],
  "total": 99.99
}
```

**设计原则：**

1. **数据访问模式优先**：根据查询需求设计结构
2. **嵌入一起查询的数据**：减少 JOIN 操作
3. **引用独立更新的数据**：避免数据冗余
4. **考虑文档大小限制**：单个文档最大 16MB

### 2.2 聚合管道

聚合管道是 MongoDB 强大的数据处理工具：

```javascript
// 订单统计示例
db.orders.aggregate([
  // 阶段 1: 筛选条件
  { $match: { status: "completed", createdAt: { $gte: new Date("2024-01-01") } } },
  
  // 阶段 2: 展开数组
  { $unwind: "$items" },
  
  // 阶段 3: 关联产品信息
  { $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "productInfo"
  }},
  
  // 阶段 4: 分组聚合
  { $group: {
      _id: "$items.productId",
      totalQuantity: { $sum: "$items.quantity" },
      totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      orderCount: { $sum: 1 }
  }},
  
  // 阶段 5: 排序
  { $sort: { totalRevenue: -1 } },
  
  // 阶段 6: 限制结果
  { $limit: 10 }
]);
```

---

## 3. ORM 框架

### 3.1 TypeORM

> **🗣️ The Metaphor: The Translator (ORM)**
> 数据库讲的是 **SQL**（关系代数），而你的代码讲的是 **TypeScript**（对象图）。这两种语言不仅语法不同，思维方式也不同（Impedance Mismatch）。
> ORM (Object-Relational Mapping) 就是**翻译官**。
> *   它让你用操作对象的方式（`user.save()`）来操作数据库。
> *   **好处**: 开发快，代码可读性高，类型安全。
> *   **坏处**: 翻译官有时会“自作聪明”（N+1 问题），或者翻译出效率低下的句子（生成的 SQL 性能差）。对于复杂的查询，直接说 SQL 往往更好。

TypeORM 是一个功能强大的 ORM，支持 TypeScript 装饰器和 Active Record/Data Mapper 模式。

**实体定义示例：**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
         UpdateDateColumn, Index, OneToMany } from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })  // 默认不查询密码
  password: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**关键特性：**

- **装饰器驱动**：使用 TypeScript 装饰器定义模型
- **类型安全**：完整的 TypeScript 支持
- **关系映射**：一对一、一对多、多对多
- **查询构建器**：类型安全的查询 API
- **迁移系统**：自动生成和管理迁移

### 3.2 Prisma

Prisma 是新一代 ORM，通过 Schema 定义模型，自动生成类型安全的客户端。

**Schema 定义：**

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@map("users")
}

model Order {
  id        String      @id @default(uuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]
  total     Decimal     @db.Decimal(10, 2)
  status    OrderStatus @default(PENDING)
  createdAt DateTime    @default(now())

  @@index([userId])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
```

**Prisma 优势：**

- **类型安全**：自动生成的客户端保证类型安全
- **直观的 API**：简洁易用的查询 API
- **自动迁移**：从 Schema 自动生成迁移
- **优秀的开发体验**：自动补全、实时错误提示
- **性能优化**：自动批处理和连接池

---

## 4. 数据库设计模式

### 4.1 范式化设计

数据库范式是设计关系数据库的规则：

**第一范式（1NF）**：列不可再分
**第二范式（2NF）**：消除部分依赖
**第三范式（3NF）**：消除传递依赖

**示例：**

```sql
-- ❌ 违反 1NF - 地址字段包含多个值
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  addresses TEXT  -- "123 Main St, NYC; 456 Office Ave, LA"
);

-- ✅ 符合 1NF - 拆分为独立表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20),
  street VARCHAR(200),
  city VARCHAR(100)
);
```

### 4.2 反范式化

为了性能，有时需要适当反范式化：

- **冗余存储常用数据**：减少 JOIN
- **预计算聚合值**：避免实时计算
- **缓存表**：存储复杂查询结果

**何时反范式化：**

- 读操作远多于写操作
- JOIN 导致性能问题
- 需要快速响应的查询

---

## 5. 数据库迁移

### 5.1 迁移最佳实践

数据库迁移是版本控制数据库结构变更的方法。

**原则：**

1. **迁移是单向的**：只能向前，不能回退
2. **迁移是原子的**：要么全部成功，要么全部失败
3. **迁移是可重复的**：多次运行结果一致
4. **迁移有顺序**：按时间顺序执行

**TypeORM 迁移示例：**

```typescript
// 生成迁移
// npm run typeorm migration:generate -- -n AddUserRole

import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserRole1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("users", new TableColumn({
      name: "role",
      type: "varchar",
      length: "50",
      default: "'user'"
    }));
    
    await queryRunner.query(
      `CREATE INDEX "idx_users_role" ON "users" ("role")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_users_role"`);
    await queryRunner.dropColumn("users", "role");
  }
}
```

---

## 6. 性能优化

### 6.1 查询优化检查清单

- [ ] **使用索引**：WHERE、JOIN、ORDER BY 的列都有索引
- [ ] **避免 SELECT ***：只查询需要的列
- [ ] **限制结果集**：使用 LIMIT
- [ ] **批量操作**：使用批量插入/更新
- [ ] **连接池**：复用数据库连接
- [ ] **缓存查询结果**：使用 Redis 缓存
- [ ] **读写分离**：主库写，从库读
- [ ] **分区表**：大表按时间或范围分区

### 6.2 N+1 查询问题

> **🛍️ The Metaphor: The Shopping Trip**
> N+1 查询问题就像是**去超市买东西**。
> *   **N+1 模式**: 你先去超市买了一瓶水（1次查询）。回家后，发现忘了买面包，又去了一趟（第1次N）。回家后，发现忘了买蛋，又去了一趟（第2次N）...
> *   **Eager Loading (预加载)**: 你列了一张清单。去一次超市，把水、面包、蛋**一次性**全买齐了（1次查询）。
> 
> 数据库的往返（Round Trip）是很昂贵的。尽量**批量**处理，不要频繁往返。

> **🏛️ ORM Patterns: Unit of Work & Identity Map**
>
> *   **Identity Map**: 确保在一个事务/Session 中，同一个数据库 ID 对应内存中的同一个对象实例。避免重复查询，保证对象一致性。
> *   **Unit of Work**: 跟踪所有对象的变更 (New/Dirty/Removed)。在事务提交时，计算变更集 (Change Set)，一次性批量写入数据库。
> *   **Active Record (TypeORM)**: 对象包含数据 + 行为 (`user.save()`)。适合简单业务。
> *   **Data Mapper (TypeORM/Hibernate)**: 对象只是数据，Mapper 负责持久化 (`repository.save(user)`)。适合复杂领域模型。

N+1 查询是 ORM 中常见的性能问题：

```typescript
// ❌ N+1 查询 - 执行 1 + N 次查询
const users = await userRepository.find();  // 1 次查询
for (const user of users) {
  const orders = await orderRepository.find({ where: { userId: user.id } });  // N 次查询
}

// ✅ 预加载 - 只执行 1 次查询
const users = await userRepository.find({
  relations: ['orders']  // 使用 JOIN 一次性加载
});
```

---

## 7. 数据库安全

### 7.1 安全最佳实践

1. **最小权限原则**：应用只需要必要的权限
2. **参数化查询**：防止 SQL 注入
3. **加密敏感数据**：密码、信用卡号等
4. **定期备份**：自动化备份和恢复测试
5. **审计日志**：记录敏感操作
6. **网络隔离**：数据库不直接暴露到公网

**SQL 注入防护：**

```typescript
// ❌ 拼接 SQL - 易受 SQL 注入攻击
const email = req.query.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
// 如果 email = "' OR '1'='1"，会返回所有用户！

// ✅ 使用参数化查询
const user = await userRepository.findOne({
  where: { email: email }
});

// ✅ 使用 ORM 查询构建器
const user = await userRepository
  .createQueryBuilder('user')
  .where('user.email = :email', { email })
  .getOne();
```

---

## 8. 实战练习

### 练习 1：数据库设计

设计一个博客系统的数据库模式，包含：
- 用户（作者）
- 文章
- 评论
- 标签
- 点赞

要求：
1. 绘制 ER 图
2. 创建表结构（SQL）
3. 添加必要的索引
4. 考虑查询性能优化

### 练习 2：查询优化

给定一个慢查询，分析并优化：

```sql
SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC;
```

要求：
1. 使用 EXPLAIN ANALYZE 分析
2. 添加必要的索引
3. 考虑使用物化视图

### 练习 3：ORM 实现

使用 Prisma 或 TypeORM 实现：
1. 用户和订单的一对多关系
2. 商品和分类的多对多关系
3. 软删除功能
4. 分页查询
5. 事务处理

---

## 9. 延伸阅读

### 推荐书籍
- 《数据库设计与关系理论》
- 《高性能 MySQL》
- 《PostgreSQL 实战》
- 《MongoDB 权威指南》

### 在线资源
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [MongoDB University](https://university.mongodb.com/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [TypeORM 文档](https://typeorm.io/)

### 工具推荐
- **数据库客户端**：DBeaver, pgAdmin, MongoDB Compass
- **性能分析**：pg_stat_statements, EXPLAIN ANALYZE
- **迁移工具**：Flyway, Liquibase
- **监控工具**：Prometheus + Grafana

---

**下一章：**[第 3 章 - 安全](../03-security/)
