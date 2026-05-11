/**
 * @file 05-functional-error-handling.ts
 * @description 演示函数式错误处理模式：Option/Maybe、Result/Either、链式操作及实战应用
 * @prerequisites Stage 2 Ch08 错误处理体系, examples/01-pure-functions.ts
 * @related examples/02-composition.ts
 */

console.log('[INFO] === 函数式错误处理完整演示 ===\n');

// ============================================================================
// 1. Option/Maybe — 处理"可能没有值"
// ============================================================================
console.log('[1] Option/Maybe — 替代 null/undefined\n');

type Option<T> =
  | { tag: 'some'; value: T }
  | { tag: 'none' };

// 构造函数
function Some<T>(value: T): Option<T> {
  return { tag: 'some', value };
}

function None<T = never>(): Option<T> {
  return { tag: 'none' };
}

// Option 的操作
function optionMap<T, U>(opt: Option<T>, fn: (v: T) => U): Option<U> {
  return opt.tag === 'some' ? Some(fn(opt.value)) : None();
}

function optionFlatMap<T, U>(opt: Option<T>, fn: (v: T) => Option<U>): Option<U> {
  return opt.tag === 'some' ? fn(opt.value) : None();
}

function optionUnwrapOr<T>(opt: Option<T>, defaultValue: T): T {
  return opt.tag === 'some' ? opt.value : defaultValue;
}

// 实战：安全地查找用户
interface User {
  id: string;
  name: string;
  email?: string;
  address?: { city: string; zip?: string };
}

const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', address: { city: 'NYC', zip: '10001' } },
  { id: '2', name: 'Bob', address: { city: 'LA' } },
  { id: '3', name: 'Charlie' },
];

function findUser(id: string): Option<User> {
  const user = users.find(u => u.id === id);
  return user ? Some(user) : None();
}

function getUserEmail(user: User): Option<string> {
  return user.email ? Some(user.email) : None();
}

function getUserZip(user: User): Option<string> {
  return user.address?.zip ? Some(user.address.zip) : None();
}

// 链式查找
const email1 = optionFlatMap(findUser('1'), getUserEmail);
const email2 = optionFlatMap(findUser('3'), getUserEmail);

console.log('  Alice 的邮箱:', email1);       // { tag: 'some', value: 'alice@...' }
console.log('  Charlie 的邮箱:', email2);      // { tag: 'none' }
console.log('  unwrap Alice:', optionUnwrapOr(email1, 'no-email'));  // 'alice@...'
console.log('  unwrap Charlie:', optionUnwrapOr(email2, 'no-email')); // 'no-email'

// 链式转换
const zip = optionFlatMap(
  findUser('1'),
  user => optionMap(getUserZip(user), zip => `ZIP: ${zip}`)
);
console.log('  Alice 的邮编:', zip);

console.log('');

// ============================================================================
// 2. Result/Either — 处理"可能失败"
// ============================================================================
console.log('[2] Result/Either — 替代 try/catch\n');

type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// 构造函数
function Ok<T, E = never>(value: T): Result<T, E> {
  return { ok: true, value };
}

function Err<E, T = never>(error: E): Result<T, E> {
  return { ok: false, error };
}

// Result 的操作
function resultMap<T, U, E>(result: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return result.ok ? Ok(fn(result.value)) : result;
}

