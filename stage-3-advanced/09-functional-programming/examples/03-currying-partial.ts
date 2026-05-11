/**
 * @file 03-currying-partial.ts
 * @description 演示柯里化与偏应用的概念、实现方式及实际应用场景
 * @prerequisites Stage 1 Ch02 高阶函数, examples/02-composition.ts
 * @related examples/01-pure-functions.ts
 */

console.log('[INFO] === 柯里化与偏应用完整演示 ===\n');

// ============================================================================
// 1. 手写柯里化函数 — 最基础的形式
// ============================================================================
console.log('[1] 手写柯里化\n');

// 普通函数
function addNormal(a: number, b: number): number {
  return a + b;
}

// 手动柯里化
function addCurried(a: number): (b: number) => number {
  return (b: number) => a + b;
}

console.log('  addNormal(2, 3) =', addNormal(2, 3));
console.log('  addCurried(2)(3) =', addCurried(2)(3));

// 柯里化的好处：创建专用函数
const add5  = addCurried(5);
const add10 = addCurried(10);

console.log('  add5(3)  =', add5(3));   // 8
console.log('  add10(3) =', add10(3));  // 13
console.log('  [TRACE] 从通用函数 add 衍生出专用函数 add5, add10');

console.log('');

// ============================================================================
// 2. 通用 curry 函数实现
// ============================================================================
console.log('[2] 通用 curry 函数\n');

function curry<T>(fn: (...args: any[]) => T): (...args: any[]) => any {
  const arity = fn.length; // 原函数的参数个数

  return function curried(...args: any[]): any {
    // 如果收集到足够参数，执行原函数
    if (args.length >= arity) {
      return fn(...args);
    }
    // 否则返回一个收集更多参数的函数
    return (...moreArgs: any[]) => curried(...args, ...moreArgs);
  };
}

// 测试
function multiply(a: number, b: number, c: number): number {
  return a * b * c;
}

const curriedMultiply = curry(multiply);

console.log('  curriedMultiply(2)(3)(4) =', curriedMultiply(2)(3)(4));      // 24
console.log('  curriedMultiply(2, 3)(4) =', curriedMultiply(2, 3)(4));      // 24
console.log('  curriedMultiply(2)(3, 4) =', curriedMultiply(2)(3, 4));      // 24
console.log('  curriedMultiply(2, 3, 4) =', curriedMultiply(2, 3, 4));      // 24
console.log('  [TRACE] curry 支持灵活的参数传递方式');

console.log('');

// ============================================================================
// 3. 偏应用 (Partial Application)
// ============================================================================
console.log('[3] 偏应用\n');

// 方式 1：使用 bind
function greet(greeting: string, punctuation: string, name: string): string {
  return `${greeting}, ${name}${punctuation}`;
}

const sayHello = greet.bind(null, 'Hello', '!');
const sayHi    = greet.bind(null, 'Hi', '~');

console.log('  sayHello("Alice") =', sayHello('Alice'));
console.log('  sayHi("Bob") =', sayHi('Bob'));

// 方式 2：通用 partial 函数
function partial<T>(fn: (...args: any[]) => T, ...preset: any[]): (...rest: any[]) => T {
  return (...rest: any[]) => fn(...preset, ...rest);
}

const sayGoodbye = partial(greet, 'Goodbye', '.');
console.log('  sayGoodbye("Charlie") =', sayGoodbye('Charlie'));

console.log('');

// ============================================================================
// 4. 柯里化 vs 偏应用 — 关键区别
// ============================================================================
console.log('[4] 柯里化 vs 偏应用 — 对比\n');

// 柯里化：每次只接受一个参数
const curriedGreet = (greeting: string) => (punct: string) => (name: string) =>
  `${greeting}, ${name}${punct}`;

const step1 = curriedGreet('Hello');         // 固定 greeting
const step2 = step1('!');                     // 固定 punctuation
const step3 = step2('Alice');                 // 完成调用

console.log('  柯里化 — 逐步调用:');
console.log('    step1 = curriedGreet("Hello") → function');
console.log('    step2 = step1("!") → function');
console.log('    step3 = step2("Alice") →', step3);

// 偏应用：可以一次固定多个参数
const partialGreet = partial(greet, 'Hello', '!'); // 一次固定两个
console.log('\n  偏应用 — 一次固定多个:');
console.log('    partial(greet, "Hello", "!")("Alice") →', partialGreet('Alice'));

console.log('');

// ============================================================================
// 5. 实战场景：日志系统
// ============================================================================
console.log('[5] 实战场景：日志系统\n');

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// 柯里化的日志函数
const createLogger = (module: string) => (level: LogLevel) => (message: string) => {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`  [${timestamp}] [${level}] [${module}] ${message}`);
};

// 为不同模块创建专用 logger
const authLogger = createLogger('Auth');
const dbLogger   = createLogger('Database');

// 为不同级别创建专用 logger
const authInfo  = authLogger('INFO');
const authError = authLogger('ERROR');
const dbInfo    = dbLogger('INFO');

authInfo('User login attempt');
authError('Invalid password');
dbInfo('Connection established');

console.log('  [TRACE] 从一个通用函数衍生出 6 种专用函数');

console.log('');

// ============================================================================
// 6. 实战场景：数据过滤器工厂
// ============================================================================
console.log('[6] 实战场景：数据过滤器工厂\n');

