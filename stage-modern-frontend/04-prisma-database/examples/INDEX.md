# Prisma 示例代码索引

## 📋 快速导航

本索引帮助你快速找到特定主题的示例代码。

---

## 🗂️ 按主题分类

### 1. Schema 定义

| 文件 | 主题 | 难度 | 代码行数 |
|------|------|------|---------|
| [`schema/basic.prisma`](./schema/basic.prisma) | Generator、Datasource、基础 Model | ⭐ | 30 |
| [`schema/relations.prisma`](./schema/relations.prisma) | 一对一、一对多、多对多关系 | ⭐⭐ | 80 |
| [`schema/full-schema.prisma`](./schema/full-schema.prisma) | 完整博客系统 Schema | ⭐⭐⭐ | 75 |

### 2. 迁移管理

| 文件 | 主题 | 难度 | 代码行数 |
|------|------|------|---------|
| [`migrations/example-migration.sql`](./migrations/example-migration.sql) | 迁移脚本示例、Schema 演化 | ⭐⭐ | 80 |

### 3. 查询操作

| 文件 | 主题 | 难度 | 代码行数 |
|------|------|------|---------|
| [`queries/basic-crud.ts`](./queries/basic-crud.ts) | Create、Read、Update、Delete | ⭐ | 250 |
| [`queries/relations.ts`](./queries/relations.ts) | include、select、关系过滤 | ⭐⭐ | 230 |
| [`queries/transactions.ts`](./queries/transactions.ts) | 事务处理、ACID、隔离级别 | ⭐⭐⭐ | 240 |
| [`queries/n-plus-one-solution.ts`](./queries/n-plus-one-solution.ts) | N+1 问题识别与 5 种解决方案 | ⭐⭐⭐ | 280 |

### 4. Next.js 集成

| 文件 | 主题 | 难度 | 代码行数 |
|------|------|------|---------|
| [`nextjs-integration/lib/prisma.ts`](./nextjs-integration/lib/prisma.ts) | Prisma Client 全局单例 | ⭐⭐ | 70 |
| [`nextjs-integration/app/users/page.tsx`](./nextjs-integration/app/users/page.tsx) | Server Component 中使用 Prisma | ⭐⭐ | 70 |

---

## 🎯 按学习路径分类

### 新手入门（0-2 天）

1. **理解 Schema 语法**
   - 阅读 [`schema/basic.prisma`](./schema/basic.prisma)
   - 理解 Generator、Datasource、Model 的作用

2. **掌握基础查询**
   - 运行 [`queries/basic-crud.ts`](./queries/basic-crud.ts)
   - 掌握 Create、Read、Update、Delete 操作

3. **学习关系建模**
   - 阅读 [`schema/relations.prisma`](./schema/relations.prisma)
   - 理解一对一、一对多、多对多的区别

### 进阶学习（3-4 天）

4. **掌握关系查询**
   - 运行 [`queries/relations.ts`](./queries/relations.ts)
   - 掌握 include、select、关系过滤

5. **理解事务处理**
   - 运行 [`queries/transactions.ts`](./queries/transactions.ts)
   - 理解 ACID 属性和隔离级别

6. **识别性能问题**
   - 运行 [`queries/n-plus-one-solution.ts`](./queries/n-plus-one-solution.ts)
   - 学会识别和解决 N+1 查询问题

### 实战应用（5-7 天）

7. **Next.js 集成**
   - 复制 [`nextjs-integration/lib/prisma.ts`](./nextjs-integration/lib/prisma.ts)
   - 在 Server Component 中使用 Prisma

8. **构建完整项目**
   - 使用 [`schema/full-schema.prisma`](./schema/full-schema.prisma) 作为模板
   - 结合所有查询示例构建博客系统

---

## 🔍 按功能查找

### 创建数据

