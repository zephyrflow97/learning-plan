# 第 9 章：函数式编程范式 — 用数学思维驯服复杂性

> *"Object-oriented programming makes code understandable by encapsulating moving parts. Functional programming makes code understandable by minimizing moving parts."*
> — Michael Feathers
>
> 你已经会用 `.map()`、`.filter()`、`.reduce()` 了。你已经在写 React 的纯组件了。你已经在用 `const` 代替 `let` 了。恭喜——你一直在做函数式编程，只是不知道而已。本章的目的不是把你变成 Haskell 程序员，而是让你**自觉地**运用你一直在无意识使用的函数式思维。

## 📖 本章内容

1. [函数式编程的世界观](#1-函数式编程的世界观) — 从"怎么做"到"是什么"的思维转换
2. [纯函数与副作用](#2-纯函数与副作用) — 纯函数的严格定义、引用透明性、副作用的隔离策略
3. [函数组合](#3-函数组合) — `compose`、`pipe`、管道操作符提案
4. [柯里化与偏应用](#4-柯里化与偏应用) — 将多参函数转化为参数复用
5. [不可变数据操作](#5-不可变数据操作) — Spread、`structuredClone`、Immer 的 Proxy 魔法
6. [函数式错误处理](#6-函数式错误处理) — Option/Maybe 模式、Result/Either 模式
7. [Functional Core, Imperative Shell](#7-functional-core-imperative-shell) — 架构模式的实战应用
8. [FP 在现代 JS/TS 中的渗透](#8-fp-在现代-jsts-中的渗透) — React Hooks、Array 方法链、Redux reducers
9. [🧘 Zen of Code：FP 与 OOP 不是战争](#9--zen-of-codefp-与-oop-不是战争)
10. [最佳实践与常见陷阱](#10-最佳实践与常见陷阱)
11. [本章总结](#11-本章总结)
12. [章节练习](#12-章节练习)

---

## 1. 函数式编程的世界观

> 🎭 **The Drama：命令式 vs 声明式 — 出租车 vs 导航**
>
> 命令式编程就像你坐出租车时指挥司机："前面路口左转，然后过两个红绿灯右转，到了第三栋楼停下。"函数式编程就像用导航："我要去机场。"你告诉系统**目的地**（what），不关心**路线**（how）。
>
> ```typescript
> // 出租车模式：命令式
> const result = [];
> for (let i = 0; i < arr.length; i++) {
>   if (arr[i] > 5) result.push(arr[i] * 2);
> }
>
> // 导航模式：声明式
> const result = arr.filter(x => x > 5).map(x => x * 2);
> ```
>
> 两者结果相同，但第二种表达了**意图**，而不是**步骤**。

### 1.1 什么是函数式编程？

函数式编程 (Functional Programming, FP) 是一种**编程范式**，其核心理念是：

1. **用函数作为基本构建单元** — 而不是对象或过程
2. **避免可变状态** — 数据一旦创建就不再改变
3. **避免副作用** — 函数不修改外部世界
4. **声明式而非命令式** — 描述"是什么"而非"怎么做"

> 🧠 **CS Master's Bridge：FP 的学术谱系**
>
> 函数式编程的数学根基是 Alonzo Church 在 1936 年发明的 **λ 演算 (Lambda Calculus)**——比第一台电子计算机还早 10 年。λ 演算证明了：任何可计算的问题都可以仅用**函数定义**和**函数应用**两个操作来表达。这和图灵机的计算能力完全等价（Church-Turing 论题），但思考方式截然不同：
>
> - **图灵机** 思考的是状态转换（读磁带 → 改状态 → 移磁头）→ 命令式编程的起源
> - **λ 演算** 思考的是函数变换（输入 → 应用规则 → 输出）→ 函数式编程的起源
>
> JavaScript 的箭头函数 `x => x + 1` 就是 λ 演算符号 `λx. x + 1` 的直接后代。

### 1.2 FP 的五根支柱

| 支柱 | 核心思想 | JS/TS 中的体现 |
|------|---------|---------------|
| **纯函数** | 相同输入 → 相同输出，无副作用 | `Array.prototype.map()` |
| **不可变性** | 数据创建后不再修改 | `const`、Spread、`Object.freeze()` |
| **函数组合** | 小函数组合成大函数 | `pipe()`、方法链 |
| **高阶函数** | 函数是值，可以传递和返回 | `filter()`、`reduce()`、回调 |
| **声明式风格** | 描述"是什么"而非"怎么做" | React JSX、SQL、正则表达式 |

### 1.3 FP 复兴弧：从学术象牙塔到主流前端

> 🌌 **The Big Picture：函数式编程的六十年长征**
>
> - **1958** — John McCarthy 创造 Lisp，第一个函数式语言。当时程序员觉得它是"学术玩具"。
> - **1990** — Haskell 问世，FP 的"黄金标准"。纯粹到所有副作用都必须用 Monad 包装。
> - **2005-2010** — Scala 和 Clojure 在 JVM 上证明 FP 可以用于"真正的工作"。
> - **2013** — Facebook 发布 React。`UI = f(State)` 这个等式把 FP 思想推入了每个前端开发者的日常。
> - **2015** — Redux 问世。纯 reducer、不可变状态、时间旅行调试——这些核心设计全部来自 FP。
> - **2019** — React Hooks 让函数组件完全取代了 Class 组件。前端开发者成为世界上数量最大的"不自觉的函数式程序员"群体。
>
> JavaScript 从来不是纯粹的 FP 语言——它是多范式的。但 FP 的思想已经渗透到了它的每个角落。

---

## 2. 纯函数与副作用

> 🌌 **The Big Picture：纯函数 — 数学函数在代码中的化身**
>
> 数学里的 `f(x) = x²` 永远对相同的 `x` 返回相同的值。它不依赖天气、心情或全局变量。编程中的纯函数追求同样的品质：
>
> 1. **确定性** — 相同输入 → 相同输出
> 2. **无副作用** — 不改变外部世界（不修改参数、不写数据库、不打 console.log）
>
> 这让纯函数拥有数学般的**可推理性**——你可以**替换**函数调用为其返回值（引用透明性），不影响程序行为。

### 2.1 纯函数的严格定义

一个函数是"纯"的，当且仅当：

```typescript
// ✅ 纯函数：确定性 + 无副作用
function add(a: number, b: number): number {
  return a + b;
}

// ❌ 不纯：依赖外部状态（非确定性）
let tax = 0.1;
function priceWithTax(price: number): number {
  return price * (1 + tax); // tax 可能变化
}
```

| 纯 ✅ | 不纯 ❌ | 原因 |
|-------|---------|------|
| `Math.max(1, 2)` | `Math.random()` | 不确定性 |
| `str.toUpperCase()` | `console.log(str)` | 副作用（I/O） |
| `arr.slice(0, 3)` | `arr.splice(0, 3)` | 副作用（修改原数组） |
| `[...arr, item]` | `arr.push(item)` | 副作用（修改原数组） |

### 2.2 引用透明性 (Referential Transparency)

如果一个表达式可以被它的值**替换**，而不改变程序行为，它就是引用透明的：

```typescript
// add(2, 3) 是引用透明的
// 可以把所有 add(2, 3) 替换为 5，程序行为不变
const x = add(2, 3) + add(2, 3);
const x = 5 + 5; // 完全等价
```

引用透明性带来的好处：

- **可缓存** — 相同输入的结果可以 memoize
- **可并行** — 纯函数之间没有共享状态，可以安全并行
- **可测试** — 不需要 mock 任何外部依赖
- **可推理** — 可以局部理解代码，不需要考虑全局上下文

### 2.3 副作用的分类与隔离

副作用是函数与外部世界的交互。它不是"坏事"——程序的**价值**就在于它的副作用（显示 UI、写数据库、发网络请求）。关键在于**隔离和管理**副作用，而非消灭它。

常见副作用类型：

| 类型 | 示例 | 影响 |
|------|------|------|
| 修改外部变量 | `counter++` | 状态不可预测 |
| I/O 操作 | `console.log()`、`fs.writeFile()` | 依赖外部环境 |
| 网络请求 | `fetch()` | 非确定性 |
| DOM 操作 | `document.title = '...'` | 外部状态变更 |
| 修改参数 | `arr.sort()` | 调用者被影响 |
| 抛出异常 | `throw new Error()` | 改变控制流 |

```typescript
// ❌ 副作用混杂在业务逻辑中
function processOrder(order: Order): void {
  const total = calculateTotal(order);    // 纯
  db.save(order);                         // 副作用
  emailService.send(order.email, total);  // 副作用
  logger.info(`Order processed: ${total}`); // 副作用
}

// ✅ 分离纯计算与副作用
function calculateOrderResult(order: Order) {
  return { total: calculateTotal(order) }; // 纯
}
// ... 副作用在调用层处理 — 详见第7节
```

> 完整的纯函数与副作用演示见 [`examples/01-pure-functions.ts`](./examples/01-pure-functions.ts)

---

## 3. 函数组合

> 🎭 **The Drama：乐高积木的哲学**
>
> 你不会用一整块塑料雕刻一座城堡。你用**标准化的小积木**拼出来。每块积木形状简单、接口统一——任何积木都能和任何积木连接。函数组合就是编程界的乐高：
>
> - 每个函数做**一件事**（单一职责）
> - 函数的输出可以是另一个函数的输入（可组合）
> - 小函数组合成大函数，大函数组合成更大的函数（分形结构）

### 3.1 手动组合

```typescript
// 三个简单函数
const trim    = (s: string) => s.trim();
const toLower = (s: string) => s.toLowerCase();
const split   = (s: string) => s.split(' ');

// 手动组合 — 嵌套调用（从内到外读）
const words = split(toLower(trim('  Hello World  ')));
// 缺点：嵌套深了就难读
```

### 3.2 `compose` — 从右到左组合

`compose` 接收一系列函数，返回一个新函数。执行顺序是**从右到左**（数学传统）：

```typescript
// compose(f, g, h)(x) = f(g(h(x)))
const processString = compose(split, toLower, trim);
processString('  Hello World  ');
// → ['hello', 'world']
```

### 3.3 `pipe` — 从左到右组合

`pipe` 和 `compose` 功能相同，但执行顺序是**从左到右**（更符合阅读习惯）：

```typescript
// pipe(f, g, h)(x) = h(g(f(x)))
const processString = pipe(trim, toLower, split);
processString('  Hello World  ');
// → ['hello', 'world']
```

### 3.4 TC39 管道操作符提案 (`|>`)

TC39 正在推进管道操作符，它让函数组合变成原生语法：

```typescript
// 提案语法（尚未正式通过）
const result = '  Hello World  '
  |> trim(%)
  |> toLower(%)
  |> split(%);
```

目前可以通过 Babel 插件 `@babel/plugin-proposal-pipeline-operator` 提前体验。

### 3.5 组合的数学基础：结合律

函数组合满足**结合律**（和加法一样）：

```typescript
compose(f, compose(g, h)) === compose(compose(f, g), h)
// 无论怎么分组，结果相同
```

这意味着你可以自由地**拆分和重组**函数管道，不影响结果。

> 完整的函数组合演示见 [`examples/02-composition.ts`](./examples/02-composition.ts)

---

## 4. 柯里化与偏应用

> ⚛️ **Science：柯里化 — 以逻辑学家 Haskell Curry 命名**
>
> 柯里化 (Currying) 是以美国数学家和逻辑学家 Haskell Curry (1900–1982) 的名字命名的。Curry 的工作建立在 Moses Schönfinkel 的基础之上——Schönfinkel 在 1924 年就发明了柯里化的概念，但命名权归了 Curry（学术界的残酷现实）。Haskell 语言也是以他命名的。
>
> 柯里化的数学本质是：**任何接受多个参数的函数都可以被转换为一系列只接受一个参数的函数**。在 λ 演算中，所有函数本来就是单参的——多参函数是语法糖。

### 4.1 柯里化 vs 偏应用

这两个概念经常被混淆，但它们有本质区别：

| | 柯里化 (Currying) | 偏应用 (Partial Application) |
|---|---|---|
| **定义** | 将 `f(a, b, c)` 转换为 `f(a)(b)(c)` | 固定部分参数，返回接收剩余参数的函数 |
| **参数数量** | 每次只接受**一个**参数 | 可以一次固定**多个**参数 |
| **转换方式** | 自动/通用转换 | 手动/按需绑定 |
| **示例** | `curry(add)(1)(2)` | `add.bind(null, 1)` → `(b) => add(1, b)` |

```typescript
// 柯里化
const curriedAdd = (a: number) => (b: number) => a + b;
const add5 = curriedAdd(5);  // 固定 a=5
add5(3); // 8

// 偏应用
const add = (a: number, b: number) => a + b;
const add5 = add.bind(null, 5); // 固定第一个参数
add5(3); // 8
```

### 4.2 柯里化的实际应用

柯里化不是学术玩具——它在日常编程中非常有用：

```typescript
// ✅ 场景1：创建可复用的配置函数
const log = (level: string) => (msg: string) =>
  console.log(`[${level}] ${msg}`);

const info  = log('INFO');   // 复用 level
const error = log('ERROR');
info('Server started');      // [INFO] Server started

// ✅ 场景2：数据管道中的参数复用
const filterBy = <T>(pred: (x: T) => boolean) =>
  (arr: T[]) => arr.filter(pred);

const adults = filterBy<{age: number}>(u => u.age >= 18);
// ... 完整实现见 examples/03-currying-partial.ts
```

### 4.3 通用 `curry` 函数的实现思路

```typescript
// 简化版 curry（完整版见 examples）
function curry(fn: Function) {
  return function curried(...args: any[]) {
    if (args.length >= fn.length) return fn(...args);
    return (...more: any[]) => curried(...args, ...more);
  };
}
```

> 完整的柯里化与偏应用演示见 [`examples/03-currying-partial.ts`](./examples/03-currying-partial.ts)

---

## 5. 不可变数据操作

> 🎭 **The Drama：共享可变状态 — 软件复杂性的根源**
>
> 想象一个家庭共享的购物清单贴在冰箱上。爸爸添加了"啤酒"，妈妈删掉了"啤酒"换成了"牛奶"，孩子在"牛奶"后面加了"巧克力"。三个人同时修改同一张纸，结果是一团乱。
>
> 函数式编程的解法是：**每次修改都创建一份新清单**。爸爸有他的版本，妈妈有她的版本，最后大家比对合并。这就是**不可变数据**的核心思想——不修改原始数据，而是创建新的副本。
>
> React 的 `setState` 就是这个思想的直接体现：你不能 `state.count++`，你必须 `setState({ count: state.count + 1 })`。

### 5.1 JavaScript 中的不可变操作

| 操作 | 可变（❌ 避免） | 不可变（✅ 推荐） |
|------|--------------|-----------------|
| 添加数组元素 | `arr.push(item)` | `[...arr, item]` |
| 删除数组元素 | `arr.splice(i, 1)` | `arr.filter((_, idx) => idx !== i)` |
| 修改数组元素 | `arr[i] = val` | `arr.map((x, idx) => idx === i ? val : x)` |
| 修改对象属性 | `obj.key = val` | `{ ...obj, key: val }` |
| 删除对象属性 | `delete obj.key` | `const { key, ...rest } = obj` |
| 数组排序 | `arr.sort()` | `[...arr].sort()` 或 `arr.toSorted()` |

### 5.2 浅拷贝 vs 深拷贝

```typescript
// ⚠️ Spread 只做浅拷贝
const original = { name: 'Alice', address: { city: 'NYC' } };
const copy = { ...original };
copy.address.city = 'LA';
// original.address.city 也变成了 'LA'！

// ✅ structuredClone 做深拷贝（ES2022+）
const deepCopy = structuredClone(original);
deepCopy.address.city = 'LA';
// original.address.city 仍然是 'NYC'
```

### 5.3 `Object.freeze()` 的局限性

```typescript
// Object.freeze 只冻结第一层
const config = Object.freeze({
  db: { host: 'localhost', port: 5432 }
});
config.db.port = 3306; // 不会报错！嵌套对象未冻结
```

### 5.4 Immer — 用"可变"语法写不可变更新

Immer 利用了 [上一章学过的 Proxy](../08-proxy-reflect/README.md)：

```typescript
import { produce } from 'immer';

const nextState = produce(state, draft => {
  draft.users[0].name = 'Bob';  // 看起来是可变操作
  draft.users.push({ name: 'Charlie' });
});
// state 不变，nextState 是新对象
```

> Immer 的 `draft` 是一个 Proxy。你对 `draft` 的所有"修改"操作被 Proxy 拦截、记录，然后在结束时生成一个新的不可变对象。**这就是 Proxy 的 FP 应用**。

### 5.5 ES2023+ 新方法：不可变数组操作

ES2023 引入了一批**非破坏性**数组方法：

```typescript
const arr = [3, 1, 4, 1, 5];
arr.toSorted();   // [1, 1, 3, 4, 5]（原数组不变）
arr.toReversed(); // [5, 1, 4, 1, 3]
arr.with(2, 99);  // [3, 1, 99, 1, 5]（替换索引2）
arr.toSpliced(1, 1, 10); // [3, 10, 4, 1, 5]
```

> 完整的不可变数据模式演示见 [`examples/04-immutable-patterns.ts`](./examples/04-immutable-patterns.ts)

---

## 6. 函数式错误处理

> ⚛️ **Science：从 try/catch 到代数数据类型**
>
> `try/catch` 是**命令式**错误处理——它像 `goto` 一样改变控制流，跳到一个完全不同的代码块。函数式编程认为这破坏了函数的**可组合性**：一个可能抛异常的函数不再是"输入 → 输出"的纯映射，它有了一个隐藏的出口（异常通道）。
>
> FP 的替代方案：**把错误编码为返回值**。函数永远返回一个值，但这个值可能是"成功"或"失败"。Rust 的 `Result<T, E>`、Haskell 的 `Either a b`、Scala 的 `Try[T]` 都是这个思路。

### 6.1 Option / Maybe 模式 — 处理"可能没有值"

`Option` 替代 `null` / `undefined`：

```typescript
type Option<T> = { tag: 'some'; value: T }
               | { tag: 'none' };

function findUser(id: string): Option<User> {
  const user = db.get(id);
  return user ? { tag: 'some', value: user }
              : { tag: 'none' };
}
// 调用者必须检查 tag 才能拿到 value — 编译器强制
```

### 6.2 Result / Either 模式 — 处理"可能失败"

`Result` 比 `Option` 多了错误信息：

```typescript
type Result<T, E> = { ok: true; value: T }
                  | { ok: false; error: E };

function parseJSON(str: string): Result<unknown, string> {
  try {
    return { ok: true, value: JSON.parse(str) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
```

### 6.3 为什么 Result 模式更安全？

```typescript
// ❌ try/catch — 错误可以被静默忽略
const data = JSON.parse(input); // 可能爆炸，编译器不强制处理

// ✅ Result — 编译器强制你处理两种情况
const result = parseJSON(input);
if (result.ok) {
  console.log(result.value);  // 安全访问
} else {
  console.error(result.error); // 必须处理错误
}
```

### 6.4 Result 的链式操作：`map` 和 `flatMap`

```typescript
// 让 Result 可链式操作
function map<T, U, E>(r: Result<T, E>, fn: (v: T) => U) {
  return r.ok ? { ok: true, value: fn(r.value) } : r;
}
// 如果是成功，应用转换；如果是失败，直接透传
// ... 完整实现见 examples/05-functional-error-handling.ts
```

> 完整的函数式错误处理演示见 [`examples/05-functional-error-handling.ts`](./examples/05-functional-error-handling.ts)

---

## 7. Functional Core, Imperative Shell

> ⚛️ **Science：Functional Core, Imperative Shell — 洋葱架构的函数式版本**
>
> 把你的应用想象成一个洋葱：
>
> - **最内层**是**纯函数核心** (Functional Core)——业务逻辑、数据转换。可测试、可推理、零副作用。
> - **最外层**是**命令式外壳** (Imperative Shell)——读写数据库、调 API、写日志。包含所有副作用。
>
> 数据从外壳流入核心，经过纯计算，结果从核心流出到外壳执行副作用。React 的组件就是这种模式：渲染函数是纯的（核心），`useEffect` 里放副作用（壳）。

### 7.1 架构对比

```
┌──────────────────────────────────────────────┐
│          Imperative Shell (不纯)              │
│  ┌────────────────────────────────────────┐  │
│  │     Functional Core (纯函数)            │  │
│  │                                        │  │
│  │  • 业务规则                             │  │
│  │  • 数据验证                             │  │
│  │  • 状态计算                             │  │
│  │  • 数据转换                             │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  • 数据库读写      • HTTP 请求               │
│  • 文件系统        • 用户输入                 │
│  • 日志输出        • 随机数/时间              │
└──────────────────────────────────────────────┘
```

### 7.2 实战示例：订单处理

```typescript
// === Functional Core（纯函数）===
function calculateDiscount(
  items: Item[], memberLevel: string
): number {
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const rate = memberLevel === 'vip' ? 0.2 : 0.1;
  return subtotal * rate; // 纯计算，无副作用
}

function validateOrder(order: Order): Result<Order, string> {
  if (order.items.length === 0)
    return { ok: false, error: 'Empty order' };
  return { ok: true, value: order };
}
```

```typescript
// === Imperative Shell（副作用）===
async function processOrder(orderId: string) {
  // 副作用：读数据库
  const order = await db.orders.findById(orderId);
  const member = await db.members.findById(order.userId);

  // 纯核心：业务计算
  const validation = validateOrder(order);
  if (!validation.ok) throw new Error(validation.error);
  const discount = calculateDiscount(order.items, member.level);

  // 副作用：写数据库、发通知
  await db.orders.update(orderId, { discount });
  await notificationService.send(order.userId, discount);
}
```

### 7.3 FCIS 模式的好处

| 好处 | 说明 |
|------|------|
| **可测试** | 纯核心可以用简单的 `assert` 测试，无需 mock |
| **可理解** | 纯函数可以独立理解，无需考虑外部状态 |
| **可复用** | 纯核心可以在不同上下文（API、CLI、测试）中复用 |
| **可重构** | 更换数据库？只改 Shell，Core 不动 |

### 7.4 React 中的 FCIS

React 组件天然是 FCIS 模式：

```typescript
// Functional Core — 纯渲染
function UserCard({ user }: { user: User }) {
  const displayName = formatName(user);  // 纯计算
  return <div>{displayName}</div>;       // 纯渲染
}

// Imperative Shell — 副作用
function UserPage() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {  // 副作用在 Shell 层
    fetchUser(id).then(setUser);
  }, [id]);
  return user ? <UserCard user={user} /> : <Loading />;
}
```

---

## 8. FP 在现代 JS/TS 中的渗透

> 🌌 **The Big Picture：你一直在写函数式代码**
>
> FP 不是一个独立的技术栈——它已经渗透到了现代 JavaScript/TypeScript 的每个角落。下面是你可能没意识到的 FP 应用：

### 8.1 React = FP 的前端表达

| React 概念 | FP 对应 |
|------------|---------|
| 纯组件 `function App(props)` | 纯函数 |
| `useState` 返回新值 | 不可变状态 |
| `useEffect` 隔离副作用 | Imperative Shell |
| `useMemo` / `useCallback` | Memoization |
| `key` prop | 引用透明性（决定是否重新渲染） |

### 8.2 Redux = FP 的状态管理

```typescript
// Reducer 是纯函数：(state, action) => newState
function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload]; // 不可变更新
    case 'TOGGLE':
      return state.map(t =>
        t.id === action.id ? { ...t, done: !t.done } : t
      );
    default:
      return state;
  }
}
```

### 8.3 Array 方法链 = FP 的数据管道

```typescript
const report = transactions
  .filter(t => t.date >= startDate)    // 筛选
  .map(t => ({                          // 转换
    ...t,
    amount: t.amount * exchangeRate
  }))
  .reduce((sum, t) => sum + t.amount, 0); // 聚合
```

这条链就是一个 `pipe`：`filter → map → reduce`。

### 8.4 Promise 链 = Monad 的简化版

```typescript
fetchUser(id)
  .then(user => fetchPosts(user.id))  // flatMap
  .then(posts => posts.filter(...))    // map
  .catch(handleError);                 // 错误通道
```

> `Promise` 在行为上近似 FP 中的 Monad——它包装了一个值，提供 `.then()` 进行链式变换，并能传播错误。虽然 `Promise` 并不严格满足 Monad 法则（它会自动展平嵌套 Promise），但思维模式是相同的。

### 8.5 TypeScript 类型系统中的 FP

TypeScript 的类型系统本身就是一个函数式语言：

```typescript
// 类型级别的"函数"
type Nullable<T> = T | null;            // 高阶类型
type Pick<T, K extends keyof T> = {     // 类型变换
  [P in K]: T[P];
};
type ReturnType<T> = T extends (...args: any) => infer R
  ? R : never;                          // 模式匹配
```

条件类型 (`extends ? :`) 就是类型级别的 `if-else`，`infer` 就是类型级别的变量绑定。

---

## 9. 🧘 Zen of Code：FP 与 OOP 不是战争

> 🧘 **Zen of Code**
>
> 互联网上充斥着"FP vs OOP"的论战。有人说"OOP 已死"，有人说"FP 是象牙塔学术"。这些都是**虚假的二元对立**。
>
> **FP 和 OOP 是两种组织代码的方式，它们解决不同维度的问题**：
>
> - **OOP** 擅长建模**实体和关系**——用户、订单、产品。当你的问题域有很多"名词"时，OOP 很自然。
> - **FP** 擅长建模**数据转换**——过滤、映射、聚合、管道。当你的问题域有很多"动词"时，FP 很自然。
>
> 现代 JavaScript/TypeScript 是**多范式语言**——你可以在同一个项目中同时使用两种范式：
>
> - 数据模型用 Class（OOP）
> - 数据处理用纯函数（FP）
> - 状态管理用不可变更新（FP）
> - UI 组件用函数组件（FP + OOP 的混合）
>
> **不要追求范式的纯粹性。追求代码的清晰性。**

### 实用主义 FP 原则

1. **纯函数优先** — 能写纯函数就写纯函数，需要副作用时明确隔离
2. **不可变优先** — 用 `const` + Spread，需要性能时再考虑可变操作
3. **组合优先** — 用小函数组合解决问题，避免"上帝函数"
4. **类型驱动** — 用 TypeScript 类型系统表达数据流和约束
5. **实用高于教条** — FP 是工具箱，不是宗教。`for` 循环有时比 `reduce` 更清晰

---

## 10. 最佳实践与常见陷阱

### ✅ 最佳实践

| 实践 | 说明 | 示例 |
|------|------|------|
| 保持函数小巧 | 每个函数做一件事，不超过 10 行 | `const isAdult = (u: User) => u.age >= 18` |
| 用 `const` 声明 | 除非需要重新赋值 | `const items = [...oldItems, newItem]` |
| 用不可变数组方法 | `map`/`filter`/`reduce` 代替 `for` 循环 | `arr.filter(x => x > 0)` |
| 用 Result 代替 throw | 让错误路径显式化 | `parseJSON(s): Result<T, Error>` |
| 纯核心 + 不纯外壳 | 业务逻辑放纯函数中 | FCIS 模式 |
| 用 `pipe`/`compose` 组合 | 避免深层嵌套调用 | `pipe(validate, transform, format)` |
| 用 TypeScript 严格模式 | 类型安全 + 强制处理 null | `strictNullChecks: true` |

### ❌ 常见陷阱

#### 陷阱 1：过度函数式 — "一切都用 reduce"

```typescript
// ❌ 用 reduce 做所有事情
const result = data.reduce((acc, item) => {
  if (item.type === 'A') {
    acc.aCount++;
    acc.aTotal += item.value;
  } else {
    acc.bItems.push(item);
  }
  return acc;
}, { aCount: 0, aTotal: 0, bItems: [] as Item[] });

// ✅ 拆分成多个清晰的操作
const aItems = data.filter(d => d.type === 'A');
const bItems = data.filter(d => d.type !== 'A');
const aCount = aItems.length;
const aTotal = aItems.reduce((s, i) => s + i.value, 0);
```

#### 陷阱 2：误以为 Spread 是深拷贝

```typescript
// ❌ Spread 只做浅拷贝
const newUser = { ...user };
newUser.address.city = 'NYC'; // 修改了原对象！

// ✅ 嵌套对象也要展开
const newUser = {
  ...user,
  address: { ...user.address, city: 'NYC' }
};
```

#### 陷阱 3：在循环中创建大量临时数组

```typescript
// ❌ 每个 map/filter 都创建新数组 — 10万条数据时性能差
const result = hugeArray
  .filter(x => x > 0)     // 新数组 1
  .map(x => x * 2)        // 新数组 2
  .filter(x => x < 100);  // 新数组 3

// ✅ 对大数据集使用 for 循环或生成器
function* processStream(arr: number[]) {
  for (const x of arr) {
    if (x > 0 && x * 2 < 100) yield x * 2;
  }
}
```

#### 陷阱 4：将 `console.log` 塞入纯函数"调试"

```typescript
// ❌ console.log 是副作用
function add(a: number, b: number) {
  console.log(`adding ${a} + ${b}`);  // 副作用！
  return a + b;
}

// ✅ 用高阶函数包装调试
const trace = <T>(label: string) => (value: T): T => {
  console.log(`[${label}]`, value);
  return value;
};
// 在 pipe 中插入 trace：
pipe(validate, trace('after validate'), transform);
```

#### 陷阱 5：忽略 `sort()` 的原地修改

```typescript
// ❌ sort() 修改原数组
const sorted = items.sort((a, b) => a.price - b.price);
// items 也被修改了！

// ✅ ES2023 toSorted() 或 spread + sort
const sorted = items.toSorted((a, b) => a.price - b.price);
// 或
const sorted = [...items].sort((a, b) => a.price - b.price);
```

---

## 11. 本章总结

### 知识图谱

```
函数式编程
├── 核心概念
│   ├── 纯函数 — 确定性 + 无副作用
│   ├── 引用透明性 — 可替换为值
│   ├── 不可变性 — 创建新的，不修改旧的
│   └── 高阶函数 — 函数是一等公民
│
├── 组合技巧
│   ├── compose — 从右到左
│   ├── pipe — 从左到右
│   ├── 柯里化 — f(a, b) → f(a)(b)
│   └── 偏应用 — 固定部分参数
│
├── 错误处理
│   ├── Option/Maybe — 有值 or 无值
│   └── Result/Either — 成功 or 失败
│
├── 架构模式
│   └── FCIS — 纯核心 + 不纯外壳
│
└── 现代渗透
    ├── React — UI = f(State)
    ├── Redux — (state, action) => newState
    ├── Array 方法链 — filter/map/reduce
    └── Promise 链 — then/catch
```

### 章节间连接

| 向前连接 | 向后连接 |
|---------|---------|
| Stage 1 Ch02 高阶函数（函数式编程的基础积木） | Stage Modern Frontend Ch07 React（React 的声明式 UI 与 FP 的关系） |
| Stage 2 Ch02 ES6 箭头函数/迭代器（FP 的语法基础设施） | Stage 3 Ch04 架构最佳实践（"纯函数核心，不纯的壳"在架构中的应用） |
| Stage 2 Ch08 错误处理体系（try/catch → Result 模式的演进） | ts-toolkit 项目（FP 工具库的实现） |
| Stage 3 Ch08 Proxy/Reflect（Immer 的 Proxy 实现不可变更新） | |

### 核心要点速查

| 概念 | 一句话总结 |
|------|-----------|
| 纯函数 | 相同输入永远返回相同输出，且不产生副作用 |
| 引用透明性 | 表达式可被其值替换而不改变程序行为 |
| 不可变性 | 数据一旦创建就不再修改，修改 = 创建新副本 |
| 柯里化 | `f(a, b, c)` → `f(a)(b)(c)`，每次接受一个参数 |
| 偏应用 | 固定部分参数，返回接受剩余参数的新函数 |
| 函数组合 | 将多个小函数组合为一个大函数 |
| Option/Maybe | 用类型安全的方式表达"可能没有值" |
| Result/Either | 用类型安全的方式表达"可能失败" |
| FCIS | 纯函数做核心计算，命令式外壳处理副作用 |

---

## 12. 章节练习

### 练习 1：实现 `pipe` 和 `compose`

**难度**: ⭐⭐
**涉及知识点**: 函数组合、泛型、高阶函数

**题目描述**: 实现类型安全的 `pipe` 和 `compose` 函数，使其能正确推导返回类型。

**要求**:
1. `pipe(f, g, h)(x)` 等价于 `h(g(f(x)))`
2. `compose(f, g, h)(x)` 等价于 `f(g(h(x)))`
3. 支持 2-5 个函数的组合
4. 使用 TypeScript 重载提供类型推导

**提示**: 使用函数重载为不同参数数量提供精确类型

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `examples/02-composition.ts`

核心思路：使用 TypeScript 函数重载为 2-5 个函数的组合提供精确的类型推导。`pipe` 从左到右 reduce，`compose` 从右到左 reduceRight。

</details>

---

### 练习 2：实现类型安全的 `Result<T, E>`

**难度**: ⭐⭐⭐
**涉及知识点**: 函数式错误处理、泛型、类型收窄

**题目描述**: 实现一个完整的 `Result` 类型，包含 `map`、`flatMap`、`unwrapOr` 等方法。

**要求**:
1. `Result<T, E>` 有 `Ok` 和 `Err` 两种状态
2. 实现 `map`：对成功值进行转换
3. 实现 `flatMap`：链式组合可能失败的操作
4. 实现 `unwrapOr`：提供默认值
5. 编译器能自动收窄类型（检查 `ok` 后可以安全访问 `value`）

**提示**: 使用 discriminated union（可辨识联合类型），`ok` 字段作为判别符

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `examples/05-functional-error-handling.ts`

核心思路：使用 `{ ok: true, value: T } | { ok: false, error: E }` 作为基础类型。`map` 和 `flatMap` 在 `ok` 为 true 时应用函数，为 false 时透传错误。

</details>

---

### 练习 3：用 FCIS 重构一个"大泥球"函数

**难度**: ⭐⭐⭐
**涉及知识点**: Functional Core Imperative Shell、纯函数、副作用隔离

**题目描述**: 给定以下混杂了业务逻辑和副作用的函数，将其重构为 FCIS 模式：

```typescript
// 待重构的"大泥球"
async function registerUser(name: string, email: string) {
  if (name.length < 2) throw new Error('Name too short');
  if (!email.includes('@')) throw new Error('Invalid email');
  const user = { id: crypto.randomUUID(), name, email };
  await db.users.insert(user);
  await emailService.sendWelcome(user.email);
  console.log(`User ${name} registered`);
  return user;
}
```

**要求**:
1. 提取纯函数：验证逻辑、用户对象创建
2. 使用 Result 类型代替 throw
3. Shell 层调用 Core 并执行副作用
4. 纯函数部分可以不依赖任何外部模块进行单元测试

**提示**: `crypto.randomUUID()` 是副作用（不确定性），应该由 Shell 层生成并传入

<details>
<summary>💡 参考答案</summary>

核心思路：
1. `validateRegistration(name, email): Result<void, string>` — 纯函数
2. `createUser(id, name, email): User` — 纯函数（id 由外部传入）
3. `registerUser(name, email)` — Shell，调用上面两个纯函数，然后执行 DB/Email 副作用

将 `crypto.randomUUID()` 的调用提升到 Shell 层，作为参数传入纯函数，使核心函数完全确定性。

</details>