function resultFlatMap<T, U, E>(
  result: Result<T, E>,
  fn: (v: T) => Result<U, E>
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

function resultUnwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

// 包装可能抛异常的函数
function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

// 实战：安全的 JSON 解析
function safeParseJSON<T = unknown>(str: string): Result<T, string> {
  try {
    return Ok(JSON.parse(str) as T);
  } catch (e) {
    return Err(`JSON 解析失败: ${(e as Error).message}`);
  }
}

console.log('  解析合法 JSON:', safeParseJSON('{"name":"Alice"}'));
console.log('  解析非法 JSON:', safeParseJSON('not json'));

console.log('');

// ============================================================================
// 3. Result 链式操作实战
// ============================================================================
console.log('[3] Result 链式操作\n');

interface Config {
  port: number;
  host: string;
  debug: boolean;
}

function parseConfig(raw: string): Result<Config, string> {
  const jsonResult = safeParseJSON<Record<string, unknown>>(raw);
  if (!jsonResult.ok) return jsonResult as Result<Config, string>;

  const data = jsonResult.value;

  if (typeof data.port !== 'number' || data.port < 1 || data.port > 65535) {
    return Err(`无效端口号: ${data.port}`);
  }
  if (typeof data.host !== 'string' || data.host.length === 0) {
    return Err('主机名不能为空');
  }

  return Ok({
    port: data.port as number,
    host: data.host as string,
    debug: Boolean(data.debug),
  });
}

// 测试各种情况
const configs = [
  '{"port": 3000, "host": "localhost", "debug": true}',
  '{"port": 99999, "host": "localhost"}',
  '{"port": 3000}',
  'not json at all',
];

for (const raw of configs) {
  const result = parseConfig(raw);
  if (result.ok) {
    console.log('  [OK]', result.value);
  } else {
    console.log('  [ERR]', result.error);
  }
}

console.log('');

// ============================================================================
// 4. Result 管道：多步操作链
// ============================================================================
console.log('[4] Result 管道 — 多步操作链\n');

// 模拟一个用户注册流程

function validateName(name: string): Result<string, string> {
  if (name.length < 2) return Err('用户名至少 2 个字符');
  if (name.length > 50) return Err('用户名最多 50 个字符');
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return Err('用户名只能包含字母、数字、下划线');
  return Ok(name);
}

function validateEmail(email: string): Result<string, string> {
  if (!email.includes('@')) return Err('邮箱格式无效');
  if (email.length > 100) return Err('邮箱太长');
  return Ok(email.toLowerCase());
}

function validateAge(age: number): Result<number, string> {
  if (!Number.isInteger(age)) return Err('年龄必须是整数');
  if (age < 0 || age > 150) return Err('年龄超出合理范围');
  return Ok(age);
}

interface Registration { name: string; email: string; age: number }

function validateRegistration(input: {
  name: string; email: string; age: number
}): Result<Registration, string[]> {
  const errors: string[] = [];

  const nameResult = validateName(input.name);
  const emailResult = validateEmail(input.email);
  const ageResult = validateAge(input.age);

  if (!nameResult.ok) errors.push(nameResult.error);
  if (!emailResult.ok) errors.push(emailResult.error);
  if (!ageResult.ok) errors.push(ageResult.error);

  if (errors.length > 0) return Err(errors);

  return Ok({
    name: (nameResult as { ok: true; value: string }).value,
    email: (emailResult as { ok: true; value: string }).value,
    age: (ageResult as { ok: true; value: number }).value,
  });
}

// 测试
const testCases = [
  { name: 'alice_99', email: 'alice@example.com', age: 28 },
  { name: 'a', email: 'not-email', age: -5 },
  { name: 'bob!', email: 'bob@test.com', age: 200 },
];

for (const input of testCases) {
  const result = validateRegistration(input);
  if (result.ok) {
    console.log('  [PASS]', result.value);
  } else {
    console.log('  [FAIL]', result.error);
  }
}

console.log('');

// ============================================================================
// 5. Result vs try/catch — 对比
// ============================================================================
console.log('[5] Result vs try/catch — 对比\n');

// ❌ try/catch 方式 — 错误容易被忽略
function parseNumberUnsafe(s: string): number {
  const n = Number(s);
  if (isNaN(n)) throw new Error(`"${s}" 不是有效数字`);
  return n;
}

// ✅ Result 方式 — 编译器强制处理
function parseNumber(s: string): Result<number, string> {
  const n = Number(s);
  return isNaN(n) ? Err(`"${s}" 不是有效数字`) : Ok(n);
}

// try/catch — 如果忘了 try 会崩溃
try {
  const n = parseNumberUnsafe('abc');
  console.log('  [try/catch] 成功:', n);
} catch (e) {
  console.log('  [try/catch] 失败:', (e as Error).message);
}

// Result — 不可能忘记处理
const numResult = parseNumber('abc');
if (numResult.ok) {
  console.log('  [Result] 成功:', numResult.value);
} else {
  console.log('  [Result] 失败:', numResult.error);
}

console.log('  [TRACE] Result 的好处: 编译器强制你处理错误路径');

console.log('');

// ============================================================================
// 6. 实用工具：Result 组合器
// ============================================================================
console.log('[6] Result 组合器\n');

// 收集所有 Result
function collectResults<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const r of results) {
    if (!r.ok) return r as Result<T[], E>;
    values.push(r.value);
  }
  return Ok(values);
}

