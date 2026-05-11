-- 示例迁移脚本
-- 这是 Prisma Migrate 自动生成的 SQL 脚本示例
-- 展示了如何从一个基础 Schema 演变到添加新字段

-- ============================================================
-- 迁移 1: 初始化（init）
-- 创建基础的用户表
-- ============================================================
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    PRIMARY KEY ("id")
);

-- ============================================================
-- 迁移 2: 添加 email 字段（add_user_email）
-- ============================================================
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- ============================================================
-- 迁移 3: 添加时间戳字段（add_timestamps）
-- ============================================================
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================
-- 迁移 4: 添加角色枚举（add_user_role）
-- ============================================================
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';

-- ============================================================
-- 迁移 5: 创建 Post 表（add_post_model）
-- ============================================================
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,
    PRIMARY KEY ("id")
);

-- 添加外键约束
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" 
  FOREIGN KEY ("authorId") REFERENCES "User"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 添加索引优化查询性能
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX "Post_published_createdAt_idx" ON "Post"("published", "createdAt");

-- ============================================================
-- 迁移 6: 重命名字段示例（rename_name_to_fullname）
-- 注意：这需要手动编辑迁移脚本来保留数据
-- ============================================================
-- ❌ Prisma 默认生成的（会丢数据）:
-- ALTER TABLE "User" DROP COLUMN "name";
-- ALTER TABLE "User" ADD COLUMN "fullName" TEXT NOT NULL;

-- ✅ 手动修改为（保留数据）:
ALTER TABLE "User" RENAME COLUMN "name" TO "fullName";

-- ============================================================
-- 注意事项
-- ============================================================
-- 1. 迁移文件一旦提交到 Git，不要修改
-- 2. 生产环境使用 `prisma migrate deploy`
-- 3. 破坏性变更（如重命名、删除列）需要手动编辑 SQL
-- 4. 每个迁移都应该是幂等的（多次执行结果相同）
