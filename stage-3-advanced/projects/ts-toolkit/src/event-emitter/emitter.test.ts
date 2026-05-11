/**
 * @file emitter.test.ts
 * @description EventEmitter 模块测试
 * @module event-emitter
 */

import { EventEmitter, createEventEmitter, onceAsync } from './emitter.js';

// ============================================================
// 简单断言
// ============================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string): void {
  if (condition) { passed++; console.log(`  ✅ ${msg}`); }
  else           { failed++; console.error(`  ❌ ${msg}`); }
}

function assertEq<T>(a: T, b: T, msg: string): void {
  assert(a === b, `${msg} (actual=${a}, expected=${b})`);
}

function section(title: string): void {
  console.log(`\n[TEST] === ${title} ===`);
}

// ============================================================
// 测试用例
// ============================================================

type TestEvents = {
  'greet': { name: string };
  'count': { n: number };
};

section('on / emit');
{
  const emitter = new EventEmitter<TestEvents>();
  let received: string | null = null;

  emitter.on('greet', (data) => { received = data.name; });
  const hadListeners = emitter.emit('greet', { name: 'Alice' });

  assert(hadListeners, 'emit 返回 true (有监听器)');
  assertEq(received, 'Alice', '监听器收到正确数据');
}

section('once — 只触发一次');
{
  const emitter = new EventEmitter<TestEvents>();
  let callCount = 0;

  emitter.once('count', () => { callCount++; });
  emitter.emit('count', { n: 1 });
  emitter.emit('count', { n: 2 });

  assertEq(callCount, 1, 'once 只触发一次');
}

section('off — 移除监听器');
{
  const emitter = new EventEmitter<TestEvents>();
  let called = false;

  const listener = () => { called = true; };
  emitter.on('greet', listener);
  emitter.off('greet', listener);
  emitter.emit('greet', { name: 'Bob' });

  assert(!called, 'off 后不再触发');
}

section('emit 无监听器');
{
  const emitter = new EventEmitter<TestEvents>();
  const result = emitter.emit('greet', { name: 'Nobody' });
  assert(!result, 'emit 返回 false (无监听器)');
}

section('removeAllListeners');
{
  const emitter = new EventEmitter<TestEvents>();
  emitter.on('greet', () => {});
  emitter.on('count', () => {});
  emitter.removeAllListeners();
  assertEq(emitter.eventNames().length, 0, '移除全部后无事件');
}

section('listenerCount / eventNames');
{
  const emitter = new EventEmitter<TestEvents>();
  emitter.on('greet', () => {});
  emitter.on('greet', () => {});
  emitter.once('count', () => {});

  assertEq(emitter.listenerCount('greet'), 2, 'greet 有 2 个监听器');
  assertEq(emitter.listenerCount('count'), 1, 'count 有 1 个监听器');
  assertEq(emitter.eventNames().length, 2, '2 个事件名');
}

section('链式调用');
{
  const emitter = createEventEmitter<TestEvents>();
  const result = emitter
    .on('greet', () => {})
    .once('count', () => {})
    .setMaxListeners(20);

  assert(result instanceof EventEmitter, '链式调用返回 this');
  assertEq(result.getMaxListeners(), 20, 'setMaxListeners 生效');
}

section('onceAsync — Promise 版本');
{
  const emitter = new EventEmitter<TestEvents>();

  // 先注册 Promise, 再 emit
  const promise = onceAsync(emitter, 'greet');
  emitter.emit('greet', { name: 'Async' });

  const data = await promise;
  assertEq(data.name, 'Async', 'onceAsync 收到正确数据');
}

section('onceAsync — 超时');
{
  const emitter = new EventEmitter<TestEvents>();
  try {
    await onceAsync(emitter, 'greet', 50); // 50ms 超时
    assert(false, '应该超时但没有');
  } catch (e) {
    assert(e instanceof Error && e.message.includes('Timeout'), 'onceAsync 超时抛出错误');
  }
}

section('异步监听器错误处理');
{
  const emitter = new EventEmitter<TestEvents>();
  emitter.on('greet', async () => {
    throw new Error('async error');
  });
  // 不应崩溃
  emitter.emit('greet', { name: 'Error' });
  assert(true, '异步监听器错误被捕获, 不影响主流程');
}

// ============================================================
// 结果汇总
// ============================================================

console.log(`\n[RESULT] EventEmitter 模块测试: ${passed} 通过, ${failed} 失败\n`);
if (failed > 0) process.exit(1);
