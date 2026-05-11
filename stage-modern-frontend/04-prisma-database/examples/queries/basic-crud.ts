/**
 * Prisma CRUD 操作完整示例
 * 
 * 这个文件展示了所有基础的 CRUD 操作、聚合查询、分组查询
 * 可以直接运行这个文件来测试 Prisma Client 的功能
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // 打印所有查询日志
});

// ==========================================
// CREATE - 创建操作
// ==========================================

async function createExamples() {
  console.log('\n━━━ CREATE 操作 ━━━\n');

  // 1. 创建单条记录
  const user = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      role: 'USER',
    },
  });
  console.log('✅ 创建用户:', user);

  // 2. 创建并包含关联数据（一对一）
  const userWithProfile = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
      profile: {
        create: {
          bio: 'Full Stack Developer',
          avatar: 'https://example.com/bob.jpg',
        },
      },
    },
    include: {
      profile: true, // 返回时包含 profile
    },
  });
  console.log('✅ 创建用户+资料:', userWithProfile);

  // 3. 创建并关联已有数据（一对多）
  const post = await prisma.post.create({
    data: {
      title: 'My First Post',
      content: 'This is the content of my first post.',
      published: true,
      author: {
        connect: { id: user.id }, // 关联到已有用户
      },
    },
  });
  console.log('✅ 创建帖子:', post);

  // 4. 批量创建
  const users = await prisma.user.createMany({
    data: [
      { email: 'charlie@example.com', name: 'Charlie' },
      { email: 'diana@example.com', name: 'Diana' },
      { email: 'eve@example.com', name: 'Eve' },
    ],
    skipDuplicates: true, // 跳过重复的记录（基于 unique 约束）
  });
  console.log(`✅ 批量创建 ${users.count} 个用户`);

  return { user, post };
}

// ==========================================
// READ - 查询操作
// ==========================================

async function readExamples() {
  console.log('\n━━━ READ 操作 ━━━\n');

  // 1. 查询所有记录
  const allUsers = await prisma.user.findMany();
  console.log(`✅ 查询所有用户 (共 ${allUsers.length} 个):`, allUsers);

  // 2. 条件查询
  const publishedPosts = await prisma.post.findMany({
    where: {
      published: true,
    },
  });
  console.log(`✅ 查询已发布的帖子 (共 ${publishedPosts.length} 个)`);

  // 3. 复杂条件查询
  const complexQuery = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'alice' } },
        { name: { startsWith: 'B' } },
      ],
      AND: [
        { role: 'USER' },
      ],
    },
  });
  console.log('✅ 复杂条件查询结果:', complexQuery);

  // 4. 查询单条记录（unique）
  const user = await prisma.user.findUnique({
    where: {
      email: 'alice@example.com',
    },
  });
  console.log('✅ 根据唯一字段查询用户:', user);

  // 5. 查询单条记录（非 unique）
  const firstUser = await prisma.user.findFirst({
    where: {
      role: 'USER',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  console.log('✅ 查询第一个 USER 角色的用户:', firstUser);

  // 6. 分页查询
  const page = 1;
  const limit = 10;
  const paginatedUsers = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
  console.log(`✅ 分页查询 (第 ${page} 页，每页 ${limit} 条):`, paginatedUsers);

  // 7. 查询指定字段（select）
  const userEmails = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      // 不包括 role, createdAt 等其他字段
    },
  });
  console.log('✅ 只查询指定字段:', userEmails);

  // 8. 查询不存在则抛错
  try {
    const userOrThrow = await prisma.user.findUniqueOrThrow({
      where: { email: 'nonexistent@example.com' },
    });
  } catch (error) {
    console.log('❌ findUniqueOrThrow: 用户不存在，抛出错误');
  }

  return { user, publishedPosts };
}

// ==========================================
// UPDATE - 更新操作
// ==========================================

async function updateExamples() {
  console.log('\n━━━ UPDATE 操作 ━━━\n');

  // 1. 更新单条记录
  const updatedUser = await prisma.user.update({
    where: {
      email: 'alice@example.com',
    },
    data: {
      name: 'Alice (Updated)',
    },
  });
  console.log('✅ 更新用户:', updatedUser);

  // 2. 更新数字字段（增量操作）
  const updatedPost = await prisma.post.updateMany({
    where: {
      published: true,
    },
    data: {
      viewCount: { increment: 10 }, // 阅读数 +10
    },
  });
  console.log(`✅ 批量增加阅读数 (影响 ${updatedPost.count} 条记录)`);

  // 3. Upsert（存在则更新，不存在则创建）
  const upsertedUser = await prisma.user.upsert({
    where: {
      email: 'frank@example.com',
    },
    update: {
      name: 'Frank (Updated)',
    },
    create: {
      email: 'frank@example.com',
      name: 'Frank',
    },
  });
  console.log('✅ Upsert 用户:', upsertedUser);

  // 4. 更新关联数据
  const userWithNewPost = await prisma.user.update({
    where: { email: 'alice@example.com' },
    data: {
      posts: {
        create: {
          title: 'Second Post',
          content: 'Content of second post',
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log('✅ 更新用户并添加新帖子:', userWithNewPost);

  return { updatedUser, upsertedUser };
}

// ==========================================
// DELETE - 删除操作
// ==========================================

async function deleteExamples() {
  console.log('\n━━━ DELETE 操作 ━━━\n');

  // 1. 删除单条记录
  try {
    const deletedUser = await prisma.user.delete({
      where: { email: 'frank@example.com' },
    });
    console.log('✅ 删除用户:', deletedUser);
  } catch (error) {
    console.log('⚠️ 用户可能不存在或有关联数据');
  }

  // 2. 批量删除
  const deletedComments = await prisma.comment.deleteMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 天前
      },
    },
  });
  console.log(`✅ 删除旧评论 (删除 ${deletedComments.count} 条)`);

  // 3. 删除所有记录（危险！）
  // const allDeleted = await prisma.user.deleteMany({});
  // console.log(`⚠️ 删除所有用户 (删除 ${allDeleted.count} 条)`);

  return deletedComments;
}

// ==========================================
// AGGREGATIONS - 聚合查询
// ==========================================

async function aggregationExamples() {
  console.log('\n━━━ 聚合查询 ━━━\n');

  // 1. 计数
  const userCount = await prisma.user.count();
  console.log(`✅ 用户总数: ${userCount}`);

  // 2. 条件计数
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' },
  });
  console.log(`✅ 管理员数量: ${adminCount}`);

  // 3. 聚合统计
  const postStats = await prisma.post.aggregate({
    _avg: { viewCount: true },
    _max: { viewCount: true },
    _min: { viewCount: true },
    _sum: { viewCount: true },
    _count: { id: true },
  });
  console.log('✅ 帖子统计:', {
    平均阅读数: postStats._avg.viewCount,
    最高阅读数: postStats._max.viewCount,
    最低阅读数: postStats._min.viewCount,
    总阅读数: postStats._sum.viewCount,
    帖子数量: postStats._count.id,
  });

  // 4. 分组统计
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      _all: true,
    },
    having: {
      role: {
        in: ['USER', 'ADMIN'],
      },
    },
    orderBy: {
      _count: {
        _all: 'desc',
      },
    },
  });
  console.log('✅ 按角色分组统计:', usersByRole);

  // 5. 复杂分组
  const postStatsByAuthor = await prisma.post.groupBy({
    by: ['authorId', 'published'],
    _count: { id: true },
    _avg: { viewCount: true },
    _sum: { viewCount: true },
  });
  console.log('✅ 按作者和发布状态分组:', postStatsByAuthor);

  return { userCount, postStats };
}

// ==========================================
// 运行所有示例
// ==========================================

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Prisma CRUD 操作完整示例           ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    // 执行所有示例
    await createExamples();
    await readExamples();
    await updateExamples();
    await aggregationExamples();
    // await deleteExamples(); // 取消注释以测试删除操作

    console.log('\n✅ 所有示例执行完成！\n');
  } catch (error) {
    console.error('❌ 执行出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行这个文件，执行 main 函数
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export {
  createExamples,
  readExamples,
  updateExamples,
  deleteExamples,
  aggregationExamples,
};
