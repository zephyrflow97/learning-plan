import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 创建用户和文章
async function main() {
  const user = await prisma.user.create({
    data: {
      name: '张三',
      email: 'zhang@example.com',
      posts: {
        create: [
          { title: '第一篇文章', content: '内容...', published: true },
          { title: '第二篇文章', content: '内容...', published: false },
        ],
      },
    },
    include: {
      posts: true, // 包含关联的文章
    },
  });

  console.log('[Prisma] 创建用户:', user);
}

main();