// 取第一个成功的
function firstOk<T, E>(results: Result<T, E>[]): Result<T, E[]> {
  const errors: E[] = [];
  for (const r of results) {
    if (r.ok) return r;
    errors.push(r.error);
  }
  return Err(errors);
}

// 演示 collectResults
const parseResults = ['1', '2', '3'].map(parseNumber);
console.log('  collectResults([1,2,3]):', collectResults(parseResults));

const parseResultsMixed = ['1', 'abc', '3'].map(parseNumber);
console.log('  collectResults([1,abc,3]):', collectResults(parseResultsMixed));

// 演示 firstOk
const attempts = [
  parseNumber('abc'),
  parseNumber('def'),
  parseNumber('42'),
  parseNumber('100'),
];
console.log('  firstOk([abc, def, 42, 100]):', firstOk(attempts));

console.log('');

// ============================================================================
// 7. 综合实战：安全的数据处理管道
// ============================================================================
console.log('[7] 综合实战：数据处理管道\n');

interface RawApiResponse {
  data?: string;
  status?: number;
}

function fetchMock(url: string): Result<RawApiResponse, string> {
  if (url.includes('error')) return Err('网络错误: 无法连接');
  if (url.includes('empty')) return Ok({ status: 200 });
  return Ok({ data: '{"users": [{"name": "Alice"}, {"name": "Bob"}]}', status: 200 });
}

function extractData(response: RawApiResponse): Result<string, string> {
  if (!response.data) return Err('响应中没有数据');
  if (response.status !== 200) return Err(`HTTP 错误: ${response.status}`);
  return Ok(response.data);
}

function parseUsers(json: string): Result<{ name: string }[], string> {
  const parsed = safeParseJSON<{ users: { name: string }[] }>(json);
  if (!parsed.ok) return parsed as Result<{ name: string }[], string>;
  if (!Array.isArray(parsed.value.users)) return Err('数据格式错误: 缺少 users 数组');
  return Ok(parsed.value.users);
}

// 完整管道
function getUserNames(url: string): Result<string[], string> {
  const response = fetchMock(url);
  if (!response.ok) return response as Result<string[], string>;

  const data = extractData(response.value);
  if (!data.ok) return data as Result<string[], string>;

  const usersResult = parseUsers(data.value);
  if (!usersResult.ok) return usersResult as Result<string[], string>;

  return Ok(usersResult.value.map(u => u.name));
}

// 测试三种情况
const urls = ['/api/users', '/api/error', '/api/empty'];
for (const url of urls) {
  const result = getUserNames(url);
  console.log(`  ${url}:`, result.ok ? `✅ ${result.value}` : `❌ ${result.error}`);
}

console.log('');

// ============================================================================
// 8. match 模式 — 穷尽处理
// ============================================================================
console.log('[8] match 模式\n');

// 对 Result 进行穷尽匹配
function matchResult<T, E, R>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => R; err: (error: E) => R }
): R {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}

// 对 Option 进行穷尽匹配
function matchOption<T, R>(
  option: Option<T>,
  handlers: { some: (value: T) => R; none: () => R }
): R {
  return option.tag === 'some' ? handlers.some(option.value) : handlers.none();
}

// 使用 match
const greeting = matchResult(parseNumber('42'), {
  ok: n => `数字是 ${n}`,
  err: e => `错误: ${e}`,
});
console.log('  match parseNumber("42"):', greeting);

const userGreeting = matchOption(findUser('1'), {
  some: u => `欢迎, ${u.name}!`,
  none: () => '用户不存在',
});
console.log('  match findUser("1"):', userGreeting);

const unknownUser = matchOption(findUser('999'), {
  some: u => `欢迎, ${u.name}!`,
  none: () => '用户不存在',
});
console.log('  match findUser("999"):', unknownUser);

console.log('\n[INFO] === 函数式错误处理演示结束 ===');
