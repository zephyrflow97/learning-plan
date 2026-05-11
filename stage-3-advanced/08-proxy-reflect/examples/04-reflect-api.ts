/**
 * @file 04-reflect-api.ts
 * @description Reflect API 的完整演示及其与 Proxy 的配合
 * @prerequisites Stage 1 Ch06 原型链, Stage 3 Ch02 装饰器
 * @related examples/01-proxy-traps.ts
 */

console.log('[INFO] === Reflect API 完整指南 ===\n');

// ============================================================================
// 1. Reflect vs 直接操作
// ============================================================================
console.log('[1] Reflect vs 直接操作\n');

const obj = { x: 1, y: 2 };

// 读取
console.log('  直接: obj.x =', obj.x);
console.log('  Reflect: Reflect.get =', Reflect.get(obj, 'x'));

// 设置
Reflect.set(obj, 'y', 200);
console.log('  Reflect.set(obj, "y", 200) → obj.y =', obj.y);

// 检查
console.log('  "x" in obj:', 'x' in obj);
console.log('  Reflect.has:', Reflect.has(obj, 'x'));

// 删除
const obj2 = { z: 3 };
Reflect.deleteProperty(obj2, 'z');
console.log('  删除后 obj2:', obj2);
console.log('');

// ============================================================================
// 2. 返回值语义 — Reflect 不抛异常
// ============================================================================
console.log('[2] 返回值语义\n');

const frozen = Object.freeze({ a: 1 });

// ❌ Object.defineProperty 失败会抛异常
try {
  Object.defineProperty(frozen, 'a', { value: 2 });
} catch (e) {
  console.error('  [ERROR] Object.defineProperty:', (e as Error).message);
}

// ✅ Reflect.defineProperty 返回 false
const success = Reflect.defineProperty(frozen, 'a', { value: 2 });
console.log('  Reflect.defineProperty 返回:', success); // false，不抛异常
console.log('');

// ============================================================================
// 3. receiver 参数 — this 绑定的关键
// ============================================================================
console.log('[3] receiver 参数详解\n');

const parent = {
  _value: 42,
  get value() {
    return this._value;
  }
};

const child = Object.create(parent);
child._value = 100;

console.log('  直接访问 child.value:', child.value); // 100

// 使用 Reflect.get 指定不同的 receiver
const anotherObj = { _value: 999 };
console.log('  Reflect.get(child, "value", anotherObj):', Reflect.get(child, 'value', anotherObj)); // 999

// Proxy 中正确使用 receiver
const proxyBad = new Proxy(child, {
  get(target, prop) {
    return target[prop]; // ❌ 丢失 receiver
  }
});

const proxyGood = new Proxy(child, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver); // ✅ 保留 receiver
  }
});

console.log('  proxyBad.value:', proxyBad.value);   // 100 (正确场景下可能出错)
console.log('  proxyGood.value:', proxyGood.value); // 100
console.log('');

// ============================================================================
// 4. Reflect.apply — 函数调用
// ============================================================================
console.log('[4] Reflect.apply\n');

function greet(greeting: string, name: string): string {
  return `${greeting}, ${name}!`;
}

console.log('  Function.call:', greet.call(null, 'Hello', 'Alice'));
console.log('  Reflect.apply:', Reflect.apply(greet, null, ['Hey', 'Bob']));

// 日志包装器
function createLogger<T extends (...args: any[]) => any>(fn: T): T {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      console.log(`  [CALL] ${target.name}(${args.join(', ')})`);
      const result = Reflect.apply(target, thisArg, args);
      console.log(`  [RETURN] ${result}`);
      return result;
    }
  }) as T;
}

const loggedGreet = createLogger(greet);
loggedGreet('Bonjour', 'Charlie');
console.log('');

// ============================================================================
// 5. Reflect.construct — 构造函数调用
// ============================================================================
console.log('[5] Reflect.construct\n');

class User {
  constructor(public name: string, public age: number) {}
}

const user1 = new User('Alice', 30);
const user2 = Reflect.construct(User, ['Bob', 25]);

console.log('  new User:', user1);
console.log('  Reflect.construct:', user2);

// 高级用法：指定 newTarget 改变实例原型
class Admin extends User {}
const mixed = Reflect.construct(User, ['Charlie', 28], Admin);
console.log('  mixed instanceof Admin:', mixed instanceof Admin); // true
console.log('  mixed instanceof User:', mixed instanceof User);   // true
console.log('');

