/**
 * @file 03-advanced-type-patterns.ts
 * @description 演示 TypeScript 高级类型模式：品牌类型 (Branded Types)、协变与逆变、
 *   递归类型、infer 模式匹配、模板字面量类型
 * @prerequisites Stage 3 Ch01 TypeScript 高级类型 (泛型、条件类型)
 * @related examples/01-declaration-files.ts, examples/02-module-augmentation.ts
 */

console.log('[INFO] === TypeScript 高级类型模式完整演示 ===\n');

// ============================================================================
// 1. 品牌类型 (Branded Types) — 名义类型系统的模拟
// ============================================================================
console.log('[1] 品牌类型 — 给相同结构贴不同标签\n');

// 品牌类型的核心：用交叉类型 & { __brand: 'X' } 区分结构相同但语义不同的类型
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type Email = Brand<string, 'Email'>;

// 工厂函数 — 带运行时验证
function createUserId(raw: string): UserId {
  if (!raw.startsWith('user_')) {
    throw new Error(`Invalid UserId: must start with "user_", got "${raw}"`);
  }
  return raw as UserId;
}

function createOrderId(raw: string): OrderId {
  if (!raw.startsWith('order_')) {
    throw new Error(`Invalid OrderId: must start with "order_", got "${raw}"`);
  }
  return raw as OrderId;
}

function createEmail(raw: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    throw new Error(`Invalid Email: "${raw}"`);
  }
  return raw as Email;
}

// 类型安全的函数 — 不同品牌不可混用
function getUser(id: UserId): { id: UserId; name: string } {
  return { id, name: 'Alice' };
}

function getOrder(id: OrderId): { id: OrderId; total: number } {
  return { id, total: 99.99 };
}

const userId = createUserId('user_abc123');
const orderId = createOrderId('order_xyz789');
const email = createEmail('alice@example.com');

console.log('  getUser(userId):', getUser(userId));
console.log('  getOrder(orderId):', getOrder(orderId));
// console.log(getUser(orderId)); // ❌ 编译错误：OrderId 不能赋给 UserId
console.log('  ❌ getUser(orderId) → 编译错误：类型不兼容');
console.log('  品牌类型的值仍然是普通 string:', typeof userId, '=', userId);
console.log('');

// ============================================================================
// 2. 协变与逆变 — 类型系统的方向性
// ============================================================================
console.log('[2] 协变与逆变 — 类型参数的方向性\n');

// 基础类型层级
class Animal {
  constructor(public name: string) {}
  eat() { console.log(`    [TRACE] ${this.name} is eating`); }
}

class Dog extends Animal {
  bark() { console.log(`    [TRACE] ${this.name}: Woof!`); }
}

class GoldenRetriever extends Dog {
  fetch() { console.log(`    [TRACE] ${this.name} fetches the ball`); }
}

// --- 协变 (Covariant): 返回值位置 ---
// Producer<Dog> 可以赋给 Producer<Animal>（同方向）
type Producer<T> = () => T;

const produceDog: Producer<Dog> = () => new Dog('Buddy');
const produceAnimal: Producer<Animal> = produceDog; // ✅ 协变

console.log('  协变（返回值位置）:');
console.log('    Producer<Dog> → Producer<Animal>: ✅ (Dog 是 Animal)');
const animal = produceAnimal();
animal.eat();
console.log('');

// --- 逆变 (Contravariant): 参数位置 (strictFunctionTypes: true) ---
// Consumer<Animal> 可以赋给 Consumer<Dog>（反方向！）
type Consumer<T> = (item: T) => void;

const consumeAnimal: Consumer<Animal> = (a: Animal) => {
  console.log(`    [TRACE] Consuming animal: ${a.name}`);
  a.eat();
};
const consumeDog: Consumer<Dog> = consumeAnimal; // ✅ 逆变

console.log('  逆变（参数位置）:');
console.log('    Consumer<Animal> → Consumer<Dog>: ✅ (方向相反)');
consumeDog(new Dog('Max'));
console.log('');

// --- 为什么逆变是安全的？ ---
console.log('  为什么逆变是安全的？');
console.log('    Animal handler 能处理任何 Animal（包括 Dog）');
console.log('    所以把 Animal handler 当作 Dog handler 是安全的');
console.log('    但反过来不安全：Dog handler 可能调用 bark()，Animal 没有 bark()');
console.log('');

// ============================================================================
// 3. 递归类型 — 类型的自引用
// ============================================================================
console.log('[3] 递归类型 — 类型定义中使用自身\n');

// DeepReadonly — 递归地将所有嵌套属性变为 readonly
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  features: string[];
}

const frozenConfig: DeepReadonly<NestedConfig> = {
  database: {
    host: 'localhost',
    port: 5432,
    credentials: { username: 'admin', password: 'secret' },
  },
  features: ['auth', 'logging'],
};

// frozenConfig.database.port = 3306; // ❌ 编译错误：readonly
// frozenConfig.database.credentials.password = 'new'; // ❌ 递归 readonly！
console.log('  DeepReadonly 递归冻结嵌套对象:');
console.log('  frozenConfig.database.host:', frozenConfig.database.host);
console.log('  ❌ frozenConfig.database.port = 3306 → 编译错误 (readonly)');
console.log('  ❌ frozenConfig.database.credentials.password = "x" → 编译错误 (递归!)');
console.log('');

// JSON 类型 — 递归定义合法的 JSON 值
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

const validJson: JSONValue = {
  name: 'Alice',
  age: 30,
  tags: ['admin', 'user'],
  metadata: { nested: { deep: true } },
};

