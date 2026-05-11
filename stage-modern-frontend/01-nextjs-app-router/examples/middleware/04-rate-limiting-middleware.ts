/**
 * 速率限制(Rate Limiting)中间件示例
 * 
 * 这个文件展示了如何在中间件中实现速率限制:
 * - 防止暴力攻击(Brute Force)
 * - 防止 DDoS 攻击
 * - API 调用限制
 * - 内存实现(开发/小型项目)
 * - Redis 实现(生产环境)
 * 
 * 限制策略:
 * - 滑动窗口(Sliding Window)
 * - 固定窗口(Fixed Window)
 * - 令牌桶(Token Bucket)
 * 
 * 使用位置: middleware.ts (项目根目录)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==================== 配置 ====================

/**
 * 速率限制规则
 */
interface RateLimitRule {
  /** 时间窗口(毫秒) */
  windowMs: number;
  /** 窗口内允许的最大请求数 */
  maxRequests: number;
}

/**
 * 不同路径的速率限制规则
 */
const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  // 登录页面:每分钟最多 5 次请求(防止暴力破解)
  '/api/auth/login': {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 5,
  },
  
  // 注册页面:每小时最多 3 次请求(防止批量注册)
  '/api/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 小时
    maxRequests: 3,
  },
  
  // 普通 API:每分钟最多 60 次请求
  '/api': {
    windowMs: 60 * 1000, // 1 分钟
    maxRequests: 60,
  },
  
  // 搜索 API:每分钟最多 20 次请求(防止爬虫)
  '/api/search': {
    windowMs: 60 * 1000,
    maxRequests: 20,
  },
};

/**
 * 默认规则(未匹配到特定规则时使用)
 */
const DEFAULT_RULE: RateLimitRule = {
  windowMs: 60 * 1000, // 1 分钟
  maxRequests: 100,
};

/**
 * IP 白名单(跳过速率限制)
 */
const IP_WHITELIST = new Set([
  '127.0.0.1',
  '::1',
  // 添加你的服务器 IP
]);

// ==================== 内存存储实现 ====================

/**
 * 速率限制记录
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * 内存存储(仅用于开发/单服务器部署)
 * 
 * ⚠️ 警告:
 * - 多服务器部署时,每个服务器有独立的内存,无法共享限制
 * - 服务器重启后数据丢失
 * - 生产环境请使用 Redis
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * 清理过期记录(防止内存泄漏)
 */
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log('🟡 [Rate Limit] 清理了', cleanedCount, '条过期记录');
  }
}, 60 * 1000); // 每分钟清理一次

/**
 * 检查并更新速率限制
 * 
 * @param key - 唯一标识(通常是 IP + 路径)
 * @param rule - 速率限制规则
 * @returns 是否允许请求(true = 允许, false = 超限)
 */
function checkRateLimit(key: string, rule: RateLimitRule): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // 没有记录或已过期,创建新记录
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + rule.windowMs,
    };
    
    rateLimitStore.set(key, newRecord);

    console.log('🟡 [Rate Limit] 新请求:', { key, count: 1, limit: rule.maxRequests });

    return {
      allowed: true,
      limit: rule.maxRequests,
      remaining: rule.maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // 记录存在且未过期
  record.count++;

  console.log('🟡 [Rate Limit] 请求计数:', {
    key,
    count: record.count,
    limit: rule.maxRequests,
  });

  const allowed = record.count <= rule.maxRequests;
  const remaining = Math.max(0, rule.maxRequests - record.count);

  return {
    allowed,
    limit: rule.maxRequests,
    remaining,
    resetAt: record.resetAt,
  };
}

// ==================== Redis 实现(生产环境推荐) ====================

/**
 * Redis 实现示例(需要安装 @upstash/redis)
 * 
 * 优势:
 * - 多服务器共享限制状态
 * - 自动过期,无需手动清理
 * - 高性能
 * 
 * 使用:
 * 1. npm install @upstash/redis
 * 2. 设置环境变量 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN
 * 3. 取消注释下面的代码
 */

