/**
 * @file validator.test.ts
 * @description Validate 模块测试 — Proxy 验证器 + 正则模式
 * @module validate
 */

import { createValidator, createReadonly, createTracked, ValidationError } from './validator.js';
import { Patterns, Validators } from './patterns.js';

// ============================================================
// 简单断言工具
// ============================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) { passed++; console.log(`  ✅ ${message}`); }
  else           { failed++; console.error(`  ❌ ${message}`); }
}

function assertThrows(fn: () => unknown, message: string): void {
  try { fn(); assert(false, `${message} — 应该抛出异常但没有`); }
  catch { assert(true, message); }
}

function section(title: string): void {
  console.log(`\n[TEST] === ${title} ===`);
}

// ============================================================
// 测试用例
// ============================================================

section('createValidator — 基本验证');
{
  interface User { name: string; age: number; email: string }

  const validate = createValidator<User>({
    name:  { type: 'string', required: true, min: 2, max: 50 },
    age:   { type: 'number', min: 0, max: 120 },
    email: { type: 'string', required: true, pattern: Patterns.email },
  });

  const user = validate({ name: 'Alice', age: 25, email: 'alice@example.com' });
  assert(user.name === 'Alice', '验证通过: name === Alice');
  assert(user.age === 25, '验证通过: age === 25');
}

section('createValidator — 必填字段缺失');
{
  const validate = createValidator<{ name: string }>({
    name: { type: 'string', required: true },
  });
  assertThrows(() => validate({} as { name: string }), '缺少必填字段应抛出');
}

section('createValidator — 类型错误');
{
  const validate = createValidator<{ age: number }>({
    age: { type: 'number' },
  });
  assertThrows(
    () => validate({ age: 'not a number' as unknown as number }),
    '类型不匹配应抛出',
  );
}

section('createValidator — Proxy 拦截后续赋值');
{
  interface Config { port: number }
  const validate = createValidator<Config>({
    port: { type: 'number', min: 1, max: 65535 },
  });

  const cfg = validate({ port: 3000 });
  assert(cfg.port === 3000, '初始值正确');

  cfg.port = 8080;
  assert(cfg.port === 8080, 'Proxy 允许合法赋值');

  assertThrows(() => { cfg.port = -1; }, 'Proxy 拦截非法赋值: port < 0');
  assertThrows(() => { cfg.port = 99999; }, 'Proxy 拦截非法赋值: port > 65535');
}

section('createValidator — 正则验证');
{
  const validate = createValidator<{ email: string }>({
    email: { type: 'string', pattern: Patterns.email },
  });

  validate({ email: 'valid@example.com' });
  assert(true, '合法邮箱通过验证');

  assertThrows(() => validate({ email: 'invalid' }), '非法邮箱应抛出');
}

section('createValidator — strict 模式');
{
  const validate = createValidator<{ name: string }>(
    { name: { type: 'string' } },
    { strict: true },
  );
  assertThrows(
    () => validate({ name: 'ok', extra: 'bad' } as { name: string }),
    'strict 模式下多余字段应抛出',
  );
}

section('createReadonly');
{
  const obj = createReadonly({ x: 1, y: 2 });
  assert(obj.x === 1, '只读 Proxy 可以读取');
  assertThrows(() => { (obj as { x: number }).x = 99; }, '只读 Proxy 禁止修改');
}

section('createTracked');
{
  const { proxy, getChanges, hasChanges, clearChanges } = createTracked({ a: 1, b: 'hello' });
  proxy.a = 2;
  proxy.b = 'world';
  assert(hasChanges(), '有变更');
  const changes = getChanges();
  assert(changes['a']?.old === 1 && changes['a']?.new === 2, '追踪 a 的变更');
  clearChanges();
  assert(!hasChanges(), '清空变更后无记录');
}

section('Patterns 正则验证');
{
  assert(Validators.isEmail('user@example.com'), '合法邮箱');
  assert(!Validators.isEmail('not-email'), '非法邮箱');
  assert(Validators.isPhoneChina('13800138000'), '合法手机号');
  assert(!Validators.isPhoneChina('12345'), '非法手机号');
  assert(Validators.isHexColor('#ff0000'), '合法颜色');
  assert(Validators.isPasswordStrong('Abcd1234'), '强密码');
  assert(!Validators.isPasswordStrong('weak'), '弱密码');
}

// ============================================================
// 结果汇总
// ============================================================

console.log(`\n[RESULT] Validate 模块测试: ${passed} 通过, ${failed} 失败\n`);
if (failed > 0) process.exit(1);
