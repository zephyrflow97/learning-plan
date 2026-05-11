/**
 * @file deep-readonly.ts
 * @description 高级工具类型 — DeepReadonly / DeepPartial / Prettify 等
 * @module type-utils
 *
 * TypeScript 的类型系统是图灵完备的, 你可以用类型做"计算"。
 * 这些工具类型就是预定义的"类型函数"。
 */

// ============================================================
// 1. 深度修饰符类型
// ============================================================

/**
 * DeepReadonly<T> — 递归地将所有属性设为 readonly
 *
 * @example
 * ```ts
 * type RO = DeepReadonly<{ a: { b: number } }>;
 * // { readonly a: { readonly b: number } }
 * ```
 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepReadonly<T[K]>
    : T[K];
};

/**
 * DeepMutable<T> — 递归移除所有 readonly
 */
export type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepMutable<T[K]>
    : T[K];
};

/**
 * DeepPartial<T> — 递归地将所有属性设为可选
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepPartial<T[K]>
    : T[K];
};

/**
 * DeepRequired<T> — 递归地移除所有可选
 */
export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepRequired<T[K]>
    : T[K];
};

// ============================================================
// 2. Prettify — 展开交叉类型, 提升 IDE 可读性
// ============================================================

/**
 * Prettify<T> — 将 A & B 展开为 { ...A, ...B }
 *
 * @example
 * ```ts
 * type A = { a: string };
 * type B = { b: number };
 * type AB = Prettify<A & B>; // IDE 显示 { a: string; b: number }
 * ```
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

// ============================================================
// 3. 属性过滤类型
// ============================================================

/** 提取值为指定类型的属性 */
export type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

/** 排除值为指定类型的属性 */
export type OmitByType<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

// ============================================================
// 4. 键提取类型
// ============================================================

/** 提取可选键 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never;
}[keyof T];

/** 提取必选键 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

/** 类型相等性检查 (辅助) */
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
    ? true : false;

/** 提取可变键 (非 readonly) */
export type MutableKeys<T> = {
  [K in keyof T]-?: Equal<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }> extends true ? K : never;
}[keyof T];

/** 提取只读键 */
export type ReadonlyKeys<T> = {
  [K in keyof T]-?: Equal<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }> extends true ? never : K;
}[keyof T];

// ============================================================
// 5. 联合 / 元组 转换
// ============================================================

/** 联合类型 → 交叉类型 */
export type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/** 元组 → 联合类型 */
export type TupleToUnion<T extends readonly unknown[]> = T[number];

// ============================================================
// 6. Nullable 辅助
// ============================================================

/** 可空类型 */
export type Nullable<T> = T | null | undefined;

/** 提取 Promise 内部类型 (递归) */
export type AwaitedType<T> = T extends Promise<infer U>
  ? U extends Promise<unknown> ? AwaitedType<U> : U
  : T;
