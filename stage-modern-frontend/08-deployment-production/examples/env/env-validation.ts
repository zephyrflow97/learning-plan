// src/env.ts - 环境变量类型安全验证
import { z } from 'zod';

/**
 * 环境变量 Schema 定义
 * 
 * 关键原则:
 * 1. 服务端变量不要用 NEXT_PUBLIC_ 前缀
 * 2. 客户端变量必须用 NEXT_PUBLIC_ 前缀
 * 3. 所有必需变量都要验证
 * 4. 使用 Zod 确保类型安全
 */

// 定义环境变量的 Schema
const envSchema = z.object({
  // ========== 服务端环境变量 (不暴露给客户端) ==========
  
  // 数据库
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .startsWith('postgresql://', 'DATABASE_URL must be a PostgreSQL connection string'),
  
  // 认证
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters')
    .describe('用于签名 JWT Token 的密钥'),
  
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL')
    .optional()
    .describe('应用的完整 URL(生产环境必需)'),
  
  // GitHub OAuth
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  
  // Sentry (服务端)
  SENTRY_DSN: z.string().url().optional(),
  
  // Node 环境
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  
  // ========== 客户端环境变量 (会暴露给浏览器) ==========
  
  // 应用名称
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .min(1, 'NEXT_PUBLIC_APP_NAME is required'),
  
  // API 端点
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL must be a valid URL')
    .default('http://localhost:3000/api'),
  
  // Sentry (客户端)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  
  // Vercel 系统变量(自动设置,可选)
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
});

/**
 * 验证环境变量
 * 
 * 如果验证失败,会抛出详细错误,构建会失败
 */
function validateEnv() {
  console.log('🔍 验证环境变量...');
  
  const result = envSchema.safeParse({
    // 服务端变量
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
    
    // 客户端变量
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
  
  if (!result.success) {
    console.error('❌ 环境变量验证失败:');
    console.error(result.error.flatten().fieldErrors);
    
    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(
        result.error.flatten().fieldErrors,
        null,
        2
      )}`
    );
  }
  
  console.log('✅ 环境变量验证通过');
  return result.data;
}

/**
 * 导出验证后的环境变量
 * 
 * 使用方式:
 * import { env } from '@/env';
 * const dbUrl = env.DATABASE_URL; // 类型安全!
 */
export const env = validateEnv();

/**
 * 类型定义
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 辅助函数:检查是否在生产环境
 */
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

/**
 * 辅助函数:获取应用 URL
 */
export function getAppUrl() {
  // Vercel 自动设置的 URL
  if (env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // 手动设置的 NEXTAUTH_URL
  if (env.NEXTAUTH_URL) {
    return env.NEXTAUTH_URL;
  }
  
  // 默认本地开发
  return 'http://localhost:3000';
}

/**
 * 使用示例
 */
const exampleUsage = () => {
  // ✅ 类型安全访问
  const dbUrl = env.DATABASE_URL; // string
  const appName = env.NEXT_PUBLIC_APP_NAME; // string
  const nodeEnv = env.NODE_ENV; // "development" | "test" | "production"
  
  // ✅ 条件判断
  if (isProduction) {
    console.log('运行在生产环境');
  }
  
  // ✅ 获取应用 URL
  const appUrl = getAppUrl();
  console.log('应用 URL:', appUrl);
  
  // ❌ 编译错误:访问不存在的变量
  // const invalid = env.NONEXISTENT_VAR; // TypeScript 报错
};
