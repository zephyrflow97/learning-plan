/**
 * @file 02-custom-errors.ts
 * @description 自定义错误类、错误码设计、错误链 (Error Cause) 完整实现
 * @prerequisites Stage 2 Ch01 TypeScript 基础 (类、继承、枚举)
 * @related Stage 2 Ch08 错误策略 (05-error-strategies.ts)
 */

console.log('=== 自定义错误类与错误链 ===\n');

// ============================================
// 1. 错误码枚举 — 结构化的错误标识
// ============================================
console.log('[INFO] 1. 错误码枚举设计\n');

enum ErrorCode {
  VALIDATION_FAILED = 'ERR_VALIDATION',
  NOT_FOUND         = 'ERR_NOT_FOUND',
  DUPLICATE         = 'ERR_DUPLICATE',
  UNAUTHORIZED      = 'ERR_UNAUTHORIZED',
  RATE_LIMITED      = 'ERR_RATE_LIMITED',
  EXTERNAL_FAILURE  = 'ERR_EXTERNAL',
  INTERNAL          = 'ERR_INTERNAL',
}

console.log('[TRACE] 定义了 7 个错误码:', Object.keys(ErrorCode).length);
console.log('[VERIFY] ErrorCode.NOT_FOUND =', ErrorCode.NOT_FOUND);
console.log();

// ============================================
// 2. AppError 基类 — 所有业务错误的根
// ============================================
console.log('[INFO] 2. AppError 基类\n');

class AppError extends Error {
  public readonly timestamp: string;

  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number = 500,
    options?: ErrorOptions   // ES2022: { cause?: unknown }
  ) {
    super(message, options);
    this.name = 'AppError';
    this.timestamp = new Date().toISOString();

    // 修复原型链 — TypeScript 编译到 ES5 时的必要步骤
    // 没有这行, instanceof AppError 会返回 false
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** 将错误转为可序列化的 JSON 对象 */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      stack: this.stack,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
    };
  }
}

const appError = new AppError('Test error', ErrorCode.INTERNAL, 500);
console.log('[TRACE] appError.name:', appError.name);
console.log('[TRACE] appError.code:', appError.code);
console.log('[TRACE] appError.statusCode:', appError.statusCode);
console.log('[VERIFY] appError instanceof AppError:', appError instanceof AppError);
console.log('[VERIFY] appError instanceof Error:', appError instanceof Error);
console.log();

// ============================================
// 3. 业务错误子类 — 精确的错误语义
// ============================================
console.log('[INFO] 3. 业务错误子类\n');

/** 输入验证错误 */
class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly constraint: string,
    options?: ErrorOptions
  ) {
    super(message, ErrorCode.VALIDATION_FAILED, 400, options);
    this.name = 'ValidationError';
  }
}

/** 资源未找到错误 */
class NotFoundError extends AppError {
  constructor(
    public readonly resource: string,
    public readonly resourceId: string | number,
    options?: ErrorOptions
  ) {
    super(`${resource} with id '${resourceId}' not found`, ErrorCode.NOT_FOUND, 404, options);
    this.name = 'NotFoundError';
  }
}

/** 资源冲突 (重复) 错误 */
class DuplicateError extends AppError {
  constructor(
    public readonly resource: string,
    public readonly field: string,
    public readonly value: string,
    options?: ErrorOptions
  ) {
    super(`${resource} with ${field} '${value}' already exists`, ErrorCode.DUPLICATE, 409, options);
    this.name = 'DuplicateError';
  }
}

/** 外部服务错误 */
class ExternalServiceError extends AppError {
  constructor(
    public readonly service: string,
    message: string,
    options?: ErrorOptions
  ) {
    super(`[${service}] ${message}`, ErrorCode.EXTERNAL_FAILURE, 502, options);
    this.name = 'ExternalServiceError';
  }
}

// 测试子类
const validationErr = new ValidationError('Invalid email format', 'email', 'email');
const notFoundErr = new NotFoundError('User', 42);
const duplicateErr = new DuplicateError('User', 'email', 'alice@example.com');

console.log('[TRACE] ValidationError:', validationErr.message, '| field:', validationErr.field);
console.log('[TRACE] NotFoundError:', notFoundErr.message, '| resource:', notFoundErr.resource);
console.log('[TRACE] DuplicateError:', duplicateErr.message, '| value:', duplicateErr.value);

// instanceof 检查完整性
console.log('[VERIFY] validationErr instanceof ValidationError:', validationErr instanceof ValidationError);
console.log('[VERIFY] validationErr instanceof AppError:', validationErr instanceof AppError);
console.log('[VERIFY] validationErr instanceof Error:', validationErr instanceof Error);
console.log();

