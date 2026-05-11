/**
 * Prisma 关系查询完整示例
 * 
 * 展示：include, select, 嵌套查询、关系过滤、关系操作
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'], // 打印 SQL 查询
});

// ==========================================
// INCLUDE - 包含关联数据
// ==========================================

async function includeExamples() {
  console.log('\n━━━ INCLUDE 示例 ━━━\n');

  // 1. 包含一对一关系
  const userWithProfile = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
    include: {
      profile: true, // 包含 Profile
    },
  });
  console.log('✅ 用户 + 资料:', userWithProfile);

  // 2. 包含一对多关系
  const userWithPosts = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
    include: {
      posts: true, // 包含所有 Post
    },
  });
  console.log(`✅ 用户 + 帖子 (${userWithPosts?.posts.length} 篇):`);

  // 3. 包含多个关联
  const userWithAll = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
    include: {
      profile: true,
      posts: true,
      comments: true,
    },
  });
  console.log('✅ 用户 + 所有关联数据:', {
    name: userWithAll?.name,
    hasProfile: !!userWithAll?.profile,
    postsCount: userWithAll?.posts.length,
    commentsCount: userWithAll?.comments.length,
  });

  // 4. 嵌套 include（多层）
  const postWithAuthorAndComments = await prisma.post.findFirst({
    include: {
      author: {
        include: {
          profile: true, // 嵌套包含作者的资料
        },
      },
      comments: {
        include: {
          author: true, // 嵌套包含评论者信息
        },
      },
    },
  });
  console.log('✅ 帖子 + 作者（含资料）+ 评论（含作者）:', postWithAuthorAndComments);

  // 5. 关联查询的条件过滤
  const userWithPublishedPosts = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
    include: {
      posts: {
        where: {
          published: true, // 只包含已发布的帖子
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5, // 最多 5 篇
      },
    },
  });
  console.log('✅ 用户 + 已发布的帖子（最多 5 篇）:', userWithPublishedPosts);

  // 6. 包含计数
  const userWithCounts = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });
  console.log('✅ 用户 + 帖子/评论计数:', userWithCounts.map(u => ({
    name: u.name,
    postsCount: u._count.posts,
    commentsCount: u._count.comments,
  })));

  return { userWithProfile, postWithAuthorAndComments };
}

// ==========================================
// SELECT - 精确选择字段
// ==========================================

async function selectExamples() {
  console.log('\n━━━ SELECT 示例 ━━━\n');

  // 1. 只选择指定字段
  const userEmails = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      // 不包括 role, createdAt, updatedAt
    },
  });
  console.log('✅ 只查询用户的 ID、邮箱、名字:', userEmails);

  // 2. select + 关联数据
  const userWithPostTitles = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
    select: {
      id: true,
      name: true,
      posts: {
        select: {
          id: true,
          title: true,
          published: true,
          // 不包括 content, viewCount 等
        },
      },
    },
  });
  console.log('✅ 用户 + 帖子标题（精简）:', userWithPostTitles);

  // 3. 嵌套 select
  const postWithMinimalData = await prisma.post.findFirst({
    select: {
      id: true,
      title: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              name: true,
            },
          },
        },
        take: 3, // 最多 3 条评论
      },
    },
  });
  console.log('✅ 帖子 + 作者 + 评论（精简数据）:', postWithMinimalData);

  // 4. select + _count
  const userWithPostCount = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
    select: {
      name: true,
      email: true,
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });
  console.log('✅ 用户 + 计数（不包括完整 posts 数组）:', userWithPostCount);

  return { userWithPostTitles, postWithMinimalData };
}

// ==========================================
// 关系过滤
// ==========================================

async function relationFilterExamples() {
  console.log('\n━━━ 关系过滤示例 ━━━\n');

  // 1. 查询有特定关联的记录
  const usersWithPosts = await prisma.user.findMany({
    where: {
      posts: {
        some: {}, // 至少有一篇帖子
      },
    },
  });
  console.log(`✅ 有帖子的用户 (共 ${usersWithPosts.length} 个)`);

  // 2. 查询有满足条件的关联记录
  const usersWithPublishedPosts = await prisma.user.findMany({
    where: {
      posts: {
        some: {
          published: true,
        },
      },
    },
  });
  console.log(`✅ 有已发布帖子的用户 (共 ${usersWithPublishedPosts.length} 个)`);

  // 3. 查询所有关联都满足条件
  const usersWithAllPostsPublished = await prisma.user.findMany({
    where: {
      posts: {
        every: {
          published: true,
        },
      },
    },
  });
  console.log(`✅ 所有帖子都已发布的用户 (共 ${usersWithAllPostsPublished.length} 个)`);

  // 4. 查询没有关联的记录
  const usersWithoutPosts = await prisma.user.findMany({
    where: {
      posts: {
        none: {},
      },
    },
  });
  console.log(`✅ 没有帖子的用户 (共 ${usersWithoutPosts.length} 个)`);

  // 5. 复杂关系过滤
  const activeUsers = await prisma.user.findMany({
    where: {
      AND: [
        {
          posts: {
            some: {
              published: true,
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 最近 30 天
              },
            },
          },
        },
        {
          comments: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近 7 天
              },
            },
          },
        },
      ],
    },
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });
  console.log('✅ 活跃用户（最近 30 天有发帖，最近 7 天有评论）:', activeUsers);

  return { usersWithPosts, activeUsers };
}

// ==========================================
// 关系操作（创建、连接、断开）
// ==========================================

async function relationOperationsExamples() {
  console.log('\n━━━ 关系操作示例 ━━━\n');

  // 1. 创建时同时创建关联数据（nested create）
  const newUserWithData = await prisma.user.create({
    data: {
      email: 'george@example.com',
      name: 'George',
      profile: {
        create: {
          bio: 'React Developer',
          avatar: 'https://example.com/george.jpg',
        },
      },
      posts: {
        create: [
          { title: 'First Post', content: 'Content 1', published: true },
          { title: 'Second Post', content: 'Content 2', published: false },
        ],
      },
    },
    include: {
      profile: true,
      posts: true,
    },
  });
  console.log('✅ 创建用户 + 资料 + 帖子:', newUserWithData);

  // 2. 连接到已有记录
  const existingPost = await prisma.post.findFirst();
  if (existingPost) {
    const userConnectedToPost = await prisma.user.update({
      where: { email: 'george@example.com' },
      data: {
        posts: {
          connect: { id: existingPost.id }, // 连接到已有帖子（改变作者）
        },
      },
      include: {
        posts: true,
      },
    });
    console.log('✅ 将已有帖子连接到用户（改变作者）:', userConnectedToPost);
  }

  // 3. 断开关联
  const userDisconnectPost = await prisma.user.update({
    where: { email: 'george@example.com' },
    data: {
      profile: {
        disconnect: true, // 断开 profile 关联（一对一）
      },
    },
    include: {
      profile: true,
    },
  });
  console.log('✅ 断开用户的 profile 关联:', userDisconnectPost);

  // 4. 删除关联数据
  const userDeletePosts = await prisma.user.update({
    where: { email: 'george@example.com' },
    data: {
      posts: {
        deleteMany: {
          published: false, // 删除所有未发布的帖子
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log('✅ 删除用户的未发布帖子:', userDeletePosts);

  // 5. 更新关联数据
  const userUpdatePosts = await prisma.user.update({
    where: { email: 'george@example.com' },
    data: {
      posts: {
        updateMany: {
          where: { published: false },
          data: { published: true }, // 发布所有未发布的帖子
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log('✅ 更新用户的帖子（发布所有未发布的）:', userUpdatePosts);

  return { newUserWithData };
}

// ==========================================
// 多对多关系操作
// ==========================================

async function manyToManyExamples() {
  console.log('\n━━━ 多对多关系示例 ━━━\n');

  // 1. 隐式多对多：创建帖子并关联分类
  const postWithCategories = await prisma.post.create({
    data: {
      title: 'Post with Categories',
      content: 'Content',
      author: {
        connect: { email: 'alice@example.com' },
      },
      categories: {
        connectOrCreate: [
          {
            where: { slug: 'tech' },
            create: { name: 'Technology', slug: 'tech' },
          },
          {
            where: { slug: 'programming' },
            create: { name: 'Programming', slug: 'programming' },
          },
        ],
      },
    },
    include: {
      categories: true,
    },
  });
  console.log('✅ 创建帖子 + 关联分类（隐式多对多）:', postWithCategories);

  // 2. 查询多对多关系
  const postsWithCategories = await prisma.post.findMany({
    where: {
      categories: {
        some: {
          slug: 'tech',
        },
      },
    },
    include: {
      categories: true,
    },
  });
  console.log(`✅ 查询包含 'tech' 分类的帖子 (共 ${postsWithCategories.length} 篇)`);

  // 3. 显式多对多：通过中间表操作
  const tag = await prisma.tag.upsert({
    where: { name: 'TypeScript' },
    update: {},
    create: { name: 'TypeScript' },
  });

  const postTag = await prisma.postTag.create({
    data: {
      postId: postWithCategories.id,
      tagId: tag.id,
      assignedAt: new Date(), // 额外字段！
    },
    include: {
      post: true,
      tag: true,
    },
  });
  console.log('✅ 创建帖子-标签关联（显式多对多，带时间戳）:', postTag);

  // 4. 查询显式多对多
  const postsWithTags = await prisma.post.findMany({
    include: {
      postTags: {
        include: {
          tag: true,
        },
      },
    },
  });
  console.log('✅ 查询帖子 + 标签（显式多对多）:', postsWithTags.map(p => ({
    title: p.title,
    tags: p.postTags.map(pt => ({
      name: pt.tag.name,
      assignedAt: pt.assignedAt,
    })),
  })));

  return { postWithCategories, postsWithTags };
}

// ==========================================
// 运行所有示例
// ==========================================

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Prisma 关系查询完整示例            ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    await includeExamples();
    await selectExamples();
    await relationFilterExamples();
    await relationOperationsExamples();
    await manyToManyExamples();

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
  includeExamples,
  selectExamples,
  relationFilterExamples,
  relationOperationsExamples,
  manyToManyExamples,
};
