/**
 * @file result.ts
 * @description Result<T, E> 联合类型 — 函数式错误处理的核心
 * @module result
 *
 * 灵感来源:
 *   - Rust 的 Result<T, E>
 *   - Go 的 (value, error) 返回模式
 *   - Haskell 的 Either a b
 *
 * 核心思想: 将错误作为值返回, 而不是抛出异常。
 * 调用者 **必须** 检查 ok 字段, 编译器会强制处理错误路径。
 */

// ============================================================
// 1. 核心类型定义
// ============================================================

/** 成功结果 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
  readonly error?: never;
}

/** 失败结果 */
export interface Err<E> {
  readonly ok: false;
  readonly value?: never;
  readonly error: E;
}

/**
 * Result 联合类型 — 操作可能成功 (Ok) 或失败 (Err)
 *
 * @example
 * ```ts
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return err('Division by zero');
 *   return ok(a / b);
 * }
 * ```
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

// ============================================================
// 2. 工厂函数
// ============================================================

/** 创建成功 Result */
export function ok<T>(value: T): Ok<T> {
  console.log('[Result] ok() 创建成功值:', typeof value === 'object' ? JSON.stringify(value) : value);
  return { ok: true, value };
}

/** 创建失败 Result */
export function err<E>(error: E): Err<E> {
  console.log('[Result] err() 创建错误:', error instanceof Error ? error.message : error);
  return { ok: false, error };
}

// ============================================================
// 3. tryCatch / tryCatchAsync
// ============================================================

/**
 * 将可能抛出异常的同步函数包装为 Result 返回
 *
 * @example
 * ```ts
 * const safeParseJSON = tryCatch((text: string) => JSON.parse(text));
 * const r = safeParseJSON('{"a":1}'); // Ok({ a: 1 })
 * ```
 */
export function tryCatch<Args extends unknown[], T>(
  fn: (...args: Args) => T,
): (...args: Args) => Result<T, Error> {
  return (...args: Args): Result<T, Error> => {
    try {
      const value = fn(...args);
      return ok(value);
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  };
}

/**
 * 将可能抛出异常的异步函数包装为 Result 返回
 *
 * @example
 * ```ts
 * const safeFetch = tryCatchAsync(async (url: string) => {
 *   const res = await fetch(url);
 *   return res.json();
 * });
 * ```
 */
export function tryCatchAsync<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<Result<T, Error>> {
  return async (...args: Args): Promise<Result<T, Error>> => {
    try {
      const value = await fn(...args);
      return ok(value);
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  };
}

// ============================================================
// 4. 链式操作: map / flatMap / unwrapOr / mapErr / all
// ============================================================

/** 映射成功值, 保持失败不变 (类似 Array.map) */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

/** 链式操作, 允许返回新的 Result (类似 Array.flatMap) */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

/** 映射错误值, 保持成功不变 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.ok) {
    return err(fn(result.error));
  }
  return result;
}

/** 提供默认值: Ok 时返回 value, Err 时返回 defaultValue */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

/** 强制取出值: Ok 时返回 value, Err 时抛出 error */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw result.error instanceof Error ? result.error : new Error(String(result.error));
}

/** 类型守卫: 检查是否为 Ok */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/** 类型守卫: 检查是否为 Err */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/**
 * 将 Result 数组合并为单个 Result<T[], E>
 * 全部 Ok → Ok(values[]);  遇到第一个 Err → 立即返回该 Err
 */
export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const r of results) {
    if (!r.ok) return r;
    values.push(r.value);
  }
  return ok(values);
}
