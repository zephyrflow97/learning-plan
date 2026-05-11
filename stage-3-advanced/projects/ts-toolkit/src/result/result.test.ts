/**
 * @file result.test.ts
 * @description Result 模块测试 — 使用简单断言函数, 不依赖外部测试框架
 * @module result
 */

import {
  ok, err, tryCatch, tryCatchAsync,
  map, flatMap, mapErr, unwrapOr, unwrap,
  isOk, isErr, all,
  type Result,
} from './result.js';

// ============================================================
// 简单断言工具
// ============================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ ${message}`);
  }
}

function assertEq<T>(actual: T, expected: T, message: string): void {
  assert(actual === expected, `${message} (actual=${actual}, expected=${expected})`);
}

function assertThrows(fn: () => unknown, message: string): void {
  try {
    fn();
    assert(false, `${message} — 应该抛出异常但没有`);
  } catch {
    assert(true, message);
  }
}

function section(title: string): void {
  console.log(`\n[TEST] === ${title} ===`);
}

// ============================================================
// 测试用例
// ============================================================

section('ok / err 工厂函数');
{
  const r1 = ok(42);
  assertEq(r1.ok, true, 'ok(42).ok === true');
  assertEq(r1.value, 42, 'ok(42).value === 42');

  const r2 = err('boom');
  assertEq(r2.ok, false, 'err("boom").ok === false');
  assertEq(r2.error, 'boom', 'err("boom").error === "boom"');
}

section('tryCatch');
{
  const safeParseJSON = tryCatch((text: string) => JSON.parse(text) as unknown);

  const success = safeParseJSON('{"a":1}');
  assertEq(success.ok, true, 'tryCatch 成功时返回 Ok');
  if (success.ok) {
    assertEq(JSON.stringify(success.value), '{"a":1}', 'tryCatch 成功值正确');
  }

  const failure = safeParseJSON('invalid');
  assertEq(failure.ok, false, 'tryCatch 失败时返回 Err');
  if (!failure.ok) {
    assert(failure.error instanceof SyntaxError, 'tryCatch 捕获 SyntaxError');
  }
}

section('tryCatchAsync');
{
  const safeFn = tryCatchAsync(async (n: number) => {
    if (n < 0) throw new Error('Negative');
    return n * 2;
  });

  const r1 = await safeFn(5);
  assertEq(r1.ok, true, 'tryCatchAsync 成功');
  if (r1.ok) assertEq(r1.value, 10, 'tryCatchAsync 成功值 === 10');

  const r2 = await safeFn(-1);
  assertEq(r2.ok, false, 'tryCatchAsync 失败');
  if (!r2.ok) assertEq(r2.error.message, 'Negative', 'tryCatchAsync 错误消息正确');
}

section('map');
{
  const r1 = map(ok(5), (x) => x * 2);
  assertEq(r1.ok, true, 'map(Ok) 仍为 Ok');
  if (r1.ok) assertEq(r1.value, 10, 'map(Ok(5), x*2) === 10');

  const r2 = map(err('e') as Result<number, string>, (x) => x * 2);
  assertEq(r2.ok, false, 'map(Err) 直接透传');
}

section('flatMap');
{
  const divide = (a: number, b: number): Result<number, string> =>
    b === 0 ? err('除以零') : ok(a / b);

  const r1 = flatMap(ok(10), (n) => divide(n, 2));
  assertEq(r1.ok, true, 'flatMap 成功链');
  if (r1.ok) assertEq(r1.value, 5, 'flatMap 10/2 === 5');

  const r2 = flatMap(ok(10), (n) => divide(n, 0));
  assertEq(r2.ok, false, 'flatMap 遇到 Err 短路');
}

section('mapErr');
{
  const r = mapErr(err('not found'), (msg) => new Error(msg));
  assertEq(r.ok, false, 'mapErr 仍为 Err');
  if (!r.ok) assert(r.error instanceof Error, 'mapErr 转换错误类型');
}

section('unwrapOr / unwrap');
{
  assertEq(unwrapOr(ok(42), 0), 42, 'unwrapOr(Ok) 返回值');
  assertEq(unwrapOr(err('e') as Result<number, string>, 0), 0, 'unwrapOr(Err) 返回默认值');

  assertEq(unwrap(ok(42)), 42, 'unwrap(Ok) 返回值');
  assertThrows(() => unwrap(err(new Error('boom'))), 'unwrap(Err) 抛出异常');
}

section('isOk / isErr 类型守卫');
{
  const r: Result<number, string> = ok(1);
  assert(isOk(r), 'isOk(Ok) === true');
  assert(!isErr(r), 'isErr(Ok) === false');
}

section('all');
{
  const r1 = all([ok(1), ok(2), ok(3)]);
  assertEq(r1.ok, true, 'all(全部Ok) === Ok');
  if (r1.ok) assertEq(r1.value.length, 3, 'all 返回 3 个值');

  const r2 = all([ok(1), err('e'), ok(3)] as Result<number, string>[]);
  assertEq(r2.ok, false, 'all(含Err) === Err');

  const r3 = all([] as Result<number, string>[]);
  assertEq(r3.ok, true, 'all([]) === Ok([])');
}

// ============================================================
// 结果汇总
// ============================================================

console.log(`\n[RESULT] Result 模块测试: ${passed} 通过, ${failed} 失败\n`);
if (failed > 0) process.exit(1);
