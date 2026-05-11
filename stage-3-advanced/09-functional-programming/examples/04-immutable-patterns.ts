/**
 * @file 04-immutable-patterns.ts
 * @description 演示 JavaScript/TypeScript 中不可变数据操作模式，包括浅拷贝、深拷贝、freeze、以及 ES2023 新方法
 * @prerequisites Stage 1 Ch03 对象和数组, Stage 3 Ch08 Proxy/Reflect
 * @related examples/01-pure-functions.ts
 */

console.log('[INFO] === 不可变数据操作模式完整演示 ===\n');

// ============================================================================
// 1. 可变 vs 不可变 — 数组操作对比
// ============================================================================
console.log('[1] 可变 vs 不可变 — 数组操作\n');

// ❌ 可变操作 — 直接修改原数组
const mutableArr = [1, 2, 3];
mutableArr.push(4);
console.log('  [MUTABLE] push 后:', mutableArr);  // [1, 2, 3, 4] — 原数组被修改

mutableArr.splice(1, 1);
console.log('  [MUTABLE] splice 后:', mutableArr); // [1, 3, 4]

mutableArr.sort((a, b) => b - a);
console.log('  [MUTABLE] sort 后:', mutableArr);   // [4, 3, 1]

// ✅ 不可变操作 — 创建新数组
const immutableArr = [1, 2, 3];

const withFour = [...immutableArr, 4];
console.log('\n  [IMMUTABLE] 添加元素:', withFour);
console.log('  [IMMUTABLE] 原数组:', immutableArr);  // 未变

const withoutSecond = immutableArr.filter((_, i) => i !== 1);
console.log('  [IMMUTABLE] 删除索引1:', withoutSecond);
console.log('  [IMMUTABLE] 原数组:', immutableArr);    // 未变

const sorted = [...immutableArr].sort((a, b) => b - a);
console.log('  [IMMUTABLE] 排序:', sorted);
console.log('  [IMMUTABLE] 原数组:', immutableArr);      // 未变

console.log('');

// ============================================================================
// 2. 可变 vs 不可变 — 对象操作对比
// ============================================================================
console.log('[2] 可变 vs 不可变 — 对象操作\n');

// ❌ 可变操作
const mutableUser = { name: 'Alice', age: 30 };
mutableUser.age = 31;
console.log('  [MUTABLE] 修改后:', mutableUser);  // { name: 'Alice', age: 31 }

// ✅ 不可变操作
const immutableUser = { name: 'Alice', age: 30 };
const olderUser = { ...immutableUser, age: 31 };
console.log('  [IMMUTABLE] 新用户:', olderUser);
console.log('  [IMMUTABLE] 原用户:', immutableUser);  // 未变

// 删除属性
const { age: _, ...userWithoutAge } = immutableUser;
console.log('  [IMMUTABLE] 去掉 age:', userWithoutAge);
console.log('  [IMMUTABLE] 原用户:', immutableUser);   // 未变

console.log('');

// ============================================================================
// 3. 浅拷贝陷阱
// ============================================================================
console.log('[3] 浅拷贝陷阱\n');

interface Address { city: string; zip: string }
interface Person { name: string; address: Address }

const alice: Person = {
  name: 'Alice',
  address: { city: 'New York', zip: '10001' }
};

// ⚠️ Spread 只做浅拷贝
const shallowCopy = { ...alice };
shallowCopy.name = 'Bob';             // 安全 — 基本类型
shallowCopy.address.city = 'LA';      // 危险！修改了嵌套对象

console.log('  shallowCopy.name:', shallowCopy.name);           // 'Bob'
console.log('  alice.name:', alice.name);                        // 'Alice' ✅ 未受影响
console.log('  shallowCopy.address.city:', shallowCopy.address.city); // 'LA'
console.log('  alice.address.city:', alice.address.city);         // 'LA' ❌ 被修改了！
console.log('  [WARN] 嵌套对象是同一个引用！');

// ✅ 正确的深层不可变更新
alice.address.city = 'New York'; // 先修复回来

const correctCopy: Person = {
  ...alice,
  address: { ...alice.address, city: 'LA' }  // 嵌套对象也展开
};

console.log('\n  correctCopy.address.city:', correctCopy.address.city); // 'LA'
console.log('  alice.address.city:', alice.address.city);              // 'New York' ✅

console.log('');

// ============================================================================
// 4. structuredClone — 深拷贝的标准方案
// ============================================================================
console.log('[4] structuredClone — 深拷贝\n');