- **创建单个记录**: [`queries/basic-crud.ts`](./queries/basic-crud.ts#L62-L67)
- **创建并关联**: [`queries/basic-crud.ts`](./queries/basic-crud.ts#L70-L82)
- **嵌套创建**: [`queries/basic-crud.ts`](./queries/basic-crud.ts#L84-L102)
- **批量创建**: [`queries/basic-crud.ts`](./queries/basic-crud.ts#L104-L113)

### 查询数据

- **条件查询**: [`queries/basic-crud.ts`](./queries/basic-crud.ts#L125-L130)
- **复杂条件**: [`queries/basic-crud.ts`](./queries/basic-crud.ts#L132-L145)
- **分页查询**: [`queries/basic-crud.ts`](./queries/basic-crud.ts#L166-L173)
- **字段选择**: [`queries/basic-crud.ts`](./queries/basic-crud.ts#L176-L183)

### 关系查询

- **Include 关联数据**: [`queries/relations.ts`](./queries/relations.ts#L15-L25)
- **Select 精确字段**: [`queries/relations.ts`](./queries/relations.ts#L47-L61)
- **关系过滤**: [`queries/relations.ts`](./queries/relations.ts#L68-L76)
- **关系聚合**: [`queries/relations.ts`](./queries/relations.ts#L133-L142)

### 事务处理

- **顺序事务**: [`queries/transactions.ts`](./queries/transactions.ts#L16-L22)
- **交互式事务**: [`queries/transactions.ts`](./queries/transactions.ts#L29-L76)
- **错误处理**: [`queries/transactions.ts`](./queries/transactions.ts#L83-L109)
- **转账示例**: [`queries/transactions.ts`](./queries/transactions.ts#L226-L260)

### 性能优化

- **N+1 问题识别**: [`queries/n-plus-one-solution.ts`](./queries/n-plus-one-solution.ts#L16-L30)
- **使用 include**: [`queries/n-plus-one-solution.ts`](./queries/n-plus-one-solution.ts#L37-L51)
- **使用 _count**: [`queries/n-plus-one-solution.ts`](./queries/n-plus-one-solution.ts#L58-L72)
- **批量查询**: [`queries/n-plus-one-solution.ts`](./queries/n-plus-one-solution.ts#L79-L105)

---

## 🚀 快速上手指南

### 1. 运行查询示例

```bash
# 设置数据库连接
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/mydb"' > .env

# 初始化 Prisma（使用 full-schema.prisma）
cp examples/schema/full-schema.prisma prisma/schema.prisma
npx prisma migrate dev --name init

# 运行示例
npx tsx examples/queries/basic-crud.ts
npx tsx examples/queries/relations.ts
npx tsx examples/queries/transactions.ts
npx tsx examples/queries/n-plus-one-solution.ts
```

### 2. Next.js 项目集成

```bash
# 复制 Prisma Client 单例
cp examples/nextjs-integration/lib/prisma.ts your-project/lib/

# 复制 Server Component 示例
cp examples/nextjs-integration/app/users/page.tsx your-project/app/users/
```

### 3. 使用 Schema 模板

```bash
# 复制完整 Schema
cp examples/schema/full-schema.prisma your-project/prisma/schema.prisma

# 运行迁移
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

---

## 💡 最佳实践检查清单

使用示例代码时，请确保：

- [ ] ✅ 使用全局单例避免连接泄漏（见 `lib/prisma.ts`）
- [ ] ✅ 使用 include/select 避免 N+1 问题（见 `n-plus-one-solution.ts`）
- [ ] ✅ 为常查询字段添加索引（见 `full-schema.prisma`）
- [ ] ✅ 使用事务保证数据一致性（见 `transactions.ts`）
- [ ] ✅ 处理 Prisma 错误（见 API Route 示例）
- [ ] ✅ 启用查询日志便于调试（见 `lib/prisma.ts`）

---

## 🤝 贡献指南

发现问题或想添加新示例？

1. **报告问题**: 如果代码有 bug 或不清楚的地方，请提 Issue
2. **添加示例**: 如果有好的示例，欢迎提 PR
3. **改进注释**: 让代码更易懂

---

## 📚 相关资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma Schema 参考](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma 最佳实践](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**最后更新**: 2024-02
**总代码量**: ~1,300 行
**覆盖主题**: Schema 定义、迁移管理、CRUD 操作、关系查询、事务处理、性能优化、Next.js 集成
