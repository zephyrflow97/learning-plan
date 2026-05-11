/**
 * @file 01-pure-functions.ts
 * @description 演示纯函数与副作用的区分，引用透明性的实际应用，以及副作用的隔离策略
 * @prerequisites Stage 1 Ch02 函数和作用域, Stage 2 Ch01 TypeScript 基础
 * @related examples/05-functional-error-handling.ts
 */

console.log('[INFO] === 纯函数与副作用完整演示 ===\n');

// ============================================================================
// 1. 纯函数 vs 不纯函数 — 对比演示
// ============================================================================
console.log('[1] 纯函数 vs 不纯函数\n');

// ✅ 纯函数：确定性 + 无副作用
function add(a: number, b: number): number {
  return a + b;
}

function multiply(a: number, b: number): number {
  return a * b;
}

function toUpperCase(str: string): string {
  return str.toUpperCase();
}

console.log('  [PURE] add(2, 3) =', add(2, 3));
console.log('  [PURE] add(2, 3) =', add(2, 3));  // 永远返回 5
console.log('  [PURE] multiply(4, 5) =', multiply(4, 5));
console.log('  [PURE] toUpperCase("hello") =', toUpperCase('hello'));

// ❌ 不纯函数：依赖或修改外部状态
let counter = 0;
function incrementCounter(): number {
  counter++;  // 副作用：修改外部变量
  return counter;
}

console.log('\n  [IMPURE] incrementCounter() =', incrementCounter()); // 1
console.log('  [IMPURE] incrementCounter() =', incrementCounter()); // 2
console.log('  [TRACE] 同一个函数，两次调用返回不同值 — 不确定性');

// ❌ 不纯函数：依赖外部状态
let taxRate = 0.1;
function priceWithTax(price: number): number {
  return price * (1 + taxRate);  // 依赖外部变量 taxRate
}

console.log('\n  [IMPURE] priceWithTax(100) =', priceWithTax(100)); // 110
taxRate = 0.2;
console.log('  [IMPURE] priceWithTax(100) =', priceWithTax(100)); // 120
console.log('  [TRACE] 相同输入，不同输出 — taxRate 被外部修改了');

// ✅ 纯化修复：把外部依赖变成参数
function purePrice(price: number, rate: number): number {
  return price * (1 + rate);
}

console.log('\n  [PURE] purePrice(100, 0.1) =', purePrice(100, 0.1)); // 110
console.log('  [PURE] purePrice(100, 0.1) =', purePrice(100, 0.1)); // 永远 110

console.log('');

// ============================================================================
// 2. 引用透明性 (Referential Transparency)
// ============================================================================
console.log('[2] 引用透明性\n');

// 纯函数具有引用透明性 — 可以用返回值替换函数调用
const result1 = add(2, 3) + add(2, 3);
const result2 = 5 + 5;  // 完全等价

console.log('  add(2, 3) + add(2, 3) =', result1);
console.log('  5 + 5 =', result2);
console.log('  [TRACE] 两者完全相等:', result1 === result2);

// 不纯函数没有引用透明性
counter = 0;
const impure1 = incrementCounter() + incrementCounter(); // 1 + 2 = 3
counter = 0;
// 不能简单替换为 incrementCounter() 的值
console.log('\n  [IMPURE] incrementCounter() + incrementCounter() =', impure1);
console.log('  [TRACE] 不能用常量替换 — 每次调用都有副作用');

console.log('');

// ============================================================================
// 3. 常见副作用分类
// ============================================================================
console.log('[3] 常见副作用分类\n');

// 副作用类型 1：修改参数
function impureSort(arr: number[]): number[] {
  return arr.sort((a, b) => a - b);  // ❌ 修改原数组
}

function pureSort(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);  // ✅ 创建新数组
}

const original = [3, 1, 4, 1, 5];
const originalCopy = [...original];

const sorted1 = impureSort(originalCopy);
console.log('  [IMPURE] sort 后 originalCopy =', originalCopy, '(被修改了！)');

const sorted2 = pureSort(original);
console.log('  [PURE]   sort 后 original =', original, '(未被修改)');
console.log('  [PURE]   sorted2 =', sorted2);

// 副作用类型 2：I/O 操作
// console.log 本身就是副作用（写入标准输出），但为了教学我们不可避免地使用它
// 关键是在业务逻辑中隔离它

