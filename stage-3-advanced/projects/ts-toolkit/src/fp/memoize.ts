/**
 * @file memoize.ts
 * @description 记忆化 — 缓存函数结果, 避免重复计算
 * @module fp
 *
 * 提供三种缓存策略:
 *   1. memoize      — 基础 LRU 缓存 (Map)
 *   2. memoizeTTL   — 带过期时间的缓存
 *   3. memoizeWeak  — 基于 WeakMap, 对象参数自动 GC
 */

// ============================================================
// 1. 类型定义
// ============================================================

/** 记忆化选项 */
export interface MemoizeOptions<Args extends unknown[]> {
  /** 自定义缓存 key 生成器 (默认 JSON.stringify) */
  keyGenerator?: (args: Args) => string;
  /** 最大缓存条目数 (LRU 淘汰) */
  maxSize?: number;
}

/** 记忆化后的函数 (附带缓存管理方法) */
export interface MemoizedFunction<Args extends unknown[], R> {
  (...args: Args): R;
  /** 内部缓存 Map */
  cache: Map<string, R>;
  /** 清空所有缓存 */
  clear: () => void;
  /** 检查参数是否已缓存 */
  has: (...args: Args) => boolean;
  /** 删除指定参数的缓存 */
  delete: (...args: Args) => boolean;
}

// ============================================================
// 2. memoize — 基础记忆化 (LRU)
// ============================================================

/**
 * 记忆化: 缓存函数调用结果
 *
 * @example
 * ```ts
 * const square = memoize((n: number) => {
 *   console.log('computing...');
 *   return n * n;
 * });
 * square(5); // computing... → 25
 * square(5); // → 25 (从缓存)
 * ```
 */
export function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  options: MemoizeOptions<Args> = {},
): MemoizedFunction<Args, R> {
  const { keyGenerator = defaultKeyGen, maxSize = Infinity } = options;
  const cache = new Map<string, R>();
  const accessOrder: string[] = [];

  console.log(`[FP] memoize: 创建记忆化函数 (maxSize=${maxSize === Infinity ? '∞' : maxSize})`);

  const memoized = (...args: Args): R => {
    const key = keyGenerator(args);

    if (cache.has(key)) {
      // LRU: 更新访问顺序
      const idx = accessOrder.indexOf(key);
      if (idx > -1) { accessOrder.splice(idx, 1); accessOrder.push(key); }
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    accessOrder.push(key);

    // LRU 淘汰
    if (cache.size > maxSize) {
      const oldest = accessOrder.shift();
      if (oldest) cache.delete(oldest);
    }

    return result;
  };

  memoized.cache = cache;
  memoized.clear = () => { cache.clear(); accessOrder.length = 0; };
  memoized.has = (...args: Args) => cache.has(keyGenerator(args));
  memoized.delete = (...args: Args) => {
    const key = keyGenerator(args);
    const idx = accessOrder.indexOf(key);
    if (idx > -1) accessOrder.splice(idx, 1);
    return cache.delete(key);
  };

  return memoized;
}

// ============================================================
// 3. memoizeTTL — 带过期时间的记忆化
// ============================================================

/**
 * TTL 记忆化: 缓存有过期时间
 *
 * @example
 * ```ts
 * const cached = memoizeTTL(fetchData, 5000); // 5s 过期
 * ```
 */
export function memoizeTTL<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  ttl: number,
  options: MemoizeOptions<Args> = {},
): MemoizedFunction<Args, R> & { clearExpired: () => void } {
  const { keyGenerator = defaultKeyGen } = options;
  const cache = new Map<string, { value: R; expiry: number }>();

  console.log(`[FP] memoizeTTL: 创建带过期的记忆化函数 (ttl=${ttl}ms)`);

  const memoized = (...args: Args): R => {
    const key = keyGenerator(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && cached.expiry > now) return cached.value;

    const result = fn(...args);
    cache.set(key, { value: result, expiry: now + ttl });
    return result;
  };

  // 兼容 MemoizedFunction 接口
  memoized.cache = new Map() as Map<string, R>;
  memoized.clear = () => cache.clear();
  memoized.has = (...args: Args) => {
    const c = cache.get(keyGenerator(args));
    return c !== undefined && c.expiry > Date.now();
  };
  memoized.delete = (...args: Args) => cache.delete(keyGenerator(args));
  memoized.clearExpired = () => {
    const now = Date.now();
    for (const [k, v] of cache) { if (v.expiry <= now) cache.delete(k); }
  };

  return memoized;
}

// ============================================================
// 4. memoizeWeak — WeakMap 记忆化 (对象参数, 自动 GC)
// ============================================================

/**
 * WeakMap 记忆化: 用于对象参数, 对象被 GC 后缓存自动清除
 *
 * @example
 * ```ts
 * const getMeta = memoizeWeak((obj: object) => Object.keys(obj).length);
 * ```
 */
export function memoizeWeak<T extends object, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new WeakMap<T, R>();
  return (arg: T): R => {
    if (cache.has(arg)) return cache.get(arg)!;
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

// ============================================================
// 内部工具
// ============================================================

function defaultKeyGen<Args extends unknown[]>(args: Args): string {
  return JSON.stringify(args);
}
