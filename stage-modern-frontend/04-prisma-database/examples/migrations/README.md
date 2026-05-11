# Prisma 迁移管理示例

这个目录包含 Prisma 迁移的最佳实践和常见场景。

## 📋 迁移基本流程

### 1. 初始化迁移

```bash
# 创建第一个迁移
npx prisma migrate dev --name init

# 这会:
# ✅ 根据 schema.prisma 生成 SQL 迁移脚本
# ✅ 执行迁移到数据库
# ✅ 生成 Prisma Client
# ✅ 创建 migrations/ 文件夹
```

### 2. 添加新字段

```prisma
// schema.prisma - 修改前
model User {
  id    Int    @id @default(autoincrement())
  name  String
}

// schema.prisma - 修改后
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique  // ✅ 新增字段
}
```

```bash
# 创建迁移
npx prisma migrate dev --name add_user_email

# Prisma 会检测到变化并生成:
# migrations/20240201100000_add_user_email/migration.sql
```

生成的 SQL:

```sql
-- migrations/20240201100000_add_user_email/migration.sql
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### 3. 处理已有数据

如果表中已有数据，添加 `NOT NULL` 字段会失败：

```bash
# 方案 1: 提供默认值
npx prisma migrate dev --name add_email

# Prisma 会询问: "表中已有数据，新字段是 NOT NULL，如何处理？"
# 选择: 提供默认值（如 'default@example.com'）
```

```sql
-- 生成的 SQL（带默认值）
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL DEFAULT 'default@example.com';
-- 后续可以手动更新这些默认值
```

```bash
# 方案 2: 先创建可选字段，再改为必填
```

```prisma
// 第一步: 先创建可选字段
model User {
  email String?  // 可选
}
```

```bash
npx prisma migrate dev --name add_email_optional
```

```sql
-- 迁移 1
ALTER TABLE "User" ADD COLUMN "email" TEXT;
```

然后手动填充数据后：

```prisma
// 第二步: 改为必填
model User {
  email String @unique  // 必填
}
```

```bash
npx prisma migrate dev --name make_email_required
```

```sql
-- 迁移 2
UPDATE "User" SET "email" = 'user' || "id" || '@example.com' WHERE "email" IS NULL;
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

## 🔄 常见迁移场景

### 场景 1: 重命名字段（保留数据）

**❌ 错误做法**（会丢失数据）:

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

```bash
npx prisma migrate dev --name rename_name
```

```sql
-- ❌ Prisma 默认生成的（会丢数据）
ALTER TABLE "User" DROP COLUMN "name";
ALTER TABLE "User" ADD COLUMN "fullName" TEXT NOT NULL;
```

**✅ 正确做法**（保留数据）:

```bash
# 1. 生成迁移但不执行
npx prisma migrate dev --name rename_name_to_fullname --create-only

# 2. 手动编辑生成的 migration.sql
```

```sql
-- 手动编辑: migrations/xxx_rename_name_to_fullname/migration.sql
-- ✅ 正确的 SQL（保留数据）
ALTER TABLE "User" RENAME COLUMN "name" TO "fullName";
```

```bash
# 3. 执行迁移
npx prisma migrate dev
```

### 场景 2: 修改字段类型

```prisma
// 从 String 改为 Int
model User {
  age String  // 改前
}

model User {
  age Int  // 改后
}
```

```sql
-- 生成的 SQL
ALTER TABLE "User" ALTER COLUMN "age" TYPE INTEGER USING "age"::INTEGER;
```

**注意**: 如果数据不能转换（如 "abc" → Int），迁移会失败！

### 场景 3: 添加外键关系

```prisma
// 添加前
model Post {
  id    Int    @id
  title String
}

// 添加后
model Post {
  id       Int    @id
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}

model User {
  id    Int    @id
  posts Post[]
}
```

```sql
-- 生成的 SQL
ALTER TABLE "Post" ADD COLUMN "authorId" INTEGER NOT NULL;
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" 
  FOREIGN KEY ("authorId") REFERENCES "User"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
```

### 场景 4: 添加索引

```prisma
model Post {
  id        Int      @id
  title     String
  published Boolean
  createdAt DateTime @default(now())
  
  @@index([published])              // 单字段索引
  @@index([createdAt])              // 单字段索引
  @@index([published, createdAt])   // 复合索引
}
```

```sql
-- 生成的 SQL
CREATE INDEX "Post_published_idx" ON "Post"("published");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Post_published_createdAt_idx" ON "Post"("published", "createdAt");
```

## 🚀 生产环境迁移

### 开发环境 vs 生产环境

```bash
# ❌ 开发环境：使用 migrate dev（会重置数据库）
npx prisma migrate dev --name add_feature

# ✅ 生产环境：使用 migrate deploy（只应用未执行的迁移）
npx prisma migrate deploy
```

