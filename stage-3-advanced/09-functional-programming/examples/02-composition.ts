/**
 * @file 02-composition.ts
 * @description 演示函数组合的核心模式：compose、pipe、以及在实际数据处理管道中的应用
 * @prerequisites Stage 1 Ch02 高阶函数, examples/01-pure-functions.ts
 * @related examples/03-currying-partial.ts
 */

console.log('[INFO] === 函数组合完整演示 ===\n');

// ============================================================================
// 1. 手动组合 — 嵌套调用的痛苦
// ============================================================================
console.log('[1] 手动组合 — 嵌套调用\n');

const trim    = (s: string): string   => s.trim();
const toLower = (s: string): string   => s.toLowerCase();
const split   = (s: string): string[] => s.split(' ');

// 嵌套调用 — 从内到外读
const words = split(toLower(trim('  Hello World  ')));
console.log('  嵌套调用结果:', words);  // ['hello', 'world']
console.log('  [TRACE] 阅读顺序与执行顺序相反 — 不直观');

console.log('');

// ============================================================================
// 2. compose — 从右到左组合（数学传统）
// ============================================================================
console.log('[2] compose — 从右到左组合\n');

// 类型安全的 compose 实现（使用函数重载）
function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B): (a: A) => C;
function compose<A, B, C, D>(
  f: (c: C) => D, g: (b: B) => C, h: (a: A) => B
): (a: A) => D;
function compose<A, B, C, D, E>(
  f: (d: D) => E, g: (c: C) => D, h: (b: B) => C, i: (a: A) => B
): (a: A) => E;
function compose(...fns: Function[]) {
  return (x: unknown) => fns.reduceRight((acc, fn) => fn(acc), x);
}

// compose(f, g, h)(x) = f(g(h(x)))
const processString = compose(split, toLower, trim);
const result1 = processString('  Hello World  ');
console.log('  compose(split, toLower, trim)("  Hello World  ")');
console.log('  结果:', result1);

// 执行顺序日志
console.log('\n  [TRACE] 执行顺序：trim → toLower → split（从右到左）');

console.log('');

// ============================================================================
// 3. pipe — 从左到右组合（更直观）
// ============================================================================
console.log('[3] pipe — 从左到右组合\n');

// 类型安全的 pipe 实现
function pipe<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C;
function pipe<A, B, C, D>(
  f: (a: A) => B, g: (b: B) => C, h: (c: C) => D
): (a: A) => D;
function pipe<A, B, C, D, E>(
  f: (a: A) => B, g: (b: B) => C, h: (c: C) => D, i: (d: D) => E
): (a: A) => E;
function pipe(...fns: Function[]) {
  return (x: unknown) => fns.reduce((acc, fn) => fn(acc), x);
}

// pipe(f, g, h)(x) = h(g(f(x)))
const processString2 = pipe(trim, toLower, split);
const result2 = processString2('  Hello World  ');
console.log('  pipe(trim, toLower, split)("  Hello World  ")');
console.log('  结果:', result2);
console.log('  [TRACE] 阅读顺序与执行顺序一致 — 更直观');

console.log('');

// ============================================================================
// 4. 组合的结合律验证
// ============================================================================
console.log('[4] 组合的结合律\n');

const double  = (n: number): number => n * 2;
const addOne  = (n: number): number => n + 1;
const square  = (n: number): number => n * n;

// 结合律：compose(f, compose(g, h)) === compose(compose(f, g), h)
const way1 = compose(double, compose(addOne, square));
const way2 = compose(compose(double, addOne), square);

console.log('  compose(double, compose(addOne, square))(3) =', way1(3));
console.log('  compose(compose(double, addOne), square)(3) =', way2(3));
console.log('  [TRACE] 两者相等 — 结合律成立');

console.log('');

// ============================================================================
// 5. 实战：数据处理管道
// ============================================================================
console.log('[5] 实战：数据处理管道\n');

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
}

const transactions: Transaction[] = [
  { id: 't1', amount: 100, currency: 'USD', date: '2025-01-15', category: 'food' },
  { id: 't2', amount: -50, currency: 'USD', date: '2025-01-20', category: 'refund' },
  { id: 't3', amount: 200, currency: 'EUR', date: '2025-02-01', category: 'food' },
  { id: 't4', amount: 75,  currency: 'USD', date: '2025-02-10', category: 'transport' },
  { id: 't5', amount: 300, currency: 'USD', date: '2025-03-01', category: 'food' },
  { id: 't6', amount: -25, currency: 'USD', date: '2025-03-05', category: 'refund' },
];

// 每个步骤都是一个小函数
const filterPositive = (txs: Transaction[]) =>
  txs.filter(t => t.amount > 0);

const filterByCurrency = (currency: string) =>
  (txs: Transaction[]) => txs.filter(t => t.currency === currency);

const filterByCategory = (cat: string) =>
  (txs: Transaction[]) => txs.filter(t => t.category === cat);

