/**
 * @file compose.ts
 * @description 函数组合工具: pipe (左→右) 与 compose (右→左)
 * @module fp
 *
 * 函数组合是函数式编程的核心操作之一:
 *   - compose(f, g, h)(x)  ≡  f(g(h(x)))   从右到左
 *   - pipe(f, g, h)(x)     ≡  h(g(f(x)))   从左到右 (更符合阅读习惯)
 */

// ============================================================
// 1. compose — 从右到左
// ============================================================

/**
 * 函数组合: 从右到左执行
 *
 * @example
 * ```ts
 * const add1 = (x: number) => x + 1;
 * const double = (x: number) => x * 2;
 * const composed = compose(add1, double); // x => add1(double(x))
 * composed(3); // 7
 * ```
 */
export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  console.log(`[FP] compose: 组合 ${fns.length} 个函数 (右→左)`);
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

// ============================================================
// 2. pipe — 从左到右
// ============================================================

/**
 * 管道操作: 从左到右执行 (更直观的数据流)
 *
 * @example
 * ```ts
 * const result = pipe(
 *   (x: number) => x + 1,
 *   (x) => x * 2,
 *   (x) => x - 3,
 * )(3); // ((3 + 1) * 2) - 3 = 5
 * ```
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  console.log(`[FP] pipe: 组合 ${fns.length} 个函数 (左→右)`);
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

// ============================================================
// 3. 类型安全的重载版本 (支持不同输入输出类型)
// ============================================================

export function pipeTyped<A, B>(f1: (a: A) => B): (a: A) => B;
export function pipeTyped<A, B, C>(f1: (a: A) => B, f2: (b: B) => C): (a: A) => C;
export function pipeTyped<A, B, C, D>(f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D): (a: A) => D;
export function pipeTyped<A, B, C, D, E>(f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D, f4: (d: D) => E): (a: A) => E;
export function pipeTyped(...fns: Array<(arg: unknown) => unknown>) {
  return (arg: unknown) => fns.reduce((acc, fn) => fn(acc), arg);
}

export function composeTyped<A, B>(f1: (a: A) => B): (a: A) => B;
export function composeTyped<A, B, C>(f2: (b: B) => C, f1: (a: A) => B): (a: A) => C;
export function composeTyped<A, B, C, D>(f3: (c: C) => D, f2: (b: B) => C, f1: (a: A) => B): (a: A) => D;
export function composeTyped(...fns: Array<(arg: unknown) => unknown>) {
  return (arg: unknown) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

// ============================================================
// 4. 异步版本
// ============================================================

/** 异步 pipe — 依次 await 每个函数 */
export function pipeAsync<T>(...fns: Array<(arg: T) => Promise<T>>): (arg: T) => Promise<T> {
  return async (arg: T) => {
    let result = arg;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

/** 异步 compose — 从右到左依次 await */
export function composeAsync<T>(...fns: Array<(arg: T) => Promise<T>>): (arg: T) => Promise<T> {
  return async (arg: T) => {
    let result = arg;
    for (let i = fns.length - 1; i >= 0; i--) {
      result = await fns[i]!(result);
    }
    return result;
  };
}
