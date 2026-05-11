# 阶段 3 练习题集合

本章包含 20-25 个精心设计的练习题，涵盖 TypeScript 高级类型、装饰器、设计模式、架构、性能优化和测试。

## 📚 练习分类

1. [TypeScript 高级类型练习](#1-typescript-高级类型练习) (6题)
2. [装饰器练习](#2-装饰器练习) (4题)
3. [设计模式练习](#3-设计模式练习) (6题)
4. [架构和性能练习](#4-架构和性能练习) (5题)
5. [测试练习](#5-测试练习) (4题)

---

## 1. TypeScript 高级类型练习

### 练习 1.1：类型安全的事件发射器

**难度：** ⭐⭐⭐⭐

**要求：** 实现一个类型安全的事件发射器，确保事件名称和处理器参数类型匹配。

```typescript
// 定义事件映射
interface EventMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:update': { id: string; data: any };
}

// TODO: 实现 EventEmitter 类
class EventEmitter<T extends Record<string, any>> {
  // 你的实现...
}

// 测试
const emitter = new EventEmitter<EventMap>();

// ✓ 应该通过类型检查
emitter.on('user:login', (payload) => {
  console.log(payload.userId, payload.timestamp);
});

// ❌ 应该报错：参数类型不匹配
// emitter.on('user:login', (payload: { wrong: string }) => {});
```

<details>
<summary>查看答案</summary>

```typescript
class EventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: Array<(payload: T[K]) => void>;
  } = {};

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(payload));
    }
  }

  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}
```

</details>

---

### 练习 1.2：深度只读类型

**难度：** ⭐⭐⭐⭐

**要求：** 实现一个 `DeepReadonly<T>` 类型，递归地将对象的所有嵌套属性设为只读。

```typescript
// TODO: 实现 DeepReadonly 类型

interface NestedObject {
  a: string;
  b: {
    c: number;
    d: {
      e: boolean;
    };
  };
  f: string[];
}

type ReadonlyNested = DeepReadonly<NestedObject>;
```

<details>
<summary>查看答案</summary>

```typescript
type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends Function
  ? T
  : T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;
```

</details>

---

## 2. 装饰器练习

### 练习 2.1：速率限制装饰器

**难度：** ⭐⭐⭐⭐

**要求：** 创建一个 `@rateLimit` 装饰器，限制方法在指定时间内的调用次数。

```typescript
class ApiClient {
  @rateLimit(5, 1000) // 每秒最多 5 次调用
  async makeRequest(url: string) {
    return fetch(url);
  }
}
```

<details>
<summary>查看答案</summary>

```typescript
function rateLimit(maxCalls: number, timeWindow: number) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const calls: number[] = [];
    
    descriptor.value = async function(...args: any[]) {
      const now = Date.now();
      
      // 移除过期的调用记录
      while (calls.length > 0 && calls[0] < now - timeWindow) {
        calls.shift();
      }
      
      // 检查是否超过限制
      if (calls.length >= maxCalls) {
        throw new Error(
          `速率限制: 最多 ${maxCalls} 次调用每 ${timeWindow}ms`
        );
      }
      
      // 记录此次调用
      calls.push(now);
      
      // 执行原始方法
      return await originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}
```

</details>

---

## 3. 设计模式练习

### 练习 3.1：实现观察者模式

**难度：** ⭐⭐⭐

**要求：** 实现一个简单的观察者模式，支持订阅、取消订阅和通知。

```typescript
// TODO: 实现观察者模式
interface Observer {
  update(data: any): void;
}

interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(data: any): void;
}
```

<details>
<summary>查看答案</summary>

```typescript
class ConcreteSubject implements Subject {
  private observers: Observer[] = [];
  
  attach(observer: Observer): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }
  
  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notify(data: any): void {
    this.observers.forEach(observer => {
      observer.update(data);
    });
  }
}

class ConcreteObserver implements Observer {
  constructor(private name: string) {}
  
  update(data: any): void {
    console.log(`${this.name} 收到更新:`, data);
  }
}
```

</details>

---

## 4. 架构和性能练习

### 练习 4.1：实现 LRU 缓存

**难度：** ⭐⭐⭐⭐

**要求：** 实现一个 LRU（最近最少使用）缓存。

```typescript
class LRUCache<K, V> {
  constructor(private maxSize: number) {}
  
  get(key: K): V | undefined {
    // TODO: 实现
  }
  
  set(key: K, value: V): void {
    // TODO: 实现
  }
}
```

<details>
<summary>查看答案</summary>

```typescript
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  
  constructor(private maxSize: number) {}
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    this.cache.set(key, value);
    
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
```

</details>

---

## 5. 测试练习

### 练习 5.1：编写单元测试

**难度：** ⭐⭐⭐

**要求：** 为以下用户服务编写单元测试。

```typescript
class UserService {
  constructor(private repository: UserRepository) {}
  
  async createUser(data: CreateUserData): Promise<User> {
    if (!data.email || !data.name) {
      throw new Error('邮箱和姓名是必需的');
    }
    
    const user = await this.repository.save(data);
    return user;
  }
}

// TODO: 编写测试
describe('UserService', () => {
  // 你的测试...
});
```

<details>
<summary>查看答案</summary>

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;
  
  beforeEach(() => {
    mockRepository = {
      save: jest.fn()
    } as any;
    
    service = new UserService(mockRepository);
  });
  
  it('应该创建用户', async () => {
    const userData = {
      name: 'Alice',
      email: 'alice@example.com'
    };
    
    const expectedUser = {
      id: '1',
      ...userData
    };
    
    mockRepository.save.mockResolvedValue(expectedUser);
    
    const user = await service.createUser(userData);
    
    expect(user).toEqual(expectedUser);
    expect(mockRepository.save).toHaveBeenCalledWith(userData);
  });
  
  it('应该在缺少必需字段时抛出错误', async () => {
    await expect(
      service.createUser({ email: '', name: 'Alice' })
    ).rejects.toThrow('邮箱和姓名是必需的');
  });
});
```

</details>

---

## 新增练习题详解

### 练习 6.1：Proxy 响应式对象（高级）

**难度**：⭐⭐⭐⭐⭐

**要求**：用 Proxy 实现一个可观察对象，当属性变化时自动通知观察者

```typescript
/**
 * 实现 observable(obj, onChange) 函数
 * - 当对象的任何属性改变时，调用 onChange
 * - 支持嵌套对象的监听
 * - 支持数组操作监听
 */
```

<details>
<summary>参考答案</summary>

核心思路：
1. 使用 Proxy 拦截 get/set 操作
2. 递归代理嵌套对象
3. 使用 Reflect 调用默认行为
4. 实现依赖收集和触发更新

</details>

---

### 练习 7.1：函数式编程工具（高级）

**难度**：⭐⭐⭐⭐

**要求**：实现 `pipe()` + `compose()` + `curry()` 三个函数

---

### 练习 8.1：Web Worker 图片处理（中高级）

**难度**：⭐⭐⭐⭐

**要求**：用 Web Worker 实现图片灰度化处理

---

### 练习 9.1：编写声明文件（中高级）

**难度**：⭐⭐⭐⭐

**要求**：为无类型 npm 包编写 `.d.ts` 声明文件

---

## 自我评估

完成练习后，请检查：

- [ ] 完成了至少 80% 的练习题
- [ ] 理解了所有练习的解决方案
- [ ] 能够独立解决类似问题
- [ ] 掌握了相关的设计模式和最佳实践
- [ ] 理解 Proxy 和元编程的应用场景
- [ ] 能够编写函数式风格的代码
- [ ] 掌握 Web Worker 的使用
- [ ] 能够为第三方库编写类型声明

---

---

## 🆕 Proxy 与 Reflect 练习

### 练习 6.1: 实现响应式对象（基础）

**难度**: ⭐⭐⭐
**涉及知识点**: Proxy、Reflect、响应式系统基础
**预计时间**: 30分钟

**题目描述**: 

实现一个简化版的 Vue 3 reactive() 函数，当对象属性变化时触发回调。

**要求**:
1. 使用 Proxy 拦截对象的 get 和 set 操作
2. 实现 `reactive(obj)` 函数创建响应式对象
3. 实现 `watch(obj, callback)` 函数监听变化
4. 支持嵌套对象的响应式
5. 添加日志记录所有拦截操作

**提示**: 使用 WeakMap 存储对象和观察者的映射

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/06-reactive-proxy.ts`

**思路说明**:
- Proxy 的 get trap 追踪属性访问
- set trap 触发更新通知
- 递归处理嵌套对象

**关键代码**:
```typescript
const observers = new WeakMap<object, Set<Function>>();

function reactive<T extends object>(obj: T): T {
  const observed = observers.get(obj) || new Set();
  observers.set(obj, observed);
  
  return new Proxy(obj, {
    get(target, prop, receiver) {
      console.log(`[GET] ${String(prop)}`);
      const value = Reflect.get(target, prop, receiver);
      
      // 递归处理嵌套对象
      if (value !== null && typeof value === 'object') {
        return reactive(value);
      }
      
      return value;
    },
    
    set(target, prop, value, receiver) {
      const oldValue = Reflect.get(target, prop, receiver);
      const result = Reflect.set(target, prop, value, receiver);
      
      if (oldValue !== value) {
        console.log(`[SET] ${String(prop)}: ${oldValue} → ${value}`);
        // 触发观察者
        observed.forEach(cb => cb(prop, value, oldValue));
      }
      
      return result;
    }
  });
}

function watch<T extends object>(obj: T, callback: Function): void {
  const observed = observers.get(obj);
  if (observed) {
    observed.add(callback);
  }
}

// 测试
const state = reactive({ count: 0, user: { name: 'Alice' } });

watch(state, (prop: string, newVal: any, oldVal: any) => {
  console.log(`属性 ${prop} 变化: ${oldVal} → ${newVal}`);
});

state.count++; // 触发回调
state.user.name = 'Bob'; // 嵌套对象也能响应
```

</details>

---

### 练习 6.2: 数据验证代理（进阶）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: Proxy、Reflect、运行时验证
**预计时间**: 35分钟

**题目描述**: 

创建一个 Proxy，在设置属性时自动进行类型和值验证。

**要求**:
1. 实现 `createValidator(schema)` 函数
2. 支持类型检查（string、number、boolean 等）
3. 支持值约束（min、max、pattern 等）
4. 设置无效值时抛出描述性错误
5. 支持可选属性和默认值

**提示**: 在 set trap 中执行验证逻辑

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/06-validation-proxy.ts`

**思路说明**:
- Schema 定义验证规则
- Proxy set trap 执行验证
- 提供清晰的错误信息

**关键代码**:
```typescript
interface ValidationRule {
  type?: 'string' | 'number' | 'boolean';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  default?: any;
}

type Schema = Record<string, ValidationRule>;

function createValidator<T extends object>(schema: Schema): T {
  const obj: any = {};
  
  // 设置默认值
  for (const [key, rule] of Object.entries(schema)) {
    if (rule.default !== undefined) {
      obj[key] = rule.default;
    }
  }
  
  return new Proxy(obj, {
    set(target, prop, value) {
      const propName = String(prop);
      const rule = schema[propName];
      
      if (!rule) {
        throw new Error(`未定义的属性: ${propName}`);
      }
      
      // 必填检查
      if (rule.required && (value === undefined || value === null)) {
        throw new Error(`${propName} 是必填项`);
      }
      
      // 类型检查
      if (rule.type && typeof value !== rule.type) {
        throw new Error(
          `${propName} 类型错误: 期望 ${rule.type}, 实际 ${typeof value}`
        );
      }
      
      // 数值范围检查
      if (rule.type === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          throw new Error(`${propName} 不能小于 ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          throw new Error(`${propName} 不能大于 ${rule.max}`);
        }
      }
      
      // 正则匹配检查
      if (rule.pattern && !rule.pattern.test(value)) {
        throw new Error(`${propName} 格式无效`);
      }
      
      console.log(`✓ 验证通过: ${propName} = ${value}`);
      return Reflect.set(target, prop, value);
    }
  });
}

// 使用
const user = createValidator<any>({
  name: { type: 'string', required: true },
  age: { type: 'number', min: 0, max: 150 },
  email: { type: 'string', pattern: /^[\w-]+@[\w-]+\.\w+$/ }
});

user.name = 'Alice'; // ✓
user.age = 25;       // ✓
// user.age = -1;    // ✗ 抛出错误
```

</details>

---

### 练习 6.3: 实现可撤销的 Proxy（挑战）

**难度**: ⭐⭐⭐⭐⭐
**涉及知识点**: Proxy、Reflect、Proxy.revocable、内存管理
**预计时间**: 40分钟

**题目描述**: 

实现一个支持时间旅行（撤销/重做）的对象代理系统。

**要求**:
1. 记录所有属性变更历史
2. 实现 `undo()` 撤销最近的修改
3. 实现 `redo()` 重做被撤销的修改
4. 实现 `getHistory()` 获取完整历史
5. 支持跳转到任意历史状态
6. 添加内存优化（限制历史记录数量）

**提示**: 使用栈结构存储历史状态

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/06-time-travel-proxy.ts`

**思路说明**:
- 维护两个栈：历史栈和重做栈
- 每次修改前保存快照
- 撤销时恢复快照并移到重做栈

**关键代码**:
```typescript
interface HistoryEntry<T> {
  timestamp: Date;
  snapshot: T;
  changes: Array<{ prop: string; from: any; to: any }>;
}

function createTimeTravelProxy<T extends object>(
  initialState: T,
  maxHistory: number = 50
) {
  let state = { ...initialState };
  const history: HistoryEntry<T>[] = [
    { timestamp: new Date(), snapshot: { ...state }, changes: [] }
  ];
  let historyIndex = 0;
  
  const proxy = new Proxy(state, {
    set(target, prop, value) {
      const oldValue = Reflect.get(target, prop);
      
      if (oldValue === value) return true;
      
      // 清除重做栈
      history.splice(historyIndex + 1);
      
      // 保存新状态
      Reflect.set(target, prop, value);
      const snapshot = { ...target } as T;
      
      history.push({
        timestamp: new Date(),
        snapshot,
        changes: [{ prop: String(prop), from: oldValue, to: value }]
      });
      
      // 限制历史记录数量
      if (history.length > maxHistory) {
        history.shift();
      } else {
        historyIndex++;
      }
      
      console.log(`[变更] ${String(prop)}: ${oldValue} → ${value}`);
      return true;
    }
  });
  
  return {
    proxy,
    
    undo(): boolean {
      if (historyIndex === 0) {
        console.log('[撤销失败] 已到达历史起点');
        return false;
      }
      
      historyIndex--;
      const entry = history[historyIndex];
      Object.assign(state, entry.snapshot);
      console.log(`[撤销] 返回到 ${entry.timestamp.toISOString()}`);
      return true;
    },
    
    redo(): boolean {
      if (historyIndex >= history.length - 1) {
        console.log('[重做失败] 已到达历史终点');
        return false;
      }
      
      historyIndex++;
      const entry = history[historyIndex];
      Object.assign(state, entry.snapshot);
      console.log(`[重做] 前进到 ${entry.timestamp.toISOString()}`);
      return true;
    },
    
    getHistory() {
      return history.map((entry, idx) => ({
        ...entry,
        isCurrent: idx === historyIndex
      }));
    },
    
    jumpTo(index: number): boolean {
      if (index < 0 || index >= history.length) {
        console.log('[跳转失败] 索引越界');
        return false;
      }
      
      historyIndex = index;
      const entry = history[index];
      Object.assign(state, entry.snapshot);
      console.log(`[跳转] 到达 ${entry.timestamp.toISOString()}`);
      return true;
    }
  };
}

// 测试
const { proxy, undo, redo, getHistory } = createTimeTravelProxy({
  count: 0,
  name: 'Alice'
});

proxy.count = 1;
proxy.count = 2;
proxy.name = 'Bob';

console.log('当前状态:', proxy); // { count: 2, name: 'Bob' }

undo();
console.log('撤销后:', proxy);  // { count: 2, name: 'Alice' }

redo();
console.log('重做后:', proxy);  // { count: 2, name: 'Bob' }
```

</details>

---

## 🆕 函数式编程练习

### 练习 7.1: 实现 pipe 和 compose（基础）

**难度**: ⭐⭐⭐
**涉及知识点**: 函数组合、高阶函数、类型推导
**预计时间**: 25分钟

**题目描述**: 

实现函数式编程的核心工具：`pipe` 和 `compose`。

**要求**:
1. 实现 `pipe(...fns)` 从左到右组合函数
2. 实现 `compose(...fns)` 从右到左组合函数
3. 支持任意数量的函数
4. 保持类型安全（TypeScript）
5. 添加示例：数据转换管道

**提示**: `pipe` 和 `compose` 的区别在于执行顺序

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/07-pipe-compose.ts`

**思路说明**:
- pipe: 从左到右，类似 Unix 管道
- compose: 从右到左，类似数学函数组合
- 使用 reduce 实现函数链式调用

**关键代码**:
```typescript
function pipe<T>(...fns: Array<(arg: any) => any>) {
  return (initialValue: T) => {
    console.log('[PIPE] 初始值:', initialValue);
    
    return fns.reduce((acc, fn, index) => {
      console.log(`[PIPE] 步骤 ${index + 1}/${fns.length}: ${fn.name || '匿名函数'}`);
      const result = fn(acc);
      console.log(`  结果:`, result);
      return result;
    }, initialValue);
  };
}

function compose<T>(...fns: Array<(arg: any) => any>) {
  return (initialValue: T) => {
    console.log('[COMPOSE] 初始值:', initialValue);
    
    return fns.reduceRight((acc, fn, index) => {
      console.log(`[COMPOSE] 步骤 ${fns.length - index}/${fns.length}: ${fn.name || '匿名函数'}`);
      const result = fn(acc);
      console.log(`  结果:`, result);
      return result;
    }, initialValue);
  };
}

// 示例：数据转换管道
const trim = (s: string) => s.trim();
const toLowerCase = (s: string) => s.toLowerCase();
const words = (s: string) => s.split(' ');
const count = (arr: string[]) => arr.length;

const countWords = pipe(
  trim,
  toLowerCase,
  words,
  count
);

console.log(countWords('  Hello World  ')); // 2
```

</details>

---

### 练习 7.2: 实现柯里化和偏应用（进阶）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: 柯里化、偏应用、闭包、类型体操
**预计时间**: 35分钟

**题目描述**: 

实现通用的柯里化函数和偏应用函数。

**要求**:
1. 实现 `curry(fn)` 自动柯里化函数
2. 实现 `partial(fn, ...args)` 偏应用
3. 支持占位符 `_` 用于跳过参数
4. 保持类型安全
5. 添加实用示例

**提示**: 柯里化返回单参数函数链，偏应用固定部分参数

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/07-curry-partial.ts`

**思路说明**:
- 柯里化：将多参函数转为单参函数链
- 偏应用：预先固定部分参数
- 占位符：允许灵活的参数绑定

**关键代码**:
```typescript
function curry<T extends (...args: any[]) => any>(fn: T) {
  return function curried(...args: any[]): any {
    console.log(`[CURRY] 收到 ${args.length}/${fn.length} 个参数`);
    
    if (args.length >= fn.length) {
      console.log('[CURRY] 参数已满，执行函数');
      return fn(...args);
    }
    
    console.log('[CURRY] 参数不足，返回新函数');
    return (...nextArgs: any[]) => {
      console.log(`[CURRY] 追加 ${nextArgs.length} 个参数`);
      return curried(...args, ...nextArgs);
    };
  };
}

const _ = Symbol('placeholder');

function partial<T extends (...args: any[]) => any>(
  fn: T,
  ...presetArgs: any[]
) {
  return (...laterArgs: any[]) => {
    console.log('[PARTIAL] 合并参数');
    
    const args: any[] = [];
    let laterIndex = 0;
    
    for (const arg of presetArgs) {
      if (arg === _) {
        args.push(laterArgs[laterIndex++]);
        console.log(`  占位符 → ${args[args.length - 1]}`);
      } else {
        args.push(arg);
        console.log(`  预设值 → ${arg}`);
      }
    }
    
    args.push(...laterArgs.slice(laterIndex));
    console.log('[PARTIAL] 最终参数:', args);
    
    return fn(...args);
  };
}

// 示例
const add = (a: number, b: number, c: number) => a + b + c;

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6

const add5and = partial(add, 5, _);
console.log(add5and(10, 3)); // 18
```

</details>

---

### 练习 7.3: 函数式错误处理（挑战）

**难度**: ⭐⭐⭐⭐⭐
**涉及知识点**: Maybe/Option、Either、Railway Oriented Programming
**预计时间**: 45分钟

**题目描述**: 

实现完整的函数式错误处理体系（Maybe 和 Either）。

**要求**:
1. 实现 `Maybe<T>` 类型（Some 和 None）
2. 实现 `Either<L, R>` 类型（Left 和 Right）
3. 实现 `map`、`flatMap`、`getOrElse` 等方法
4. 实现链式调用的错误处理管道
5. 提供实际应用示例

**提示**: Maybe 表示可能为空，Either 表示成功或失败

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/07-functional-error-handling.ts`

**关键代码** (详见 solutions 文件)

</details>

---

## 🆕 浏览器 API 练习

### 练习 8.1: Web Worker 图片处理（基础）

**难度**: ⭐⭐⭐
**涉及知识点**: Web Worker、Transferable Objects、Canvas API
**预计时间**: 30分钟

**题目描述**: 

使用 Web Worker 在后台线程中处理图片（灰度化）。

**要求**:
1. 创建 Worker 处理图片数据
2. 使用 Transferable Objects 优化传输
3. 主线程显示处理进度
4. 处理完成后更新 UI
5. 处理多张图片时使用 Worker 池

**提示**: ImageData 可以转移所有权避免拷贝

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/08-web-worker-image.ts` 和 `solutions/08-image-worker.js`

</details>

---

### 练习 8.2: IntersectionObserver 无限滚动（进阶）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: IntersectionObserver、虚拟滚动、性能优化
**预计时间**: 35分钟

**题目描述**: 

实现一个高性能的无限滚动列表组件。

**要求**:
1. 使用 IntersectionObserver 检测滚动到底部
2. 分页加载数据（每次加载20条）
3. 显示加载状态
4. 实现虚拟滚动优化（只渲染可见项）
5. 支持上拉加载更多

**提示**: IntersectionObserver 比 scroll 事件性能更好

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/08-infinite-scroll.ts`

</details>

---

### 练习 8.3: 文件分片上传（挑战）

**难度**: ⭐⭐⭐⭐⭐
**涉及知识点**: File API、Blob、Fetch API、并发控制
**预计时间**: 45分钟

**题目描述**: 

实现支持断点续传的大文件分片上传。

**要求**:
1. 将大文件切分为多个分片（每片5MB）
2. 并发上传多个分片（最多3个并发）
3. 显示上传进度
4. 支持暂停和恢复
5. 所有分片完成后合并文件
6. 使用 AbortController 控制请求

**提示**: File.slice() 分片，Promise 并发控制

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/08-file-upload.ts`

</details>

---

## 🆕 TypeScript 工程化练习

### 练习 9.1: 为无类型包编写声明文件（基础）

**难度**: ⭐⭐⭐
**涉及知识点**: 声明文件、模块增强、DefinitelyTyped
**预计时间**: 25分钟

**题目描述**: 

为一个没有类型定义的 npm 包编写 `.d.ts` 声明文件。

**要求**:
1. 假设有一个JS库 `my-logger`，提供日志功能
2. 编写完整的类型声明
3. 支持默认导出和命名导出
4. 包含函数重载
5. 添加 JSDoc 注释

**提示**: 使用 `declare module` 声明模块

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/09-declaration-file.d.ts`

</details>

---

### 练习 9.2: 模块增强与全局扩展（进阶）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: 模块增强、全局扩展、声明合并
**预计时间**: 35分钟

**题目描述**: 

为第三方库添加自定义方法和属性。

**要求**:
1. 扩展 Express 的 `Request` 接口，添加 `user` 属性
2. 扩展 Array 原型，添加 `last()` 方法
3. 扩展全局 Window 接口
4. 确保类型安全
5. 提供使用示例

**提示**: 使用 `declare module` 和 `declare global`

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/09-module-augmentation.ts`

</details>

---

### 练习 9.3: 高级类型模式（进阶）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: 品牌类型、协变逆变、递归类型、infer
**预计时间**: 40分钟

**题目描述**: 

实现一组高级类型工具。

**要求**:
1. 实现品牌类型 `Brand<T, Tag>`
2. 实现 `DeepPartial<T>` 递归可选
3. 实现 `PromiseValue<T>` 提取 Promise 值类型
4. 实现 `UnionToIntersection<U>` 联合转交叉
5. 提供实际应用场景

**提示**: 使用条件类型和 `infer` 关键字

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/09-advanced-type-patterns.ts`

</details>

---

### 练习 9.4: Monorepo 配置与项目引用（挑战）

**难度**: ⭐⭐⭐⭐⭐
**涉及知识点**: Project References、Monorepo、tsconfig 继承
**预计时间**: 50分钟

**题目描述**: 

配置一个 TypeScript Monorepo 项目，包含多个包和共享配置。

**要求**:
1. 创建项目结构：packages/core、packages/ui、packages/utils
2. 配置根 tsconfig.json 和各包的 tsconfig.json
3. 设置 Project References
4. 配置路径映射（@myapp/core 等）
5. 实现包之间的类型共享
6. 配置增量编译

**提示**: 使用 `references` 和 `composite` 选项

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/09-monorepo-setup/`

</details>

---

## 下一步

**下一步：** [实时聊天应用项目](../projects/realtime-chat/) 和 [ts-toolkit 工具库](../projects/ts-toolkit/)

通过完整项目巩固所学知识！💪
