/**
 * @file fp.test.ts
 * @description FP 模块测试 — compose / pipe / curry / memoize
 * @module fp
 */

import { compose, pipe } from './compose.js';
import { curry, partial } from './curry.js';
import { memoize, memoizeTTL } from './memoize.js';

// ============================================================
// 简单断言工具
// ============================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) { passed++; console.log(`  ✅ ${message}`); }
  else           { failed++; console.error(`  ❌ ${message}`); }
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  assert(actual === expected, `${msg} (actual=${actual}, expected=${expected})`);
}

function section(title: string): void {
  console.log(`\n[TEST] === ${title} ===`);
}

// ============================================================
// compose / pipe 测试
// ============================================================

section('compose — 从右到左');
{
  const add1 = (x: number) => x + 1;
  const double = (x: number) => x * 2;
  const square = (x: number) => x * x;

  const fn = compose(add1, double, square);
  // square(3)=9 → double(9)=18 → add1(18)=19
  assertEq(fn(3), 19, 'compose(add1, double, square)(3) === 19');
}

section('pipe — 从左到右');
{
  const add1 = (x: number) => x + 1;
  const double = (x: number) => x * 2;
  const square = (x: number) => x * x;

  const fn = pipe(square, double, add1);
  assertEq(fn(3), 19, 'pipe(square, double, add1)(3) === 19');
}

section('pipe 与 compose 互逆');
{
  const add1 = (x: number) => x + 1;
  const double = (x: number) => x * 2;

  const a = pipe(add1, double)(5);
  const b = compose(double, add1)(5);
  assertEq(a, b, 'pipe(f,g) === compose(g,f)');
}

section('pipe — 数据处理管道');
{
  const numbers = [1, 2, 3, 4, 5];
  const filterEven = (arr: number[]) => arr.filter((x) => x % 2 === 0);
  const double = (arr: number[]) => arr.map((x) => x * 2);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const process = pipe(filterEven, double, sum);
  assertEq(process(numbers), 12, '管道: [1-5] → 过滤偶数 → 翻倍 → 求和 === 12');
}

// ============================================================
// curry 测试
// ============================================================

section('curry — 基本柯里化');
{
  const add = (a: number, b: number, c: number) => a + b + c;
  const curried = curry(add);

  assertEq(curried(1)(2)(3), 6, 'curry(add)(1)(2)(3) === 6');
  assertEq(curried(1, 2)(3), 6, 'curry(add)(1,2)(3) === 6');
  assertEq(curried(1)(2, 3), 6, 'curry(add)(1)(2,3) === 6');
}

section('curry — 偏应用');
{
  const add = (a: number, b: number, c: number) => a + b + c;
  const curried = curry(add);

  const add5 = curried(5);
  const add5and3 = add5(3);
  assertEq(add5and3(2), 10, '偏应用: add5and3(2) === 10');
}

// ============================================================
// partial 测试
// ============================================================

section('partial — 固定参数');
{
  const greet = (greeting: string, name: string) => `${greeting}, ${name}!`;

  const sayHello = partial(greet, 'Hello');
  assertEq(sayHello('Alice'), 'Hello, Alice!', 'partial(greet, "Hello")("Alice")');

  const sayHi = partial(greet, 'Hi');
  assertEq(sayHi('Bob'), 'Hi, Bob!', 'partial(greet, "Hi")("Bob")');
}

// ============================================================
// memoize 测试
// ============================================================

section('memoize — 基本缓存');
{
  let callCount = 0;
  const expensive = (n: number) => { callCount++; return n * n; };
  const cached = memoize(expensive);

  assertEq(cached(5), 25, 'memoize(5) === 25');
  assertEq(callCount, 1, '第一次调用计算');

  assertEq(cached(5), 25, 'memoize(5) 缓存命中');
  assertEq(callCount, 1, '缓存命中不重新计算');

  assertEq(cached(10), 100, 'memoize(10) === 100');
  assertEq(callCount, 2, '新参数重新计算');
}

section('memoize — 缓存管理');
{
  const fn = (x: number) => x * 2;
  const m = memoize(fn);
  m(5);
  assert(m.has(5), 'has(5) === true');
  m.delete(5);
  assert(!m.has(5), 'delete 后 has(5) === false');
  m(10); m(20);
  m.clear();
  assert(!m.has(10), 'clear 后缓存为空');
}

section('memoize — LRU (maxSize)');
{
  const fn = (x: number) => x * 2;
  const m = memoize(fn, { maxSize: 2 });
  m(1); m(2); m(3); // 1 应被淘汰
  assert(!m.has(1), 'LRU: 1 被淘汰');
  assert(m.has(2), 'LRU: 2 保留');
  assert(m.has(3), 'LRU: 3 保留');
}

section('memoizeTTL — 带过期');
{
  let callCount = 0;
  const fn = (x: number) => { callCount++; return x * 2; };
  const m = memoizeTTL(fn, 100); // 100ms 过期

  m(5);
  assertEq(callCount, 1, 'TTL: 首次调用');
  m(5);
  assertEq(callCount, 1, 'TTL: 缓存有效');

  // 等待过期
  await new Promise((r) => setTimeout(r, 150));
  m(5);
  assertEq(callCount, 2, 'TTL: 缓存过期后重新计算');
}

// ============================================================
// 集成测试
// ============================================================

section('FP 集成 — curry + pipe');
{
  const multiply = curry((a: number, b: number) => a * b);
  const add = curry((a: number, b: number) => a + b);

  const transform = pipe(
    multiply(2),  // x * 2
    add(10),      // (x * 2) + 10
  );

  assertEq(transform(5), 20, 'curry+pipe: (5*2)+10 === 20');
}

// ============================================================
// 结果汇总
// ============================================================

console.log(`\n[RESULT] FP 模块测试: ${passed} 通过, ${failed} 失败\n`);
if (failed > 0) process.exit(1);
