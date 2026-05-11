/**
 * Prisma Client 单例模式（Next.js 专用）
 * 
 * 为什么需要全局单例？
 * - Next.js 开发模式下，热重载会重新加载模块
 * - 每次重载都 new PrismaClient() 会创建新的数据库连接
 * - 最终会耗尽数据库连接池
 * 
 * 解决方案：
 * - 使用 globalThis 存储 PrismaClient 实例
 * - 热重载时复用已有实例
 */

import { PrismaClient } from '@prisma/client';

// ==========================================
// 全局类型扩展
// ==========================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ==========================================
// 创建 Prisma Client 实例
// ==========================================

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']  // 开发环境：打印所有查询
      : ['error'],                   // 生产环境：只打印错误
    
    // 可选：性能优化配置
    // datasources: {
    //   db: {
    //     url: process.env.DATABASE_URL,
    //   },
    // },
  });

// ==========================================
// 开发环境：保存实例到 globalThis
// ==========================================

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  
  console.log('🗄️  Prisma Client initialized (development mode)');
  console.log('   - Logs: query, error, warn');
  console.log('   - Global instance: cached for hot reload');
}

// ==========================================
// 生产环境：优雅关闭
// ==========================================

if (process.env.NODE_ENV === 'production') {
  // 在应用关闭时断开连接
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('🗄️  Prisma Client disconnected');
  });
}

// ==========================================
// 导出类型（用于 tRPC 等）
// ==========================================

export type PrismaClientType = typeof prisma;
