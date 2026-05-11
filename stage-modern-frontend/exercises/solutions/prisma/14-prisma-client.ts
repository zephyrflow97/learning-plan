// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// 防止开发环境热重载时创建多个 PrismaClient 实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // 开发环境打印 SQL 查询
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