console.log('  JSONValue 递归类型:', JSON.stringify(validJson));
console.log('');

// ============================================================================
// 4. infer 的模式匹配 — 类型系统的"正则捕获组"
// ============================================================================
console.log('[4] infer 模式匹配 — 从复杂类型中提取信息\n');

// 提取函数返回类型（等价于内建 ReturnType）
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取 Promise 的解包类型（等价于内建 Awaited）
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;

// 提取函数的第一个参数类型
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

// 提取元组的最后一个元素
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

// 演示
type Fn = (name: string, age: number) => boolean;

type R = MyReturnType<Fn>;      // boolean
type P = FirstParam<Fn>;        // string
type U = UnwrapPromise<Promise<Promise<string>>>; // string
type E = ElementType<number[]>; // number
type L = Last<[1, 2, 3]>;       // 3

// 运行时验证
const testReturn: R = true;
const testParam: P = 'hello';
const testUnwrap: U = 'unwrapped';
const testElement: E = 42;
const testLast: L = 3;

console.log('  MyReturnType<(name, age) => boolean>:', typeof testReturn);
console.log('  FirstParam<(name, age) => boolean>:', typeof testParam);
console.log('  UnwrapPromise<Promise<Promise<string>>>:', typeof testUnwrap);
console.log('  ElementType<number[]>:', typeof testElement);
console.log('  Last<[1, 2, 3]>:', testLast);
console.log('');

// ============================================================================
// 5. 模板字面量类型 — 字符串级别的类型操作
// ============================================================================
console.log('[5] 模板字面量类型 — 编译时字符串操作\n');

// 基础：从联合类型生成新的字符串类型
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// → 'onClick' | 'onFocus' | 'onBlur'

// 实用：CSS 单位类型
type CSSUnit = 'px' | 'rem' | 'em' | '%' | 'vh' | 'vw';
type CSSValue = `${number}${CSSUnit}`;

const width: CSSValue = '100px';
const height: CSSValue = '50vh';
// const invalid: CSSValue = '100'; // ❌ 缺少单位

console.log('  EventHandler:', "'onClick' | 'onFocus' | 'onBlur'");
console.log('  CSSValue examples:', width, height);
console.log('');

// 高级：用 infer 解析字符串模式
type ParseRoute<T extends string> =
  T extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ParseRoute<`/${Rest}`>
    : T extends `${string}/:${infer Param}`
      ? Param
      : never;

type RouteParams = ParseRoute<'/api/users/:userId/posts/:postId'>;
// → 'userId' | 'postId'

const param1: RouteParams = 'userId';
const param2: RouteParams = 'postId';
// const param3: RouteParams = 'invalid'; // ❌ 编译错误

console.log('  ParseRoute<"/api/users/:userId/posts/:postId">:', param1, '|', param2);
console.log('');

// ============================================================================
// 6. 实用高级类型集锦
// ============================================================================
console.log('[6] 实用高级类型集锦\n');

// Prettify — 展平交叉类型，让 IDE 显示完整结构
type Prettify<T> = { [K in keyof T]: T[K] } & {};

type MergedUser = Prettify<
  { name: string; age: number } & { email: string; role: 'admin' | 'user' }
>;

// StrictOmit — 比内建 Omit 更安全（只允许 omit 已有的 key）
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

// RequireAtLeastOne — 至少需要一个属性
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// NonEmptyArray — 至少一个元素的数组
type NonEmptyArray<T> = [T, ...T[]];

const users: NonEmptyArray<string> = ['Alice']; // ✅ 至少一个
// const empty: NonEmptyArray<string> = []; // ❌ 编译错误

console.log('  Prettify: 展平交叉类型，让 IDE hover 显示完整结构');
console.log('  StrictOmit: 只允许 omit 已有的 key（比 Omit 更安全）');
console.log('  NonEmptyArray: 保证数组至少有一个元素');
console.log('  NonEmptyArray<string>:', users);
console.log('');

// ============================================================================
// 7. 类型守卫工厂 — 用泛型生成类型守卫
// ============================================================================
console.log('[7] 类型守卫工厂 — 泛型 + 类型谓词\n');

// 通用的属性检查类型守卫
function hasProperty<T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && prop in obj;
}

const data: unknown = { name: 'Alice', age: 30 };

if (hasProperty(data, 'name')) {
  console.log('  data.name:', data.name); // ✅ 类型安全
}

if (hasProperty(data, 'age')) {
  console.log('  data.age:', data.age);   // ✅ 类型安全
}

// 判别联合类型的类型守卫
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function isShape<K extends Shape['kind']>(
  shape: Shape,
  kind: K
): shape is Extract<Shape, { kind: K }> {
  return shape.kind === kind;
}

const shape: Shape = { kind: 'circle', radius: 10 };

if (isShape(shape, 'circle')) {
  console.log('  Circle radius:', shape.radius); // ✅ 已收窄为 circle
}

console.log('');

console.log('\n[INFO] === 高级类型模式演示结束 ===');
console.log('[INFO] 关键收获:');
console.log('  1. 品牌类型: 用 T & { __brand } 模拟名义类型');
console.log('  2. 协变/逆变: 返回值协变、参数逆变是类型安全的基石');
console.log('  3. 递归类型: DeepReadonly、JSONValue 等需要自引用的场景');
console.log('  4. infer: 类型系统的"模式匹配"，从复杂类型中提取部分');
console.log('  5. 模板字面量: 编译时字符串操作，解析路由、生成事件名');