// ============================================
// 4. 错误链 (Error Cause) — 保留错误上下文
// ============================================
console.log('[INFO] 4. 错误链 — ES2022 cause 属性\n');

function simulateDatabaseError(): never {
  throw new Error('ECONNREFUSED: Connection refused to localhost:5432');
}

function fetchUserFromDB(userId: number): never {
  try {
    simulateDatabaseError();
  } catch (dbError) {
    // 包装原始错误, 添加业务上下文
    throw new NotFoundError('User', userId, { cause: dbError });
  }
}

try {
  fetchUserFromDB(42);
} catch (error: unknown) {
  if (error instanceof NotFoundError) {
    console.log('[TRACE] 顶层错误:', error.message);
    console.log('[TRACE] 错误码:', error.code);
    console.log('[TRACE] 原始原因 (cause):', (error.cause as Error)?.message);
    console.log('[VERIFY] 通过 cause 可以追溯到原始的数据库错误');
  }
}
console.log();

// ============================================
// 5. 错误分类处理 — switch on error type
// ============================================
console.log('[INFO] 5. 根据错误类型做分类处理\n');

interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ValidationError) {
    return {
      status: error.statusCode,
      code: error.code,
      message: error.message,
      details: { field: error.field, constraint: error.constraint },
    };
  }

  if (error instanceof NotFoundError) {
    return {
      status: error.statusCode,
      code: error.code,
      message: error.message,
      details: { resource: error.resource, id: error.resourceId },
    };
  }

  if (error instanceof DuplicateError) {
    return {
      status: error.statusCode,
      code: error.code,
      message: error.message,
      details: { field: error.field, value: error.value },
    };
  }

  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      code: error.code,
      message: error.message,
    };
  }

  // 未知错误 — 不暴露内部细节
  return {
    status: 500,
    code: ErrorCode.INTERNAL,
    message: 'Internal server error',
  };
}

// 模拟处理不同错误
const testErrors: unknown[] = [
  new ValidationError('Email is required', 'email', 'required'),
  new NotFoundError('Order', 'ORD-001'),
  new DuplicateError('User', 'username', 'alice'),
  new Error('Unknown database error'),         // 普通 Error
  'some string error',                          // 非 Error 类型
];

testErrors.forEach((err, i) => {
  const response = formatErrorResponse(err);
  console.log(`[TRACE] 错误 #${i + 1}: status=${response.status}, code=${response.code}`);
  console.log(`  message: ${response.message}`);
  if (response.details) {
    console.log(`  details:`, JSON.stringify(response.details));
  }
});
console.log();

// ============================================
// 6. 实战: 用户注册流程中的错误处理
// ============================================
console.log('[INFO] 6. 实战 — 用户注册流程\n');

interface UserInput {
  username: string;
  email: string;
  age: number;
}

// 模拟已存在的用户
const existingUsers = [
  { id: 1, username: 'alice', email: 'alice@example.com' },
];

function registerUser(input: UserInput): { id: number; username: string; email: string } {
  // 验证: username
  if (!input.username || input.username.length < 3) {
    throw new ValidationError(
      'Username must be at least 3 characters',
      'username',
      'minLength:3'
    );
  }

  // 验证: email 格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new ValidationError('Invalid email format', 'email', 'email');
  }

  // 验证: age 范围
  if (input.age < 0 || input.age > 150) {
    throw new ValidationError('Age must be between 0 and 150', 'age', 'range:0-150');
  }

  // 检查重复
  const existing = existingUsers.find(u => u.email === input.email);
  if (existing) {
    throw new DuplicateError('User', 'email', input.email);
  }

  return { id: Date.now(), username: input.username, email: input.email };
}

// 测试用例
const testCases: { label: string; input: UserInput }[] = [
  { label: '用户名太短', input: { username: 'ab', email: 'test@test.com', age: 25 } },
  { label: '无效邮箱', input: { username: 'bob', email: 'invalid-email', age: 25 } },
  { label: '年龄越界', input: { username: 'bob', email: 'bob@test.com', age: -5 } },
  { label: '邮箱重复', input: { username: 'bob', email: 'alice@example.com', age: 25 } },
  { label: '注册成功', input: { username: 'charlie', email: 'charlie@test.com', age: 30 } },
];

testCases.forEach(({ label, input }) => {
  try {
    const user = registerUser(input);
    console.log(`[TRACE] ✅ ${label}: 成功, id=${user.id}`);
  } catch (error: unknown) {
    const response = formatErrorResponse(error);
    console.log(`[TRACE] ❌ ${label}: status=${response.status}, ${response.message}`);
  }
});

console.log('\n[INFO] === 示例结束 ===');