/*
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function checkRateLimitRedis(
  key: string,
  rule: RateLimitRule
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}`;

  // 使用 Redis INCR 原子操作
  const count = await redis.incr(windowKey);

  // 第一次请求,设置过期时间
  if (count === 1) {
    await redis.pexpire(windowKey, rule.windowMs);
  }

  // 获取剩余 TTL
  const ttl = await redis.pttl(windowKey);
  const resetAt = now + (ttl > 0 ? ttl : rule.windowMs);

  const allowed = count <= rule.maxRequests;
  const remaining = Math.max(0, rule.maxRequests - count);

  console.log('🟡 [Rate Limit Redis]', {
    key,
    count,
    limit: rule.maxRequests,
    allowed,
  });

  return {
    allowed,
    limit: rule.maxRequests,
    remaining,
    resetAt,
  };
}
*/

// ==================== 辅助函数 ====================

/**
 * 获取客户端 IP 地址
 */
function getClientIp(request: NextRequest): string {
  // 1. 尝试从 request.ip 获取(Vercel 等平台提供)
  if (request.ip) {
    return request.ip;
  }

  // 2. 从 Headers 获取(代理服务器)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for 可能包含多个 IP,取第一个
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 3. 默认值
  return 'unknown';
}

/**
 * 获取匹配的速率限制规则
 */
function getRateLimitRule(pathname: string): RateLimitRule {
  // 精确匹配
  if (RATE_LIMIT_RULES[pathname]) {
    return RATE_LIMIT_RULES[pathname];
  }

  // 前缀匹配(按长度排序,优先匹配更具体的规则)
  const sortedPaths = Object.keys(RATE_LIMIT_RULES).sort(
    (a, b) => b.length - a.length
  );

  for (const path of sortedPaths) {
    if (pathname.startsWith(path)) {
      return RATE_LIMIT_RULES[path];
    }
  }

  return DEFAULT_RULE;
}

// ==================== 主中间件函数 ====================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🟡 [Rate Limit Middleware] 请求:', pathname);

  // ==================== 1. 获取客户端 IP ====================

  const clientIp = getClientIp(request);
  console.log('🟡 [Rate Limit] 客户端 IP:', clientIp);

  // ==================== 2. 检查 IP 白名单 ====================

  if (IP_WHITELIST.has(clientIp)) {
    console.log('🟡 [Rate Limit] IP 在白名单中,跳过限制');
    return NextResponse.next();
  }

  // ==================== 3. 获取速率限制规则 ====================

  const rule = getRateLimitRule(pathname);
  console.log('🟡 [Rate Limit] 应用规则:', {
    windowMs: rule.windowMs,
    maxRequests: rule.maxRequests,
  });

  // ==================== 4. 检查速率限制 ====================

  // 生成唯一键(IP + 路径)
  const key = `${clientIp}:${pathname}`;

  const { allowed, limit, remaining, resetAt } = checkRateLimit(key, rule);

  // ==================== 5. 构建响应 ====================

  let response: NextResponse;

  if (allowed) {
    console.log('✅ [Rate Limit] 请求允许,剩余:', remaining);
    response = NextResponse.next();
  } else {
    console.log('🔴 [Rate Limit] 请求超限,拒绝');

    // 返回 429 Too Many Requests
    response = new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: '请求过于频繁,请稍后再试',
        limit,
        remaining,
        resetAt: new Date(resetAt).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // ==================== 6. 添加 Rate Limit Headers ====================

  /**
   * 标准的 Rate Limit Headers (RFC 6585)
   * 
   * X-RateLimit-Limit: 窗口内允许的最大请求数
   * X-RateLimit-Remaining: 窗口内剩余请求数
   * X-RateLimit-Reset: 窗口重置时间(Unix 时间戳,秒)
   * Retry-After: 超限后多久可以重试(秒)
   */
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.floor(resetAt / 1000).toString());

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

// ==================== Matcher 配置 ====================

export const config = {
  matcher: [
    // 只对 API 路由应用速率限制
    '/api/:path*',
  ],
};

// ==================== 使用说明 ====================

