/**
 * @file 02-reactive-store.ts
 * @description 用 Proxy 实现简化版 Vue 3 reactive() 响应式数据存储
 * @prerequisites Stage 1 Ch04 异步编程, Stage 2 Ch02 ES6
 * @related examples/01-proxy-traps.ts
 */

console.log('[INFO] === 响应式数据存储 (Reactive Store) ===\n');

// ============================================================================
// 核心：依赖追踪系统
// ============================================================================

type Effect = () => void;
let activeEffect: Effect | null = null;
const targetMap = new WeakMap<object, Map<PropertyKey, Set<Effect>>>();

/** 依赖收集：将当前活跃的 effect 与 (对象, 属性) 关联 */
function track(target: object, key: PropertyKey): void {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }

  deps.add(activeEffect);
  console.log(`  [TRACK] 收集依赖: ${String(key)}`);
}

/** 触发更新：执行所有依赖于该属性的 effect */
function trigger(target: object, key: PropertyKey): void {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const deps = depsMap.get(key);
  if (!deps) return;

  console.log(`  [TRIGGER] 触发更新: ${String(key)} (${deps.size} 个订阅者)`);
  deps.forEach(effect => effect());
}

/** 注册副作用函数 */
function effect(fn: Effect): void {
  activeEffect = fn;
  fn(); // 立即执行一次以收集依赖
  activeEffect = null;
}

// ============================================================================
// 1. reactive() — 创建响应式代理
// ============================================================================
console.log('[1] 基础响应式系统\n');

const proxyCache = new WeakMap<object, any>();

function reactive<T extends object>(target: T): T {
  if (proxyCache.has(target)) {
    console.log('  [CACHE] 返回缓存的代理');
    return proxyCache.get(target);
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);

      // 递归代理嵌套对象
      if (result !== null && typeof result === 'object') {
        return reactive(result);
      }
      return result;
    },

    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, value, receiver);

      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },

    deleteProperty(target, key) {
      const hadKey = Reflect.has(target, key);
      const result = Reflect.deleteProperty(target, key);

      if (hadKey) {
        trigger(target, key);
      }
      return result;
    }
  });

  proxyCache.set(target, proxy);
  return proxy;
}

// ============================================================================
// 2. 基础使用
// ============================================================================
const state = reactive({ count: 0, message: 'Hello' });

effect(() => {
  console.log(`  [EFFECT] count = ${state.count}`);
});

console.log('\n--- 修改 count ---');
state.count++;
state.count = 10;
console.log('');

// ============================================================================
// 3. 嵌套对象响应式
// ============================================================================
console.log('[2] 嵌套对象响应式\n');

const nested = reactive({
  user: { name: 'Alice', profile: { city: 'Beijing' } }
});

effect(() => {
  console.log(`  [EFFECT] 城市: ${nested.user.profile.city}`);
});

console.log('\n--- 修改嵌套属性 ---');
nested.user.profile.city = 'Shanghai';
console.log('');

// ============================================================================
// 4. 数组响应式
// ============================================================================
console.log('[3] 数组响应式\n');

const arrState = reactive({ items: [1, 2, 3] });

effect(() => {
  console.log(`  [EFFECT] items = [${arrState.items.join(', ')}]`);
});

console.log('\n--- push(4) ---');
arrState.items.push(4);

console.log('\n--- 修改索引 0 ---');
arrState.items[0] = 100;
console.log('');

// ============================================================================
// 5. computed() — 计算属性
// ============================================================================
console.log('[4] 计算属性 (Computed)\n');

interface ComputedRef<T> { readonly value: T; }

function computed<T>(getter: () => T): ComputedRef<T> {
  let cachedValue: T;

  effect(() => {
    cachedValue = getter();
  });

  return {
    get value() { return cachedValue; }
  };
}

const names = reactive({ first: 'John', last: 'Doe' });
const fullName = computed(() => {
  console.log('  [COMPUTED] 重新计算 fullName');
  return `${names.first} ${names.last}`;
});

console.log('  fullName:', fullName.value);

console.log('\n--- 修改 first ---');
names.first = 'Jane';
console.log('  fullName:', fullName.value);
console.log('');

// ============================================================================
// 6. 避免重复代理
// ============================================================================
console.log('[5] 避免重复代理\n');

const original = { x: 1 };
const p1 = reactive(original);
const p2 = reactive(original);
console.log('  p1 === p2:', p1 === p2); // true (来自缓存)
console.log('');

// ============================================================================
// 7. Vue 3 对比
// ============================================================================
console.log('[6] 本实现 vs Vue 3 真实实现\n');

console.log(`  本简化实现 vs Vue 3:

  ✅ 相同点:
  - Proxy 拦截 get/set/deleteProperty
  - WeakMap 存储依赖关系
  - 递归代理嵌套对象
  - 数组响应式

  ❌ 简化之处:
  1. Vue 3 使用 effect 栈追踪嵌套
  2. Vue 3 有调度器 (nextTick 批量更新)
  3. Vue 3 有 ref() 为基本类型包装
  4. Vue 3 有 readonly() / shallowReactive()
  5. Vue 3 有更完善的边界处理
`);

console.log('[INFO] === 示例结束 ===');
