/**
 * @file 01-proxy-traps.ts
 * @description 演示 Proxy 的 13 种 trap，每种 trap 配有独立示例和日志
 * @prerequisites Stage 1 Ch03 对象和数组, Stage 1 Ch06 原型链
 * @related examples/04-reflect-api.ts
 */

console.log('[INFO] === Proxy 13 种 Trap 完整演示 ===\n');

// ============================================================================
// 1. get Trap — 拦截属性读取
// ============================================================================
console.log('[1] get Trap — 拦截属性读取');

const user = { name: 'Alice', age: 30, _password: 'secret123' };

const userProxy = new Proxy(user, {
  get(target, prop, receiver) {
    if (typeof prop === 'string' && prop.startsWith('_')) {
      console.log(`  [WARN] 尝试访问私有属性: ${prop}`);
      return undefined;
    }
    console.log(`  [TRACE] 读取属性: ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  }
});

console.log('  userProxy.name:', userProxy.name);
console.log('  userProxy._password:', userProxy._password);
console.log('');

// ============================================================================
// 2. set Trap — 拦截属性设置（带验证）
// ============================================================================
console.log('[2] set Trap — 拦截属性设置');

const validated = new Proxy({ name: '', age: 0 }, {
  set(target, prop, value, receiver) {
    if (prop === 'age' && (typeof value !== 'number' || value < 0 || value > 150)) {
      console.error(`  [ERROR] 非法年龄: ${value}`);
      return false;
    }
    console.log(`  [SET] ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
});

validated.age = 25;   // [SET] age = 25
validated.age = -5;   // [ERROR] 非法年龄: -5
validated.name = 'Bob'; // [SET] name = Bob
console.log('  validated:', validated);
console.log('');

// ============================================================================
// 3. has Trap — 拦截 in 操作符
// ============================================================================
console.log('[3] has Trap — 拦截 in 操作符');

const secretData = { publicKey: 'abc', _privateKey: 'xyz', apiToken: 'tok' };

const secureProxy = new Proxy(secretData, {
  has(target, prop) {
    if (typeof prop === 'string' && prop.startsWith('_')) {
      return false; // 隐藏私有属性
    }
    return Reflect.has(target, prop);
  }
});

console.log("  'publicKey' in secureProxy:", 'publicKey' in secureProxy);     // true
console.log("  '_privateKey' in secureProxy:", '_privateKey' in secureProxy); // false
console.log('');

// ============================================================================
// 4. deleteProperty Trap — 拦截 delete 操作
// ============================================================================
console.log('[4] deleteProperty Trap — 拦截 delete 操作');

const protectedObj = { id: 1, name: 'Important', temp: 'can delete' };

const guardedProxy = new Proxy(protectedObj, {
  deleteProperty(target, prop) {
    if (prop === 'id' || prop === 'name') {
      console.error(`  [ERROR] 不允许删除受保护属性: ${String(prop)}`);
      return false;
    }
    console.log(`  [DELETE] ${String(prop)}`);
    return Reflect.deleteProperty(target, prop);
  }
});

delete guardedProxy.temp; // [DELETE] temp
delete guardedProxy.id;   // [ERROR] 不允许删除
console.log('  guardedProxy:', guardedProxy);
console.log('');

// ============================================================================
// 5. ownKeys Trap — 拦截键枚举
// ============================================================================
console.log('[5] ownKeys Trap — 过滤私有属性');

const dataWithSecrets = {
  username: 'alice', email: 'alice@test.com',
  _sessionToken: 'abc', _internalId: 42
};

const filteredProxy = new Proxy(dataWithSecrets, {
  ownKeys(target) {
    return Reflect.ownKeys(target).filter(
      key => typeof key !== 'string' || !key.startsWith('_')
    );
  },
  getOwnPropertyDescriptor(target, prop) {
    if (typeof prop === 'string' && prop.startsWith('_')) return undefined;
    return Reflect.getOwnPropertyDescriptor(target, prop);
  }
});

console.log('  可见的键:', Object.keys(filteredProxy));  // ['username', 'email']
console.log('  原始的键:', Object.keys(dataWithSecrets)); // 全部4个
console.log('');

// ============================================================================
// 6. getOwnPropertyDescriptor Trap
// ============================================================================
console.log('[6] getOwnPropertyDescriptor Trap — 修改描述符');

const descProxy = new Proxy({ x: 1 }, {
  getOwnPropertyDescriptor(target, prop) {
    const desc = Reflect.getOwnPropertyDescriptor(target, prop);
    if (desc) return { ...desc, writable: false }; // 标记为不可写
    return desc;
  }
});

const desc = Object.getOwnPropertyDescriptor(descProxy, 'x');
console.log('  x.writable:', desc?.writable); // false
console.log('');

// ============================================================================
// 7. defineProperty Trap
// ============================================================================
console.log('[7] defineProperty Trap — 强制可枚举');

const defProxy = new Proxy({}, {
  defineProperty(target, prop, descriptor) {
    console.log(`  [DEFINE] ${String(prop)}, 强制 enumerable=true`);
    return Reflect.defineProperty(target, prop, { ...descriptor, enumerable: true });
  }
});

Object.defineProperty(defProxy, 'hidden', { value: 'secret', enumerable: false });
console.log('  Object.keys:', Object.keys(defProxy)); // ['hidden'] (被强制可枚举)
console.log('');

// ============================================================================
// 8. preventExtensions Trap
// ============================================================================
console.log('[8] preventExtensions Trap');

const extProxy = new Proxy({}, {
  preventExtensions(target) {
    console.log('  [WARN] 对象被冻结扩展');
    Reflect.preventExtensions(target);
    return true;
  }
});

Object.preventExtensions(extProxy);
console.log('');

// ============================================================================
// 9. isExtensible Trap
// ============================================================================
console.log('[9] isExtensible Trap');

const isExtProxy = new Proxy({}, {
  isExtensible(target) {
    const result = Reflect.isExtensible(target);
    console.log(`  [CHECK] isExtensible = ${result}`);
    return result;
  }
});

Object.isExtensible(isExtProxy);
console.log('');

// ============================================================================
// 10. getPrototypeOf Trap
// ============================================================================
console.log('[10] getPrototypeOf Trap');

const protoProxy = new Proxy({}, {
  getPrototypeOf(target) {
    console.log('  [TRACE] 获取原型');
    return Reflect.getPrototypeOf(target);
  }
});
Object.getPrototypeOf(protoProxy);
console.log('');

// ============================================================================
// 11. setPrototypeOf Trap — 禁止修改原型
// ============================================================================
console.log('[11] setPrototypeOf Trap — 禁止修改');

const noProtoChange = new Proxy({}, {
  setPrototypeOf(target, proto) {
    console.log('  [BLOCK] 禁止修改原型链');
    return false;
  }
});

try {
  Object.setPrototypeOf(noProtoChange, Array.prototype);
} catch (e) {
  console.error('  [ERROR]', (e as Error).message);
}
console.log('');

// ============================================================================
// 12. apply Trap — 拦截函数调用
// ============================================================================
console.log('[12] apply Trap — 拦截函数调用');

function add(a: number, b: number): number { return a + b; }

const loggedAdd = new Proxy(add, {
  apply(target, thisArg, args) {
    console.log(`  [CALL] ${target.name}(${args.join(', ')})`);
    const result = Reflect.apply(target, thisArg, args);
    console.log(`  [RETURN] ${result}`);
    return result;
  }
});

loggedAdd(5, 3);
console.log('');

// ============================================================================
// 13. construct Trap — 拦截 new 操作符
// ============================================================================
console.log('[13] construct Trap — 拦截 new');

class Animal {
  constructor(public species: string, public legs: number) {}
}

const TrackedAnimal = new Proxy(Animal, {
  construct(target, args, newTarget) {
    console.log(`  [NEW] ${target.name}(${args.join(', ')})`);
    return Reflect.construct(target, args, newTarget);
  }
});

const cat = new TrackedAnimal('Cat', 4);
console.log('  cat:', cat);
console.log('');

// ============================================================================
// 不变性约束 (Invariants) 演示
// ============================================================================
console.log('[重要] 不变性约束 — Proxy 必须遵守的规则');

const frozen = Object.freeze({ x: 1 });
try {
  const badProxy = new Proxy(frozen, {
    get() { return 999; } // 尝试为冻结属性返回不同值
  });
  badProxy.x;
} catch (e) {
  console.error('  [ERROR] 不变性违反:', (e as Error).message);
}

console.log('\n[INFO] === 示例结束 ===');
