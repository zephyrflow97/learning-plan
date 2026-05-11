/**
 * @file curry.ts
 * @description 柯里化与偏应用 — 将多参函数转为可逐步传参的函数链
 * @module fp
 *
 * 柯里化的数学定义: curry(f)(a)(b)(c) === f(a, b, c)
 * 偏应用: partial(f, a) === (...rest) => f(a, ...rest)
 */

// ============================================================
// 1. 柯里化类型
// ============================================================

/** 柯里化后的函数类型 (递归推导) */
export type Curried<Args extends unknown[], R> =
  Args extends [infer First, ...infer Rest]
    ? (arg: First) => Rest extends [] ? R : Curried<Rest, R>
    : () => R;

// ============================================================
// 2. curry — 通用柯里化
// ============================================================

/**
 * 柯里化: 将 f(a, b, c) 转为 f(a)(b)(c)
 * 也支持分批传参: f(a, b)(c) 或 f(a)(b, c)
 *
 * @example
 * ```ts
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const curried = curry(add);
 * curried(1)(2)(3); // 6
 * curried(1, 2)(3); // 6
 * ```
 */
export function curry<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): Curried<Args, R> {
  console.log(`[FP] curry: 柯里化函数 "${fn.name || 'anonymous'}" (参数数: ${fn.length})`);

  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) {
      return fn(...(args as Args));
    }
    return (...nextArgs: unknown[]) => curried(...args, ...nextArgs);
  } as Curried<Args, R>;
}

// ============================================================
// 3. partial — 偏应用 (固定左侧参数)
// ============================================================

/**
 * 偏应用: 固定函数的前 N 个参数
 *
 * @example
 * ```ts
 * const greet = (greeting: string, name: string) => `${greeting}, ${name}!`;
 * const sayHello = partial(greet, 'Hello');
 * sayHello('Alice'); // "Hello, Alice!"
 * ```
 */
export function partial<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  ...fixedArgs: Partial<Args>
): (...rest: unknown[]) => R {
  console.log(`[FP] partial: 固定 ${fixedArgs.length} 个参数`);
  return (...rest: unknown[]) => fn(...([...fixedArgs, ...rest] as Args));
}

// ============================================================
// 4. partialRight — 固定右侧参数
// ============================================================

/**
 * 右偏应用: 固定函数的后 N 个参数
 *
 * @example
 * ```ts
 * const divide = (a: number, b: number) => a / b;
 * const divideBy2 = partialRight(divide, 2);
 * divideBy2(10); // 5
 * ```
 */
export function partialRight<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  ...fixedArgs: Partial<Args>
): (...rest: unknown[]) => R {
  return (...rest: unknown[]) => fn(...([...rest, ...fixedArgs] as Args));
}

// ============================================================
// 5. uncurry — 反柯里化
// ============================================================

/**
 * 反柯里化: 将 f(a)(b)(c) 还原为 f(a, b, c)
 *
 * @example
 * ```ts
 * const curried = (a: number) => (b: number) => a + b;
 * const add = uncurry(curried, 2);
 * add(1, 2); // 3
 * ```
 */
export function uncurry<R>(fn: Function, arity: number): (...args: unknown[]) => R {
  return (...args: unknown[]): R => {
    let result: unknown = fn;
    for (let i = 0; i < arity; i++) {
      if (typeof result === 'function') {
        result = result(args[i]);
      }
    }
    return result as R;
  };
}