const complex = {
  name: 'Alice',
  scores: [90, 85, 92],
  metadata: {
    created: new Date('2025-01-01'),
    tags: ['admin', 'user'],
  },
};

const deepCopy = structuredClone(complex);

// 修改深拷贝不影响原始对象
deepCopy.scores.push(100);
deepCopy.metadata.tags.push('superadmin');

console.log('  deepCopy.scores:', deepCopy.scores);            // [90, 85, 92, 100]
console.log('  original.scores:', complex.scores);              // [90, 85, 92] ✅
console.log('  deepCopy.metadata.tags:', deepCopy.metadata.tags); // 3 个
console.log('  original.metadata.tags:', complex.metadata.tags);  // 2 个 ✅
console.log('  [TRACE] structuredClone 是真正的深拷贝');

// structuredClone 的限制
console.log('\n  [WARN] structuredClone 不能拷贝:');
console.log('    - 函数 (Function)');
console.log('    - DOM 节点');
console.log('    - Symbol 属性');
console.log('    - 原型链（拷贝后是普通对象）');

console.log('');

// ============================================================================
// 5. Object.freeze — 浅冻结
// ============================================================================
console.log('[5] Object.freeze — 浅冻结\n');

const config = Object.freeze({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  nested: { retries: 3 }
});

// @ts-expect-error — 严格模式下 TypeScript 会报错
// config.apiUrl = 'https://other.com';  // TypeError in strict mode

// ⚠️ 嵌套对象未冻结！
config.nested.retries = 10;
console.log('  config.nested.retries:', config.nested.retries); // 10 — 被修改了！
console.log('  [WARN] Object.freeze 只冻结第一层');

// ✅ 深冻结实现
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj);
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value as object);
    }
  }
  return obj;
}

const frozenConfig = deepFreeze({
  apiUrl: 'https://api.example.com',
  nested: { retries: 3 }
});

try {
  (frozenConfig.nested as any).retries = 10; // 在严格模式下会报错
} catch {
  console.log('  [CAUGHT] 严格模式下深冻结对象不可修改');
}
console.log('  frozenConfig.nested.retries:', frozenConfig.nested.retries); // 3

console.log('');

// ============================================================================
// 6. ES2023 不可变数组方法
// ============================================================================
console.log('[6] ES2023 不可变数组方法\n');

const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
console.log('  原始数组:', numbers);

// toSorted — 排序但不修改原数组
const sortedNums = numbers.toSorted((a, b) => a - b);
console.log('  toSorted():', sortedNums);
console.log('  原数组不变:', numbers);

// toReversed — 翻转但不修改原数组
const reversed = numbers.toReversed();
console.log('  toReversed():', reversed);
console.log('  原数组不变:', numbers);

// with — 替换指定索引的值
const replaced = numbers.with(2, 99);
console.log('  with(2, 99):', replaced);
console.log('  原数组不变:', numbers);

// toSpliced — 删除/插入但不修改原数组
const spliced = numbers.toSpliced(1, 2, 10, 20);
console.log('  toSpliced(1, 2, 10, 20):', spliced);
console.log('  原数组不变:', numbers);

console.log('');

// ============================================================================
// 7. 不可变更新工具函数
// ============================================================================
console.log('[7] 不可变更新工具函数\n');

// 通用的不可变更新辅助
function updateAt<T>(arr: readonly T[], index: number, value: T): T[] {
  return arr.map((item, i) => (i === index ? value : item));
}

function removeAt<T>(arr: readonly T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

function insertAt<T>(arr: readonly T[], index: number, value: T): T[] {
  return [...arr.slice(0, index), value, ...arr.slice(index)];
}

function updateProp<T extends object, K extends keyof T>(
  obj: T, key: K, value: T[K]
): T {
  return { ...obj, [key]: value };
}

const items = ['apple', 'banana', 'cherry'];
console.log('  原始:', items);
console.log('  updateAt(1, "blueberry"):', updateAt(items, 1, 'blueberry'));
console.log('  removeAt(1):', removeAt(items, 1));
console.log('  insertAt(1, "grape"):', insertAt(items, 1, 'grape'));
console.log('  原始不变:', items);

const user = { name: 'Alice', age: 30 };
console.log('\n  原始用户:', user);
console.log('  updateProp(age, 31):', updateProp(user, 'age', 31));
console.log('  原始不变:', user);

console.log('');

// ============================================================================
// 8. 实战：不可变状态管理（模拟 Redux）
// ============================================================================
console.log('[8] 实战：不可变状态管理（模拟 Redux）\n');

interface TodoItem { id: number; text: string; done: boolean }
interface AppState { todos: TodoItem[]; filter: 'all' | 'active' | 'done' }

type Action =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: number }
  | { type: 'REMOVE_TODO'; id: number }
  | { type: 'SET_FILTER'; filter: AppState['filter'] };