// 副作用类型 3：获取当前时间（不确定性）
function impureGreeting(name: string): string {
  const hour = new Date().getHours();  // ❌ 依赖当前时间
  return hour < 12 ? `Good morning, ${name}!` : `Good afternoon, ${name}!`;
}

function pureGreeting(name: string, hour: number): string {
  return hour < 12 ? `Good morning, ${name}!` : `Good afternoon, ${name}!`;
}

console.log('\n  [IMPURE]', impureGreeting('Alice'));
console.log('  [PURE]  ', pureGreeting('Alice', 9));   // 可预测
console.log('  [PURE]  ', pureGreeting('Alice', 15));  // 可预测

console.log('');

// ============================================================================
// 4. Memoization — 纯函数的超能力
// ============================================================================
console.log('[4] Memoization（记忆化）— 纯函数独有的优化\n');

// 只有纯函数可以安全地缓存结果
function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const cache = new Map<string, R>();
  return (...args: Args): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(`  [CACHE HIT] ${fn.name}(${args.join(', ')})`);
      return cache.get(key)!;
    }
    console.log(`  [CACHE MISS] ${fn.name}(${args.join(', ')})`);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function expensiveCalculation(n: number): number {
  // 模拟耗时计算
  let result = 0;
  for (let i = 0; i < n * 1000; i++) result += Math.sqrt(i);
  return result;
}

const memoizedCalc = memoize(expensiveCalculation);

console.log('  结果:', memoizedCalc(100));  // CACHE MISS — 首次计算
console.log('  结果:', memoizedCalc(100));  // CACHE HIT — 直接返回缓存
console.log('  结果:', memoizedCalc(200));  // CACHE MISS — 新参数
console.log('  结果:', memoizedCalc(200));  // CACHE HIT

console.log('');

// ============================================================================
// 5. 副作用隔离策略 — 实战示例
// ============================================================================
console.log('[5] 副作用隔离策略\n');

// 模拟数据
interface User { id: string; name: string; email: string; age: number }

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', age: 28 },
  { id: '2', name: 'Bob',   email: 'bob@example.com',   age: 17 },
  { id: '3', name: 'Charlie', email: 'charlie@test.com', age: 35 },
];

// ✅ 纯函数：数据处理逻辑
function filterAdults(users: User[]): User[] {
  return users.filter(u => u.age >= 18);
}

function formatUserEmails(users: User[]): string[] {
  return users.map(u => `${u.name} <${u.email}>`);
}

function buildReport(users: User[]): {
  total: number;
  adults: number;
  emails: string[];
} {
  const adults = filterAdults(users);
  return {
    total: users.length,
    adults: adults.length,
    emails: formatUserEmails(adults),
  };
}

// Imperative Shell：执行副作用
function runReport() {
  // 副作用：获取数据（这里用 mock 代替真实 DB）
  const users = mockUsers;

  // 纯核心：计算报告
  const report = buildReport(users);

  // 副作用：输出结果
  console.log('  [REPORT] 总用户数:', report.total);
  console.log('  [REPORT] 成年用户数:', report.adults);
  console.log('  [REPORT] 成年用户邮箱:', report.emails);
}

runReport();

console.log('');

// ============================================================================
// 6. 纯函数的可测试性
// ============================================================================
console.log('[6] 纯函数的可测试性\n');

// 纯函数测试不需要 mock
function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${label}`);
  if (!pass) {
    console.log(`    Expected: ${JSON.stringify(expected)}`);
    console.log(`    Actual:   ${JSON.stringify(actual)}`);
  }
}

assertEqual(add(2, 3), 5, 'add(2, 3) === 5');
assertEqual(add(-1, 1), 0, 'add(-1, 1) === 0');
assertEqual(toUpperCase('hello'), 'HELLO', 'toUpperCase works');
assertEqual(pureSort([3, 1, 2]), [1, 2, 3], 'pureSort works');
assertEqual(
  filterAdults([
    { id: '1', name: 'A', email: '', age: 20 },
    { id: '2', name: 'B', email: '', age: 15 },
  ]).length,
  1,
  'filterAdults filters minors'
);
assertEqual(pureGreeting('Alice', 9), 'Good morning, Alice!', 'morning greeting');
assertEqual(pureGreeting('Alice', 15), 'Good afternoon, Alice!', 'afternoon greeting');

console.log('\n[INFO] === 纯函数与副作用演示结束 ===');