// ============================================================================
// 6. Reflect.ownKeys — 获取所有键（含 Symbol）
// ============================================================================
console.log('[6] Reflect.ownKeys\n');

const sym = Symbol('secret');
const objWithSym = { a: 1, b: 2, [sym]: 'hidden' };

console.log('  Object.keys:', Object.keys(objWithSym));            // ['a', 'b']
console.log('  Object.getOwnPropertySymbols:', Object.getOwnPropertySymbols(objWithSym)); // [Symbol(secret)]
console.log('  Reflect.ownKeys:', Reflect.ownKeys(objWithSym));    // ['a', 'b', Symbol(secret)]
console.log('');

// ============================================================================
// 7. 实战：通用深克隆（使用 Reflect API）
// ============================================================================
console.log('[7] 实战：Reflect 深克隆\n');

function deepClone<T>(source: T): T {
  if (source === null || typeof source !== 'object') return source;
  if (Array.isArray(source)) return source.map(deepClone) as any;

  const clone = Object.create(Reflect.getPrototypeOf(source as object));

  Reflect.ownKeys(source as object).forEach(key => {
    const desc = Reflect.getOwnPropertyDescriptor(source as object, key);
    if (desc) {
      const value = Reflect.get(source as object, key);
      Reflect.defineProperty(clone, key, { ...desc, value: deepClone(value) });
    }
  });

  return clone;
}

const original = {
  a: 1,
  b: { c: 2, d: { e: 3 } },
  arr: [1, { nested: true }]
};

const cloned = deepClone(original);
cloned.b.c = 999;
console.log('  original.b.c:', original.b.c); // 2 (未受影响)
console.log('  cloned.b.c:', cloned.b.c);     // 999
console.log('  cloned === original:', cloned === original); // false
console.log('');

// ============================================================================
// 8. 实战：安全属性访问
// ============================================================================
console.log('[8] 实战：安全属性访问\n');

function safeGet(obj: any, path: string, defaultValue: any = undefined): any {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return defaultValue;
    if (!Reflect.has(current, key)) return defaultValue;
    current = Reflect.get(current, key);
  }

  return current;
}

const data = { user: { profile: { name: 'Alice', address: { city: 'Beijing' } } } };

console.log('  user.profile.name:', safeGet(data, 'user.profile.name'));
console.log('  user.profile.age:', safeGet(data, 'user.profile.age', 30));
console.log('  user.settings.theme:', safeGet(data, 'user.settings.theme', 'light'));
console.log('');

// ============================================================================
// 9. 实战：元数据注册系统
// ============================================================================
console.log('[9] 实战：元数据注册\n');

const METADATA = Symbol('metadata');

class MetadataRegistry {
  static define(target: object, prop: PropertyKey, meta: Record<string, any>): void {
    const existing = Reflect.get(target, METADATA) || {};
    existing[prop] = meta;
    Reflect.defineProperty(target, METADATA, {
      value: existing, enumerable: false, writable: true
    });
  }

  static get(target: object, prop: PropertyKey): Record<string, any> | undefined {
    const all = Reflect.get(target, METADATA);
    return all?.[prop];
  }
}

const userObj = { name: '', age: 0 };
MetadataRegistry.define(userObj, 'name', { type: 'string', label: '用户名' });
MetadataRegistry.define(userObj, 'age', { type: 'number', label: '年龄' });

console.log('  name 元数据:', MetadataRegistry.get(userObj, 'name'));
console.log('  age 元数据:', MetadataRegistry.get(userObj, 'age'));
console.log('  Object.keys 不含元数据:', Object.keys(userObj));
console.log('');

// ============================================================================
// 10. 性能对比
// ============================================================================
console.log('[10] 性能对比\n');

const iterations = 1_000_000;
const testObj = { a: 1 };

console.time('  直接访问');
for (let i = 0; i < iterations; i++) { const _ = testObj.a; }
console.timeEnd('  直接访问');

console.time('  Reflect.get');
for (let i = 0; i < iterations; i++) { const _ = Reflect.get(testObj, 'a'); }
console.timeEnd('  Reflect.get');

console.log(`
  结论:
  - Reflect 比直接访问慢 ~2-3x
  - 在 Proxy trap 中使用 Reflect 是最佳实践
  - 业务场景中这个开销可忽略
  - 性能关键路径仍应避免
`);

console.log('[INFO] === 示例结束 ===');
