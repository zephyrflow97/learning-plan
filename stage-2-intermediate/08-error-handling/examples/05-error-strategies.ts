/**
 * @file 05-error-strategies.ts
 * @description Result 模式、Fail Fast/Safe 策略、结构化错误日志完整实现
 * @prerequisites Stage 2 Ch01 TypeScript 基础 (泛型、联合类型)
 * @related Stage 3 Ch09 函数式编程 (Option/Either 模式), Stage 2 Ch05 可观测性基础
 */

console.log('=== 错误处理策略 — Result 模式与 Fail Fast/Safe ===\n');

// ============================================
// 1. Result 类型定义
// ============================================
console.log('[INFO] 1. Result<T, E> 类型 — 错误即值\n');

type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

/** 构造成功结果 */
function Ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

/** 构造失败结果 */
function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// 基本使用
const success = Ok(42);
const failure = Err(new Error('something went wrong'));

console.log('[TRACE] Ok(42):', JSON.stringify(success));
console.log('[TRACE] Err(...):', JSON.stringify({ ok: failure.ok, error: failure.error.message }));

// 类型收窄演示
if (success.ok) {
  console.log('[VERIFY] TypeScript 知道 success.data 是 number:', success.data);
}
if (!failure.ok) {
  console.log('[VERIFY] TypeScript 知道 failure.error 是 Error:', failure.error.message);
}
console.log();

// ============================================
// 2. 实用的 Result 工具函数
// ============================================
console.log('[INFO] 2. Result 工具函数\n');

/** 将可能抛出异常的同步函数包装为 Result */
function tryCatchSync<T>(fn: () => T): Result<T> {
  try {
    return Ok(fn());
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
}

/** 将可能 reject 的异步函数包装为 Result */
async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await fn();
    return Ok(data);
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
}

/** 对 Result 中的成功值进行转换 */
function map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  if (result.ok) {
    return Ok(fn(result.data));
  }
  return result;
}

/** 对 Result 进行链式转换 (flatMap / andThen) */
function flatMap<T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E> {
  if (result.ok) {
    return fn(result.data);
  }
  return result;
}

/** 提供默认值 */
function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.data : defaultValue;
}

// 演示 tryCatchSync
const parseResult = tryCatchSync(() => JSON.parse('{"name": "Alice"}'));
const parseError = tryCatchSync(() => JSON.parse('{invalid}'));

console.log('[TRACE] JSON 解析成功:', parseResult.ok ? parseResult.data : 'N/A');
console.log('[TRACE] JSON 解析失败:', parseError.ok ? 'N/A' : parseError.error.message);

// 演示 map
const nameResult = map(parseResult, (data: any) => data.name as string);
console.log('[TRACE] map 提取 name:', nameResult.ok ? nameResult.data : 'N/A');

// 演示 unwrapOr
const value = unwrapOr(parseError, { fallback: true });
console.log('[TRACE] unwrapOr 提供默认值:', value);
console.log();

// ============================================
// 3. 异步 Result 模式实战
// ============================================
console.log('[INFO] 3. 异步 Result 模式实战\n');

interface User { id: number; name: string; email: string }

async function fetchUserById(id: number): Promise<User> {
  await new Promise(r => setTimeout(r, 10));
  if (id === 999) throw new Error('User not found');
  if (id === 0) throw new Error('Invalid user ID');
  return { id, name: `User_${id}`, email: `user${id}@example.com` };
}

async function demo3() {
  // 使用 tryCatch 包装异步操作
  const result1 = await tryCatch(() => fetchUserById(1));
  const result2 = await tryCatch(() => fetchUserById(999));

  console.log('[TRACE] 获取用户 1:', result1.ok ? result1.data.name : result1.error.message);
  console.log('[TRACE] 获取用户 999:', result2.ok ? result2.data.name : result2.error.message);

  // 链式处理
  const emailResult = map(result1, user => user.email);
  console.log('[TRACE] 提取邮箱:', emailResult.ok ? emailResult.data : 'N/A');
  console.log('[VERIFY] Result 模式: 错误不会被意外忽略, 编译器强制检查 ok 字段');
}

// ============================================
// 4. Fail Fast 策略 — 入口验证
// ============================================
console.log('[INFO] 4. Fail Fast 策略 — 在入口处验证\n');

interface CreateOrderInput {
  userId: number;
  items: Array<{ productId: string; quantity: number }>;
  couponCode?: string;
}

function validateOrderInput(input: unknown): Result<CreateOrderInput, string> {
  if (!input || typeof input !== 'object') {
    return Err('Input must be an object');
  }

  const obj = input as Record<string, unknown>;

  if (typeof obj.userId !== 'number' || obj.userId <= 0) {
    return Err('userId must be a positive number');
  }

  if (!Array.isArray(obj.items) || obj.items.length === 0) {
    return Err('items must be a non-empty array');
  }

  for (let i = 0; i < obj.items.length; i++) {
    const item = obj.items[i];
    if (!item.productId || typeof item.productId !== 'string') {
      return Err(`items[${i}].productId must be a non-empty string`);
    }
    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      return Err(`items[${i}].quantity must be at least 1`);
    }
  }

  return Ok(obj as unknown as CreateOrderInput);
}