const sumAmounts = (txs: Transaction[]) =>
  txs.reduce((sum, t) => sum + t.amount, 0);

const formatCurrency = (amount: number) =>
  `$${amount.toFixed(2)}`;

// 组合管道：筛选 USD 正交易中的 food 类别，求和并格式化
const foodExpensesReport = pipe(
  filterPositive,
  filterByCurrency('USD'),
  filterByCategory('food'),
  sumAmounts,
  formatCurrency
);

console.log('  USD food 总支出:', foodExpensesReport(transactions));

// 另一条管道：所有 USD 正交易的总额
const usdTotalReport = pipe(
  filterPositive,
  filterByCurrency('USD'),
  sumAmounts,
  formatCurrency
);

console.log('  USD 总正交易:', usdTotalReport(transactions));

console.log('');

// ============================================================================
// 6. 调试组合管道：trace 函数
// ============================================================================
console.log('[6] 调试组合管道：trace 函数\n');

// trace 是一个不破坏管道的调试工具
function trace<T>(label: string): (value: T) => T {
  return (value: T) => {
    console.log(`  [TRACE ${label}]`, JSON.stringify(value).slice(0, 80));
    return value;  // 原样返回，不影响管道
  };
}

// 在管道中插入 trace 点
const debugPipeline = pipe(
  filterPositive,
  trace('after filterPositive'),
  filterByCurrency('USD'),
  trace('after filterByCurrency'),
  sumAmounts,
  trace('after sumAmounts'),
  formatCurrency
);

console.log('  最终结果:', debugPipeline(transactions));

console.log('');

// ============================================================================
// 7. pointfree 风格
// ============================================================================
console.log('[7] Pointfree 风格\n');

// Pointfree：不显式提及数据参数
const isPositive = (t: Transaction) => t.amount > 0;
const isUSD      = (t: Transaction) => t.currency === 'USD';
const getAmount  = (t: Transaction) => t.amount;
const sum        = (nums: number[]) => nums.reduce((a, b) => a + b, 0);

// 传统风格
function getUsdTotal1(txs: Transaction[]): number {
  return txs.filter(isPositive).filter(isUSD).map(getAmount).reduce((a, b) => a + b, 0);
}

// pointfree 风格 — 函数组合，不提及数据
const getUsdTotal2 = pipe(
  (txs: Transaction[]) => txs.filter(isPositive),
  (txs: Transaction[]) => txs.filter(isUSD),
  (txs: Transaction[]) => txs.map(getAmount),
  sum
);

console.log('  传统风格结果:', getUsdTotal1(transactions));
console.log('  Pointfree 结果:', getUsdTotal2(transactions));
console.log('  [TRACE] 两种风格结果相同，但 pointfree 更强调函数组合');

console.log('');

// ============================================================================
// 8. 实战：字符串处理管道
// ============================================================================
console.log('[8] 实战：字符串处理管道\n');

// 一系列字符串处理函数
const removeExtraSpaces = (s: string) => s.replace(/\s+/g, ' ');
const capitalize = (s: string) =>
  s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const truncate = (maxLen: number) => (s: string) =>
  s.length > maxLen ? s.slice(0, maxLen) + '...' : s;
const wrap = (tag: string) => (s: string) => `<${tag}>${s}</${tag}>`;

// 组合：清理 → 小写 → 移除多余空格 → 大写首字母 → 截断 → 包裹标签
const formatTitle = pipe(
  trim,
  toLower,
  removeExtraSpaces,
  capitalize,
  truncate(20),
  wrap('h1')
);

const rawTitle = '   hELLO    wORLD   from   JAVASCRIPT   ';
const formatted = formatTitle(rawTitle);
console.log('  原始标题:', JSON.stringify(rawTitle));
console.log('  处理结果:', formatted);

console.log('');

// ============================================================================
// 9. 组合 vs 继承 — 函数式方式的代码复用
// ============================================================================
console.log('[9] 组合 vs 继承\n');

// OOP 方式：通过继承扩展行为（紧耦合）
// FP 方式：通过组合扩展行为（松耦合）

type Validator<T> = (value: T) => boolean;

const isNonEmpty: Validator<string> = (s) => s.length > 0;
const isEmail: Validator<string> = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const minLength = (n: number): Validator<string> => (s) => s.length >= n;
const maxLength = (n: number): Validator<string> => (s) => s.length <= n;

// 组合多个验证器
function composeValidators<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T) => validators.every(v => v(value));
}

const validateEmail = composeValidators(
  isNonEmpty,
  minLength(5),
  maxLength(100),
  isEmail
);

const testEmails = ['', 'ab', 'test@example.com', 'not-an-email', 'a@b.c'];
for (const email of testEmails) {
  console.log(`  validateEmail("${email}"):`, validateEmail(email));
}

console.log('\n[INFO] === 函数组合演示结束 ===');
