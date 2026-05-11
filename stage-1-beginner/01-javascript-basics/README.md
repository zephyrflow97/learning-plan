# 第 1 章：JavaScript 基础语法

欢迎来到 JavaScript 学习的第一章!在本章中,你将学习 JavaScript 的基础语法,包括变量、数据类型、运算符和控制流。

## 📖 本章内容

1. [变量声明](#1-变量声明)
2. [数据类型](#2-数据类型)
3. [运算符](#3-运算符)
4. [控制流](#4-控制流)
5. [代码示例](#5-代码示例)
6. [最佳实践](#6-最佳实践)
7. [常见陷阱](#7-常见陷阱)
8. [章节练习](#8-章节练习)

---

## 1. 变量声明

> **🎭 The Drama: The Anarchist `var`**
> 如果 `let` 和 `const` 是遵纪守法的现代公民，那么 `var` 就是那个**来自 90 年代的无政府主义者**。
> 它无视块级作用域的法律（Block Scope），能像幽灵一样穿透 `if` 和 `for` 的墙壁。
> 它还掌握着 **Hoisting (变量提升)** 的黑魔法——明明你在第 10 行才出生，它却在第 1 行就已经存在了（虽然灵魂是空的 `undefined`）。
> **老黑客的忠告**：除非你想在调试时体验“捉鬼”的快感，否则请把 `var` 埋在历史的尘埃里。

### 1.1 为什么需要变量?

变量是程序中用来存储数据的容器。就像现实生活中的盒子,你可以在盒子里放东西,也可以随时查看或更换盒子里的内容。

### 1.2 三种变量声明方式

JavaScript 提供了三种声明变量的方式:`var`、`let` 和 `const`。

#### var - 传统方式 (☠️ 危险区域)

> **💡 极客比喻**:
> 如果 `let` 和 `const` 是遵纪守法的公民，那么 `var` 就是那个**无政府主义者**。
> 它声明的变量会发生 **Hoisting (变量提升)**——就像一个幽灵，明明你在第 10 行才声明它，但它在第 1 行就已经存在了（虽然是 `undefined`）。
> 而且它无视块级作用域（Block Scope），能像穿墙术一样穿透 `if` 和 `for` 的花括号。
>
> **结论**: 除非你想体验 Debug 的“快感”，否则把 `var` 扔进历史的垃圾堆。

```javascript
// var 是旧式的变量声明方式
var name = 'Alice';
console.log('使用 var 声明:', name); // 输出: 使用 var 声明: Alice

// ❌ 问题1: var 可以重复声明
var name = 'Bob'; // 不会报错,但容易引起混乱
console.log('重复声明后:', name); // 输出: 重复声明后: Bob

// ❌ 问题2: var 没有块级作用域
if (true) {
  var message = 'Hello';
}
console.log('块外访问:', message); // 输出: 块外访问: Hello (可以访问!)
```

**var 的问题：**
- 可以重复声明,容易造成错误
- 没有块级作用域,容易污染全局
- 存在变量提升,可能导致意外行为

#### let - 现代方式(推荐)

```javascript
// let 是 ES6 引入的新方式
let age = 25;
console.log('使用 let 声明:', age); // 输出: 使用 let 声明: 25

// ✅ 优点1: let 不能重复声明
// let age = 30; // ❌ 这会报错: Identifier 'age' has already been declared

// ✅ 优点2: let 有块级作用域
if (true) {
  let blockMessage = 'Hi';
  console.log('块内访问:', blockMessage); // 输出: 块内访问: Hi
}
// console.log(blockMessage); // ❌ 这会报错: blockMessage is not defined

// ✅ 优点3: let 可以重新赋值
age = 30;
console.log('重新赋值后:', age); // 输出: 重新赋值后: 30
```

**let 的特点：**
- 不能重复声明,避免错误
- 有块级作用域,更安全
- 可以重新赋值,适合变化的值

#### const - 常量声明(推荐)

```javascript
// const 用于声明常量
const PI = 3.14159;
console.log('圆周率:', PI); // 输出: 圆周率: 3.14159

// ❌ const 不能重新赋值
// PI = 3.14; // ❌ 这会报错: Assignment to constant variable

// ✅ const 也有块级作用域
if (true) {
  const TAX_RATE = 0.2;
  console.log('税率:', TAX_RATE); // 输出: 税率: 0.2
}
// console.log(TAX_RATE); // ❌ 这会报错: TAX_RATE is not defined

// ⚠️ 注意: const 对象的属性可以修改
const person = { name: 'Alice' };
person.name = 'Bob'; // ✅ 可以修改属性
console.log('修改属性后:', person); // 输出: 修改属性后: { name: 'Bob' }

// 但不能重新赋值整个对象
// person = { name: 'Charlie' }; // ❌ 这会报错

> ### 🧠 CS Master's Bridge: 变量与内存模型
>
> 对于习惯了 C/C++/Java 的你，理解 JS 变量的关键在于 **Stack vs Heap** 和 **Scope Chain**。
>
> 1.  **栈 (Stack)**: 原始类型 (`number`, `boolean`, `null`, `undefined`) 直接存储在栈帧 (Stack Frame) 中。
> 2.  **堆 (Heap)**: 引用类型 (`object`, `array`, `function`) 存储在堆中，栈中只保存指向堆内存的 **指针 (Pointer)**。
>
> **关于 `const` 的本质**:
> `const` 锁定的仅仅是 **栈中的内容**。
> *   对于原始类型，栈中存的是值，所以值不可变。
> *   对于引用类型，栈中存的是地址，所以 **地址不可变**，但堆中的数据（对象的属性）完全可以修改。这类似于 C++ 中的 `Type* const pointer` (常量指针)，而不是 `const Type* pointer` (指向常量的指针)。
>
> **关于作用域 (Scope)**:
> *   **`var` (Function Scope)**: 类似于 C 语言早期版本，变量声明会被“提升” (Hoisting) 到函数体的顶部。这本质上是因为 JS 引擎在编译阶段（是的，JS 有 JIT 编译）会先扫描声明。
> *   **`let`/`const` (Block Scope)**: 遵循词法作用域 (Lexical Scoping)，在大括号 `{}` 结束时，栈帧中的相关变量会被标记为失效（虽然 JS 是 GC 语言，但栈内存管理依然遵循 LIFO）。
```

**const 的特点：**
- 不能重新赋值,保证值不变
- 有块级作用域
- 对象/数组的内容可以修改,但引用不能变

### 1.3 如何选择?

> **🧘 Zen of Code: The Art of Restriction (约束的艺术)**
> 编程的智慧往往不在于“你能做什么”，而在于“你承诺不做什么”。
> *   **`var`**: "我什么都敢做，什么规矩都不守。" (混乱邪恶)
> *   **`let`**: "我会变，但我守规矩（块级作用域）。" (绝对中立)
> *   **`const`**: "我承诺永远不变。" (守序善良)
> 
> **越多的约束，意味着越少的 Bug。** 当你看到 `const`，你的大脑就少了一件需要担心的事（它会不会在后面被改了？）。所以，默认用 `const`，这是给未来的自己的一份礼物。

**决策流程：**

```
值会改变吗?
  │
  ├─ 是 → 使用 let
  │
  └─ 否 → 使用 const
```

**最佳实践：**
1. **默认使用 `const`** - 除非你知道值会改变
2. **需要改变时使用 `let`** - 比如循环计数器
3. **永远不要使用 `var`** - 除非维护旧代码

> ### 🧠 CS Master's Bridge: 变量与内存模型
>
> 对于习惯了 C/C++/Java 的你，理解 JS 变量的关键在于 **Stack vs Heap** 和 **Scope Chain**。
>
> 1.  **栈 (Stack)**: 原始类型 (`number`, `boolean`, `null`, `undefined`) 直接存储在栈帧 (Stack Frame) 中。
> 2.  **堆 (Heap)**: 引用类型 (`object`, `array`, `function`) 存储在堆中，栈中只保存指向堆内存的 **指针 (Pointer)**。
>
> **关于 `const` 的本质**:
> `const` 锁定的仅仅是 **栈中的内容**。
> *   对于原始类型，栈中存的是值，所以值不可变。
> *   对于引用类型，栈中存的是地址，所以 **地址不可变**，但堆中的数据（对象的属性）完全可以修改。这类似于 C++ 中的 `Type* const pointer` (常量指针)，而不是 `const Type* pointer` (指向常量的指针)。
>
> **关于作用域 (Scope)**:
> *   **`var` (Function Scope)**: 类似于 C 语言早期版本，变量声明会被“提升” (Hoisting) 到函数体的顶部。这本质上是因为 JS 引擎在编译阶段（是的，JS 有 JIT 编译）会先扫描声明。
> *   **`let`/`const` (Block Scope)**: 遵循词法作用域 (Lexical Scoping)，在大括号 `{}` 结束时，栈帧中的相关变量会被标记为失效（虽然 JS 是 GC 语言，但栈内存管理依然遵循 LIFO）。


---

## 2. 数据类型

### 2.1 为什么需要数据类型?

> **🌌 The Big Picture: The Chaos of Bits**
> 在计算机的底层（内存里），一切都是 **0** 和 **1** 的洪流。
> `01000001` 是数字 65？还是字母 'A'？还是一个布尔值？还是一个指令？
> 内存本身不知道。
> **数据类型 (Data Types)** 就是我们贴在这些 0/1 上的**标签**。
> 它告诉 CPU：“嘿，这块内存是‘整数’，请用加法电路处理它；那块内存是‘字符’，请把它画在屏幕上。”
> JavaScript 的**动态类型**意味着这些标签是在**运行时**贴上去的，而不是在**编译时**。这就像是在高速公路上给正在飞驰的汽车换轮胎——灵活，但危险。

数据类型帮助 JavaScript 理解你存储的是什么样的数据,以便正确处理。就像生活中区分数字、文字、是非一样。

### 2.2 原始类型 (Primitive Types)

> **⚛️ The Physics: Atoms vs Molecules**
> *   **原始类型 (Primitives)** 就像是**原子**。它们是不可分割的、不可变的。你不能改变数字 `5` 的内部结构，你只能用 `6` 来替换它。它们很轻，直接存在栈（Stack）上。
> *   **引用类型 (Objects)** 就像是**分子**。它们由原子组成，结构复杂，可以改变（你可以改变对象的属性）。它们很重，存在堆（Heap）上，我们只能手里拿着一根线（引用）牵着它们。

原始类型是最基本的数据类型,它们是不可变的(immutable)。

#### Number - 数字

> **🌊 The Physics: The Leaky Bucket (Floating Point)**
> 为什么 `0.1 + 0.2 !== 0.3`？
> 这不是 JavaScript 的错，这是**二进制**的物理定律。
> 在十进制里，`1/3` 是无限循环小数 `0.3333...`。
> 在二进制里，`0.1` 也是无限循环小数 `0.0001100110011...`。
> 计算机的内存是有限的（64位），它存不下无限的位数，只能截断。
> 当你把两个被截断的“近似值”相加，误差就会累积。
> **教训**: 永远不要用浮点数处理**钱**。用整数（分）来存，或者用专门的 `Decimal` 库。

```javascript
// 整数
const age = 25;
console.log('整数:', age, '类型:', typeof age); 
// 输出: 整数: 25 类型: number

// 浮点数
const price = 19.99;
console.log('浮点数:', price, '类型:', typeof price); 
// 输出: 浮点数: 19.99 类型: number

// 特殊数值
const infinity = Infinity;
const notANumber = NaN; // Not a Number (虽然名字叫 Not a Number，但它的类型是 Number... 🤷‍♂️)

console.log('无穷大:', infinity); // 输出: 无穷大: Infinity
console.log('非数字:', notANumber); // 输出: 非数字: NaN
console.log('NaN 的类型:', typeof NaN); // 输出: number (是不是很哲学?)

// 数学运算
const sum = 10 + 5;
const difference = 10 - 5;
const product = 10 * 5;
const quotient = 10 / 5;
const remainder = 10 % 3;

console.log('加法:', sum);       // 输出: 加法: 15
console.log('减法:', difference); // 输出: 减法: 5
console.log('乘法:', product);   // 输出: 乘法: 50
console.log('除法:', quotient);  // 输出: 除法: 2
console.log('取余:', remainder); // 输出: 取余: 1
```

#### String - 字符串

> **📜 The History: The Tower of Babel (Encoding)**
> 为什么 JS 的字符串有时候处理 Emoji 会出问题（比如 `'💩'.length === 2`）？
> 因为 JavaScript 诞生时，**UCS-2** 编码是主流，它认为所有字符都是 16 位的。
> 后来 Unicode 膨胀了，字符超过了 65536 个，需要用两个 16 位（代理对）来表示一个字符（比如 Emoji）。
> 但 JS 的 `length` 属性依然傻傻地数 16 位的单元。
> 这就是**技术债**。我们至今仍生活在 1995 年的阴影下。
> **现代解法**: 使用 `[...'💩'].length` 或 `Array.from('💩').length`，利用迭代器正确识别字符边界。

```javascript
// 使用单引号
const firstName = 'Alice';

// 使用双引号
const lastName = "Smith";

// 使用反引号(模板字符串)
const fullName = `${firstName} ${lastName}`;
console.log('完整姓名:', fullName); // 输出: 完整姓名: Alice Smith

// 字符串拼接
const greeting = 'Hello, ' + firstName + '!';
console.log('拼接方式:', greeting); // 输出: 拼接方式: Hello, Alice!

// 模板字符串(推荐)
const betterGreeting = `Hello, ${firstName}!`;
console.log('模板方式:', betterGreeting); // 输出: 模板方式: Hello, Alice!

// 多行字符串
const multiLine = `
这是第一行
这是第二行
这是第三行
`;
console.log('多行字符串:', multiLine);

// 字符串方法
const text = 'JavaScript';
console.log('长度:', text.length);              // 输出: 长度: 10
console.log('大写:', text.toUpperCase());        // 输出: 大写: JAVASCRIPT
console.log('小写:', text.toLowerCase());        // 输出: 小写: javascript
console.log('截取:', text.slice(0, 4));         // 输出: 截取: Java
console.log('包含:', text.includes('Script'));  // 输出: 包含: true
```

#### Boolean - 布尔值

> **☯️ The Philosophy: The Dualism (二元论)**
> 布尔值是计算机世界的**阴阳**。
> 在底层，它是电压的高与低，是磁极的南与北。
> 在逻辑层，它是真与假，是存在与虚无。
> 整个数字宇宙，无论多么复杂（AI、元宇宙、区块链），归根结底都是由这最简单的 `true` (1) 和 `false` (0) 编织而成的。
> **大道至简**。

```javascript
// 布尔值只有两个: true 和 false
const isStudent = true;
const isTeacher = false;

console.log('是学生:', isStudent);   // 输出: 是学生: true
console.log('是老师:', isTeacher);   // 输出: 是老师: false

// 比较运算产生布尔值
const age = 18;
const isAdult = age >= 18;
console.log('是成年人:', isAdult);  // 输出: 是成年人: true

// 逻辑运算
const hasLicense = true;
const canDrive = isAdult && hasLicense; // AND 运算
console.log('可以开车:', canDrive);    // 输出: 可以开车: true

const needsHelp = !isAdult;  // NOT 运算
console.log('需要帮助:', needsHelp); // 输出: 需要帮助: false
```

#### null 和 undefined

```javascript
// undefined - 变量已声明但未赋值
let notAssigned;
console.log('未赋值的变量:', notAssigned); // 输出: 未赋值的变量: undefined
console.log('类型:', typeof notAssigned);   // 输出: 类型: undefined

// null - 明确表示"没有值"
const emptyValue = null;
console.log('空值:', emptyValue);          // 输出: 空值: null

// 👇 经典的 JavaScript 鬼故事
console.log('类型:', typeof emptyValue);   // 输出: object 
```

> **👻 The History Ghost: The 10-Day Miracle & Its Curse**
> 为什么 `typeof null` 是 `object`？
> 这是一个 **1995 年留下的考古遗迹**。当年 Brendan Eich 大神只用了 10 天就创造了 JavaScript（为了赶在 Netscape Navigator 2.0 发布前）。
> 在初代版本中，值以 32 位存储，类型标签存储在低位。对象的标签是 `000`，而 `null` 的机器码全为 0。
> 于是，`typeof` 读到了 `000`，就大喊一声：“这是个对象！”
> 为什么不修？因为修复它会搞挂世界上 50% 的古老网站 (Web Legacy)。这就是**技术债**的终极形态——你必须背负着祖先的错误前行。

> **🧘 Zen of Code: The Two Shades of Nothingness**
> *   **Undefined**: "我还没想好。" (系统级的空缺，自然的虚无)
> *   **Null**: "我决定这里什么都没有。" (人为的空缺，显式的虚无)
> *   **哲学建议**: 尽量不要显式赋值 `undefined`，那是 JS 引擎的特权。如果你要表示空，请用 `null`。

> ### 🔧 Under the Hood: 动态类型与 V8 优化
>
> 你可能会觉得 JS 的动态类型 (Dynamic Typing) 效率低下，因为每次操作都需要运行时类型检查。
>
> **V8 引擎是如何优化的？**
> V8 引入了 **Hidden Classes (Shapes)** 和 **Inline Caching (IC)** 技术。
> 当你创建一个对象或变量时，V8 会在后台为其生成一个隐藏的 C++ 类结构。如果你总是以相同的顺序给对象添加属性，V8 就会复用这个 Hidden Class，从而将属性访问编译为直接的内存偏移量读取 (Memory Offset)，性能接近 C++。
>
> **反模式**:
> ```javascript
> // ❌ 动态添加属性会导致 Hidden Class 转换 (Transition)，降低性能
> const p1 = { x: 1 };
> p1.y = 2; 
>
> // ✅ 始终以相同结构初始化对象，保持 Shape 稳定
> class Point {
>   constructor(x, y) {
>     this.x = x;
>     this.y = y;
>   }
> }
> ```


### 2.3 引用类型 (Reference Types)

#### Object - 对象

```javascript
// 对象字面量
const person = {
  name: 'Alice',
  age: 25,
  isStudent: true
};

console.log('对象:', person);
// 输出: 对象: { name: 'Alice', age: 25, isStudent: true }

// 访问属性 - 点语法
console.log('姓名:', person.name); // 输出: 姓名: Alice

// 访问属性 - 括号语法
console.log('年龄:', person['age']); // 输出: 年龄: 25

// 修改属性
person.age = 26;
console.log('新年龄:', person.age); // 输出: 新年龄: 26

// 添加新属性
person.email = 'alice@example.com';
console.log('添加邮箱后:', person);
// 输出: 添加邮箱后: { name: 'Alice', age: 26, isStudent: true, email: 'alice@example.com' }
```

#### Array - 数组

```javascript
// 数组字面量
const fruits = ['apple', 'banana', 'orange'];
console.log('水果数组:', fruits); 
// 输出: 水果数组: [ 'apple', 'banana', 'orange' ]

// 访问数组元素(索引从0开始)
console.log('第一个水果:', fruits[0]); // 输出: 第一个水果: apple
console.log('第二个水果:', fruits[1]); // 输出: 第二个水果: banana

// 数组长度
console.log('水果数量:', fruits.length); // 输出: 水果数量: 3

// 添加元素
fruits.push('grape'); // 在末尾添加
console.log('添加后:', fruits); 
// 输出: 添加后: [ 'apple', 'banana', 'orange', 'grape' ]

// 删除元素
const lastFruit = fruits.pop(); // 删除并返回最后一个元素
console.log('删除的水果:', lastFruit); // 输出: 删除的水果: grape
console.log('删除后:', fruits); 
// 输出: 删除后: [ 'apple', 'banana', 'orange' ]
```

### 2.4 类型检查

```javascript
// typeof 运算符
console.log(typeof 42);           // 输出: number
console.log(typeof 'hello');      // 输出: string
console.log(typeof true);         // 输出: boolean
console.log(typeof undefined);    // 输出: undefined
console.log(typeof null);         // 输出: object (历史遗留bug!)
console.log(typeof {});           // 输出: object
console.log(typeof []);           // 输出: object

// 检查数组
console.log(Array.isArray([]));   // 输出: true
console.log(Array.isArray({}));   // 输出: false
```

---

## 3. 运算符

### 3.1 算术运算符

```javascript
const a = 10;
const b = 3;

console.log('加法:', a + b);      // 输出: 加法: 13
console.log('减法:', a - b);      // 输出: 减法: 7
console.log('乘法:', a * b);      // 输出: 乘法: 30
console.log('除法:', a / b);      // 输出: 除法: 3.3333333333333335
console.log('取余:', a % b);      // 输出: 取余: 1
console.log('幂运算:', a ** b);   // 输出: 幂运算: 1000

// 自增和自减
let count = 0;
count++; // 等同于 count = count + 1
console.log('自增后:', count);    // 输出: 自增后: 1

count--; // 等同于 count = count - 1
console.log('自减后:', count);    // 输出: 自减后: 0
```

### 3.2 比较运算符

> **⚔️ Critical Thinking: The Chaos of Coercion**
> JavaScript 的 `==` (宽松相等) 是万恶之源。
> 它试图扮演一个“老好人”，在你比较 `1 == '1'` 时，自动帮你转换类型。
> 但这个老好人经常办坏事：`[] == ![]` 竟然是 `true`！
> **Type System (类型系统)** 本应是我们在混沌世界中建立的秩序，而 `==` 却在秩序中引入了熵增。
> **结论**: 永远使用 `===` (严格相等)。在代码的世界里，我们不需要这种廉价的“善解人意”，我们需要的是**绝对的精确**。

```javascript
const x = 5;
const y = '5';

// 相等性比较
console.log('x == y:', x == y);   // 输出: x == y: true  (值相等,类型转换)
console.log('x === y:', x === y); // 输出: x === y: false (值和类型都要相等)

// ⚠️ 最佳实践: 始终使用 === 和 !== (严格相等)
console.log('x !== y:', x !== y); // 输出: x !== y: true

// 大小比较
console.log('5 > 3:', 5 > 3);     // 输出: 5 > 3: true
console.log('5 < 3:', 5 < 3);     // 输出: 5 < 3: false
console.log('5 >= 5:', 5 >= 5);   // 输出: 5 >= 5: true
console.log('5 <= 3:', 5 <= 3);   // 输出: 5 <= 3: false
```

> ### 🧠 CS Master's Bridge: 类型系统理论
>
> JavaScript 属于 **弱类型 (Weakly Typed)** 且 **动态类型 (Dynamically Typed)** 语言。
>
> *   **弱类型**: 允许隐式类型转换 (Implicit Coercion)。
> *   **动态类型**: 变量类型在运行时确定。
>
> **The Algorithm of Coercion (ToPrimitive)**:
> 当你执行 `obj + 1` 时，JS 引擎并非随机猜测。它遵循严格的 `ToPrimitive` 算法：
> 1.  检查对象是否有 `[Symbol.toPrimitive]` 方法。如果有，调用它。
> 2.  如果没有，且上下文是 "number" (如 `obj - 1`)，先调用 `valueOf()`，如果返回原始值则使用；否则调用 `toString()`。
> 3.  如果上下文是 "string" (如 `alert(obj)`)，先调用 `toString()`，后调用 `valueOf()`。
> 4.  **Default**: 对于 `+` 操作符，通常先 `valueOf` 后 `toString` (Date 对象除外)。
>
> **`===` vs `==` 的本质**:
> *   `==` (Abstract Equality Comparison): 包含 10+ 条复杂的递归规则。例如 `null == undefined` 是特例，`number == string` 会尝试 `ToNumber(string)`。
> *   `===` (Strict Equality Comparison): 类似于 CPU 指令级的比较。首先检查 **Type Tag**，不同则 false。效率极高。
>
> **架构建议**: 在生产环境中，永远禁止使用 `==`，这可以通过 ESLint 规则 (`eqeqeq`) 强制执行。


### 3.3 逻辑运算符

> **🚪 The Metaphor: The Lazy Gatekeeper (Short-Circuit)**
> 逻辑运算符 `&&` 和 `||` 是**极其懒惰的守门人**。
> *   **`&&` (AND)**: "只要有一个是假的，结果就是假的。" 守门人先看左边，如果是 `false`，他直接关门（返回左边），**根本不看右边**。
> *   **`||` (OR)**: "只要有一个是真的，结果就是真的。" 守门人先看左边，如果是 `true`，他直接开门（返回左边），**根本不看右边**。
> 
> 这种“短路”特性常被用来做**条件执行**（`isReady && launch()`）或**默认值**（`name || 'Guest'`）。

```javascript
const isAdult = true;
const hasLicense = false;

// AND 运算 (&&) - 所有条件都为 true 才返回 true
const canDrive = isAdult && hasLicense;
console.log('可以开车:', canDrive); // 输出: 可以开车: false

// OR 运算 (||) - 只要有一个条件为 true 就返回 true
const canEnter = isAdult || hasLicense;
console.log('可以进入:', canEnter); // 输出: 可以进入: true

// NOT 运算 (!) - 取反
const isChild = !isAdult;
console.log('是儿童:', isChild);    // 输出: 是儿童: false
```

---

## 4. 控制流

### 4.1 条件语句 - if/else

> **🛤️ The Metaphor: The Railway Switch**
> `if/else` 就像是铁路上的**道岔**。
> 火车（代码执行流）开过来，道岔根据信号灯（条件表达式）决定火车是去左边的轨道，还是右边的轨道。
> 每一个 `if` 都是程序逻辑的一次**分叉**。
> 分叉越多，逻辑越复杂（Cyclomatic Complexity）。
> **大师的建议**: 尽早 `return` (Early Return)，减少嵌套。不要让你的代码变成迷宫，要让它像一条笔直的高速公路，只在必要时才会有出口。

```javascript
// 基本 if 语句
const age = 18;

if (age >= 18) {
  console.log('你是成年人');
}
// 输出: 你是成年人

// if-else 语句
const score = 75;

if (score >= 60) {
  console.log('考试通过!');
} else {
  console.log('考试未通过');
}
// 输出: 考试通过!

// if-else if-else 语句
const grade = 85;

if (grade >= 90) {
  console.log('等级: A');
} else if (grade >= 80) {
  console.log('等级: B');
} else if (grade >= 70) {
  console.log('等级: C');
} else if (grade >= 60) {
  console.log('等级: D');
} else {
  console.log('等级: F');
}
// 输出: 等级: B
```

### 4.2 条件语句 - switch

```javascript
// switch 语句
const day = 'Monday';

switch (day) {
  case 'Monday':
    console.log('星期一 - 一周的开始');
    break;
  case 'Friday':
    console.log('星期五 - 快到周末了');
    break;
  case 'Saturday':
  case 'Sunday':
    console.log('周末 - 休息时间');
    break;
  default:
    console.log('工作日');
}
// 输出: 星期一 - 一周的开始

// ⚠️ 注意: 不要忘记 break,否则会继续执行下一个 case
const number = 2;

switch (number) {
  case 1:
    console.log('一');
    // 忘记 break!
  case 2:
    console.log('二');
    break;
  case 3:
    console.log('三');
    break;
}
// 如果 number 是 1,会输出: 一 二 (因为没有 break)
```

### 4.3 循环 - for

> **🌌 The Big Picture: The Eternal Return**
> 循环不仅仅是代码的重复执行，它是计算机最本质的能力——**不知疲倦地处理枯燥任务**。
> 人类讨厌重复，但 CPU 热爱重复。
> 当你写下 `for (let i = 0; i < 1000000; i++)` 时，你是在指挥一个每秒能进行数十亿次运算的硅基生命体。
> 善待你的循环：一个不小心写出的 `O(n²)` 嵌套循环，就是对这个硅基生命体的虐待，也是对用户电池寿命的谋杀。

```javascript
// 基本 for 循环
console.log('=== 基本 for 循环 ===');
for (let i = 0; i < 5; i++) {
  console.log(`循环次数: ${i + 1}`);
}
// 输出:
// 循环次数: 1
// 循环次数: 2
// 循环次数: 3
// 循环次数: 4
// 循环次数: 5

// 遍历数组
console.log('=== 遍历数组 ===');
const fruits = ['apple', 'banana', 'orange'];

for (let i = 0; i < fruits.length; i++) {
  console.log(`水果 ${i + 1}: ${fruits[i]}`);
}
// 输出:
// 水果 1: apple
// 水果 2: banana
// 水果 3: orange

// for...of 循环(推荐用于数组)
console.log('=== for...of 循环 ===');
for (const fruit of fruits) {
  console.log(`我喜欢 ${fruit}`);
}
// 输出:
// 我喜欢 apple
// 我喜欢 banana
// 我喜欢 orange
```

### 4.4 循环 - while

> **♾️ The Philosophy: The Infinite Loop**
> `while` 循环是计算机最危险的能力之一。
> 如果你写了一个 `while(true)` 且没有 `break`，你实际上创造了一个**黑洞**。
> 你的程序会吞噬掉 CPU 的所有算力，界面会卡死，风扇会狂转。
> 这就是**停机问题 (Halting Problem)** 的微观体现——我们无法预知一段代码是否会永远运行下去。
> **警示**: 在写 `while` 时，永远先想好**出口**在哪里。

```javascript
// while 循环
console.log('=== while 循环 ===');
let count = 0;

while (count < 3) {
  console.log(`计数: ${count}`);
  count++;
}
// 输出:
// 计数: 0
// 计数: 1
// 计数: 2

// do-while 循环(至少执行一次)
console.log('=== do-while 循环 ===');
let num = 0;

do {
  console.log(`数字: ${num}`);
  num++;
} while (num < 3);
// 输出:
// 数字: 0
// 数字: 1
// 数字: 2
```

> ### 🚀 Performance Note: 循环性能
>
> 在高性能计算场景（如图形渲染、大数据处理）下，循环的选择很重要：
>
> 1.  **`for` 循环**: 通常是最快的。因为它直接操作栈上的索引，没有额外的函数调用开销。
> 2.  **`forEach` / `map`**: 稍微慢一点。因为它们是高阶函数 (Higher-Order Functions)，每次迭代都会产生一次函数调用 (Function Call Overhead)，涉及新的栈帧压入弹出（尽管现代 V8 的内联优化 Inline Expansion 已经将其差距缩小到了微乎其微的程度）。
> 3.  **`for...of`**: 语义最清晰，基于迭代器协议 (Iterator Protocol)。性能介于两者之间。
>
> **结论**: 99% 的业务逻辑中，优先选择**可读性** (`map`, `filter`, `reduce`)。只有在 Profiler 显示这是热点路径 (Hot Path) 时，才退回到原始的 `for` 循环。


### 4.5 循环控制 - break 和 continue

```javascript
// break - 跳出循环
console.log('=== break 示例 ===');
for (let i = 0; i < 10; i++) {
  if (i === 5) {
    console.log('达到5,停止循环');
    break;
  }
  console.log(`i = ${i}`);
}
// 输出:
// i = 0
// i = 1
// i = 2
// i = 3
// i = 4
// 达到5,停止循环

// continue - 跳过本次循环
console.log('=== continue 示例 ===');
for (let i = 0; i < 5; i++) {
  if (i === 2) {
    console.log('跳过2');
    continue;
  }
  console.log(`i = ${i}`);
}
// 输出:
// i = 0
// i = 1
// 跳过2
// i = 3
// i = 4
```

---

## 5. 代码示例

### 示例1: 成绩评定系统

```javascript
/**
 * 成绩评定系统
 * 功能: 根据分数给出等级评定
 */

// 日志: 程序开始
console.log('=== 成绩评定系统 ===\n');

// 定义学生分数
const studentName = 'Alice';
const score = 85;

// 日志: 输入信息
console.log(`学生姓名: ${studentName}`);
console.log(`考试分数: ${score}\n`);

// 定义等级变量
let grade;
let comment;

// 根据分数判定等级
if (score >= 90) {
  grade = 'A';
  comment = '优秀';
} else if (score >= 80) {
  grade = 'B';
  comment = '良好';
} else if (score >= 70) {
  grade = 'C';
  comment = '中等';
} else if (score >= 60) {
  grade = 'D';
  comment = '及格';
} else {
  grade = 'F';
  comment = '不及格';
}

// 日志: 输出结果
console.log(`等级: ${grade}`);
console.log(`评语: ${comment}`);

// 日志: 程序结束
console.log('\n=== 评定完成 ===');
```

### 示例2: 购物车总价计算

```javascript
/**
 * 购物车总价计算
 * 功能: 计算购物车商品总价,并应用折扣
 */

// 日志: 程序开始
console.log('=== 购物车总价计算 ===\n');

// 定义商品列表
const cart = [
  { name: '笔记本电脑', price: 5999, quantity: 1 },
  { name: '鼠标', price: 99, quantity: 2 },
  { name: '键盘', price: 299, quantity: 1 }
];

// 日志: 购物车内容
console.log('购物车商品:');
cart.forEach((item, index) => {
  console.log(`${index + 1}. ${item.name} - ¥${item.price} x ${item.quantity}`);
});
console.log('');

// 计算小计
let subtotal = 0;
for (const item of cart) {
  const itemTotal = item.price * item.quantity;
  subtotal += itemTotal;
  console.log(`${item.name} 小计: ¥${itemTotal}`);
}

console.log(`\n原价小计: ¥${subtotal}`);

// 应用折扣规则
let discount = 0;
let discountRate = 0;

if (subtotal >= 5000) {
  discountRate = 0.1; // 10% 折扣
  comment = '满5000减10%';
} else if (subtotal >= 3000) {
  discountRate = 0.05; // 5% 折扣
  comment = '满3000减5%';
}

discount = subtotal * discountRate;
const total = subtotal - discount;

// 日志: 折扣信息
if (discount > 0) {
  console.log(`折扣规则: ${comment}`);
  console.log(`折扣金额: -¥${discount.toFixed(2)}`);
}

// 日志: 最终结果
console.log(`\n应付总额: ¥${total.toFixed(2)}`);
console.log('\n=== 计算完成 ===');
```

### 示例3: 找出数组中的最大值

```javascript
/**
 * 找出数组中的最大值
 * 功能: 遍历数组找出最大的数字
 */

// 日志: 程序开始
console.log('=== 查找最大值 ===\n');

// 定义数字数组
const numbers = [23, 45, 12, 67, 34, 89, 15];

// 日志: 输入数组
console.log('数组:', numbers);

// 初始化最大值为第一个元素
let max = numbers[0];
let maxIndex = 0;

// 日志: 开始遍历
console.log('\n开始查找...');

// 遍历数组
for (let i = 1; i < numbers.length; i++) {
  console.log(`比较: ${numbers[i]} vs ${max}`);
  
  if (numbers[i] > max) {
    max = numbers[i];
    maxIndex = i;
    console.log(`  → 发现更大的数: ${max}`);
  }
}

// 日志: 输出结果
console.log(`\n最大值: ${max}`);
console.log(`位置: 索引 ${maxIndex} (第 ${maxIndex + 1} 个元素)`);
console.log('\n=== 查找完成 ===');
```

---

## 6. 最佳实践

### 6.1 变量命名规范

```javascript
// ✅ 推荐: 使用有意义的名称
const userName = 'Alice';
const userAge = 25;
const isLoggedIn = true;

// ❌ 避免: 使用无意义的名称
const x = 'Alice';
const a = 25;
const flag = true;

// ✅ 推荐: 使用驼峰命名法 (camelCase)
const firstName = 'Alice';
const lastName = 'Smith';

// ✅ 推荐: 常量使用大写下划线
const MAX_USERS = 100;
const API_KEY = 'abc123';
```

### 6.2 代码风格

```javascript
// ✅ 推荐: 每条语句后加分号
const name = 'Alice';
const age = 25;

// ✅ 推荐: 使用单引号或模板字符串
const message = 'Hello';
const greeting = `Hello, ${name}!`;

// ✅ 推荐: 运算符两边留空格
const sum = 10 + 5;
const isValid = age >= 18;

// ✅ 推荐: 代码块使用大括号,即使只有一行
if (isValid) {
  console.log('Valid');
}

// ❌ 避免: 省略大括号(虽然语法允许)
if (isValid)
  console.log('Valid');
```

### 6.3 性能考虑

```javascript
// ✅ 推荐: 缓存数组长度
const arr = [1, 2, 3, 4, 5];
const len = arr.length;
for (let i = 0; i < len; i++) {
  console.log(arr[i]);
}

// ❌ 避免: 每次循环都计算长度
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// ✅ 推荐: 使用 const 和 let,不使用 var
const PI = 3.14159;
let counter = 0;

// ✅ 推荐: 使用严格相等 ===
if (value === 10) {
  // ...
}

// ❌ 避免: 使用宽松相等 ==
if (value == 10) {
  // ...
}
```

---

## 7. 常见陷阱

### 7.1 类型转换陷阱 (The "Wat" Moments 🎭)

JavaScript 的类型转换系统经常被用来当做笑话讲。作为一个严谨的 CS 人，看这些可能会让你血压升高，但了解它们能救命。

```javascript
// 1. 字符串拼接 vs 数字相加
// JS: "哦，你有一个字符串？那我就把大家都变成字符串吧！"
console.log('10' + 5);  // '105' 

// JS: "减号？字符串不能相减，那我把大家都变成数字吧！"
console.log('10' - 5);  // 5 

// 2. 著名的 "Wat" 瞬间
// 数组相加
console.log([] + []); // "" (空字符串)
// 解释: [].toString() 是 ""，所以变成 "" + ""

// 数组加对象
console.log([] + {}); // "[object Object]"
// 解释: "" + "[object Object]"

// 对象加数组 (注意：在控制台直接输入 {} + [] 可能会被解析为代码块，但在程序中是这样的)
console.log({} + []); // "[object Object]"

// 3. 宽松相等的哲学
console.log(false == '0'); // true 
// 解释: false -> 0, '0' -> 0. 0 == 0. Bingo!

console.log(null == undefined); // true
// 解释: 它们是难兄难弟，规范定义它们相等。
```

> **🧠 CS 思考**: 
> 这种设计的初衷是“容错性”——让网页尽可能不崩溃，哪怕显示错乱。
> 但对于软件工程来说，**Fail Fast (快速失败)** 才是正道。
> 所以：**永远使用 `===`**，不要给 JS 这种自作聪明的机会。


### 7.2 变量作用域陷阱

```javascript
// ⚠️ var 的作用域问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出: 3 3 3 (因为 var 没有块级作用域)

// ✅ 使用 let 解决
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// 输出: 0 1 2
```

### 7.3 NaN 陷阱

`NaN` (Not a Number) 是 JS 中最孤独的值。

```javascript
// ⚠️ NaN 不等于任何值，甚至不等于它自己！
// 这就像是数据库里的 NULL，但更疯狂一点
const result = 0 / 0;
console.log(result === NaN);  // false 😱

// ✅ 正确的检查方式
console.log(isNaN(result));   // true (但这个函数有坑，isNaN('hello') 也是 true)
console.log(Number.isNaN(result)); // true (这个才是正经的检查函数，ES6 引入)
```


### 7.4 浮点数精度陷阱

```javascript
// ⚠️ 浮点数运算可能不精确
console.log(0.1 + 0.2);  // 0.30000000000000004 (不是 0.3!)

// ✅ 解决方案: 使用整数运算或 toFixed
const sum = (0.1 * 10 + 0.2 * 10) / 10;
console.log(sum);  // 0.3

// 或者
const result = (0.1 + 0.2).toFixed(2);
console.log(result);  // '0.30' (字符串)
```

---

## 8. 章节练习

### 练习1: 变量和数据类型

编写代码完成以下任务:
1. 声明一个常量 `APP_NAME`,值为 'MyApp'
2. 声明一个变量 `userCount`,初始值为 0
3. 将 `userCount` 增加 10
4. 输出 `APP_NAME` 和 `userCount`

<details>
<summary>查看答案</summary>

```javascript
const APP_NAME = 'MyApp';
let userCount = 0;
userCount += 10;
console.log(`应用名称: ${APP_NAME}`);
console.log(`用户数量: ${userCount}`);
```
</details>

### 练习2: 条件判断

编写一个函数 `checkAge(age)`,根据年龄返回不同的消息:
- 小于 13: '儿童'
- 13-17: '青少年'
- 18-59: '成年人'
- 60 及以上: '老年人'

<details>
<summary>查看答案</summary>

```javascript
function checkAge(age) {
  if (age < 13) {
    return '儿童';
  } else if (age < 18) {
    return '青少年';
  } else if (age < 60) {
    return '成年人';
  } else {
    return '老年人';
  }
}

console.log(checkAge(10));  // 儿童
console.log(checkAge(15));  // 青少年
console.log(checkAge(30));  // 成年人
console.log(checkAge(65));  // 老年人
```
</details>

### 练习3: 循环

编写代码计算 1 到 100 的和。

<details>
<summary>查看答案</summary>

```javascript
let sum = 0;
for (let i = 1; i <= 100; i++) {
  sum += i;
}
console.log(`1 到 100 的和: ${sum}`); // 5050
```
</details>

### 练习4: 数组遍历

给定数组 `[1, 2, 3, 4, 5]`,编写代码输出所有偶数。

<details>
<summary>查看答案</summary>

```javascript
const numbers = [1, 2, 3, 4, 5];

for (const num of numbers) {
  if (num % 2 === 0) {
    console.log(num);
  }
}
// 输出: 2, 4
```
</details>

### 练习5: 综合应用

编写一个程序,找出数组中所有大于平均值的数字。

示例: `[10, 20, 30, 40, 50]` → 平均值 30 → 输出 `[40, 50]`

<details>
<summary>查看答案</summary>

```javascript
const numbers = [10, 20, 30, 40, 50];

// 计算平均值
let sum = 0;
for (const num of numbers) {
  sum += num;
}
const average = sum / numbers.length;

console.log(`平均值: ${average}`);

// 找出大于平均值的数字
const result = [];
for (const num of numbers) {
  if (num > average) {
    result.push(num);
  }
}

console.log(`大于平均值的数字:`, result);
```
</details>

---

## 📚 下一步

恭喜你完成了第1章的学习!现在你已经掌握了:
- ✅ JavaScript 的基本语法
- ✅ 变量声明和数据类型
- ✅ 运算符和表达式
- ✅ 控制流(条件和循环)

**准备好了吗?** 让我们继续学习[第2章:函数和作用域](../02-functions-scope/)!

---

## 📖 参考资源

- [MDN - JavaScript 基础](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/First_steps)
- [JavaScript.info - JavaScript 基础知识](https://zh.javascript.info/first-steps)
