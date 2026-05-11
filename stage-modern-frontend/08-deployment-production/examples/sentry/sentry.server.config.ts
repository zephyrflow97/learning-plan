// sentry.server.config.ts - 服务端错误追踪
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN (注意:服务端不用 NEXT_PUBLIC_ 前缀)
  dsn: process.env.SENTRY_DSN,
  
  // 追踪采样率: 10%
  tracesSampleRate: 0.1,
  
  // 只在生产环境启用
  enabled: process.env.NODE_ENV === 'production',
  
  // 环境标识
  environment: process.env.NODE_ENV,
  
  // 发布版本
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // 错误采样率: 100%
  sampleRate: 1.0,
  
  // 忽略某些错误
  ignoreErrors: [
    // 数据库连接超时(可能是临时网络问题)
    'ETIMEDOUT',
    // 客户端取消请求
    'AbortError',
  ],
  
  // 过滤敏感信息
  beforeSend(event, hint) {
    console.log('🚨 [Server] Sentry 捕获错误:', event.exception);
    
    // 移除敏感环境变量
    if (event.extra) {
      delete event.extra.DATABASE_URL;
      delete event.extra.NEXTAUTH_SECRET;
      delete event.extra.API_KEY;
    }
    
    // 移除敏感请求数据
    if (event.request?.data) {
      const data = event.request.data as any;
      if (data.password) delete data.password;
      if (data.creditCard) delete data.creditCard;
    }
    
    // 开发环境打印
    if (process.env.NODE_ENV === 'development') {
      console.error('[Server] Sentry Event:', event);
      console.error('[Server] Original Error:', hint.originalException);
    }
    
    return event;
  },
  
  // 集成配置
  integrations: [
    // HTTP 请求追踪
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});

// 在 API Route 中使用
// app/api/users/route.ts
import * as Sentry from '@sentry/nextjs';

export async function GET(request: Request) {
  try {
    const users = await db.user.findMany();
    return Response.json(users);
  } catch (error) {
    // 捕获错误并发送到 Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/users',
        method: 'GET',
      },
      extra: {
        url: request.url,
        headers: Object.fromEntries(request.headers),
      },
    });
    
    console.error('❌ API Error:', error);
    
    // 返回友好的错误信息(不暴露内部细节)
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// 在 Server Action 中使用
// app/actions/user.ts
'use server';

import * as Sentry from '@sentry/nextjs';

export async function createUser(data: unknown) {
  try {
    // 业务逻辑
    const user = await db.user.create({ data });
    return { success: true, user };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'createUser' },
      extra: { inputData: data },
    });
    
    return {
      success: false,
      error: 'Failed to create user',
    };
  }
}

// 手动设置上下文
export function setSentryContext(user: any, request: any) {
  // 设置用户上下文
  Sentry.setUser({
    id: user.id,
    username: user.username,
  });
  
  // 设置标签
  Sentry.setTag('server', 'next');
  Sentry.setTag('route', request.url);
  
  // 设置额外数据
  Sentry.setContext('request', {
    url: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
  });
}
