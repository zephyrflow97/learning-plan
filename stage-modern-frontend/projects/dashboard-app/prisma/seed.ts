import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@teampulse.dev' },
    update: {},
    create: {
      email: 'demo@teampulse.dev',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log('✅ Created user:', user.email);

  // 创建测试项目
  const project = await prisma.project.create({
    data: {
      name: 'TeamPulse 开发',
      description: '构建下一代团队协作工具',
      color: '#3b82f6',
      icon: '🚀',
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log('✅ Created project:', project.name);

  // 创建测试任务
  await prisma.task.createMany({
    data: [
      {
        title: '设计数据库 Schema',
        description: '使用 Prisma 定义用户、项目、任务等核心模型',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project.id,
        assigneeId: user.id,
        order: 0,
        completedAt: new Date(),
      },
      {
        title: '实现用户认证',
        description: '集成 NextAuth,支持邮箱密码和 GitHub OAuth 登录',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project.id,
        assigneeId: user.id,
        order: 0,
      },
      {
        title: '开发看板拖拽功能',
        description: '使用 dnd-kit 实现任务在看板列之间的拖拽',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project.id,
        order: 0,
      },
      {
        title: '构建数据仪表盘',
        description: '使用 recharts 展示任务趋势、成员工作量等统计图表',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project.id,
        order: 1,
      },
      {
        title: '部署到 Vercel',
        description: '配置生产环境数据库,设置环境变量,完成首次部署',
        status: 'TODO',
        priority: 'LOW',
        projectId: project.id,
        order: 2,
      },
    ],
  });

  console.log('✅ Created 5 tasks');

  // 创建标签
  const tags = await prisma.tag.createMany({
    data: [
      { name: 'Bug', color: '#ef4444' },
      { name: 'Feature', color: '#3b82f6' },
      { name: 'Documentation', color: '#10b981' },
      { name: 'Urgent', color: '#f59e0b' },
    ],
  });

  console.log('✅ Created tags');
  console.log('\n🎉 Seed data created successfully!');
  console.log('\n📝 Demo credentials:');
  console.log('   Email: demo@teampulse.dev');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
