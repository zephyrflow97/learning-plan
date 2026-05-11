# 第 2 章:函数和作用域

在本章中,你将深入学习 JavaScript 中最重要的概念之一——函数。你将理解函数的多种定义方式、作用域规则、闭包原理以及 this 关键字的绑定机制。

## 📖 本章内容

1. [函数基础](#1-函数基础)
2. [函数的多种形式](#2-函数的多种形式)
3. [作用域](#3-作用域)
4. [闭包](#4-闭包)
5. [this 关键字](#5-this-关键字)
6. [高阶函数](#6-高阶函数)
7. [最佳实践](#7-最佳实践)
8. [常见陷阱](#8-常见陷阱)
9. [章节练习](#9-章节练习)

---

## 1. 函数基础

### 1.1 为什么需要函数?

函数是可重用的代码块,它帮助我们:
- **避免重复代码** - 写一次,到处使用
- **组织代码** - 将相关逻辑组合在一起
- **提高可维护性** - 修改一处即可影响所有调用
- **抽象复杂性** - 隐藏实现细节,暴露简洁接口

### 1.2 函数声明

> **👑 The Metaphor: First-Class Citizens (一等公民)**
> 在 JavaScript 的国度里，函数是**一等公民**。
> 这意味着函数和数字、字符串一样，拥有“人权”：
> 1.  可以被赋值给变量（有了名字）。
> 2.  可以作为参数传递给别的函数（可以去旅行）。
> 3.  可以作为返回值被返回（可以生孩子）。
> 
> 在 Java (pre-8) 等语言里，函数是二等公民，必须依附于类（Class）才能生存。
> JS 的这种特性赋予了它极大的灵活性，也是**函数式编程 (Functional Programming)** 的基石。

```javascript
/**
 * 基本函数声明
 * 功能: 问候用户
 */

// 日志: 定义函数
console.log('=== 函数声明示例 ===\n');

// 无参数函数
function sayHello() {
  console.log('Hello, World!');
}

// 调用函数
sayHello(); // 输出: Hello, World!

// 带参数的函数
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('Alice');  // 输出: Hello, Alice!
greet('Bob');    // 输出: Hello, Bob!

// 带返回值的函数
function add(a, b) {
  return a + b;
}

const sum = add(5, 3);
console.log(`5 + 3 = ${sum}`); // 输出: 5 + 3 = 8

// 多个参数的函数
function calculateRectangleArea(width, height) {
  console.log(`计算矩形面积: 宽=${width}, 高=${height}`);
  const area = width * height;
  console.log(`面积 = ${area}`);
  return area;
}

const area = calculateRectangleArea(10, 5);
// 输出:
// 计算矩形面积: 宽=10, 高=5
// 面积 = 50
```

### 1.3 函数的重要特性

> **🕰️ The Sci-Fi: Hoisting as Time Travel**
> 再次见到我们的老朋友 "Hoisting"。函数声明会被完整提升到顶部。
> 这就像是**时间旅行**：你可以在函数出生（定义）之前就调用它。
> *   **JS 引擎**: "我不仅活在当下，我还拥有未来的记忆。我知道你在第 100 行定义了 `doSomething`，所以在第 1 行我就能执行它。"
> *   **C++ 编译器**: "Undeclared identifier? 滚去排队！"
> 
> 这虽然方便了代码组织（把杂乱的辅助函数扔到文件底部），但也破坏了线性阅读的逻辑。**能力越大，责任越大**。

```javascript
/**
 * 函数的重要特性演示
 */

console.log('=== 函数特性 ===\n');

// 1. 函数可以在声明前调用(函数提升)
console.log('调用 hoistedFunction:');
hoistedFunction(); // 输出: 我被提升了!

function hoistedFunction() {
  console.log('我被提升了!');
}

// 2. 函数可以接收默认参数(ES6+)
function greetWithDefault(name = 'Guest') {
  console.log(`Hello, ${name}!`);
}

greetWithDefault('Alice');  // 输出: Hello, Alice!
greetWithDefault();         // 输出: Hello, Guest!

// 3. 函数可以返回多个值(通过数组或对象)
function getMinMax(numbers) {
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  
  // 返回对象
  return { min, max };
}

const result = getMinMax([3, 7, 2, 9, 1]);
console.log(`最小值: ${result.min}, 最大值: ${result.max}`);
// 输出: 最小值: 1, 最大值: 9

// 4. 函数可以不返回值(返回 undefined)
function logMessage(message) {
  console.log(`日志: ${message}`);
  // 没有 return 语句
}

const returnValue = logMessage('测试消息');
console.log(`返回值: ${returnValue}`); 
// 输出: 
// 日志: 测试消息
// 返回值: undefined
```

---

## 2. 函数的多种形式

### 2.1 函数表达式

```javascript
/**
 * 函数表达式
 * 将函数赋值给变量
 */

console.log('=== 函数表达式 ===\n');

// 函数表达式
const multiply = function(a, b) {
  return a * b;
};

console.log(`3 * 4 = ${multiply(3, 4)}`); // 输出: 3 * 4 = 12

// ⚠️ 函数表达式不会被提升
// console.log(notHoisted()); // ❌ 错误: notHoisted is not defined

const notHoisted = function() {
  return '我不会被提升';
};

// 命名函数表达式(可用于递归和调试)
const factorial = function fact(n) {
  console.log(`计算阶乘: ${n}`);
  if (n <= 1) return 1;
  return n * fact(n - 1); // 递归调用自己
};

console.log(`5! = ${factorial(5)}`); // 输出: 5! = 120
```

### 2.2 箭头函数

```javascript
/**
 * 箭头函数 (ES6+)
 * 更简洁的函数语法
 */

console.log('=== 箭头函数 ===\n');

// 传统函数
const addTraditional = function(a, b) {
  return a + b;
};

// 箭头函数 - 完整形式
const addArrow = (a, b) => {
  return a + b;
};

// 箭头函数 - 简化形式(单行返回)
const addSimple = (a, b) => a + b;

console.log(`传统函数: ${addTraditional(5, 3)}`); // 8
console.log(`箭头函数: ${addArrow(5, 3)}`);      // 8
console.log(`简化箭头: ${addSimple(5, 3)}`);     // 8

// 单个参数可以省略括号
const square = n => n * n;
console.log(`5 的平方: ${square(5)}`); // 输出: 5 的平方: 25

// 无参数需要空括号
const getRandomNumber = () => Math.random();
console.log(`随机数: ${getRandomNumber()}`);

// 返回对象需要用括号包裹
const createPerson = (name, age) => ({ name, age });
const person = createPerson('Alice', 25);
console.log('创建的对象:', person); 
// 输出: 创建的对象: { name: 'Alice', age: 25 }

// 箭头函数在数组方法中的应用
const numbers = [1, 2, 3, 4, 5];

// 传统写法
const doubled1 = numbers.map(function(n) {
  return n * 2;
});

// 箭头函数写法
const doubled2 = numbers.map(n => n * 2);

console.log('加倍后的数组:', doubled2); 
// 输出: 加倍后的数组: [ 2, 4, 6, 8, 10 ]
```

### 2.3 函数声明 vs 表达式 vs 箭头函数

```javascript
/**
 * 三种函数形式的对比
 */

console.log('=== 函数形式对比 ===\n');

// 1. 函数声明 - Function Declaration
function declarationFunc() {
  return '函数声明';
}

// 2. 函数表达式 - Function Expression
const expressionFunc = function() {
  return '函数表达式';
};

// 3. 箭头函数 - Arrow Function
const arrowFunc = () => '箭头函数';

console.log('调用结果:');
console.log('- 声明:', declarationFunc());
console.log('- 表达式:', expressionFunc());
console.log('- 箭头:', arrowFunc());

// 关键区别汇总
console.log('\n区别汇总:');
console.log('1. 提升: 只有函数声明会被提升');
console.log('2. this: 箭头函数没有自己的 this');
console.log('3. arguments: 箭头函数没有 arguments 对象');
console.log('4. 构造函数: 箭头函数不能用作构造函数');
```

---

## 3. 作用域

### 3.1 什么是作用域?

> **🏰 The Metaphor: The Castle Walls**
> 作用域（Scope）就是代码世界里的**城墙**。
> *   **全局作用域**: 荒野。谁都可以在这里跑，但也最危险（变量污染、命名冲突）。
> *   **函数作用域**: 城堡。外面的人（外部代码）看不见城堡里有什么（私有变量），但城堡里的人可以看见外面的荒野。
> *   **块级作用域**: 房间。`let` 和 `const` 让你可以在城堡里再建一个个带锁的小房间。
> 
> **最小权限原则 (Least Privilege)**: 尽量把变量关在最小的房间里。不要让它们在荒野上裸奔。

作用域(Scope)决定了变量的可访问范围。JavaScript 有三种作用域:
- **全局作用域** - 在代码任何地方都可以访问
- **函数作用域** - 只在函数内部可以访问
- **块级作用域** - 只在 {} 块内部可以访问(let/const)

### 3.2 全局作用域

```javascript
/**
 * 全局作用域
 * 在任何地方都可以访问的变量
 */

console.log('=== 全局作用域 ===\n');

// 全局变量
const globalVar = '我是全局变量';

function accessGlobal() {
  console.log(`函数内访问: ${globalVar}`);
}

accessGlobal(); // 输出: 函数内访问: 我是全局变量
console.log(`函数外访问: ${globalVar}`); // 输出: 函数外访问: 我是全局变量

// ⚠️ 避免过多使用全局变量,容易造成命名冲突
```

### 3.3 函数作用域

```javascript
/**
 * 函数作用域
 * 变量只在函数内部可见
 */

console.log('=== 函数作用域 ===\n');

function myFunction() {
  const localVar = '我是局部变量';
  console.log(`函数内访问: ${localVar}`);
}

myFunction(); // 输出: 函数内访问: 我是局部变量

// console.log(localVar); // ❌ 错误: localVar is not defined

// 内部函数可以访问外部函数的变量
function outerFunction() {
  const outerVar = '外部变量';
  
  function innerFunction() {
    console.log(`内部函数访问外部变量: ${outerVar}`);
  }
  
  innerFunction(); // 输出: 内部函数访问外部变量: 外部变量
}

outerFunction();
```

### 3.4 块级作用域

```javascript
/**
 * 块级作用域
 * let 和 const 具有块级作用域
 */

console.log('=== 块级作用域 ===\n');

// if 块
if (true) {
  const blockVar = '块级变量';
  let blockLet = '块级 let';
  var functionVar = '函数级 var';
  
  console.log(`块内访问 const: ${blockVar}`);
  console.log(`块内访问 let: ${blockLet}`);
}

// console.log(blockVar); // ❌ 错误: blockVar is not defined
// console.log(blockLet); // ❌ 错误: blockLet is not defined
console.log(`块外访问 var: ${functionVar}`); // ✅ 可以访问(var 没有块级作用域)

// for 循环块
console.log('\nfor 循环作用域:');
for (let i = 0; i < 3; i++) {
  console.log(`循环内 i = ${i}`);
}
// console.log(i); // ❌ 错误: i is not defined

// ⚠️ var 在循环中的问题
console.log('\nvar 在循环中的问题:');
for (var j = 0; j < 3; j++) {
  // j 是函数作用域,不是块级作用域
}
console.log(`循环外 j = ${j}`); // ✅ 可以访问,j = 3
```

### 3.5 作用域链 (The Scope Chain)

> **🎭 The Metaphor: The Russian Matryoshka Dolls**
> 作用域链就像是一套**俄罗斯套娃**。
> *   最里面的娃娃（当前函数）想找一个变量。
> *   如果自己肚子里没有，它就打开外面一层的娃娃（父级函数）去找。
> *   如果还没有，就再往外找...
> *   直到最大的那个娃娃（全局作用域 Global Scope）。
> *   如果连最大的娃娃里都没有，JS 引擎就会抛出一个 `ReferenceError`：**"在这个宇宙里，我不认识这个名字。"**

> **🎓 CS Master's Bridge: 词法环境链 (Lexical Environment Chain)**
>
> 别被“作用域链”这个前端术语迷惑了。在编译原理中，这实际上是一个 **Linked List of Lexical Environments**。
>
> *   每个执行上下文 (Execution Context) 都有一个 `outer` 指针，指向其父级词法环境。
> *   变量查找过程本质上就是沿着这个链表进行 **O(N)** 的线性搜索。
> *   **全局作用域 (Global Scope)** 是链表的尾节点 (Tail)，其 `outer` 指针为 `null`。
>
> **🔧 Under the Hood (V8 Context Allocation)**:
> 通常，局部变量存储在 **Stack** 上 (高效)。但闭包打破了这一点。
> V8 在编译阶段进行 **Scope Analysis (Escape Analysis)**。
> *   如果一个变量被内部函数引用（逃逸），V8 就不会把它放在栈帧上，而是分配到一个堆对象 **Context** 中。
> *   这个 Context 对象通过 `outer` 指针链连接。
> *   这就是为什么闭包比普通函数慢：变量访问从 **Stack Offset** 变成了 **Heap Lookup** (甚至是指针追踪)。

```javascript
/**
 * 作用域链
 * JavaScript 查找变量的机制
 */

console.log('=== 作用域链 ===\n');

const globalVar = 'global';

function level1() {
  const level1Var = 'level1';
  
  console.log('level1 函数:');
  console.log(`  访问 globalVar: ${globalVar}`);    // ✅ 找到全局变量
  console.log(`  访问 level1Var: ${level1Var}`);   // ✅ 找到当前作用域
  
  function level2() {
    const level2Var = 'level2';
    
    console.log('\nlevel2 函数:');
    console.log(`  访问 globalVar: ${globalVar}`);   // ✅ 向上查找到全局
    console.log(`  访问 level1Var: ${level1Var}`);  // ✅ 向上查找到 level1
    console.log(`  访问 level2Var: ${level2Var}`);  // ✅ 找到当前作用域
    
    function level3() {
      console.log('\nlevel3 函数:');
      console.log(`  访问 globalVar: ${globalVar}`);  // ✅ 向上查找到全局
      console.log(`  访问 level1Var: ${level1Var}`); // ✅ 向上查找到 level1
      console.log(`  访问 level2Var: ${level2Var}`); // ✅ 向上查找到 level2
    }
    
    level3();
  }
  
  level2();
}

level1();

// 查找规则: 当前作用域 → 上层作用域 → ... → 全局作用域
// 如果找不到,报错: ReferenceError
```

---

## 4. 闭包

### 4.1 什么是闭包? (The "Magic" Revealed)

> **🎒 The Metaphor: The Backpacker**
> 想象函数是一个**背包客**。
> 当函数被创建时，它不仅仅是代码，它还背了一个**隐形的背包**（Closure）。
> 这个背包里装满了它出生时周围环境里的所有变量。
> 无论这个背包客走到哪里（被传到哪里执行），它都可以随时打开背包，拿出那些原本应该已经消失的变量。
> **这就是闭包：函数 + 它随身携带的背包。**

> **🎬 Pop Culture: Inception (盗梦空间)**
> 闭包就像是《盗梦空间》里的层层梦境。
> 你在深层梦境（内部函数）里，依然记得上一层梦境（外部函数）里留下的图腾（变量）。
> 即使上一层梦境已经坍塌（外部函数执行完毕），那个图腾依然在你的口袋里，真实存在。

> **🎓 CS Master's Bridge: 栈帧持久化 (Stack Frame Persistence)**
>
> 在 C/C++ 中，函数返回后，其栈帧 (Stack Frame) 会被立即销毁 (Popped off)。如果你试图返回一个指向栈局部变量的指针，你会得到一个悬垂指针 (Dangling Pointer) —— 这是未定义行为 (UB)。
>
> **但在 JavaScript 中，闭包打破了这个规则。**
>
> 闭包本质上是：**一个函数加上它被创建时的词法环境 (Lexical Environment)**。
> 当一个内部函数引用了外部函数的变量时，JS 引擎（如 V8）检测到这种“逃逸” (Escape Analysis)，它就不会把这些变量分配在栈上，而是**分配在堆 (Heap) 上**。
>
> 所以，闭包就是 **Heap-allocated Scope**。即使外部函数执行完毕，这个堆内存依然存在，直到内部函数被 GC 回收。

**闭包(Closure)**是指函数能够记住并访问其词法作用域,即使函数在其词法作用域之外执行。

简单说:内部函数引用了外部函数的变量,即使外部函数已经执行完毕。

### 4.2 基本闭包示例

```javascript
/**
 * 基本闭包
 * 内部函数访问外部函数的变量
 */

console.log('=== 基本闭包 ===\n');

function createCounter() {
  let count = 0; // 外部函数的变量
  
  console.log('创建计数器,初始值:', count);
  
  // 返回一个内部函数
  return function() {
    count++; // 访问外部函数的变量
    console.log(`当前计数: ${count}`);
    return count;
  };
}

// 创建计数器实例
const counter1 = createCounter();
console.log('\n使用 counter1:');
counter1(); // 输出: 当前计数: 1
counter1(); // 输出: 当前计数: 2
counter1(); // 输出: 当前计数: 3

// 创建另一个独立的计数器
const counter2 = createCounter();
console.log('\n使用 counter2:');
counter2(); // 输出: 当前计数: 1
counter2(); // 输出: 当前计数: 2

// counter1 和 counter2 是独立的,各自维护自己的 count
console.log('\n再次使用 counter1:');
counter1(); // 输出: 当前计数: 4
```

### 4.3 闭包的实际应用

#### 应用1: 数据私有化

```javascript
/**
 * 使用闭包实现数据私有化
 * 外部无法直接访问内部变量
 */

console.log('=== 数据私有化 ===\n');

function createBankAccount(initialBalance) {
  let balance = initialBalance; // 私有变量
  
  console.log(`创建账户,初始余额: ¥${balance}`);
  
  return {
    // 存款方法
    deposit(amount) {
      if (amount > 0) {
        balance += amount;
        console.log(`存入 ¥${amount},当前余额: ¥${balance}`);
      } else {
        console.log('❌ 存款金额必须大于0');
      }
    },
    
    // 取款方法
    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        console.log(`取出 ¥${amount},当前余额: ¥${balance}`);
      } else {
        console.log('❌ 余额不足或金额无效');
      }
    },
    
    // 查询余额方法
    getBalance() {
      console.log(`当前余额: ¥${balance}`);
      return balance;
    }
  };
}

const account = createBankAccount(1000);
console.log('');

account.deposit(500);     // 存入 ¥500,当前余额: ¥1500
account.withdraw(200);    // 取出 ¥200,当前余额: ¥1300
account.getBalance();     // 当前余额: ¥1300

// ⚠️ 无法直接访问 balance 变量
// console.log(account.balance); // undefined
```

#### 应用2: 函数工厂

```javascript
/**
 * 使用闭包创建函数工厂
 * 根据参数生成定制化的函数
 */

console.log('\n=== 函数工厂 ===\n');

function createMultiplier(multiplier) {
  console.log(`创建乘法器,倍数: ${multiplier}`);
  
  return function(number) {
    const result = number * multiplier;
    console.log(`${number} × ${multiplier} = ${result}`);
    return result;
  };
}

// 创建不同的乘法器
const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log('\n使用 double:');
double(5);  // 5 × 2 = 10
double(10); // 10 × 2 = 20

console.log('\n使用 triple:');
triple(5);  // 5 × 3 = 15
triple(10); // 10 × 3 = 30
```

#### 应用3: 事件处理器

```javascript
/**
 * 在事件处理器中使用闭包
 * 保存事件发生时的上下文信息
 */

console.log('\n=== 事件处理器中的闭包 ===\n');

function createButtonHandler(buttonName) {
  let clickCount = 0;
  
  console.log(`为按钮 "${buttonName}" 创建处理器`);
  
  return function() {
    clickCount++;
    console.log(`按钮 "${buttonName}" 被点击了 ${clickCount} 次`);
  };
}

// 模拟按钮点击
const loginButton = createButtonHandler('登录');
const submitButton = createButtonHandler('提交');

console.log('\n模拟点击:');
loginButton();  // 按钮 "登录" 被点击了 1 次
loginButton();  // 按钮 "登录" 被点击了 2 次
submitButton(); // 按钮 "提交" 被点击了 1 次
loginButton();  // 按钮 "登录" 被点击了 3 次
```

### 4.4 闭包的注意事项

```javascript
/**
 * 闭包的常见陷阱
 */

console.log('\n=== 闭包陷阱 ===\n');

// ⚠️ 陷阱1: 循环中的闭包
console.log('陷阱1: 使用 var 在循环中创建闭包');
const functions1 = [];

for (var i = 0; i < 3; i++) {
  functions1.push(function() {
    console.log(`  i = ${i}`);
  });
}

console.log('调用函数:');
functions1[0](); // i = 3 (不是 0!)
functions1[1](); // i = 3 (不是 1!)
functions1[2](); // i = 3 (不是 2!)

// ✅ 解决方案1: 使用 let
console.log('\n解决方案1: 使用 let');
const functions2 = [];

for (let j = 0; j < 3; j++) {
  functions2.push(function() {
    console.log(`  j = ${j}`);
  });
}

console.log('调用函数:');
functions2[0](); // j = 0 ✅
functions2[1](); // j = 1 ✅
functions2[2](); // j = 2 ✅

// ✅ 解决方案2: 使用 IIFE(立即执行函数)
console.log('\n解决方案2: 使用 IIFE');
const functions3 = [];

for (var k = 0; k < 3; k++) {
  functions3.push((function(index) {
    return function() {
      console.log(`  index = ${index}`);
    };
  })(k));
}

console.log('调用函数:');
functions3[0](); // index = 0 ✅
functions3[1](); // index = 1 ✅
functions3[2](); // index = 2 ✅
```

---

## 5. this 关键字 (The Most Misunderstood Feature)

### 5.1 什么是 this?

> **🎭 The Drama: The Identity Crisis**
> `this` 是 JavaScript 中患有严重**身份认知障碍**的角色。
> 在其他语言（如 Java/C++）中，`this` 忠诚地指向实例本身。
> 但在 JS 中，`this` 是一个**墙头草**。它不看自己出生在哪里，只看**谁在调用它**。
> *   "是 `obj` 叫我吗？那我就是 `obj`。"
> *   "没人叫我？那我就是 `Global`（或者在严格模式下消失为 `undefined`）。"
> *   "是 `new` 叫我吗？那我就是一个全新的对象。"
> 
> 这种设计虽然灵活（Dynamic Binding），但也导致了无数的 Bug 和脱发。它是 JS 最大的**设计缺陷**之一，也是**设计特性**之一。

> **🎭 WTFJS / CS Contrast**:
>
> *   **C++/Java**: `this` 是一个 **Instance Pointer**，永远指向当前对象实例。它是在编译时确定的。
> *   **JavaScript**: `this` 是一个 **Runtime Binding** (运行时绑定)。它不取决于函数在哪里定义，而完全取决于 **函数是如何被调用的 (Call Site)**。
>
> 这就是为什么前端开发者经常会问："Wait, what is `this` now?"
> 把它想象成 C 语言中，每个函数都隐式接收一个 `void* context` 参数。你传什么，它就是什么。如果你不传，它可能就是全局对象（或者 undefined）。

`this` 关键字指向函数执行时的上下文对象。它的值取决于**函数如何被调用**,而不是在哪里定义。

### 5.2 this 的四种绑定规则

```javascript
/**
 * this 的绑定规则
 */

console.log('=== this 绑定规则 ===\n');

// 规则1: 默认绑定 - 独立函数调用
console.log('规则1: 默认绑定');
function showThis1() {
  console.log('  this:', this); // 严格模式下是 undefined,非严格模式下是 global
}
showThis1();

// 规则2: 隐式绑定 - 对象方法调用
console.log('\n规则2: 隐式绑定');
const person = {
  name: 'Alice',
  greet: function() {
    console.log(`  Hello, I'm ${this.name}`);
  }
};
person.greet(); // this 指向 person,输出: Hello, I'm Alice

// 规则3: 显式绑定 - 使用 call/apply/bind
console.log('\n规则3: 显式绑定');
function introduce(greeting) {
  console.log(`  ${greeting}, I'm ${this.name}`);
}

const user = { name: 'Bob' };

introduce.call(user, 'Hi');   // Hi, I'm Bob
introduce.apply(user, ['Hey']); // Hey, I'm Bob

const boundIntroduce = introduce.bind(user);
boundIntroduce('Hello'); // Hello, I'm Bob

// 规则4: new 绑定 - 构造函数调用
console.log('\n规则4: new 绑定');
function Person(name) {
  this.name = name;
  console.log(`  创建 Person,this.name = ${this.name}`);
}

const alice = new Person('Alice'); // this 指向新创建的对象
```

### 5.3 箭头函数中的 this

> **🛡️ Engineering Mindset: 修复 `this` 的设计缺陷**
>
> 箭头函数 (`=>`) 不仅仅是简写。它的核心目的是**修复 `this` 的动态绑定问题**。
> 箭头函数没有自己的 `this`，它通过 **Lexical Scoping** (词法作用域) 捕获外层的 `this`。
>
> *   **普通函数**: `this` 取决于调用方式 (Dynamic)。
> *   **箭头函数**: `this` 取决于定义位置 (Lexical)。
>
> **最佳实践**: 在回调函数（如 `setTimeout`, `map`, `onClick`）中，**永远优先使用箭头函数**，除非你真的需要动态 `this`。

```javascript
/**
 * 箭头函数的 this
 * 箭头函数没有自己的 this,它继承外层作用域的 this
 */

console.log('\n=== 箭头函数的 this ===\n');

const obj = {
  name: 'Object',
  
  // 普通函数
  regularFunction: function() {
    console.log('普通函数 this.name:', this.name); // 'Object'
  },
  
  // 箭头函数
  arrowFunction: () => {
    console.log('箭头函数 this.name:', this.name); // undefined(继承外层)
  },
  
  // 方法中的箭头函数
  methodWithArrow: function() {
    const arrow = () => {
      console.log('方法内箭头函数 this.name:', this.name); // 'Object'
    };
    arrow();
  }
};

obj.regularFunction();     // 普通函数 this.name: Object
obj.arrowFunction();       // 箭头函数 this.name: undefined
obj.methodWithArrow();     // 方法内箭头函数 this.name: Object
```

### 5.4 this 的实际应用

```javascript
/**
 * this 在实际开发中的应用
 */

console.log('\n=== this 实际应用 ===\n');

// 示例: 倒计时器
function CountdownTimer(seconds) {
  this.seconds = seconds;
  console.log(`创建倒计时器: ${seconds} 秒\n`);
  
  // ❌ 使用普通函数会导致 this 丢失
  // setInterval(function() {
  //   this.seconds--; // this 不指向 CountdownTimer!
  //   console.log(this.seconds);
  // }, 1000);
  
  // ✅ 解决方案1: 使用箭头函数
  this.start = function() {
    console.log('开始倒计时(使用箭头函数):');
    const interval = setInterval(() => {
      this.seconds--;
      console.log(`  剩余: ${this.seconds} 秒`);
      
      if (this.seconds === 0) {
        console.log('  倒计时结束!\n');
        clearInterval(interval);
      }
    }, 1000);
  };
  
  // ✅ 解决方案2: 保存 this 引用
  this.startWithSelf = function() {
    console.log('开始倒计时(保存 this):');
    const self = this; // 保存 this 引用
    
    const interval = setInterval(function() {
      self.seconds--;
      console.log(`  剩余: ${self.seconds} 秒`);
      
      if (self.seconds === 0) {
        console.log('  倒计时结束!\n');
        clearInterval(interval);
      }
    }, 1000);
  };
}

// 创建倒计时器(示例,不实际运行)
// const timer = new CountdownTimer(5);
// timer.start();
```

---

## 6. 高阶函数

### 6.1 什么是高阶函数?

高阶函数是指:
- 接收函数作为参数,或
- 返回一个函数

的函数。

### 6.2 接收函数作为参数

```javascript
/**
 * 接收函数作为参数的高阶函数
 */

console.log('=== 接收函数作为参数 ===\n');

// 示例: 通用的数组处理函数
function processArray(arr, callback) {
  console.log(`处理数组: [${arr}]`);
  const result = [];
  
  for (const item of arr) {
    result.push(callback(item));
  }
  
  return result;
}

const numbers = [1, 2, 3, 4, 5];

// 使用不同的回调函数
const doubled = processArray(numbers, n => n * 2);
console.log('加倍结果:', doubled);
// 输出: 加倍结果: [ 2, 4, 6, 8, 10 ]

const squared = processArray(numbers, n => n * n);
console.log('平方结果:', squared);
// 输出: 平方结果: [ 1, 4, 9, 16, 25 ]
```

### 6.3 返回函数

```javascript
/**
 * 返回函数的高阶函数
 */

console.log('\n=== 返回函数 ===\n');

// 示例: 创建条件检查器
function createChecker(condition) {
  console.log(`创建检查器: ${condition}`);
  
  return function(value) {
    const result = condition(value);
    console.log(`  检查 ${value}: ${result ? '✅ 通过' : '❌ 失败'}`);
    return result;
  };
}

// 创建不同的检查器
const isEven = createChecker(n => n % 2 === 0);
const isPositive = createChecker(n => n > 0);

console.log('\n使用 isEven:');
isEven(4);  // ✅ 通过
isEven(5);  // ❌ 失败

console.log('\n使用 isPositive:');
isPositive(10);  // ✅ 通过
isPositive(-5);  // ❌ 失败
```

### 6.4 常用的高阶函数

```javascript
/**
 * 数组的常用高阶函数
 */

console.log('\n=== 数组高阶函数 ===\n');

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('原数组:', numbers);
console.log('');

// 1. map - 映射转换
const doubled = numbers.map(n => n * 2);
console.log('map(加倍):', doubled);

// 2. filter - 过滤筛选
const evens = numbers.filter(n => n % 2 === 0);
console.log('filter(偶数):', evens);

// 3. reduce - 归约计算
const sum = numbers.reduce((total, n) => {
  console.log(`  累加: ${total} + ${n} = ${total + n}`);
  return total + n;
}, 0);
console.log('reduce(求和):', sum);

// 4. find - 查找第一个符合条件的元素
const firstEven = numbers.find(n => n % 2 === 0);
console.log('\nfind(第一个偶数):', firstEven);

// 5. every - 检查是否所有元素都符合条件
const allPositive = numbers.every(n => n > 0);
console.log('every(都是正数):', allPositive);

// 6. some - 检查是否有元素符合条件
const hasEven = numbers.some(n => n % 2 === 0);
console.log('some(有偶数):', hasEven);

// 链式调用
console.log('\n链式调用示例:');
const result = numbers
  .filter(n => n % 2 === 0)  // 筛选偶数
  .map(n => n * n)           // 求平方
  .reduce((sum, n) => sum + n, 0); // 求和

console.log('偶数的平方和:', result); // 220
```

---

## 7. 最佳实践

### 7.1 函数设计原则

```javascript
/**
 * 函数设计最佳实践
 */

console.log('=== 函数设计原则 ===\n');

// ✅ 原则1: 单一职责 - 一个函数只做一件事
function validateEmail(email) {
  return email.includes('@');
}

function sendEmail(email) {
  if (validateEmail(email)) {
    console.log(`发送邮件到: ${email}`);
  }
}

// ❌ 避免: 一个函数做太多事
function badFunction(email) {
  // 验证、发送、记录...太多职责
}

// ✅ 原则2: 函数应该有清晰的输入和输出
function calculateTotal(price, quantity) {
  return price * quantity;
}

// ✅ 原则3: 使用描述性的函数名
function getUserFullName(firstName, lastName) {
  return `${firstName} ${lastName}`;
}

// ❌ 避免: 使用模糊的名称
function process(a, b) {
  return a + b;
}

// ✅ 原则4: 函数参数不要过多(建议 ≤ 3 个)
// 如果参数很多,使用对象
function createUser(options) {
  const { name, age, email, phone } = options;
  console.log(`创建用户: ${name}`);
  return { name, age, email, phone };
}

createUser({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com',
  phone: '123-456-7890'
});
```

### 7.2 纯函数

> **💎 The Philosophy: The Platonic Ideal (柏拉图理念)**
> 纯函数 (Pure Function) 是代码世界里的**数学公式**。
> *   **无副作用**: 它不修改外部世界，不读写文件，不修改全局变量。它就像一个与世隔绝的隐士。
> *   **引用透明**: 只要输入是 `2`，输出永远是 `4`。它不依赖心情、天气或时间。
> 
> 在充满不确定性（网络延迟、用户输入、硬件故障）的现实世界中，纯函数是我们唯一能掌控的**绝对真理**。
> 尽可能多写纯函数，把副作用（脏活累活）推到系统的边缘。

```javascript
/**
 * 纯函数
 * 相同输入总是产生相同输出,且没有副作用
 */

console.log('\n=== 纯函数 ===\n');

// ✅ 纯函数示例
function add(a, b) {
  return a + b; // 相同输入,相同输出,无副作用
}

console.log('纯函数 add(2, 3):', add(2, 3)); // 总是 5

// ❌ 非纯函数示例
let counter = 0;

function impureIncrement() {
  counter++; // 修改外部变量,有副作用
  return counter;
}

console.log('非纯函数调用1:', impureIncrement()); // 1
console.log('非纯函数调用2:', impureIncrement()); // 2 (不同结果)

// ✅ 改进为纯函数
function pureIncrement(value) {
  return value + 1; // 不修改外部状态
}

console.log('纯函数 pureIncrement(0):', pureIncrement(0)); // 1
console.log('纯函数 pureIncrement(0):', pureIncrement(0)); // 1 (相同结果)
```

### 7.3 何时使用箭头函数

```javascript
/**
 * 箭头函数使用场景
 */

console.log('\n=== 箭头函数使用场景 ===\n');

// ✅ 适合使用箭头函数的场景

// 1. 数组方法
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
console.log('数组方法:', doubled);

// 2. 简短的回调函数
setTimeout(() => console.log('定时器回调'), 0);

// 3. 需要保持 this 绑定
const obj = {
  name: 'Object',
  delayedGreet: function() {
    setTimeout(() => {
      console.log(`Hello from ${this.name}`); // this 指向 obj
    }, 0);
  }
};
obj.delayedGreet();

// ❌ 不适合使用箭头函数的场景

// 1. 对象方法(需要访问 this)
const person = {
  name: 'Alice',
  greet: function() {
    console.log(`Hi, I'm ${this.name}`); // ✅ 正常工作
  }
  // greet: () => {
  //   console.log(`Hi, I'm ${this.name}`); // ❌ this 不指向 person
  // }
};
person.greet();

// 2. 构造函数
// const Person = (name) => {
//   this.name = name; // ❌ 箭头函数不能用作构造函数
// };

// 3. 需要 arguments 对象的函数
function regularFunc() {
  console.log('arguments:', arguments); // ✅ 可以访问 arguments
}
regularFunc(1, 2, 3);
```

---

## 8. 常见陷阱

### 8.1 作用域陷阱

```javascript
/**
 * 作用域相关陷阱
 */

console.log('\n=== 作用域陷阱 ===\n');

// ⚠️ 陷阱1: 变量提升
console.log('陷阱1: 变量提升');
console.log('  hoistedVar:', hoistedVar); // undefined(不是报错!)
var hoistedVar = 'I am hoisted';

// ✅ 避免方法: 使用 let/const
// console.log(notHoisted); // ❌ 报错: Cannot access before initialization
// let notHoisted = 'Not hoisted';

// ⚠️ 陷阱2: 意外创建全局变量
console.log('\n陷阱2: 意外的全局变量');
function createGlobal() {
  accidentalGlobal = '我是全局的'; // 忘记声明,变成全局变量!
}
createGlobal();
console.log('  accidentalGlobal:', accidentalGlobal);

// ✅ 避免方法: 始终声明变量,使用严格模式
function avoidGlobal() {
  'use strict';
  // undeclared = 'error'; // ❌ 严格模式下会报错
  const declared = 'safe';
  console.log('  declared:', declared);
}
avoidGlobal();
```

### 8.2 闭包陷阱 (The Loop Problem)

> **🐛 Debugging Challenge: 共享的词法环境**
>
> 这是一个经典的面试题，也是无数初学者的噩梦。
> 问题的根源在于：**`var` 只有一个函数作用域**。
> 在循环中，虽然你创建了 3 个闭包，但它们共享了**同一个**变量 `i` 的引用（即同一个词法环境）。
> 当 `setTimeout` 回调执行时，循环早已结束，`i` 已经变成了 3。
>
> **修复原理**:
> 使用 `let` 会为**每次循环迭代**创建一个**新的词法环境 (New Lexical Environment)**。每个闭包捕获的是属于它自己的那个 `i`。

```javascript
/**
 * 闭包相关陷阱
 */

console.log('\n=== 闭包陷阱 ===\n');

// ⚠️ 陷阱: 循环中的闭包(之前已经演示过)
console.log('循环中的 var 陷阱:');
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(`  i = ${i}`); // 都是 3!
  }, 0);
}

// ✅ 解决: 使用 let
console.log('\n使用 let 解决:');
for (let j = 0; j < 3; j++) {
  setTimeout(function() {
    console.log(`  j = ${j}`); // 0, 1, 2
  }, 0);
}
```

### 8.3 this 陷阱

```javascript
/**
 * this 绑定陷阱
 */

console.log('\n=== this 陷阱 ===\n');

const user = {
  name: 'Alice',
  greet: function() {
    console.log(`  Hello, ${this.name}`);
  }
};

// ⚠️ 陷阱: this 丢失
console.log('陷阱: 赋值后 this 丢失');
const greetFunction = user.greet;
// greetFunction(); // ❌ this 不再指向 user

// ✅ 解决方案: 使用 bind
const boundGreet = user.greet.bind(user);
boundGreet(); // ✅ 正常工作

// 或者使用箭头函数
const user2 = {
  name: 'Bob',
  greet: function() {
    const arrowGreet = () => {
      console.log(`  Hello, ${this.name}`);
    };
    return arrowGreet;
  }
};

const greet2 = user2.greet();
greet2(); // ✅ 正常工作
```

---

## 9. 章节练习

### 练习1: 函数基础

编写一个函数 `calculateBMI(weight, height)`,计算并返回 BMI 指数。
- BMI = 体重(kg) / 身高²(m²)
- 返回一个对象,包含 BMI 值和分类(偏瘦/正常/偏胖/肥胖)

<details>
<summary>查看答案</summary>

```javascript
function calculateBMI(weight, height) {
  console.log(`计算 BMI: 体重=${weight}kg, 身高=${height}m`);
  
  // 计算 BMI
  const bmi = weight / (height * height);
  
  // 判断分类
  let category;
  if (bmi < 18.5) {
    category = '偏瘦';
  } else if (bmi < 24) {
    category = '正常';
  } else if (bmi < 28) {
    category = '偏胖';
  } else {
    category = '肥胖';
  }
  
  const result = {
    bmi: bmi.toFixed(2),
    category: category
  };
  
  console.log(`BMI: ${result.bmi}, 分类: ${result.category}`);
  return result;
}

// 测试
calculateBMI(70, 1.75); // BMI: 22.86, 分类: 正常
```
</details>

### 练习2: 闭包应用

实现一个 `createIDGenerator()` 函数,返回一个 ID 生成器:
- 第一次调用返回 1
- 每次调用自动递增
- 提供 `reset()` 方法重置为 1

<details>
<summary>查看答案</summary>

```javascript
function createIDGenerator() {
  let currentID = 0;
  console.log('创建 ID 生成器');
  
  return {
    next: function() {
      currentID++;
      console.log(`生成 ID: ${currentID}`);
      return currentID;
    },
    
    reset: function() {
      console.log(`重置 ID 生成器 (之前: ${currentID})`);
      currentID = 0;
    },
    
    current: function() {
      console.log(`当前 ID: ${currentID}`);
      return currentID;
    }
  };
}

// 测试
const idGen = createIDGenerator();
console.log('');
idGen.next();    // 1
idGen.next();    // 2
idGen.next();    // 3
idGen.reset();   // 重置
idGen.next();    // 1
```
</details>

### 练习3: 高阶函数

实现一个 `repeat(n, action)` 函数:
- `n`: 重复次数
- `action`: 要执行的函数
- 执行 `action` 函数 n 次

<details>
<summary>查看答案</summary>

```javascript
function repeat(n, action) {
  console.log(`重复执行 ${n} 次`);
  
  for (let i = 0; i < n; i++) {
    console.log(`第 ${i + 1} 次:`);
    action(i);
  }
}

// 测试
repeat(3, (index) => {
  console.log(`  执行任务 ${index + 1}`);
});

// 输出:
// 重复执行 3 次
// 第 1 次:
//   执行任务 1
// 第 2 次:
//   执行任务 2
// 第 3 次:
//   执行任务 3
```
</details>

### 练习4: 数组方法

给定学生数组:
```javascript
const students = [
  { name: 'Alice', score: 85 },
  { name: 'Bob', score: 92 },
  { name: 'Charlie', score: 78 },
  { name: 'David', score: 95 }
];
```

完成以下任务:
1. 找出所有分数 ≥ 90 的学生
2. 计算所有学生的平均分
3. 获取所有学生的名字数组

<details>
<summary>查看答案</summary>

```javascript
const students = [
  { name: 'Alice', score: 85 },
  { name: 'Bob', score: 92 },
  { name: 'Charlie', score: 78 },
  { name: 'David', score: 95 }
];

console.log('学生列表:', students);
console.log('');

// 1. 找出分数 ≥ 90 的学生
const topStudents = students.filter(s => s.score >= 90);
console.log('优秀学生 (≥90):', topStudents);

// 2. 计算平均分
const average = students.reduce((sum, s) => sum + s.score, 0) / students.length;
console.log('平均分:', average.toFixed(2));

// 3. 获取所有名字
const names = students.map(s => s.name);
console.log('学生名字:', names);
```
</details>

### 练习5: 综合应用

实现一个 `debounce(func, delay)` 函数:
- 防抖功能: 只有在停止调用 `delay` 毫秒后才执行 `func`
- 用途: 防止频繁触发事件(如搜索框输入)

<details>
<summary>查看答案</summary>

```javascript
function debounce(func, delay) {
  let timeoutId;
  console.log(`创建防抖函数,延迟: ${delay}ms`);
  
  return function(...args) {
    console.log(`防抖函数被调用,重置定时器`);
    
    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
      console.log('  清除旧定时器');
    }
    
    // 设置新的定时器
    timeoutId = setTimeout(() => {
      console.log(`  ${delay}ms 后执行实际函数`);
      func.apply(this, args);
    }, delay);
  };
}

// 测试
const search = debounce((keyword) => {
  console.log(`  搜索关键词: "${keyword}"\n`);
}, 500);

// 模拟快速输入
search('a');
search('ab');
search('abc');
// 只有最后一次会在 500ms 后执行
```
</details>

---

## 📚 下一步

恭喜你完成了第2章的学习!现在你已经掌握了:
- ✅ 函数的多种定义方式
- ✅ 作用域和作用域链
- ✅ 闭包的原理和应用
- ✅ this 关键字的绑定规则
- ✅ 高阶函数的概念和使用

**准备好了吗?** 让我们继续学习[第3章:对象和数组操作](../03-objects-arrays/)!

---

## 📖 参考资源

- [MDN - 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)
- [MDN - 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [MDN - this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [JavaScript.info - 函数](https://zh.javascript.info/function-basics)