let nextId = 1;

// Reducer — 纯函数，不可变更新
function todoReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { id: nextId++, text: action.text, done: false }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.id ? { ...t, done: !t.done } : t
        )
      };
    case 'REMOVE_TODO':
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.id)
      };
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    default:
      return state;
  }
}

// 模拟状态变化过程
let state: AppState = { todos: [], filter: 'all' };
console.log('  初始状态:', JSON.stringify(state));

state = todoReducer(state, { type: 'ADD_TODO', text: 'Learn FP' });
console.log('  添加 Todo:', JSON.stringify(state));

state = todoReducer(state, { type: 'ADD_TODO', text: 'Write code' });
console.log('  添加 Todo:', JSON.stringify(state));

const prevState = state;  // 保存引用
state = todoReducer(state, { type: 'TOGGLE_TODO', id: 1 });
console.log('  切换 Done:', JSON.stringify(state));

console.log('\n  [TRACE] prevState === state:', prevState === state);  // false — 新对象
console.log('  [TRACE] prevState.todos[1] === state.todos[1]:',
  prevState.todos[1] === state.todos[1]);  // true — 未修改的项共享引用（结构共享）
console.log('  [TRACE] 这就是"结构共享"— 只重建被修改的路径');

console.log('');

// ============================================================================
// 9. TypeScript 的只读类型
// ============================================================================
console.log('[9] TypeScript 的只读类型\n');

// Readonly — 浅层只读
type ReadonlyUser = Readonly<{ name: string; address: { city: string } }>;

// DeepReadonly — 深层只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type DeepReadonlyUser = DeepReadonly<{ name: string; address: { city: string } }>;

// 实际效果（编译时检查）
const readonlyUser: DeepReadonlyUser = {
  name: 'Alice',
  address: { city: 'NYC' }
};

// 以下代码如果取消注释，TypeScript 会报错：
// readonlyUser.name = 'Bob';              // Error!
// readonlyUser.address.city = 'LA';       // Error!

console.log('  DeepReadonly 类型确保编译时不可变性');
console.log('  Readonly<T> 只保护第一层');
console.log('  DeepReadonly<T> 递归保护所有层');

// ReadonlyArray
const readonlyArr: ReadonlyArray<number> = [1, 2, 3];
// readonlyArr.push(4);  // Error! Property 'push' does not exist
// readonlyArr[0] = 10;  // Error! Index signature only permits reading

console.log('  ReadonlyArray<T> 禁止所有修改操作');

console.log('');

// ============================================================================
// 10. 性能考虑：何时使用可变操作
// ============================================================================
console.log('[10] 性能考虑\n');

// 不可变操作在大数据量时会创建很多临时对象
// 用基准测试说明

const SIZE = 100_000;
const bigArray = Array.from({ length: SIZE }, (_, i) => i);

// 可变操作
const mutableStart = performance.now();
const mutableResult: number[] = [];
for (const x of bigArray) {
  if (x % 2 === 0) mutableResult.push(x * 2);
}
const mutableTime = performance.now() - mutableStart;

// 不可变操作（链式）
const immutableStart = performance.now();
const immutableResult = bigArray
  .filter(x => x % 2 === 0)
  .map(x => x * 2);
const immutableTime = performance.now() - immutableStart;

console.log(`  可变操作 (for + push): ${mutableTime.toFixed(2)}ms`);
console.log(`  不可变操作 (filter + map): ${immutableTime.toFixed(2)}ms`);
console.log(`  结果相同: ${mutableResult.length === immutableResult.length}`);

console.log('\n  [RULE] 经验法则:');
console.log('    • 数据量 < 10,000 → 优先不可变（可读性优先）');
console.log('    • 数据量 > 100,000 → 考虑可变操作或生成器');
console.log('    • 热路径（每秒调用数千次）→ 测量后决定');

console.log('\n[INFO] === 不可变数据操作模式演示结束 ===');
