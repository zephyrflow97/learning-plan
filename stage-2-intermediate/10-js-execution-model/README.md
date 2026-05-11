# 第 10 章：JavaScript 执行机制深入 — 掀开引擎的盖子

> *"You don't really understand something unless you can explain it to your grandmother."*
> — Albert Einstein
>
> 你已经知道"闭包能访问外部变量"、"let 不会提升"、"箭头函数没有自己的 this"。但你能解释**为什么**吗？这些行为不是语法层面的规定——它们是执行引擎内部数据结构的**自然推论**。当你理解了执行上下文和词法环境这两个核心数据结构，所有那些看似"需要记忆的规则"都会变成"显而易见的推论"。
>
> 本章不讲"怎么用"，讲"怎么回事"。我们要做的，是把 V8 引擎的盖子掀开，看看里面的齿轮是怎么转的。

## 📖 本章内容

1. [执行上下文 (Execution Context)](#1-执行上下文-execution-context)
2. [词法环境 (Lexical Environment)](#2-词法环境-lexical-environment)
3. [变量提升的统一模型](#3-变量提升的统一模型)
4. [暂时性死区 (TDZ)](#4-暂时性死区-tdz)
5. [闭包的底层实现](#5-闭包的底层实现)
6. [尾调用优化 (TCO)](#6-尾调用优化-tco)
7. [this 绑定完整规则](#7-this-绑定完整规则)
8. [🧘 Zen of Code: 从记忆到推理](#8--zen-of-code-从记忆到推理)
9. [最佳实践与常见陷阱](#9-最佳实践与常见陷阱)
10. [章节练习](#10-章节练习)

---

## 1. 执行上下文 (Execution Context)

> 🎭 **The Drama: 舞台剧的场景切换**
>
> 想象 JavaScript 引擎是一座剧院。全局代码是第一幕（全局执行上下文）。每次调用函数，就换一幕（新的函数执行上下文压入调用栈）。每一幕都有自己的布景（变量环境）、道具（局部变量）、和一张"上一幕的剧照"（外部词法环境引用）。当这一幕演完（函数 return），布景被拆掉（执行上下文出栈），但如果有人拍了照片保留了（闭包），那些道具就不会被清理。
>
> 调用栈就是舞台管理员手中的**演出顺序表**——先进后出，严格有序。

### 1.1 三种执行上下文

ECMAScript 规范定义了三种执行上下文：

```javascript
// 1. 全局执行上下文 (Global Execution Context)
// — 程序启动时自动创建，整个生命周期只有一个
// — 创建全局对象（浏览器中是 window，Node.js 中是 global）
// — 将 this 绑定到全局对象
var globalVar = 'I am global';

// 2. 函数执行上下文 (Function Execution Context)
// — 每次调用函数时创建
// — 可以有无数个
function greet(name) {
  // 进入这里时，创建新的函数执行上下文
  var greeting = 'Hello, ' + name;
  return greeting;
  // return 后，这个执行上下文被销毁
}

// 3. eval 执行上下文 (Eval Execution Context)
// — eval() 调用时创建，实际开发中应避免使用
```

> 完整的执行上下文演示见 [`examples/01-execution-context.js`](./examples/01-execution-context.js)

### 1.2 调用栈 (Call Stack)

调用栈是引擎管理执行上下文的数据结构——一个 **LIFO（后进先出）栈**。

```javascript
function first() {
  console.log('first start');
  second();                    // 压入 second 的上下文
  console.log('first end');    // second 返回后才执行
}

function second() {
  console.log('second start');
  third();                     // 压入 third 的上下文
  console.log('second end');
}

function third() {
  console.log('third');        // 执行后出栈
}

first();
// 调用栈变化：
// [global] → [global, first] → [global, first, second]
// → [global, first, second, third] → [global, first, second]
// → [global, first] → [global]
```

### 1.3 执行上下文的两个阶段

每个执行上下文经历两个阶段：

| 阶段 | 发生了什么 | 关键行为 |
|------|-----------|---------|
| **创建阶段** (Creation Phase) | 扫描代码，注册声明 | `var` 初始化为 `undefined`；`let`/`const` 注册但**不初始化**；函数声明**整体**提升 |
| **执行阶段** (Execution Phase) | 逐行执行代码 | 给变量赋值，执行函数调用，计算表达式 |

```javascript
// 创建阶段的效果可视化
console.log(a);      // undefined (var 在创建阶段初始化为 undefined)
// console.log(b);   // ReferenceError! (let 在创建阶段不初始化 → TDZ)
greetFn('World');     // "Hello, World" (函数声明整体提升)

var a = 10;
let b = 20;
function greetFn(name) {
  return 'Hello, ' + name;
}
```

### 1.4 执行上下文的内部结构 (ES6+ 规范)

> 🧠 **CS Master's Bridge: 从 AO/VO 到 Environment Record 的演化**
>
> 如果你在网上搜索"JavaScript 执行上下文"，你可能会看到大量关于 **Activation Object (AO)** 和 **Variable Object (VO)** 的讲解。这些是 ES3 规范的术语，在现代规范（ES6+）中已经被 **Environment Record** 取代。本章使用 ES6+ 规范术语。
>
> | ES3 术语 (已过时) | ES6+ 术语 (现行) |
> |-------------------|------------------|
> | Variable Object (VO) | Environment Record |
> | Activation Object (AO) | Function Environment Record |
> | Scope Chain | `[[OuterEnv]]` 引用链 |

ES6+ 规范中，每个执行上下文包含以下组件：

```
ExecutionContext = {
  LexicalEnvironment: {        // 用于解析 let/const/class 声明
    EnvironmentRecord: { ... },
    [[OuterEnv]]: <reference>
  },
  VariableEnvironment: {       // 用于解析 var 声明
    EnvironmentRecord: { ... },
    [[OuterEnv]]: <reference>
  },
  ThisBinding: <value>         // this 的值
}
```

- **LexicalEnvironment**：解析 `let`、`const`、`class` 声明，以及块级作用域
- **VariableEnvironment**：解析 `var` 和 `function` 声明，函数级作用域
- **ThisBinding**：`this` 的值，在创建阶段确定

> 💡 为什么有两个环境？因为 `var` 是函数作用域，`let`/`const` 是块作用域。`VariableEnvironment` 在进入函数时创建一次，`LexicalEnvironment` 在每个 `{}` 块时可能创建新的。

---

## 2. 词法环境 (Lexical Environment)

> 🧠 **CS Master's Bridge: 词法环境 ≈ 作用域链的链表实现**
>
> 每个词法环境包含两部分：(1) **Environment Record**（当前作用域的变量表，类似哈希表），(2) **`[[OuterEnv]]`**（指向外层词法环境的指针）。当引擎查找变量时，就是在做**链表遍历**：先查当前节点，没找到就跟 `[[OuterEnv]]` 指针走到下一个节点。`null` 是链表的终点（全局作用域之外）。
>
> 如果你学过数据结构，这就是一个**单链表**：
> ```
> 当前环境 → 外层环境 → 更外层 → ... → 全局环境 → null
> ```

### 2.1 Environment Record 的类型

ECMAScript 规范定义了三种 Environment Record：

| 类型 | 对应场景 | 包含内容 |
|------|---------|---------|
| **Declarative Environment Record** | 函数、块级作用域 (`{}`) | `let`/`const`/`class`/函数声明等 |
| **Object Environment Record** | `with` 语句、全局作用域 | 绑定到一个实际的 JS 对象（全局作用域绑定到 `globalThis`） |
| **Function Environment Record** | 函数内部 | 继承 Declarative，额外包含 `this`、`arguments`、`super` |

### 2.2 链式查找的过程

```javascript
var x = 'global x';

function outer() {
  var y = 'outer y';

  function inner() {
    var z = 'inner z';
    console.log(z);   // 在当前 Record 找到 → 'inner z'
    console.log(y);   // 当前没有 → 跟 [[OuterEnv]] → 在 outer 的 Record 找到
    console.log(x);   // 当前没有 → outer 没有 → 跟 [[OuterEnv]] → 全局找到
  }

  inner();
}
outer();
// 链: inner.Record → outer.Record → global.Record → null
```

> 完整的词法环境链式查找演示见 [`examples/02-lexical-environment.js`](./examples/02-lexical-environment.js)

### 2.3 块级作用域的词法环境

```javascript
function demo() {
  let a = 1;              // demo 的 LexicalEnvironment

  if (true) {
    let b = 2;            // 新的块级 LexicalEnvironment
    console.log(a);       // 1 — 沿 [[OuterEnv]] 向上找到
    console.log(b);       // 2 — 当前 Record
  }

  // console.log(b);      // ReferenceError — if 块的环境已出栈
}
```

进入 `if` 块时，引擎创建一个新的词法环境，其 `[[OuterEnv]]` 指向 `demo` 的词法环境。离开 `if` 块时，这个词法环境被丢弃——`b` 从此不可访问。

### 2.4 词法作用域 vs 动态作用域

> 🌌 **The Big Picture: 词法作用域 — 代码写在哪里，就在哪里查找**
>
> JavaScript 使用**词法作用域（Lexical Scope）**，也叫**静态作用域**。变量的查找取决于函数**定义时**的位置，而不是**调用时**的位置。这意味着在你写代码的那一刻，作用域链就已经确定了——不需要运行程序就能推断变量的来源。
>
> 与之相对的是**动态作用域**（Bash、一些 Lisp 方言）——变量的查找取决于调用栈。同一个函数在不同的调用位置可能看到不同的变量值。JavaScript 选择了词法作用域，因为它更**可预测**、更**易推理**。

```javascript
var scope = 'global';

function checkScope() {
  var scope = 'local';
  return innerCheck();
}

function innerCheck() {
  return scope;  // 词法作用域：看定义位置 → 找到全局的 'global'
                 // 如果是动态作用域：看调用位置 → 会找到 'local'
}

console.log(checkScope()); // 'global' — 因为 JS 是词法作用域
```

> ⚛️ **The Science: 为什么选词法作用域？**
>
> 词法作用域让编译器/引擎可以在编译时就确定变量的绑定关系，这使得**静态分析**和**性能优化**成为可能。V8 的 TurboFan 优化编译器正是利用词法作用域的确定性来做内联缓存 (Inline Cache) 和逃逸分析 (Escape Analysis)。如果 JS 是动态作用域，大量优化将无法实施。

---

## 3. 变量提升的统一模型

> 🎭 **The Drama: 提升不是"搬运"，是"提前注册"**
>
> "变量提升"这个名词容易造成误导——很多人以为引擎把代码"搬到了文件顶部"。实际上，引擎**从来不移动代码**。所谓"提升"，是指在执行上下文的**创建阶段**，引擎扫描代码并将声明**注册**到 Environment Record 中。注册时的初始状态因声明类型而异——这就是各种提升差异的根源。

### 3.1 五种声明的提升行为

| 声明类型 | 创建阶段行为 | 声明前访问 | 作用域 |
|---------|-------------|-----------|--------|
| `var` | 注册 + 初始化为 `undefined` | `undefined` (不报错) | 函数级 |
| `let` | 注册，**不初始化** | ❌ `ReferenceError` (TDZ) | 块级 |
| `const` | 注册，**不初始化** | ❌ `ReferenceError` (TDZ) | 块级 |
| `function` 声明 | 注册 + 初始化为**函数体** | ✅ 可正常调用 | 函数级 (严格模式下块级) |
| `class` | 注册，**不初始化** | ❌ `ReferenceError` (TDZ) | 块级 |

```javascript
// --- var: 注册 + 初始化为 undefined ---
console.log(a);   // undefined (不报错！a 已注册并初始化为 undefined)
var a = 10;

// --- let: 注册但不初始化 ---
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;

// --- function: 注册 + 初始化为函数体 ---
sayHi();           // "Hi!" (函数声明整体提升)
function sayHi() { console.log('Hi!'); }

// --- class: 注册但不初始化 ---
// const p = new Person(); // ReferenceError
class Person {}
```

> 完整的各种提升行为对比见 [`examples/03-hoisting-unified.js`](./examples/03-hoisting-unified.js)

### 3.2 函数声明 vs 函数表达式的提升差异

```javascript
// 函数声明 — 整体提升（创建阶段就绑定函数体）
hoistedFn();   // ✅ "I work!"
function hoistedFn() { console.log('I work!'); }

// 函数表达式 — 只提升变量，不提升函数体
// notHoisted(); // ❌ TypeError: notHoisted is not a function
var notHoisted = function() { console.log('I fail'); };
// notHoisted 在创建阶段被注册为 undefined
// 调用 undefined() 当然是 TypeError
```

> ⚛️ **The Science: 为什么函数声明整体提升？**
>
> 这是 Brendan Eich 的有意设计。函数声明整体提升允许**互相递归**——函数 A 调用函数 B，函数 B 调用函数 A，不需要考虑声明顺序。这在某些编程模式中非常有用（如状态机、解析器）。而 `let`/`const` 的 TDZ 是 ES6 为了**代码安全性**做的改进——强制你先声明再使用。

### 3.3 同名声明的优先级

当 `var` 和 `function` 同名时，函数声明优先级更高：

```javascript
console.log(typeof foo); // 'function' (不是 'undefined')
var foo = 'string';
function foo() {}
console.log(typeof foo); // 'string' (执行阶段 var 赋值覆盖)
```

创建阶段：`foo` 先被 `var` 注册为 `undefined`，然后被 `function` 覆盖为函数体。执行阶段：`var foo = 'string'` 将 `foo` 重新赋值为字符串。

### 3.4 "提升"这个词的问题

> 🧘 **Zen of Code: 忘掉"提升"这个词**
>
> "提升 (hoisting)" 不是 ECMAScript 规范中的正式术语——规范从未使用过这个词。它是社区为了方便理解而创造的隐喻，但这个隐喻本身有误导性。更准确的心智模型是：
>
> 1. 执行上下文创建时，引擎**扫描**当前作用域的所有声明
> 2. 将声明的标识符**注册**到 Environment Record
> 3. 注册时的初始状态（`undefined`、函数体、或未初始化）因声明类型而异
> 4. 然后才开始逐行执行代码
>
> 代码没有被"搬运"。是引擎的**两阶段处理**制造了"提升"的幻觉。

---

## 4. 暂时性死区 (TDZ)

> 🌌 **The Big Picture: 薛定谔的变量**
>
> `let x = 1` 中的 `x`，在声明语句执行之前就已经存在于词法环境中了（被"提升"了），但它处于"**未初始化**"状态——你知道它在那里，但碰不到它。就像薛定谔的猫，变量存在于 Environment Record 中，但在你"打开盒子"（执行到声明语句）之前，任何观测（访问）都会导致"坍缩"（ReferenceError）。
>
> 这个"存在但不可触碰"的区间就是**暂时性死区 (Temporal Dead Zone, TDZ)**。

### 4.1 TDZ 的精确定义

TDZ 是从进入作用域到变量声明语句被执行之间的区间：

```javascript
{
  // -------- TDZ 开始 --------
  // x 已注册到 Environment Record，但状态为 "uninitialized"
  
  console.log(typeof x);   // ReferenceError! (即使是 typeof 也不安全)
  // console.log(x);        // ReferenceError: Cannot access 'x' before initialization
  
  // -------- TDZ 结束 --------
  let x = 42;               // 执行到这里时，x 被初始化为 42
  console.log(x);           // 42 ✅
}
```

### 4.2 为什么 typeof 在 TDZ 中也不安全？

```javascript
// 对于完全未声明的变量，typeof 是安全的
console.log(typeof undeclared); // 'undefined' (不报错)

// 但对于 TDZ 中的变量，typeof 也会报错！
{
  // console.log(typeof tdzVar); // ReferenceError!
  let tdzVar = 'hello';
}
```

> 这违反了很多人的直觉——`typeof` 不是"安全的检查"吗？对于真正不存在的变量是安全的，但对于 TDZ 中的变量不安全。原因：引擎能区分"根本没声明"和"声明了但未初始化"这两种状态。TDZ 中的变量属于后者。

### 4.3 TDZ 的常见陷阱

```javascript
// 陷阱 1: 函数参数的 TDZ
// function trap(a = b, b = 1) {} // ReferenceError — 参数从左到右求值
// trap();                         // 求值 a 时，b 还在 TDZ

// 陷阱 2: 循环中的 TDZ
for (let i = 0; i < 3; i++) {
  // 每次循环创建新的词法环境
  // i 在这里是"已初始化"的，不在 TDZ
  console.log(i); // 0, 1, 2
}

// 陷阱 3: class 继承中的 TDZ
// const instance = new Derived(); // ReferenceError
class Base {}
class Derived extends Base {}
```

> 完整的 TDZ 陷阱演示见 [`examples/04-tdz-and-closures.js`](./examples/04-tdz-and-closures.js)

### 4.4 TDZ 的设计意图

> ⚛️ **The Science: TDZ 不是 Bug，是 Feature**
>
> ES6 引入 TDZ 的三个理由：
>
> 1. **防止意外使用未初始化的变量** — `var` 的静默 `undefined` 已经造成了无数难以追踪的 Bug
> 2. **支持 `const` 的语义** — `const` 必须在声明时赋值，如果没有 TDZ，`const` 在声明前就能被访问到 `undefined`，违反了"常量"的语义
> 3. **与 `class` 语义一致** — `class` 中可能包含 `extends` 表达式，这些表达式在执行前不应该被使用

---

## 5. 闭包的底层实现

> 🎭 **The Drama: 闭包 — 函数带着行李箱旅行**
>
> 当一个函数从它的定义环境中"离开"（作为返回值、作为参数传递、存储到对象属性），它不是赤身裸体地出门。它带着一个**行李箱**——那个行李箱里装着它定义时所在的词法环境。无论这个函数被带到天涯海角，它打开行李箱就能找到"家乡"的变量。
>
> **闭包不是特殊语法，闭包是词法作用域 + 函数是一等公民的自然结果。**

### 5.1 闭包的定义

闭包是函数和其定义时的词法环境的组合。更精确地说：

```
闭包 = 函数对象 + 该函数创建时的 [[Environment]]（指向定义时的词法环境）
```

在 ECMAScript 规范中，每个函数对象都有一个内部属性 `[[Environment]]`，它在函数创建时被设置为当前执行上下文的词法环境。

### 5.2 用词法环境解释闭包

```javascript
function createCounter() {
  let count = 0;                // createCounter 的 Environment Record 中

  return function increment() { // increment 的 [[Environment]] → createCounter 的词法环境
    count++;                    // 沿 [[OuterEnv]] 找到 count
    return count;
  };
}

const counter = createCounter();
// createCounter() 返回后，其执行上下文出栈
// 但！increment 的 [[Environment]] 仍然引用 createCounter 的词法环境
// 所以 count 不会被 GC 回收

console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

> 🧠 **CS Master's Bridge: 闭包 = 函数对象持有词法环境节点的引用**
>
> 画出内存模型：
> ```
> counter (函数对象)
>   [[Environment]] ──→ createCounter 的词法环境
>                        ├── EnvironmentRecord: { count: 3 }
>                        └── [[OuterEnv]] → 全局词法环境
> ```
>
> `createCounter` 的执行上下文出栈了，但它的**词法环境节点**还在堆内存中，因为 `counter` 函数通过 `[[Environment]]` 引用着它。GC 无法回收仍被引用的对象——这就是闭包"记住"外部变量的底层原理。当所有引用这个词法环境的函数都被销毁时，GC 才会回收它。

### 5.3 经典的循环闭包问题

```javascript
// ❌ 经典 Bug: var + 循环 + 闭包
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出: 3, 3, 3
// 原因: var 是函数作用域，三个闭包共享同一个 i

// ✅ 修复 1: 使用 let (块级作用域)
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// 输出: 0, 1, 2
// 原因: 每次循环 let 创建新的词法环境，每个闭包引用不同的 j
```

> `let` 如何做到"每次循环新变量"？ECMAScript 规范明确要求：`for` 循环的每次迭代会创建一个**新的词法环境**，将上一次迭代的 `let` 变量的值复制到新环境中。这是 `let` 在 `for` 循环中的特殊行为——`var` 没有这个待遇。

### 5.4 闭包的内存考量

```javascript
// ❌ 闭包导致的内存泄漏
function createHeavyClosure() {
  const hugeArray = new Array(1000000).fill('data');
  // 即使 return 的函数不使用 hugeArray
  // 但由于闭包引用了整个词法环境...
  return function() {
    // 并非所有引擎都优化这种情况
    return 'I am lightweight';
  };
}

// ✅ 手动解除大对象引用
function createSmartClosure() {
  let hugeArray = new Array(1000000).fill('data');
  const result = hugeArray.length; // 提取需要的数据
  hugeArray = null;                // 释放大对象
  return function() {
    return result;                 // 只闭包一个数字
  };
}
```

> 💡 **V8 的闭包优化**：现代 V8 引擎会对闭包进行**变量分析**——如果内部函数只使用了外部作用域中的部分变量，V8 只会在堆上保留那些被使用的变量（放入 `Context` 对象），而不是整个词法环境。但如果内部函数中使用了 `eval()`，V8 就无法做这个优化——因为 `eval` 可能访问任何变量。

---

## 6. 尾调用优化 (TCO)

> 🌌 **The Big Picture: 递归的阿喀琉斯之踵**
>
> 递归是优雅的编程技法，但有一个致命弱点：每次递归调用都要压入一个新的执行上下文到调用栈。JavaScript 引擎的调用栈有容量限制（通常 10000~25000 层）。一个深度递归会导致 `RangeError: Maximum call stack size exceeded`。**尾调用优化 (Tail Call Optimization, TCO)** 是解决这个问题的规范级方案。

### 6.1 什么是尾调用

**尾调用**：函数的最后一个动作是调用另一个函数（或自身），并且**直接返回**其结果，不做任何额外操作。

```javascript
// ✅ 尾调用 — return 的是函数调用本身
function tailCall(n) {
  if (n <= 0) return 0;
  return tailCall(n - 1);        // 尾调用：直接返回调用结果
}

// ❌ 非尾调用 — return 后还有操作
function notTailCall(n) {
  if (n <= 0) return 0;
  return notTailCall(n - 1) + 1; // 不是尾调用：返回后还要 +1
}

// ❌ 非尾调用 — 调用结果没有被 return
function alsoNotTailCall(n) {
  if (n <= 0) return;
  alsoNotTailCall(n - 1);        // 不是尾调用：结果被丢弃了
  // 隐式 return undefined
}
```

### 6.2 TCO 的原理

当引擎检测到尾调用时，它可以**复用当前的栈帧**而不是创建新的：

```
// 没有 TCO:
factorial(5) → factorial(4) → factorial(3) → factorial(2) → factorial(1)
// 调用栈深度 = 5，每层都占用内存

// 有 TCO:
factorial(5) → [复用栈帧] → [复用栈帧] → [复用栈帧] → [复用栈帧]
// 调用栈深度始终 = 1
```

### 6.3 将递归转换为尾递归

```javascript
// ❌ 普通递归 — 不是尾调用 (return 后还有乘法)
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);   // n * ... 是额外操作
}

// ✅ 尾递归版本 — 用累加器参数
function factorialTail(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc); // 直接返回调用结果
}

console.log(factorialTail(5)); // 120
```

### 6.4 TCO 的现实状况

> ⚠️ **残酷的现实: TCO 规范与引擎实现的鸿沟**
>
> ES6（ES2015）规范明确要求引擎在严格模式下实现 TCO。但截至 2026 年：
>
> | 引擎 | 是否支持 TCO | 备注 |
> |------|-------------|------|
> | **JavaScriptCore** (Safari) | ✅ 支持 | 唯一完整实现 TCO 的主流引擎 |
> | **V8** (Chrome/Node.js) | ❌ 不支持 | 曾短暂实现后移除，理由：影响调试（堆栈追踪丢失）、性能优化收益不大 |
> | **SpiderMonkey** (Firefox) | ❌ 不支持 | 同样选择不实现 |
>
> 这意味着**你不能依赖 TCO**。在生产代码中，请使用**迭代 (while/for)** 替代深度递归：

```javascript
// ✅ 实际工程中的做法：用循环替代递归
function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// ✅ 蹦床函数 (Trampoline) — 通用的递归转迭代方案
function trampoline(fn) {
  return function trampolined(...args) {
    let result = fn(...args);
    while (typeof result === 'function') {
      result = result();       // 不断调用，直到返回非函数值
    }
    return result;
  };
}
```

---

## 7. this 绑定完整规则

> 🎭 **The Drama: this — JavaScript 中最令人困惑的关键字**
>
> `this` 是 JavaScript 中最让初学者困惑的概念。在 Java/C++ 中，`this` 永远指向当前实例——简单明了。但在 JavaScript 中，`this` 的值取决于函数**怎么被调用**，而不是**在哪里定义**。同一个函数，用不同方式调用，`this` 可以指向完全不同的对象。这是因为 JavaScript 的 `this` 是在执行上下文的**创建阶段**动态绑定的。

### 7.1 四种绑定规则（优先级从高到低）

```
┌─────────────────────────────────────────────────────────┐
│  优先级 1: new 绑定                                       │
│  new Foo() → this = 新创建的对象                          │
├─────────────────────────────────────────────────────────┤
│  优先级 2: 显式绑定                                       │
│  call / apply / bind → this = 指定的对象                  │
├─────────────────────────────────────────────────────────┤
│  优先级 3: 隐式绑定                                       │
│  obj.method() → this = obj (调用上下文)                   │
├─────────────────────────────────────────────────────────┤
│  优先级 4: 默认绑定                                       │
│  独立调用 fn() → this = globalThis (非严格) / undefined    │
└─────────────────────────────────────────────────────────┘
```

### 7.2 规则 1: 默认绑定

```javascript
function showThis() {
  console.log(this);
}

showThis(); // 非严格模式: window/globalThis
            // 严格模式: undefined
```

### 7.3 规则 2: 隐式绑定

```javascript
const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name); // this = obj
  }
};

obj.greet(); // 'Alice' — obj 是调用者

// ❌ 隐式绑定的丢失
const fn = obj.greet;      // 提取方法引用
fn();                       // undefined — 丢失了 obj 上下文，退化为默认绑定
```

> 隐式绑定的丢失是 JavaScript 中最常见的 `this` Bug。回调函数、事件处理器、`setTimeout` 都是重灾区：
> ```javascript
> setTimeout(obj.greet, 100); // undefined — greet 被独立调用
> ```

### 7.4 规则 3: 显式绑定

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const user = { name: 'Bob' };

greet.call(user, 'Hello');         // 'Hello, Bob'
greet.apply(user, ['Hi']);         // 'Hi, Bob'

const boundGreet = greet.bind(user);
boundGreet('Hey');                 // 'Hey, Bob'
// bind 返回一个新函数，this 被永久锁定
```

`call` 和 `apply` 的区别仅在参数传递方式：`call` 逐个传参，`apply` 传数组。`bind` 不立即调用，而是返回一个新函数。

### 7.5 规则 4: new 绑定

```javascript
function Person(name) {
  // new 关键字做了四件事:
  // 1. 创建空对象 {}
  // 2. 将空对象的 [[Prototype]] 指向 Person.prototype
  // 3. 用空对象作为 this 调用 Person 函数
  // 4. 如果函数没有返回对象，就返回这个新对象
  this.name = name;
}

const alice = new Person('Alice');
console.log(alice.name); // 'Alice' — this 指向新创建的对象
```

### 7.6 优先级验证

```javascript
function foo(val) {
  this.a = val;
}

const obj1 = {};
const bar = foo.bind(obj1);   // 显式绑定到 obj1

bar(2);
console.log(obj1.a);          // 2 — 显式绑定生效

const baz = new bar(3);       // new 绑定 vs 显式绑定
console.log(obj1.a);          // 2 — obj1.a 没变
console.log(baz.a);           // 3 — new 绑定胜出！

// 结论: new 绑定 > 显式绑定（bind）
```

### 7.7 箭头函数: 没有自己的 this

```javascript
const obj = {
  name: 'Charlie',
  // 普通方法: this = 调用者
  regularMethod() {
    console.log(this.name);   // 'Charlie'

    // 箭头函数: 捕获外层的 this
    const arrowFn = () => {
      console.log(this.name); // 'Charlie' — 继承自 regularMethod 的 this
    };
    arrowFn();

    // 普通函数: 自己的 this (默认绑定)
    const normalFn = function() {
      console.log(this.name); // undefined — 独立调用，默认绑定
    };
    normalFn();
  }
};

obj.regularMethod();
```

> ⚛️ **The Science: 箭头函数为什么没有 this？**
>
> 箭头函数在 ECMAScript 规范中的定义不同于普通函数——它没有 `[[ThisValue]]` 绑定步骤。当引擎在箭头函数中遇到 `this` 时，它的处理方式和遇到普通变量一样：沿着词法环境的 `[[OuterEnv]]` 链向上查找，直到找到一个有 `this` 绑定的环境（即普通函数或全局环境）。
>
> **箭头函数的 `this` 不是"绑定到外层"，是"自己没有 `this`，所以向外查找"**。这和闭包访问外部变量的机制完全一样。

### 7.8 this 绑定决策流程图

```
调用 fn()
  │
  ├── fn 是箭头函数?
  │     └── 是 → this = 外层词法环境的 this (不可更改)
  │
  ├── 通过 new 调用?
  │     └── 是 → this = 新创建的对象
  │
  ├── 通过 call/apply/bind 调用?
  │     └── 是 → this = 指定的对象
  │
  ├── 通过 obj.fn() 调用?
  │     └── 是 → this = obj
  │
  └── 独立调用 fn()
        ├── 严格模式 → this = undefined
        └── 非严格模式 → this = globalThis
```

### 7.9 实战中的 this 问题与解决方案

```javascript
// 场景: 类方法作为回调时 this 丢失
class Timer {
  constructor() {
    this.seconds = 0;
  }

  // ❌ 方法引用传递时丢失 this
  // start() {
  //   setInterval(this.tick, 1000); // this.tick 被提取为独立函数
  // }

  // ✅ 方案 1: 箭头函数
  start() {
    setInterval(() => this.tick(), 1000);
  }

  // ✅ 方案 2: bind
  // start() {
  //   setInterval(this.tick.bind(this), 1000);
  // }

  // ✅ 方案 3: 类字段 + 箭头函数 (最推荐)
  tick = () => {
    this.seconds++;
  };
}
```

> 🧰 **Toolbox: this 问题的通用解法**
>
> | 场景 | 推荐方案 |
> |------|---------|
> | 类方法作为回调 | 类字段箭头函数 `tick = () => {}` |
> | setTimeout / setInterval | 箭头函数包裹 `() => this.method()` |
> | 事件处理器 (原生 DOM) | `bind(this)` 或箭头函数 |
> | React 组件 | 类字段箭头函数 或 函数组件 + Hooks |
> | 独立工具函数 | 不使用 `this`，用参数传递 |

---

## 8. 🧘 Zen of Code: 从记忆到推理

> *"知其然，更要知其所以然。"*

本章的核心信息是：

1. **执行上下文和词法环境是两个数据结构** — 理解它们，就理解了 JavaScript 的作用域系统。不需要记忆"let 不提升"这样的规则，只需要知道"let 在创建阶段不初始化"。

2. **闭包不是魔法** — 它是函数对象持有词法环境引用的自然结果。当你理解了 `[[Environment]]` 和 `[[OuterEnv]]` 的引用链，闭包就是一个显然的推论。

3. **this 是动态绑定，作用域是静态绑定** — 这是 JavaScript 中最重要的不对称性。作用域在你写代码时就确定了（词法作用域），this 在代码运行时才确定（取决于调用方式）。

4. **理解底层不是为了炫技** — 当你 debug 一个诡异的 `undefined` 时，如果你理解执行上下文的两阶段模型，你会立即想到"这是提升造成的"。当你发现闭包导致内存泄漏时，如果你理解词法环境的引用链，你会知道该断开哪个引用。

> *"The best programmers are not those who can write the cleverest code, but those who understand what the computer is actually doing."*
> — John Carmack

---

## 9. 最佳实践与常见陷阱

### ✅ 最佳实践

| 实践 | 说明 |
|------|------|
| **始终使用 `let`/`const`** | 避免 `var` 的函数作用域和不报错的提升行为 |
| **先声明，后使用** | 即使理解了提升机制，也应保持声明在使用之前（代码可读性） |
| **优先使用 `const`** | 只在需要重新赋值时用 `let`，避免意外修改 |
| **箭头函数处理回调中的 this** | 箭头函数继承外层 this，避免绑定丢失 |
| **类字段箭头函数** | 在 Class 中用 `method = () => {}` 确保 this 不丢失 |
| **避免深度递归** | 不要依赖 TCO，使用迭代或蹦床函数 |
| **注意闭包的内存影响** | 闭包中不需要的大对象设为 `null` |

### ❌ 常见陷阱

| 陷阱 | 原因 | 解决方案 |
|------|------|---------|
| `var` 声明前访问得到 `undefined` | 创建阶段初始化为 `undefined` | 使用 `let`/`const` |
| `for (var i)` 循环闭包共享变量 | `var` 是函数作用域 | 使用 `let` |
| 方法提取后 `this` 丢失 | 隐式绑定丢失 | 箭头函数或 `bind` |
| `typeof` 在 TDZ 中报错 | `let`/`const` 声明但未初始化 | 确保声明在前 |
| 函数参数默认值的 TDZ | 参数从左到右求值 | 注意参数声明顺序 |
| 闭包引用循环变量 | 闭包引用的是变量本身，不是值 | `let` 或 IIFE |
| 递归栈溢出 | TCO 未被广泛实现 | 改用迭代或蹦床函数 |

---

## 10. 章节练习

### 练习 1: 执行上下文追踪

**难度**: ⭐⭐

**涉及知识点**: 执行上下文、调用栈、提升

**题目描述**: 不运行代码，预测以下代码的输出顺序。然后运行验证。

```javascript
var x = 1;

function a() {
  console.log('a:', x);
  var x = 2;
  b();
  console.log('a end:', x);
}

function b() {
  console.log('b:', x);
}

a();
console.log('global:', x);
```

**要求**:
1. 画出调用栈的变化过程
2. 标出每个 `console.log` 时 `x` 的来源（哪个执行上下文的变量）
3. 解释为什么 `a()` 中的第一个 `console.log` 输出 `undefined`

<details>
<summary>💡 参考答案</summary>

输出:
```
a: undefined
b: 1
a end: 2
global: 1
```

- `a: undefined` — `a()` 中有 `var x`，创建阶段 `x` 被初始化为 `undefined`，遮蔽了全局的 `x`
- `b: 1` — `b()` 中没有 `x`，沿词法环境链找到全局的 `x = 1`（词法作用域，看定义位置）
- `a end: 2` — `var x = 2` 执行后，`a()` 的 `x` 变为 `2`
- `global: 1` — 全局的 `x` 未被修改

</details>

---

### 练习 2: TDZ 与闭包综合

**难度**: ⭐⭐⭐

**涉及知识点**: TDZ、闭包、词法环境

**题目描述**: 指出以下代码中哪些行会报错，解释原因。

```javascript
function challenge() {
  const fns = [];

  for (let i = 0; i < 3; i++) {
    fns.push(() => i);
  }

  console.log(fns[0]());
  console.log(fns[1]());
  console.log(fns[2]());

  // --- Part 2 ---
  {
    // console.log(typeof value); // 这行会报错吗?
    const value = 42;
  }

  // --- Part 3 ---
  const outer = 'hello';
  function inner() {
    // console.log(outer); // 这行会报错吗?
    // const outer = 'world'; // 如果取消这行注释呢?
  }
  inner();
}
```

**要求**:
1. 预测 `fns[0]()`、`fns[1]()`、`fns[2]()` 的输出
2. 判断 Part 2 中 `typeof value` 是否报错，说明原因
3. 判断 Part 3 中取消注释后 `console.log(outer)` 是否报错

<details>
<summary>💡 参考答案</summary>

1. 输出 `0`, `1`, `2` — `let` 在每次迭代创建新的词法环境
2. `typeof value` **会报错** — `value` 在 TDZ 中，`typeof` 对 TDZ 变量不安全
3. 取消 `const outer = 'world'` 注释后，`console.log(outer)` **会报错** — `inner` 函数中的 `const outer` 遮蔽了外层的 `outer`，但 `console.log` 在声明之前，处于 TDZ

</details>

---

### 练习 3: this 绑定分析

**难度**: ⭐⭐⭐

**涉及知识点**: this 绑定规则、优先级

**题目描述**: 预测以下每个 `console.log` 的输出。

```javascript
const obj = {
  value: 42,
  getValue: function() {
    return this.value;
  },
  getValueArrow: () => {
    return this.value;
  }
};

console.log(obj.getValue());                              // A
console.log(obj.getValueArrow());                         // B

const extracted = obj.getValue;
console.log(extracted());                                 // C

console.log(obj.getValue.call({ value: 100 }));           // D
console.log(obj.getValue.bind({ value: 200 })());         // E

function Wrapper(val) {
  this.value = val;
  this.getVal = obj.getValue.bind(obj);
}
const w = new Wrapper(999);
console.log(w.getVal());                                  // F
console.log(w.value);                                     // G
```

**要求**:
1. 写出 A 到 G 的输出值
2. 说明每个输出对应哪条 this 绑定规则
3. 解释为什么 B 的结果和 A 不同

<details>
<summary>💡 参考答案</summary>

```
A: 42        — 隐式绑定: obj.getValue()，this = obj
B: undefined — 箭头函数没有自己的 this，向外查找到全局/模块的 this
C: undefined — 默认绑定: extracted() 独立调用，this = globalThis（无 value 属性）
D: 100       — 显式绑定: call 将 this 绑定到 { value: 100 }
E: 200       — 显式绑定: bind 将 this 锁定到 { value: 200 }
F: 42        — 显式绑定: bind(obj) 将 this 锁定到 obj
G: 999       — new 绑定: new Wrapper(999)，this = 新对象
```

B 和 A 不同是因为 `getValueArrow` 是箭头函数，它没有自己的 `this`。箭头函数在对象字面量中定义时，外层 `this` 是**定义对象字面量的代码所在的 this**（通常是全局/模块 this），而不是 `obj` 本身。

</details>

---

## 📚 延伸阅读

- [ECMAScript 2024 Language Specification — Executable Code and Execution Contexts](https://tc39.es/ecma262/#sec-executable-code-and-execution-contexts) — 权威规范
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures) — Kyle Simpson 的经典系列
- [V8 Blog: Understanding V8's Bytecode](https://v8.dev/blog) — V8 内部实现的官方博客
- [JavaScript: The Core (2nd Edition)](http://dmitrysoshnikov.com/ecmascript/javascript-the-core-2nd-edition/) — Dmitry Soshnikov 的深度解析

---

## 🔗 章节间连接

| 向前连接 | 向后连接 |
|---------|---------|
| [Stage 1 Ch02 函数和作用域](../../stage-1-beginner/02-functions-scope/) — 闭包和 this 的入门讲解 | [Stage 3 Ch05 性能优化](../../stage-3-advanced/05-performance-optimization/) — 内存管理、GC 的执行上下文视角 |
| [Stage 1 Ch04 异步基础](../../stage-1-beginner/04-async-basics/) — 事件循环的宏观理解 | [Stage 3 Ch08 Proxy/Reflect](../../stage-3-advanced/08-proxy-reflect/) — 元编程需要理解对象模型的底层 |
| [Stage 1 Ch06 原型链](../../stage-1-beginner/06-prototype-inheritance/) — 对象模型的另一半拼图 | |

---

> *"Talk is cheap. Show me the code."* — Linus Torvalds
>
> 理论学完了。现在去 `examples/` 目录运行代码，亲眼看看引擎的行为。然后做练习题，验证你是否真正理解了——不是"记住了"，而是"能推理出来"。
