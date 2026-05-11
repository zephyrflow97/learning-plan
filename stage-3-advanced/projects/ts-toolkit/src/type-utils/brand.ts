/**
 * @file brand.ts
 * @description Brand 品牌类型 — 在结构化类型系统中模拟名义类型
 * @module type-utils
 *
 * 问题: TypeScript 是结构化类型系统, string 就是 string,
 *       无法区分 UserId 和 OrderId (都是 string)。
 *
 * 解法: 给 string 加一个 "品牌标记" (__brand), 让类型系统区分它们。
 *       品牌标记只存在于编译时, 运行时零开销。
 */

// ============================================================
// 1. 核心类型
// ============================================================

/**
 * Brand<T, B> — 给基础类型 T 添加品牌标记 B
 *
 * @example
 * ```ts
 * type UserId  = Brand<string, 'UserId'>;
 * type OrderId = Brand<string, 'OrderId'>;
 *
 * const uid: UserId = 'u1' as UserId;
 * const oid: OrderId = uid; // ❌ 编译错误!
 * ```
 */
export type Brand<T, BrandName extends string> = T & { readonly __brand: BrandName };

// ============================================================
// 2. 工厂函数
// ============================================================

/**
 * brand(validator) — 创建品牌类型的构造函数 (含运行时验证)
 *
 * @example
 * ```ts
 * type Email = Brand<string, 'Email'>;
 * const createEmail = brand<Email>((v) => {
 *   if (!/^[\w.-]+@/.test(v as string)) throw new Error('Invalid email');
 *   return v;
 * });
 * const email = createEmail('a@b.c'); // Email
 * ```
 */
export function brand<T extends Brand<unknown, string>>(
  validator: (value: unknown) => unknown,
): (value: unknown) => T {
  return (value: unknown): T => {
    console.log('[Brand] 创建品牌类型值:', value);
    return validator(value) as T;
  };
}

/** 不安全的品牌类型转换 (跳过验证, 仅在确保安全时使用) */
export function unsafeBrand<T extends Brand<unknown, string>>(value: unknown): T {
  return value as T;
}

/** 从品牌类型中提取原始值 */
export function unbrand<T extends Brand<unknown, string>>(
  value: T,
): T extends Brand<infer U, string> ? U : never {
  return value as T extends Brand<infer U, string> ? U : never;
}

// ============================================================
// 3. 常用品牌类型
// ============================================================

// --- 数字 ---
export type PositiveInt = Brand<number, 'PositiveInt'>;
export const createPositiveInt = brand<PositiveInt>((v) => {
  if (typeof v !== 'number' || v <= 0 || !Number.isInteger(v))
    throw new Error('Must be a positive integer');
  return v;
});

export type Percentage = Brand<number, 'Percentage'>;
export const createPercentage = brand<Percentage>((v) => {
  if (typeof v !== 'number' || v < 0 || v > 100)
    throw new Error('Percentage must be 0-100');
  return v;
});

export type MoneyInCents = Brand<number, 'MoneyInCents'>;
export const createMoneyInCents = brand<MoneyInCents>((v) => {
  if (typeof v !== 'number' || v < 0 || !Number.isInteger(v))
    throw new Error('Money must be non-negative integer (cents)');
  return v;
});

// --- 字符串 ---
export type NonEmptyString = Brand<string, 'NonEmptyString'>;
export const createNonEmptyString = brand<NonEmptyString>((v) => {
  if (typeof v !== 'string' || v.trim().length === 0)
    throw new Error('String cannot be empty');
  return v;
});

export type EmailBrand = Brand<string, 'Email'>;
export const createEmail = brand<EmailBrand>((v) => {
  if (typeof v !== 'string' || !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(v))
    throw new Error('Invalid email format');
  return v;
});

export type URLBrand = Brand<string, 'URL'>;
export const createURL = brand<URLBrand>((v) => {
  if (typeof v !== 'string') throw new Error('URL must be a string');
  try { new globalThis.URL(v); return v; }
  catch { throw new Error('Invalid URL format'); }
});

// --- 日期时间 ---
export type ISODateString = Brand<string, 'ISODateString'>;
export const createISODateString = brand<ISODateString>((v) => {
  if (typeof v !== 'string') throw new Error('Must be a string');
  if (isNaN(new Date(v).getTime())) throw new Error('Invalid ISO date');
  return v;
});

export type Timestamp = Brand<number, 'Timestamp'>;
export const createTimestamp = brand<Timestamp>((v) => {
  if (typeof v !== 'number' || v < 0)
    throw new Error('Timestamp must be non-negative number');
  return v;
});

// --- 业务 ID ---
export type UserId = Brand<string, 'UserId'>;
export const createUserId = brand<UserId>((v) => {
  if (typeof v !== 'string' || v.trim().length === 0)
    throw new Error('UserId cannot be empty');
  return v;
});

export type OrderId = Brand<string, 'OrderId'>;
export const createOrderId = brand<OrderId>((v) => {
  if (typeof v !== 'string' || v.trim().length === 0)
    throw new Error('OrderId cannot be empty');
  return v;
});

export type ProductId = Brand<string, 'ProductId'>;
export const createProductId = brand<ProductId>((v) => {
  if (typeof v !== 'string' || v.trim().length === 0)
    throw new Error('ProductId cannot be empty');
  return v;
});
