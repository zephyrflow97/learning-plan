# 第 8 章：Proxy 与 Reflect — JavaScript 的元编程魔法

> *"Any sufficiently advanced technology is indistinguishable from magic."*
> — Arthur C. Clarke, *Profiles of the Future*
>
> 如果说 JavaScript 的 `class` 让你扮演建筑师，`decorator` 让你扮演魔法师，那么 `Proxy` 让你扮演**造物主**。你可以重新定义"读取属性"的含义、"赋值"的行为、"调用函数"的过程。这是语言提供给你的最底层的钩子——你在改写对象的**存在规则**。Vue 3 的整个响应式系统、Immer 的不可变数据结构、MobX 的自动依赖追踪——都建立在这个 "sufficiently advanced" 的 API 之上。

## 📖 本章内容

1. [元编程的三个层次](#1-元编程的三个层次) — 内省、自修改、拦截
2. [Proxy 的 13 种 Trap](#2-proxy-的-13-种-trap) — 拦截对象的基本操作
3. [Reflect API](#3-reflect-api) — Proxy 的默认行为手册
4. [实战：响应式数据存储](#4-实战响应式数据存储) — 简化版 Vue 3 reactive()
5. [实战：验证代理](#5-实战验证代理) — 运行时类型检查
6. [实战：惰性初始化与虚拟化](#6-实战惰性初始化与虚拟化) — 按需加载
7. [Proxy 的限制与性能](#7-proxy-的限制与性能) — 不可代理的对象、性能开销
8. [Proxy vs 装饰器](#8-proxy-vs-装饰器) — 运行时拦截 vs 声明时修饰
9. [🧘 Zen of Code：元编程的边界](#9--zen-of-code元编程的边界)
10. [最佳实践与常见陷阱](#10-最佳实践与常见陷阱)
11. [本章总结](#11-本章总结)
12. [章节练习](#12-章节练习)

---

## 1. 元编程的三个层次

> 🎭 **The Drama：从观察者到篡改者的权力升级**
>
> 元编程 (Metaprogramming) 是"写操作代码的代码"。想象你在玩一款 RPG 游戏——元编程就是修改游戏规则本身，而不仅仅是在规则内操作角色。在 JavaScript 中，元编程有三个层次的权力：
>
> - **Level 1：内省 (Introspection)** — 你是**观察者**。你可以查看对象的结构（`Object.keys()`、`typeof`、`instanceof`），但不能改变它的行为。就像拿着放大镜观察蚂蚁，不干涉它的行动。
>
> - **Level 2：自修改 (Self-Modification)** — 你是**外科医生**。你可以修改对象的结构（`Object.defineProperty`、`Object.setPrototypeOf`），在运行时添加/删除属性、修改原型链。就像给机器人装一只新手臂。
>
> - **Level 3：拦截 (Intercession)** — 你是**造物主**。你可以**重新定义基本操作的语义**。当有人读取 `obj.x` 时，不是去查找 `x` 属性，而是执行你写的函数。**Proxy 就在这一层**。

在 ES6 之前，JavaScript 只有 Level 1 和 Level 2。Proxy 的加入让 JavaScript 进入了 Level 3——真正的元对象协议 (Meta-Object Protocol, MOP)。

> 🧠 **CS Master's Bridge：Proxy 的学术谱系**
>
> Proxy 的设计灵感来自 CLOS (Common Lisp Object System) 的 Meta-Object Protocol。MOP 的核心思想是：对象的基本操作（读属性、写属性、调用方法）不应该被硬编码在语言运行时中，而应该是**可定制的**。JavaScript 的 Proxy 实现了 MOP 的子集——13 个可拦截的"基本操作"（称为 Internal Methods），对应 `[[Get]]`、`[[Set]]`、`[[HasProperty]]` 等规范内部方法。

### 元编程工具对比

| 工具 | 层次 | 能力 | 示例 |
|------|------|------|------|
| `Object.keys()` | Level 1 (内省) | 查看对象的键 | `Object.keys(user)` |
| `typeof` / `instanceof` | Level 1 | 检查类型 | `typeof x === 'object'` |
| `Object.defineProperty()` | Level 2 (自修改) | 修改属性描述符 | 拦截单个属性的 get/set |
| `Object.setPrototypeOf()` | Level 2 | 修改原型链 | 动态改变继承关系 |
| **`Proxy`** | **Level 3 (拦截)** | **重新定义基本操作** | 拦截所有属性访问 |
| **`Reflect`** | Level 3 辅助 | 调用默认操作 | `Reflect.get(target, prop)` |

> 完整的元编程层次演示见 [`examples/01-proxy-traps.ts`](./examples/01-proxy-traps.ts)

---

## 2. Proxy 的 13 种 Trap

> 🌌 **The Big Picture：Proxy — 对象的替身演员**
>
> 在电影中，危险镜头由替身完成。观众看到的是主角在跳楼，实际上跳楼的是替身。**Proxy 就是对象的替身**——外界以为自己在和原始对象交互，实际上所有操作都被 Proxy 拦截、修改、然后（也许）转发给原始对象。
>
> Vue 3 的整个响应式系统就是：你以为你在读写 `state.count`，实际上你在和一个 Proxy 对话，它会悄悄通知 UI 更新。

Proxy 接收两个参数：

```typescript
const proxy = new Proxy(target, handler);
// target: 被代理的原始对象
// handler: 包含"拦截器"(trap) 的对象
```

每个 trap 对应 ECMAScript 规范中定义的一个"内部方法"(Internal Method)：

| Trap | 触发时机 | 对应内部方法 | 示例操作 |
|------|---------|-------------|---------|
| **`get(target, prop, receiver)`** | 读取属性 | `[[Get]]` | `obj.x`、`obj['x']` |
| **`set(target, prop, value, receiver)`** | 设置属性 | `[[Set]]` | `obj.x = 1` |
| **`has(target, prop)`** | `in` 操作符 | `[[HasProperty]]` | `'x' in obj` |
| **`deleteProperty(target, prop)`** | `delete` 操作符 | `[[Delete]]` | `delete obj.x` |
| **`ownKeys(target)`** | 枚举键 | `[[OwnPropertyKeys]]` | `Object.keys(obj)` |
| **`getOwnPropertyDescriptor(target, prop)`** | 获取描述符 | `[[GetOwnProperty]]` | `Object.getOwnPropertyDescriptor()` |
| **`defineProperty(target, prop, desc)`** | 定义属性 | `[[DefineOwnProperty]]` | `Object.defineProperty()` |
| **`preventExtensions(target)`** | 禁止扩展 | `[[PreventExtensions]]` | `Object.preventExtensions()` |
| **`isExtensible(target)`** | 检查可扩展 | `[[IsExtensible]]` | `Object.isExtensible()` |
| **`getPrototypeOf(target)`** | 获取原型 | `[[GetPrototypeOf]]` | `Object.getPrototypeOf()` |
| **`setPrototypeOf(target, proto)`** | 设置原型 | `[[SetPrototypeOf]]` | `Object.setPrototypeOf()` |
| **`apply(target, thisArg, args)`** | 调用函数 | `[[Call]]` | `fn()`、`fn.call(...)` |
| **`construct(target, args, newTarget)`** | `new` 操作符 | `[[Construct]]` | `new Fn(...)` |

### 2.1 最常用的 Trap：`get` 和 `set`

```typescript
const user = { name: 'Alice', age: 30 };

const proxy = new Proxy(user, {
  get(target, prop, receiver) {
    console.log(`[READ] ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`[WRITE] ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
});
// ... 完整实现见 examples/01-proxy-traps.ts
```

> ⚛️ **为什么要用 `Reflect.get()` 而不是直接 `target[prop]`？**
>
> 因为 `Reflect.get()` 的第三个参数 `receiver` 保证了 `this` 绑定的正确性。当原始对象有 getter 时，直接 `target[prop]` 会让 getter 的 `this` 指向 `target`，而不是 `proxy`。使用 `Reflect` 可以确保 `this` 始终指向代理对象。这个细节在继承场景中至关重要。

### 2.2 `has` Trap — 拦截 `in` 操作符

```typescript
const safeProxy = new Proxy(secretData, {
  has(target, prop) {
    // 隐藏以 _ 开头的私有属性
    if (String(prop).startsWith('_')) return false;
    return Reflect.has(target, prop);
  }
});
'_password' in safeProxy; // false (虽然实际存在)
```

### 2.3 `apply` 和 `construct` — 函数与类的拦截

```typescript
// apply: 拦截函数调用
const loggingFn = new Proxy(greet, {
  apply(target, thisArg, args) {
    console.log(`[CALL] ${target.name}(${args})`);
    return Reflect.apply(target, thisArg, args);
  }
});

// construct: 拦截 new 操作符
const TrackedUser = new Proxy(User, {
  construct(target, args, newTarget) {
    console.log(`[NEW] 创建实例: ${args[0]}`);
    return Reflect.construct(target, args, newTarget);
  }
});
```

### 2.4 不变性约束 (Invariants)

Proxy 并不是无所不能。ECMAScript 规范为 trap 定义了**不变性约束**——如果目标对象有某些限制，Proxy 必须遵守：

```typescript
const frozen = Object.freeze({ x: 1 });
const proxy = new Proxy(frozen, {
  get() { return 999; } // ❌ 不可配置属性的值不能被修改
});
proxy.x; // TypeError: 违反不变性约束
```

**核心约束**：
- 如果 `target[prop]` 不可写且不可配置，`get` trap 必须返回相同值
- 如果 `target[prop]` 不可配置且无 setter，`set` trap 不能成功
- `ownKeys` 必须返回 `target` 的所有不可配置属性

> 完整的 13 种 trap 演示见 [`examples/01-proxy-traps.ts`](./examples/01-proxy-traps.ts)

---

## 3. Reflect API

> ⚛️ **Reflect — Proxy 的默认行为手册**
>
> 每个 Proxy trap 都有一个对应的 `Reflect` 方法。`Reflect.get(target, prop)` 就是"不加任何拦截的原始 get 操作"。在 Proxy 的 handler 中调用 `Reflect`，就像替身演员在完成特技后，把剩下的台词交回给主角来说。

### 3.1 为什么需要 Reflect？

在 Proxy 之前，JavaScript 的对象操作分散在多个 API 中，行为不一致：

```typescript
// 旧方式：API 分散，行为各异
Object.keys(obj);                    // 方法
delete obj.x;                         // 操作符
'x' in obj;                           // 操作符
Object.defineProperty(obj, 'x', {}); // 抛异常

// Reflect：统一接口，一致的返回值
Reflect.ownKeys(obj);               // 函数
Reflect.deleteProperty(obj, 'x');    // 返回 boolean
Reflect.has(obj, 'x');               // 返回 boolean
Reflect.defineProperty(obj, 'x', {}); // 返回 boolean
```

**Reflect 的三大优势**：

1. **统一接口**：所有对象操作都变成函数调用
2. **返回值语义**：`Reflect.defineProperty()` 返回布尔值（成功/失败），而 `Object.defineProperty()` 失败会抛异常
3. **与 Proxy 对称**：Reflect 方法签名与 Proxy trap 完全一致

### 3.2 Reflect 方法一览

| Reflect 方法 | 对应操作 | 返回值 |
|-------------|---------|-------|
| `Reflect.get(target, prop, receiver?)` | `target[prop]` | 属性值 |
| `Reflect.set(target, prop, value, receiver?)` | `target[prop] = value` | `boolean` |
| `Reflect.has(target, prop)` | `prop in target` | `boolean` |
| `Reflect.deleteProperty(target, prop)` | `delete target[prop]` | `boolean` |
| `Reflect.ownKeys(target)` | 获取所有键 | `(string\|symbol)[]` |
| `Reflect.apply(fn, thisArg, args)` | `fn.apply(thisArg, args)` | 函数返回值 |
| `Reflect.construct(Ctor, args, newTarget?)` | `new Ctor(...args)` | 实例对象 |

> 其余 6 个方法（`getOwnPropertyDescriptor`、`defineProperty`、`preventExtensions`、`isExtensible`、`getPrototypeOf`、`setPrototypeOf`）在表中省略，但同样与 Proxy trap 一一对应。

### 3.3 receiver 参数的重要性

`receiver` 是 Proxy 和 Reflect 中最容易被忽略的参数，也是最关键的参数之一：

```typescript
const parent = {
  _value: 42,
  get value() { return this._value; }
};
const child = Object.create(parent);
child._value = 100;

// ❌ target[prop] 丢失了正确的 this
const proxyBad = new Proxy(child, {
  get(target, prop) { return target[prop]; }
});
// ✅ Reflect.get 保留了正确的 this
const proxyGood = new Proxy(child, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  }
});
```

> 完整的 Reflect API 演示见 [`examples/04-reflect-api.ts`](./examples/04-reflect-api.ts)

---

## 4. 实战：响应式数据存储

> 🎭 **The Drama：Vue 2 → Vue 3 的血泪迁移**
>
> Vue 2 使用 `Object.defineProperty` 实现响应式，但它有致命缺陷：
> - **无法检测新增属性**：`obj.newProp = 1` 不会触发更新（需要 `Vue.set()`）
> - **无法检测数组索引变化**：`arr[0] = 1` 不会触发更新
> - **无法检测 `delete` 操作**：`delete obj.x` 不会触发更新
>
> Vue 3 用 Proxy 一次性解决了所有问题。这次迁移是 Vue 3 最大的 breaking change，也是放弃 IE11 支持的直接原因——因为 **Proxy 无法被 polyfill**。

### 4.1 响应式系统三要素

一个最小的响应式系统需要三个核心函数：

```typescript
// 1. reactive() — 创建响应式代理
function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);  // 收集依赖
      const value = Reflect.get(target, key, receiver);
      // 递归代理嵌套对象
      if (value !== null && typeof value === 'object')
        return reactive(value);
      return value;
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) trigger(target, key); // 触发更新
      return result;
    }
  });
}
// ... 完整实现见 examples/02-reactive-store.ts
```

### 4.2 依赖收集与触发

```typescript
// 2. track() — "谁在读这个属性？"
function track(target: object, key: PropertyKey) {
  if (!activeEffect) return;
  // WeakMap<对象, Map<属性, Set<effect>>>
  // ... 完整实现见 examples/02-reactive-store.ts
}

// 3. trigger() — "这个属性变了，通知所有人"
function trigger(target: object, key: PropertyKey) {
  // 找到所有依赖这个属性的 effect，执行它们
  // ... 完整实现见 examples/02-reactive-store.ts
}
```

### 4.3 使用示例

```typescript
const state = reactive({ count: 0 });

effect(() => {
  console.log(`count = ${state.count}`);
});
// 初始输出: count = 0

state.count++;  // 自动输出: count = 1
state.count++;  // 自动输出: count = 2
```

> 🧠 **CS Master's Bridge：Vue 3 的真实实现**
>
> 真实的 Vue 3 响应式系统（`@vue/reactivity`）使用：
> - `WeakMap` 存储对象 → Proxy 的映射（避免重复代理）
> - `targetMap: WeakMap<object, Map<key, Set<Effect>>>` 追踪依赖关系
> - `effect` 函数栈管理嵌套 effect
> - `ref()` 为基本类型创建响应式包装
> - `computed()` 缓存计算结果，惰性求值
>
> 核心代码约 500 行，完整实现见 Vue 3 源码 `@vue/reactivity` 包。

> 完整的响应式存储实现见 [`examples/02-reactive-store.ts`](./examples/02-reactive-store.ts)

---

## 5. 实战：验证代理

> 🌌 **The Big Picture：运行时类型检查的最后一道防线**
>
> TypeScript 的类型检查在编译时就消失了。当数据来自外部（API、用户输入、localStorage）时，你需要运行时验证。Zod 是声明式的验证库，而 Proxy 可以实现**透明的、自动的**验证——你只需要像操作普通对象一样操作，Proxy 会在后台检查每一次赋值。

### 5.1 基础类型验证

```typescript
function createValidator<T extends object>(
  schema: Record<string, string>
): T {
  return new Proxy({} as T, {
    set(target, prop, value) {
      const expectedType = schema[String(prop)];
      if (typeof value !== expectedType) {
        throw new TypeError(
          `${String(prop)} 期望 ${expectedType}，` +
          `实际 ${typeof value}`
        );
      }
      return Reflect.set(target, prop, value);
    }
  });
}
// ... 完整实现见 examples/03-validation-proxy.ts
```

### 5.2 使用示例

```typescript
const user = createValidator<{ name: string; age: number }>({
  name: 'string', age: 'number'
});

user.name = 'Alice';  // ✅ 成功
user.age = 30;        // ✅ 成功
user.age = '30';      // ❌ TypeError!
```

### 5.3 高级验证：范围、正则、自定义规则

真实场景中，类型检查远远不够。你需要范围约束、正则匹配、自定义逻辑：

```typescript
// 高级验证规则
const product = createAdvancedValidator<Product>({
  name:  { type: 'string', minLength: 3, maxLength: 50 },
  price: { type: 'number', min: 0, max: 1000000 },
  category: { type: 'string', enum: ['Electronics', 'Books'] },
  stock: { type: 'number', custom: v => Number.isInteger(v) }
});
// ... 完整实现见 examples/03-validation-proxy.ts
```

### 5.4 Proxy 验证 vs Zod/Yup

| 维度 | Proxy 验证 | Zod/Yup |
|------|-----------|---------|
| **验证方式** | 隐式（赋值时自动触发） | 显式（调用 `.parse()`） |
| **学习成本** | 需理解 Proxy | 声明式 API，易上手 |
| **类型推导** | 手动维护 | 自动推导（Zod） |
| **生态** | 自己造轮子 | 成熟社区，错误消息友好 |
| **适用场景** | 库/框架内部 | 业务代码、表单验证 |

**推荐策略**：业务代码用 Zod，框架/库内部用 Proxy。

> 完整的验证代理实现见 [`examples/03-validation-proxy.ts`](./examples/03-validation-proxy.ts)

---

## 6. 实战：惰性初始化与虚拟化

Proxy 不只能拦截已有属性——它可以**凭空创造**属性。这带来了三种强大的模式。

### 6.1 虚拟属性 (Virtual Property)

属性不真正存储在对象中，每次访问动态计算：

```typescript
const lazyUser = new Proxy({
  firstName: 'John', lastName: 'Doe'
}, {
  get(target, prop) {
    if (prop === 'fullName')
      return `${target.firstName} ${target.lastName}`;
    return Reflect.get(target, prop);
  }
});
lazyUser.fullName; // 'John Doe' (动态计算)
```

### 6.2 惰性加载 (Lazy Loading)

首次访问时才加载数据，后续从缓存读取：

```typescript
const db = new Proxy({} as Record<string, any>, {
  get(target, tableName: string) {
    if (!(tableName in target)) {
      console.log(`[LAZY] 加载表 ${tableName}`);
      target[tableName] = loadTable(tableName);
    }
    return target[tableName];
  }
});
db.users;    // [LAZY] 加载表 users
db.users;    // 第二次不再加载
```

### 6.3 无限数组 (Infinite Array)

```typescript
const doubles = new Proxy([], {
  get(target, prop) {
    const idx = Number(prop);
    if (Number.isInteger(idx) && idx >= 0)
      return idx * 2; // 无限生成
    return Reflect.get(target, prop);
  }
});
doubles[100]; // 200
doubles[9999]; // 19998
```

> 这三种模式的核心思想一致：**Proxy 让对象的行为从"存储驱动"变成了"逻辑驱动"**。

---

## 7. Proxy 的限制与性能

### 7.1 不可代理的对象

以下对象**无法被 Proxy 正常代理**（或代理后行为异常）：

```typescript
// ❌ Date、Map、Set、WeakMap、WeakSet
const dateProxy = new Proxy(new Date(), {});
dateProxy.getTime(); // TypeError!

const mapProxy = new Proxy(new Map(), {});
mapProxy.set('a', 1); // TypeError!
```

**原因**：这些对象使用"内部槽"（Internal Slots，如 `[[DateValue]]`、`[[MapData]]`），Proxy 只能拦截属性访问，无法拦截内部槽的访问。

**解决方案**：包装对象的方法，而不是直接代理：

```typescript
function createMapProxy<K, V>(map: Map<K, V>) {
  return new Proxy(map, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      // 绑定 this 到原始 Map
      if (typeof value === 'function')
        return value.bind(target);
      return value;
    }
  });
}
```

### 7.2 性能开销

Proxy 的性能开销来自两方面：

1. **函数调用开销**：每次属性访问都要调用 trap 函数
2. **JIT 优化失效**：V8 编译器难以优化 Proxy 的动态行为

**基准参考**（1000 万次属性访问）：

```
普通对象:              ~15ms
Object.defineProperty: ~150ms  (10x)
Proxy:                 ~300ms  (20x)
```

> 🧰 **Toolbox：性能建议**
>
> - **不要过度代理**：只在真正需要拦截的地方用 Proxy
> - **避免深层嵌套**：递归代理让 trap 调用次数指数增长
> - **缓存代理对象**：用 `WeakMap` 避免对同一对象重复创建 Proxy
> - **热路径禁区**：渲染循环、动画帧中避免 Proxy

### 7.3 可撤销代理 (Revocable Proxy)

`Proxy.revocable()` 创建可以被"销毁"的代理。撤销后，任何操作都会抛出 `TypeError`：

```typescript
const { proxy, revoke } = Proxy.revocable({ x: 1 }, {
  get(target, prop) {
    return Reflect.get(target, prop);
  }
});

proxy.x;   // 1
revoke();  // 撤销代理
proxy.x;   // TypeError: 代理已被撤销
```

**使用场景**：
- **临时授权**：用户会话结束后撤销数据访问权限
- **内存管理**：撤销后 target 可被 GC 回收
- **安全沙箱**：限制第三方代码的访问时间窗口

---

## 8. Proxy vs 装饰器

> 🧘 **Zen of Code：两种元编程路径的选择**
>
> Proxy 和装饰器都能改变对象的行为，但它们工作在不同的时间点：
> - **装饰器**：在**类定义时**修改类/方法（编译时元编程）
> - **Proxy**：在**对象使用时**拦截操作（运行时元编程）
>
> 一个在建筑图纸上改，一个在入住后改。两者不是替代关系，而是互补关系。

### 8.1 对比表

| 维度 | Proxy | 装饰器 |
|------|-------|--------|
| **作用时机** | 运行时（对象创建后） | 编译时（类定义时） |
| **作用对象** | 任何对象/函数 | 类、方法、属性、参数 |
| **拦截范围** | 所有基本操作 | 方法调用、属性访问 |
| **透明性** | 完全透明（外部无感知） | 可见（代码中声明） |
| **性能** | 运行时开销（~20x） | 编译时处理，运行时开销小 |
| **适用场景** | 动态拦截、响应式、验证 | 日志、权限、缓存、DI |

### 8.2 示例对比

**装饰器方式**（编译时修饰）：

```typescript
class Calculator {
  @Log  // 声明式：在定义时就决定了要记录日志
  add(a: number, b: number) { return a + b; }
}
```

**Proxy 方式**（运行时拦截）：

```typescript
const calculator = new Proxy(new Calculator(), {
  get(target, prop) {
    const val = Reflect.get(target, prop);
    if (typeof val === 'function')
      return new Proxy(val, {
        apply(fn, thisArg, args) {
          console.log(`[CALL] ${String(prop)}(${args})`);
          return Reflect.apply(fn, thisArg, args);
        }
      });
    return val;
  }
});
```

### 8.3 决策流程

```
需要修改行为？
├── 只修改类/方法？ → 装饰器
├── 需要拦截 delete/in/Object.keys？ → Proxy
├── 需要代理非类对象（普通对象、数组、函数）？ → Proxy
├── 性能敏感？ → 装饰器（编译时处理）
├── 需要动态创建/撤销？ → Proxy（Proxy.revocable）
└── 需要依赖注入/元数据？ → 装饰器 + Reflect.metadata
```

---

## 9. 🧘 Zen of Code：元编程的边界

> *"With great power comes great responsibility."* — Uncle Ben (Spider-Man)

Proxy 是 JavaScript 中最强大的特性之一，但也是最容易滥用的特性之一。当你重新定义了"属性访问"的含义，你就打破了其他开发者对对象行为的基本假设。

**元编程的黄金法则**：

1. **最小惊讶原则**：代理对象的行为应该和普通对象"足够相似"。不要让 `obj.x = 1; console.log(obj.x)` 返回 `2`。
2. **透明性**：外部代码不应该需要知道它在和 Proxy 交互。
3. **性能意识**：Proxy 不是免费的。在热路径上避免使用。
4. **调试友好性**：Proxy 会让堆栈跟踪变复杂。在 trap 中加日志，帮助未来的你调试。

**Proxy 的正确使用场景**：

✅ **框架/库的核心机制**（Vue、MobX、Immer）
✅ **开发工具**（性能监控、调试代理）
✅ **安全沙箱**（限制敏感 API 的访问）
✅ **数据验证**（运行时类型检查）

**避免的场景**：

❌ 为了"炫技"而使用
❌ 可以用 getter/setter 简单实现的场景
❌ 性能关键路径（如渲染循环中的对象访问）

> 🌌 **历史教训**
>
> Proxy 的滥用会导致"魔法过载"(Magic Overload)。AngularJS 的脏检查、Backbone 的全局事件总线——这些早期框架都试图用魔法简化开发，最终却让代码难以理解和调试。现代框架（React、Vue 3）都在**减少魔法，增加显式性**。Proxy 应该**藏在抽象层的背后**，而不是暴露在业务代码中。

---

## 10. 最佳实践与常见陷阱

### ✅ 推荐做法

**1. 始终使用 Reflect**

```typescript
// ✅ 正确：使用 Reflect 保留 receiver
get(target, prop, receiver) {
  return Reflect.get(target, prop, receiver);
}

// ❌ 错误：丢失 receiver 导致 this 绑定错误
get(target, prop) {
  return target[prop];
}
```

**2. 检查 trap 的返回值**

```typescript
set(target, prop, value, receiver) {
  const result = Reflect.set(target, prop, value, receiver);
  if (!result) console.warn(`设置 ${String(prop)} 失败`);
  return result; // 必须返回布尔值
}
```

**3. 用 WeakMap 缓存避免重复代理**

```typescript
const proxyCache = new WeakMap();
function reactive(target) {
  if (proxyCache.has(target)) return proxyCache.get(target);
  const proxy = new Proxy(target, handler);
  proxyCache.set(target, proxy);
  return proxy;
}
```

### ❌ 常见陷阱

**1. trap 中的无限递归**

```typescript
// ❌ proxy[prop] 会再次触发 get trap → 无限递归
const proxy = new Proxy({}, {
  get(target, prop) { return proxy[prop]; }
});

// ✅ 使用 Reflect 直接访问 target
get(target, prop) {
  return Reflect.get(target, prop);
}
```

**2. 忘记处理 Symbol 属性**

```typescript
// Proxy 的 prop 可能是 Symbol，不仅仅是 string
get(target, prop) {
  // typeof prop 可能是 'symbol'
  // String(prop) 可以安全转换
  console.log(`[READ] ${String(prop)}`);
  return Reflect.get(target, prop);
}
```

**3. 违反不变性约束**

```typescript
const frozen = Object.freeze({ x: 1 });
const proxy = new Proxy(frozen, {
  get() { return 999; }
  // ❌ TypeError: 不可配置属性的值不能被修改
});
```

**4. set trap 忘记返回 true**

```typescript
// ❌ 严格模式下会抛出 TypeError
set(target, prop, value) {
  target[prop] = value;
  // 忘记 return true
}

// ✅ 正确
set(target, prop, value, receiver) {
  return Reflect.set(target, prop, value, receiver);
}
```

---

## 11. 本章总结

| 核心概念 | 关键要点 |
|---------|---------|
| **元编程层次** | Level 1 内省 → Level 2 自修改 → Level 3 拦截 (Proxy) |
| **13 种 Trap** | get/set/has/deleteProperty 最常用；apply/construct 用于函数/类 |
| **Reflect API** | 与 Proxy trap 一一对应；提供默认行为；返回布尔值而非抛异常 |
| **receiver 参数** | 确保 this 绑定正确；始终使用 `Reflect.get(target, prop, receiver)` |
| **实战应用** | 响应式系统 (Vue)、数据验证、惰性加载、访问控制 |
| **限制** | Date/Map/Set 等内部槽对象无法代理；~20x 性能开销 |
| **Proxy vs 装饰器** | Proxy 运行时拦截任何对象；装饰器编译时修饰类 |
| **哲学** | 强大但易滥用；隐藏在抽象层后；遵循最小惊讶原则 |

**下一步**：
- 阅读 Vue 3 响应式源码（`@vue/reactivity`）
- 研究 Immer 的 produce() 实现（用 Proxy 实现不可变更新）
- 探索 MobX 的自动依赖追踪机制

**相关章节**：
- [Stage 1 Ch06：原型链与原型继承](../../stage-1-beginner/06-prototype-inheritance/) — Proxy 操作的底层对象模型
- [Stage 3 Ch02：装饰器与元编程](../02-decorators-metaprogramming/) — 编译时元编程的另一条路
- [Stage 3 Ch09：函数式编程范式](../09-functional-programming/) — Immer 中 Proxy 与 FP 的交汇

---

## 12. 章节练习

### 练习 1：日志代理

**难度**：⭐
**涉及知识点**：get trap、set trap、Reflect

**题目描述**：创建一个函数 `createLoggingProxy(target)`，返回一个 Proxy，记录所有对对象的读写操作。

**要求**：
1. 读取属性时打印 `[READ] propName = value`
2. 设置属性时打印 `[WRITE] propName = newValue`
3. 使用 `Reflect` 实现默认行为

```typescript
const data = { count: 0, message: 'Hello' };
const logged = createLoggingProxy(data);
logged.count;           // [READ] count = 0
logged.message = 'Hi';  // [WRITE] message = Hi
```

<details>
<summary>💡 参考答案</summary>

```typescript
function createLoggingProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      console.log(`[READ] ${String(prop)} = ${value}`);
      return value;
    },
    set(target, prop, value, receiver) {
      console.log(`[WRITE] ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value, receiver);
    }
  });
}
```

</details>

### 练习 2：只读代理

**难度**：⭐⭐
**涉及知识点**：set trap、deleteProperty trap、defineProperty trap

**题目描述**：创建一个完全只读的代理（禁止 set/delete/defineProperty），任何修改操作都应抛出错误。

```typescript
const readOnly = createReadOnlyProxy({ x: 1 });
readOnly.x = 2;            // ❌ 抛出错误
delete readOnly.x;         // ❌ 抛出错误
```

<details>
<summary>💡 参考答案</summary>

```typescript
function createReadOnlyProxy<T extends object>(target: T): Readonly<T> {
  return new Proxy(target, {
    set() { throw new Error('对象只读，不允许修改'); },
    deleteProperty() { throw new Error('对象只读，不允许删除'); },
    defineProperty() { throw new Error('对象只读，不允许定义属性'); }
  });
}
```

</details>

### 练习 3：Python 风格负索引数组

**难度**：⭐⭐⭐
**涉及知识点**：get trap、数组代理

**题目描述**：实现 Python 风格的负索引（`arr[-1]` 访问最后一个元素，`arr[-2]` 倒数第二个）。

```typescript
const arr = proxyArray([1, 2, 3, 4, 5]);
arr[-1];  // 5
arr[-2];  // 4
arr[-10]; // undefined
```

<details>
<summary>💡 参考答案</summary>

```typescript
function proxyArray<T>(arr: T[]): T[] {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop);
      if (Number.isInteger(index) && index < 0) {
        const realIndex = target.length + index;
        return realIndex >= 0 ? target[realIndex] : undefined;
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
```

</details>

---

> *"The best code is code you don't have to write."* — Unknown
>
> Proxy 让对象拥有了"行为"。当你掌握了 Proxy，你就掌握了让对象变得"聪明"的能力——它们能自我验证、自我监控、自我优化。但请记住：聪明的对象也可能成为聪明的陷阱。**透明、可预测、易调试** — 这三个原则比任何魔法都重要。
