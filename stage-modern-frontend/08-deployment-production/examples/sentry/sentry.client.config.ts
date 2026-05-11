// sentry.client.config.ts - 客户端错误追踪
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN (Data Source Name) - Sentry 项目的唯一标识符
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 追踪采样率: 10% 的请求会被追踪(生产环境避免 100% 追踪,成本太高)
  tracesSampleRate: 0.1,
  
  // 只在生产环境启用
  enabled: process.env.NODE_ENV === 'production',
  
  // 环境标识
  environment: process.env.NODE_ENV,
  
  // 发布版本(用于追踪哪个版本的代码出错)
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  
  // 错误采样率: 100% 的错误会被记录
  sampleRate: 1.0,
  
  // 性能监控采样率: 10% 的事务会被追踪
  tracesSampleRate: 0.1,
  
  // 忽略某些错误
  ignoreErrors: [
    // 浏览器扩展错误
    'Non-Error promise rejection captured',
    // 网络错误(用户网络问题,不是代码问题)
    'NetworkError',
    // 用户取消请求
    'AbortError',
  ],
  
  // 过滤敏感信息
  beforeSend(event, hint) {
    console.log('🚨 Sentry 捕获错误:', event.exception);
    
    // 移除用户邮箱(避免泄露隐私)
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    
    // 移除敏感请求头
    if (event.request?.headers) {
      delete event.request.headers.cookie;
      delete event.request.headers.authorization;
    }
    
    // 在开发环境打印错误到控制台
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Event:', event);
      console.error('Original Error:', hint.originalException);
    }
    
    return event;
  },
  
  // 集成配置
  integrations: [
    // 浏览器追踪
    new Sentry.BrowserTracing({
      // 追踪导航
      tracingOrigins: [
        'localhost',
        /^\//,
        /^https:\/\/yourapp\.com/,
      ],
      
      // 追踪 fetch/XHR 请求
      traceFetch: true,
      traceXHR: true,
    }),
    
    // 重放会话(记录用户操作,帮助重现 Bug)
    new Sentry.Replay({
      maskAllText: true, // 遮盖所有文本(隐私保护)
      blockAllMedia: true, // 阻止所有媒体(图片、视频)
    }),
  ],
  
  // 重放采样率
  replaysSessionSampleRate: 0.1, // 10% 的正常会话
  replaysOnErrorSampleRate: 1.0, // 100% 的错误会话
});

// 手动添加用户上下文
export function setUser(user: { id: string; username: string }) {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    // 不要添加邮箱和敏感信息!
  });
  console.log('✅ Sentry 用户上下文已设置:', user.username);
}

// 手动添加面包屑(用户操作痕迹)
export function addBreadcrumb(message: string, category?: string, data?: any) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: 'info',
    data,
  });
  console.log('📍 Sentry Breadcrumb:', message);
}

// 手动捕获异常
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
  });
  console.error('🚨 手动捕获异常:', error.message);
}

// 手动捕获消息
export function captureMessage(message: string, level?: Sentry.SeverityLevel) {
  Sentry.captureMessage(message, level || 'info');
  console.log('📝 Sentry Message:', message);
}

// 在 React 组件中使用示例
// import { captureException, addBreadcrumb } from '@/lib/sentry';
//
// function Component() {
//   const handleClick = () => {
//     addBreadcrumb('User clicked button', 'ui', { buttonId: 'submit' });
//     
//     try {
//       // 业务逻辑
//     } catch (error) {
//       captureException(error, {
//         tags: { component: 'Component' },
//         extra: { additionalInfo: '...' },
//       });
//     }
//   };
// }