// 测试 Fail Fast 验证
const testInputs = [
  null,
  { userId: -1 },
  { userId: 1, items: [] },
  { userId: 1, items: [{ productId: '', quantity: 1 }] },
  { userId: 1, items: [{ productId: 'P-001', quantity: 0 }] },
  { userId: 1, items: [{ productId: 'P-001', quantity: 2 }] },  // ✅ 合法
];

testInputs.forEach((input, i) => {
  const result = validateOrderInput(input);
  const status = result.ok ? '✅ 合法' : `❌ ${result.error}`;
  console.log(`[TRACE] 输入 #${i + 1}: ${status}`);
});
console.log('[VERIFY] Fail Fast: 第一个无效字段就立刻返回错误, 不继续处理');
console.log();

// ============================================
// 5. Fail Safe 策略 — 优雅降级
// ============================================
console.log('[INFO] 5. Fail Safe 策略 — 优雅降级\n');

interface Config {
  apiUrl: string;
  timeout: number;
  features: string[];
}

const DEFAULT_CONFIG: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  features: ['basic'],
};

async function fetchRemoteConfig(): Promise<Config> {
  // 模拟: 远程配置获取失败
  throw new Error('Config server unreachable');
}

async function getConfig(): Promise<Config> {
  const result = await tryCatch(fetchRemoteConfig);

  if (result.ok) {
    console.log('[TRACE] 使用远程配置');
    return result.data;
  }

  // Fail Safe: 远程获取失败, 降级到默认配置
  console.log(`[TRACE] 远程配置失败: ${result.error.message}`);
  console.log('[TRACE] 降级到默认配置');
  return DEFAULT_CONFIG;
}

// ============================================
// 6. 结构化错误日志
// ============================================
console.log('[INFO] 6. 结构化错误日志\n');

// 日志级别
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
}

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie'];

function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitize(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function logError(
  error: unknown,
  message: string,
  context?: Record<string, unknown>
): StructuredLog {
  const log: StructuredLog = {
    timestamp: new Date().toISOString(),
    level: LogLevel.ERROR,
    message,
  };

  if (error instanceof Error) {
    log.error = {
      name: error.constructor.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
    };
    // 如果有 code 属性
    if ('code' in error && typeof (error as any).code === 'string') {
      log.error.code = (error as any).code;
    }
  }

  if (context) {
    log.context = sanitize(context);
  }

  return log;
}

// 演示
const structuredLog = logError(
  new Error('Connection timeout after 5000ms'),
  'Failed to fetch user profile',
  {
    userId: 'u-123',
    requestId: 'req-abc-def',
    apiToken: 'sk-secret-token-12345',  // 敏感信息!
    endpoint: '/api/users/123',
  }
);

console.log('[TRACE] 结构化日志:');
console.log(JSON.stringify(structuredLog, null, 2));
console.log('[VERIFY] apiToken 已被替换为 [REDACTED]');
console.log();

// ============================================
// 7. 综合实战: 完整的错误处理链路
// ============================================
console.log('[INFO] 7. 综合实战 — 完整的错误处理链路\n');

async function demo7() {
  // 层次: Controller → Service → Repository

  // Repository 层
  async function findUserById(id: number): Promise<Result<User>> {
    if (id <= 0) return Err(new Error('Invalid ID'));
    if (id === 999) return Err(new Error('Database connection lost'));
    return Ok({ id, name: `User_${id}`, email: `user${id}@mail.com` });
  }

  // Service 层
  async function getUserProfile(userId: number): Promise<Result<{ user: User; greeting: string }>> {
    const userResult = await findUserById(userId);
    if (!userResult.ok) return userResult;

    // 业务逻辑转换
    return Ok({
      user: userResult.data,
      greeting: `Hello, ${userResult.data.name}!`,
    });
  }

  // Controller 层
  async function handleGetUser(requestId: string, userId: number): Promise<void> {
    console.log(`[TRACE] [${requestId}] 处理请求: GET /users/${userId}`);

    const result = await getUserProfile(userId);

    if (result.ok) {
      console.log(`[TRACE] [${requestId}] ✅ 200: ${JSON.stringify(result.data)}`);
    } else {
      const log = logError(result.error, 'Failed to get user', { requestId, userId });
      console.log(`[TRACE] [${requestId}] ❌ 500: ${log.error?.message}`);
    }
  }

  await handleGetUser('req-001', 1);    // 成功
  await handleGetUser('req-002', 999);  // 数据库错误
  await handleGetUser('req-003', -1);   // 无效 ID
}

// ============================================
// 运行所有异步 demo
// ============================================
async function main() {
  await demo3();
  console.log();
  const config = await getConfig();
  console.log('[TRACE] 最终配置:', JSON.stringify(config));
  console.log();
  await demo7();
  console.log('\n[INFO] === 示例结束 ===');
}

main().catch(console.error);
