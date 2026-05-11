/**
 * N+1 问题完整分析和解决方案
 * 
 * 展示：问题识别、性能对比、5 种解决方案
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'], // 打印 SQL 查询，帮助识别 N+1 问题
});

// ==========================================
// ❌ 问题示例：N+1 查询
// ==========================================

async function nPlusOneProblem() {
  console.log('\n━━━ ❌ N+1 问题示例 ━━━\n');

  const startTime = Date.now();
  let queryCount = 0;

  // 1. 查询所有用户（1 次查询）
  const users = await prisma.user.findMany();
  queryCount++;
  console.log(`查询 1: 获取所有用户 (${users.length} 个)`);

  // 2. 为每个用户查询帖子（N 次查询）
  for (const user of users) {
    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
    });
    queryCount++;
    console.log(`查询 ${queryCount}: 获取用户 ${user.name} 的帖子 (${posts.length} 篇)`);
  }

  const endTime = Date.now();

  console.log('\n📊 性能统计:');
  console.log(`  - 总查询次数: ${queryCount} (1 + ${users.length})`);
  console.log(`  - 总耗时: ${endTime - startTime}ms`);
  console.log(`  - 平均每次查询: ${Math.round((endTime - startTime) / queryCount)}ms`);
  console.log('\n⚠️ 问题：如果有 1000 个用户，就会执行 1001 次查询！');

  return { users, queryCount, duration: endTime - startTime };
}

// ==========================================
// ✅ 解决方案 1: 使用 include
// ==========================================

async function solutionInclude() {
  console.log('\n━━━ ✅ 解决方案 1: 使用 include ━━━\n');

  const startTime = Date.now();

  // 一次查询获取所有数据
  const users = await prisma.user.findMany({
    include: {
      posts: true, // Prisma 会自动使用 JOIN 或 IN 查询
    },
  });

  const endTime = Date.now();

  console.log('✅ 使用 include 一次性获取所有数据');
  console.log(`  - 用户数: ${users.length}`);
  console.log(`  - 查询次数: 1 次（Prisma 内部可能使用 2 次查询，但仍比 N+1 好）`);
  console.log(`  - 总耗时: ${endTime - startTime}ms`);

  // 打印结果
  users.forEach(user => {
    console.log(`  - ${user.name}: ${user.posts.length} 篇帖子`);
  });

  return { users, duration: endTime - startTime };
}

// ==========================================
// ✅ 解决方案 2: 使用 select（减少数据传输）
// ==========================================

async function solutionSelect() {
  console.log('\n━━━ ✅ 解决方案 2: 使用 select ━━━\n');

  const startTime = Date.now();

  // 只选择需要的字段
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      posts: {
        select: {
          id: true,
          title: true,
          published: true,
          // 不包括 content, viewCount 等大字段
        },
      },
    },
  });

  const endTime = Date.now();

  console.log('✅ 使用 select 精确控制返回字段');
  console.log(`  - 用户数: ${users.length}`);
  console.log(`  - 查询次数: 1 次`);
  console.log(`  - 总耗时: ${endTime - startTime}ms`);
  console.log(`  - 数据量: 减少（不包括 content 等大字段）`);

  return { users, duration: endTime - startTime };
}

// ==========================================
// ✅ 解决方案 3: 手动批量查询
// ==========================================

async function solutionManualBatch() {
  console.log('\n━━━ ✅ 解决方案 3: 手动批量查询 ━━━\n');

  const startTime = Date.now();

  // 1. 查询所有用户
  const users = await prisma.user.findMany();
  
  // 2. 提取所有用户 ID
  const userIds = users.map(user => user.id);
  
  // 3. 批量查询所有帖子
  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        in: userIds, // WHERE authorId IN (1, 2, 3, ...)
      },
    },
  });

  // 4. 手动组装数据
  const usersWithPosts = users.map(user => ({
    ...user,
    posts: posts.filter(post => post.authorId === user.id),
  }));

  const endTime = Date.now();

  console.log('✅ 手动批量查询（2 次查询）');
  console.log(`  - 用户数: ${users.length}`);
  console.log(`  - 查询次数: 2 次（1 次用户 + 1 次帖子）`);
  console.log(`  - 总耗时: ${endTime - startTime}ms`);

  return { users: usersWithPosts, duration: endTime - startTime };
}

// ==========================================
// ✅ 解决方案 4: 使用 _count（只需要数量时）
// ==========================================

async function solutionCount() {
  console.log('\n━━━ ✅ 解决方案 4: 使用 _count ━━━\n');

  const startTime = Date.now();

  // 如果只需要数量，不需要完整数据
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });

  const endTime = Date.now();

  console.log('✅ 使用 _count 只获取计数');
  console.log(`  - 用户数: ${users.length}`);
  console.log(`  - 查询次数: 1 次`);
  console.log(`  - 总耗时: ${endTime - startTime}ms`);
  console.log(`  - 数据量: 最小（不传输完整 posts 数组）`);

  // 打印结果
  users.forEach(user => {
    console.log(`  - ${user.name}: ${user._count.posts} 篇帖子, ${user._count.comments} 条评论`);
  });

  return { users, duration: endTime - startTime };
}

// ==========================================
// ✅ 解决方案 5: 关系过滤 + 限制数量
// ==========================================

async function solutionFilterAndLimit() {
  console.log('\n━━━ ✅ 解决方案 5: 关系过滤 + 限制数量 ━━━\n');

  const startTime = Date.now();

  // 只获取每个用户的最新 5 篇已发布帖子
  const users = await prisma.user.findMany({
    include: {
      posts: {
        where: {
          published: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5, // 每个用户最多 5 篇
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      },
    },
  });

  const endTime = Date.now();

  console.log('✅ 关系过滤 + 限制数量');
  console.log(`  - 用户数: ${users.length}`);
  console.log(`  - 查询次数: 1 次`);
  console.log(`  - 总耗时: ${endTime - startTime}ms`);
  console.log(`  - 数据量: 优化（每个用户最多 5 篇帖子）`);

  return { users, duration: endTime - startTime };
}

// ==========================================
// 性能对比
// ==========================================

async function performanceComparison() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   N+1 问题性能对比                    ║');
  console.log('╚════════════════════════════════════════╝');

  // 运行所有方案
  const problemResult = await nPlusOneProblem();
  const includeResult = await solutionInclude();
  const selectResult = await solutionSelect();
  const batchResult = await solutionManualBatch();
  const countResult = await solutionCount();
  const filterResult = await solutionFilterAndLimit();

  // 性能对比
  console.log('\n━━━ 📊 性能对比总结 ━━━\n');
  console.log('| 方案 | 查询次数 | 耗时 | 提升比例 |');
  console.log('|------|---------|------|---------|');
  console.log(`| ❌ N+1 问题 | ${problemResult.queryCount} | ${problemResult.duration}ms | 基准线 (0%) |`);
  console.log(`| ✅ include | 1-2 | ${includeResult.duration}ms | ${Math.round((1 - includeResult.duration / problemResult.duration) * 100)}% |`);
  console.log(`| ✅ select | 1-2 | ${selectResult.duration}ms | ${Math.round((1 - selectResult.duration / problemResult.duration) * 100)}% |`);
  console.log(`| ✅ 手动批量 | 2 | ${batchResult.duration}ms | ${Math.round((1 - batchResult.duration / problemResult.duration) * 100)}% |`);
  console.log(`| ✅ _count | 1 | ${countResult.duration}ms | ${Math.round((1 - countResult.duration / problemResult.duration) * 100)}% |`);
  console.log(`| ✅ 过滤限制 | 1-2 | ${filterResult.duration}ms | ${Math.round((1 - filterResult.duration / problemResult.duration) * 100)}% |`);

  console.log('\n━━━ 🎯 选择建议 ━━━\n');
  console.log('1. 需要完整数据 → 使用 **include**');
  console.log('2. 数据量大、只需部分字段 → 使用 **select**');
  console.log('3. 需要精细控制 → 使用 **手动批量查询**');
  console.log('4. 只需要数量 → 使用 **_count**');
  console.log('5. 需要过滤和分页 → 使用 **关系过滤 + 限制**');
}

// ==========================================
// 如何识别 N+1 问题
// ==========================================

async function howToDetectNPlusOne() {
  console.log('\n━━━ 🔍 如何识别 N+1 问题 ━━━\n');

  console.log('1. 启用查询日志');
  console.log('   在 PrismaClient 中启用 log: ["query"]');
  console.log('   观察是否有大量重复的查询\n');

  console.log('2. 使用 Prisma Studio');
  console.log('   运行 `npx prisma studio`');
  console.log('   在 Network 标签中查看查询数量\n');

  console.log('3. 使用 APM 工具');
  console.log('   - Sentry: 检测慢查询');
  console.log('   - DataDog: 数据库查询性能监控');
  console.log('   - New Relic: 事务追踪\n');

  console.log('4. 手动检查代码');
  console.log('   ❌ 在循环中调用 findMany/findUnique');
  console.log('   ❌ 在循环中调用 await prisma.*');
  console.log('   ✅ 使用 include/select');
  console.log('   ✅ 使用 WHERE ... IN (...) 批量查询\n');

  console.log('5. 常见模式');
  console.log('   ❌ for (const user of users) { await prisma.post.findMany(...) }');
  console.log('   ❌ users.map(async user => await prisma.post.findMany(...))');
  console.log('   ✅ await prisma.user.findMany({ include: { posts: true } })');
}

// ==========================================
// 运行所有示例
// ==========================================

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   N+1 问题完整分析                    ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    await howToDetectNPlusOne();
    await performanceComparison();

    console.log('\n✅ 所有示例执行完成！\n');
  } catch (error) {
    console.error('❌ 执行出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export {
  nPlusOneProblem,
  solutionInclude,
  solutionSelect,
  solutionManualBatch,
  solutionCount,
  solutionFilterAndLimit,
  performanceComparison,
  howToDetectNPlusOne,
};