/**
 * 1. 基础使用:
 *    - 复制这个文件到 middleware.ts
 *    - 根据需求调整 RATE_LIMIT_RULES
 * 
 * 2. 生产环境使用 Redis:
 *    - npm install @upstash/redis
 *    - 取消注释 Redis 实现代码
 *    - 将 checkRateLimit 替换为 checkRateLimitRedis
 * 
 * 3. 客户端处理(JavaScript):
 * 
 *    async function fetchWithRetry(url, options = {}) {
 *      const response = await fetch(url, options);
 *      
 *      if (response.status === 429) {
 *        const retryAfter = response.headers.get('Retry-After');
 *        const seconds = parseInt(retryAfter || '60', 10);
 *        
 *        console.log(`请求超限,${seconds} 秒后重试`);
 *        
 *        await new Promise(resolve => setTimeout(resolve, seconds * 1000));
 *        
 *        // 重试
 *        return fetchWithRetry(url, options);
 *      }
 *      
 *      return response;
 *    }
 * 
 * 4. 显示剩余配额(React):
 * 
 *    function ApiUsage() {
 *      const [quota, setQuota] = useState({ limit: 0, remaining: 0 });
 *      
 *      useEffect(() => {
 *        fetch('/api/data').then(res => {
 *          setQuota({
 *            limit: parseInt(res.headers.get('X-RateLimit-Limit') || '0'),
 *            remaining: parseInt(res.headers.get('X-RateLimit-Remaining') || '0'),
 *          });
 *        });
 *      }, []);
 *      
 *      return (
 *        <div>
 *          API 配额: {quota.remaining} / {quota.limit}
 *        </div>
 *      );
 *    }
 */

// ==================== 高级策略 ====================

/**
 * 1. 滑动窗口(Sliding Window):
 *    - 更精确,但实现复杂
 *    - 需要记录每个请求的时间戳
 * 
 * 2. 令牌桶(Token Bucket):
 *    - 允许突发流量
 *    - 需要定期补充令牌
 * 
 * 3. 基于用户的限制:
 *    - 已登录用户和匿名用户使用不同的限制
 *    - 付费用户更高的配额
 * 
 *    const userId = request.cookies.get('user_id')?.value;
 *    const key = userId ? `user:${userId}:${pathname}` : `ip:${clientIp}:${pathname}`;
 * 
 * 4. 动态调整限制:
 *    - 根据服务器负载动态调整
 *    - 检测到攻击时降低限制
 * 
 * 5. 分层限制:
 *    - 全局限制:每个 IP 每分钟 1000 次请求
 *    - 路径限制:每个 IP 每分钟对 /api/login 5 次请求
 */

// ==================== 监控和告警 ====================

/**
 * 1. 记录被拒绝的请求:
 * 
 *    if (!allowed) {
 *      // 发送到日志服务(如 Sentry, DataDog)
 *      console.warn('Rate limit exceeded', {
 *        ip: clientIp,
 *        path: pathname,
 *        userAgent: request.headers.get('user-agent'),
 *      });
 *    }
 * 
 * 2. 检测 DDoS 攻击:
 * 
 *    // 如果同一个 IP 在短时间内触发多次限制,可能是攻击
 *    const blockKey = `blocked:${clientIp}`;
 *    const blockCount = await redis.incr(blockKey);
 *    
 *    if (blockCount > 10) {
 *      // 封禁 IP(添加到黑名单)
 *      await redis.sadd('ip_blacklist', clientIp);
 *      await redis.expire(blockKey, 3600); // 1 小时后解封
 *    }
 * 
 * 3. 指标收集:
 * 
 *    - 被拒绝的请求数量
 *    - 平均响应时间
 *    - 每个端点的使用率
 */

// ==================== 常见问题 ====================

/**
 * Q: 为什么使用内存存储会有问题?
 * A: 多服务器部署时,每个服务器有独立的内存,用户可能通过负载均衡
 *    访问不同服务器,绕过限制。生产环境必须使用 Redis 等共享存储。
 * 
 * Q: 如何处理代理/NAT 后的用户?
 * A: 多个用户可能共享同一个公网 IP(如公司网络)。
 *    - 使用 User-Agent + IP 组合键
 *    - 提供 API Key 给已知客户端
 *    - 增加限制阈值
 * 
 * Q: 如何测试速率限制?
 * A: 使用 curl 或 ab(Apache Bench)模拟大量请求:
 *    ab -n 100 -c 10 http://localhost:3000/api/test
 * 
 * Q: 如何处理合法的高频请求(如 WebSocket)?
 * A: 将 WebSocket 路径添加到白名单,或使用更高的限制。
 */