interface Product {
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

const products: Product[] = [
  { name: 'Laptop',     price: 999,  category: 'electronics', inStock: true },
  { name: 'Mouse',      price: 29,   category: 'electronics', inStock: true },
  { name: 'Notebook',   price: 5,    category: 'stationery',  inStock: false },
  { name: 'Pen',        price: 2,    category: 'stationery',  inStock: true },
  { name: 'Headphones', price: 149,  category: 'electronics', inStock: false },
];

// 柯里化的过滤器
const filterByProp = <T, K extends keyof T>(key: K) =>
  (value: T[K]) =>
    (items: T[]) =>
      items.filter(item => item[key] === value);

const filterByCategory = filterByProp<Product, 'category'>('category');
const filterByStock    = filterByProp<Product, 'inStock'>('inStock');

const electronics = filterByCategory('electronics')(products);
const inStock     = filterByStock(true)(products);

console.log('  电子产品:', electronics.map(p => p.name));
console.log('  有库存:', inStock.map(p => p.name));

// 组合过滤器
const electronicsInStock = filterByCategory('electronics')(
  filterByStock(true)(products)
);
console.log('  有库存的电子产品:', electronicsInStock.map(p => p.name));

console.log('');

// ============================================================================
// 7. 实战场景：事件处理器
// ============================================================================
console.log('[7] 实战场景：事件处理器\n');

// 柯里化使得事件处理器更灵活
const handleEvent = (eventType: string) => (handler: (data: any) => void) => {
  console.log(`  [REGISTERED] ${eventType} handler`);
  return (data: any) => {
    console.log(`  [EVENT] ${eventType} triggered`);
    handler(data);
  };
};

const onClick  = handleEvent('click');
const onSubmit = handleEvent('submit');

const logClick = onClick((data: any) => {
  console.log(`  [HANDLER] Clicked on: ${data.target}`);
});

const logSubmit = onSubmit((data: any) => {
  console.log(`  [HANDLER] Form submitted: ${data.formId}`);
});

// 模拟触发事件
logClick({ target: 'button#save' });
logSubmit({ formId: 'user-form' });

console.log('');

// ============================================================================
// 8. 实战场景：API URL 构建器
// ============================================================================
console.log('[8] 实战场景：API URL 构建器\n');

const createUrl = (baseUrl: string) =>
  (version: string) =>
    (resource: string) =>
      (id?: string) =>
        `${baseUrl}/api/${version}/${resource}${id ? `/${id}` : ''}`;

// 逐步固定配置
const apiUrl = createUrl('https://example.com');
const v1     = apiUrl('v1');
const v2     = apiUrl('v2');

const usersV1 = v1('users');
const postsV2 = v2('posts');

console.log('  usersV1()      =', usersV1());
console.log('  usersV1("123") =', usersV1('123'));
console.log('  postsV2()      =', postsV2());
console.log('  postsV2("456") =', postsV2('456'));
console.log('  [TRACE] 从一个函数衍生出适配不同 API 版本和资源的专用函数');

console.log('');

// ============================================================================
// 9. 高级：占位符偏应用
// ============================================================================
console.log('[9] 高级：占位符偏应用\n');

// 有时我们需要固定非连续的参数
const _ = Symbol('placeholder');
type Placeholder = typeof _;

function partialWithPlaceholder(fn: Function, ...presetArgs: any[]) {
  return (...laterArgs: any[]) => {
    let laterIdx = 0;
    const finalArgs = presetArgs.map(arg =>
      arg === _ ? laterArgs[laterIdx++] : arg
    );
    // 添加剩余的后续参数
    while (laterIdx < laterArgs.length) {
      finalArgs.push(laterArgs[laterIdx++]);
    }
    return fn(...finalArgs);
  };
}

function createTag(tag: string, className: string, content: string): string {
  return `<${tag} class="${className}">${content}</${tag}>`;
}

// 固定 tag 和 className，留 content 待填
const alertDiv = partialWithPlaceholder(createTag, 'div', 'alert', _);
// 固定 tag，留 className 和 content 待填
const paragraph = partialWithPlaceholder(createTag, 'p', _, _);

console.log('  alertDiv("Warning!") =', alertDiv('Warning!'));
console.log('  paragraph("highlight", "Hello") =', paragraph('highlight', 'Hello'));

console.log('');

// ============================================================================
// 10. 柯里化 + pipe = 强大的数据管道
// ============================================================================
console.log('[10] 柯里化 + pipe — 综合运用\n');

// 简单 pipe 实现
function pipe<T>(...fns: Array<(arg: any) => any>): (input: T) => any {
  return (input: T) => fns.reduce((acc, fn) => fn(acc), input as any);
}

// 柯里化的数据处理函数
const filter = <T>(pred: (x: T) => boolean) =>
  (arr: T[]) => arr.filter(pred);

const map = <T, U>(fn: (x: T) => U) =>
  (arr: T[]) => arr.map(fn);

const take = <T>(n: number) =>
  (arr: T[]) => arr.slice(0, n);

const sortBy = <T>(key: keyof T) =>
  (arr: T[]) => [...arr].sort((a, b) =>
    a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0
  );

// 使用柯里化函数构建管道：查找最便宜的有库存电子产品
const cheapestElectronics = pipe<Product[]>(
  filter<Product>(p => p.category === 'electronics'),
  filter<Product>(p => p.inStock),
  sortBy<Product>('price'),
  take<Product>(2),
  map<Product, string>(p => `${p.name} ($${p.price})`)
);

console.log('  最便宜的有库存电子产品:', cheapestElectronics(products));
console.log('  [TRACE] 每个步骤都是一个柯里化函数，通过 pipe 串联');

console.log('\n[INFO] === 柯里化与偏应用演示结束 ===');