### 生产部署流程

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      # ✅ 关键步骤：运行迁移
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### 迁移的幂等性

Prisma 通过 `_prisma_migrations` 表确保迁移的幂等性：

```sql
-- Prisma 自动创建的迁移记录表
CREATE TABLE "_prisma_migrations" (
  id                  VARCHAR(36) PRIMARY KEY,
  checksum            VARCHAR(64) NOT NULL,
  finished_at         TIMESTAMP,
  migration_name      VARCHAR(255) NOT NULL,
  logs                TEXT,
  rolled_back_at      TIMESTAMP,
  started_at          TIMESTAMP DEFAULT now(),
  applied_steps_count INTEGER DEFAULT 0
);
```

**工作原理**:
1. 运行 `migrate deploy` 时，Prisma 扫描 `migrations/` 文件夹
2. 计算每个迁移文件的 checksum
3. 查询 `_prisma_migrations` 表，检查哪些已执行
4. 只执行未记录的迁移
5. 执行成功后，记录到 `_prisma_migrations`

**好处**: 多次运行 `migrate deploy` 是安全的，不会重复执行。

## ⚠️ 破坏性变更处理

### 删除列（会丢失数据）

```prisma
// 删除 bio 字段
model Profile {
  id     Int    @id
  // bio String  // ❌ 删除这一行
  avatar String
}
```

```bash
# 1. 创建迁移（先不执行）
npx prisma migrate dev --name remove_bio --create-only

# 2. 审查生成的 SQL
cat migrations/xxx_remove_bio/migration.sql
```

```sql
-- 生成的 SQL
ALTER TABLE "Profile" DROP COLUMN "bio";
```

```bash
# 3. 确认数据不需要后，执行迁移
npx prisma migrate dev
```

**最佳实践**: 在删除列之前，先在生产环境验证这个列确实不再使用。

### 删除表（会丢失数据）

```bash
# 1. 生成迁移但不执行
npx prisma migrate dev --name remove_old_table --create-only

# 2. 手动审查 SQL
# 3. 备份数据
pg_dump -t old_table mydb > old_table_backup.sql

# 4. 执行迁移
npx prisma migrate dev
```

## 🔧 迁移工具命令

```bash
# 创建并应用迁移（开发环境）
npx prisma migrate dev --name my_migration

# 只创建迁移文件，不执行（用于手动编辑）
npx prisma migrate dev --name my_migration --create-only

# 应用迁移（生产环境）
npx prisma migrate deploy

# 重置数据库（⚠️ 会删除所有数据）
npx prisma migrate reset

# 查看迁移状态
npx prisma migrate status

# 解决迁移冲突
npx prisma migrate resolve --applied <migration_name>
npx prisma migrate resolve --rolled-back <migration_name>
```

## 📚 团队协作最佳实践

### 1. 提交迁移到 Git

```bash
# ✅ 务必提交 migrations/ 文件夹
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat: add user email field"
git push
```

### 2. 拉取代码后同步数据库

```bash
git pull

# 应用团队成员的迁移
npx prisma migrate dev
```

### 3. 解决迁移冲突

如果两个开发者同时创建迁移：

```bash
# 开发者 A 创建迁移
npx prisma migrate dev --name add_field_a

# 开发者 B 创建迁移
npx prisma migrate dev --name add_field_b

# 合并时，migrations/ 文件夹会冲突
```

**解决方案**:
1. 保留两个迁移文件
2. 重新运行 `npx prisma migrate dev`
3. Prisma 会按时间戳顺序应用两个迁移

## 🎯 总结

### ✅ 最佳实践

1. **每次 Schema 变更都创建迁移** — 不要手动修改数据库
2. **使用 `--create-only` 审查 SQL** — 重命名、删除操作需要人工确认
3. **提交迁移到 Git** — 团队协作必须同步迁移
4. **生产环境用 `migrate deploy`** — 不要用 `migrate dev`
5. **备份数据** — 执行破坏性变更前先备份

### ❌ 常见错误

1. **不要手动编辑 schema.prisma 后直接 `prisma generate`** — 必须先 `migrate dev`
2. **不要删除 migrations/ 文件夹** — 这是数据库历史记录
3. **不要在生产环境用 `migrate dev`** — 会重置数据库
4. **不要修改已提交的迁移** — 会导致 checksum 不匹配

## 📖 相关章节

- [Schema 示例](../schema/README.md) - 如何设计 Prisma Schema
- [查询示例](../queries/README.md) - 如何使用生成的 Prisma Client
- [Next.js 集成](../nextjs-integration/README.md) - 在 Next.js 中使用 Prisma
