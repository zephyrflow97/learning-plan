# 第 3 章:对象和数组操作

在本章中,你将深入学习 JavaScript 中两种最重要的数据结构——对象和数组。你将掌握它们的基本操作、常用方法、解构赋值和展开运算符等现代特性。

## 📖 本章内容

1. [对象基础](#1-对象基础)
2. [对象的高级操作](#2-对象的高级操作)
3. [数组基础](#3-数组基础)
4. [数组的高级方法](#4-数组的高级方法)
5. [解构赋值](#5-解构赋值)
6. [展开运算符](#6-展开运算符)
7. [实战示例](#7-实战示例)
8. [最佳实践](#8-最佳实践)
9. [章节练习](#9-章节练习)

---

## 1. 对象基础

### 1.1 什么是对象?

> **🎭 The Metaphor: The Shape Shifter**
> 在 C++ 或 Java 中，对象像是由模具（Class）铸造出来的金属零件，形状固定，坚不可摧。
> 但在 JavaScript 中，对象像是**橡皮泥**。
> 你可以随时捏它（添加属性）、切它（删除属性）。
> 这种灵活性是把双刃剑：它让你开发神速，也让 V8 引擎的优化器（TurboFan）头秃。
> 为了让橡皮泥变硬（高性能），V8 发明了 **Hidden Classes** —— 只要你像个正常人一样按顺序初始化属性，V8 就会假装它是个静态语言的 Struct。

```javascript
/**
 * 对象基础
 * 创建和使用对象
 */

console.log('=== 对象基础 ===\n');

// 创建对象 - 对象字面量(推荐方式)
const person = {
  name: 'Alice',
  age: 25,
  city: 'Beijing',
  isStudent: true
};

console.log('创建的对象:', person);
console.log('对象类型:', typeof person);
```

> ### 🔧 Under the Hood: Objects are NOT just Hash Maps
> You might think a JS Object is just a `std::map<string, any>` or a Hash Table. **Wrong.**
>
> V8 uses **Hidden Classes (Shapes)** to optimize property access to be nearly as fast as C++ struct field access.
> *   **Transitions**: When you create `const p = { x: 1 }`, V8 creates a Shape `S0`. When you add `p.y = 2`, V8 creates a new Shape `S1` and a **Transition** from `S0` to `S1`.
> *   **Inline Caching (IC)**: The call site `p.x` caches the Shape `S1` and the offset of `x`. Next time, it checks "Is shape S1? Yes -> Read offset 0". This is **Monomorphic** (Fast).
> *   **Polymorphism**: If you pass `{x:1, y:2}` (Shape A) and `{y:2, x:1}` (Shape B) to the same function, the IC becomes **Polymorphic** (slower, switch-case like).
> *   **Megamorphism**: If you pass >4 different shapes, IC fails and falls back to **Megamorphic** (Global Dictionary Lookup, very slow).
> *   **Optimization Tip**: Always initialize properties in the **same order**.
> *   **The `delete` Trap**: `delete user.email` is slow because it forces the object into "Dictionary Mode" (hash table lookup). If performance matters, use `user.email = null` (or `undefined`) instead to keep the Shape stable.

### 1.2 访问和修改属性

```javascript
/**
 * 属性的访问和修改
 */

console.log('\n=== 属性访问和修改 ===\n');

const user = {
  name: 'Bob',
  age: 30,
  email: 'bob@example.com'
};

console.log('原始对象:', user);

// 访问属性 - 点语法
console.log('\n使用点语法:');
console.log('  姓名:', user.name);
console.log('  年龄:', user.age);

// 访问属性 - 括号语法
console.log('\n使用括号语法:');
console.log('  邮箱:', user['email']);

// 括号语法的优势: 可以使用变量
const propertyName = 'name';
console.log('  动态访问:', user[propertyName]);

// 修改属性
console.log('\n修改属性:');
user.age = 31;
console.log('  修改年龄后:', user.age);

// 添加新属性
console.log('\n添加新属性:');
user.phone = '123-456-7890';
console.log('  添加电话后:', user);

// 删除属性
console.log('\n删除属性:');
delete user.email;
console.log('  删除邮箱后:', user);

// 检查属性是否存在
console.log('\n检查属性:');
console.log('  是否有 name:', 'name' in user);
console.log('  是否有 email:', 'email' in user);
console.log('  phone 是否存在:', user.phone !== undefined);
```

### 1.3 对象方法

> **🎭 The Metaphor: Data with Behavior**
> 对象不仅仅是数据的容器（像一个背包），它还是**有行为的实体**（像一个机器人）。
> *   **属性 (Property)** 是它的零件（手臂、电池）。
> *   **方法 (Method)** 是它的功能（挥手、充电）。
> 
> 当我们将数据（属性）和操作数据的逻辑（方法）封装在一起时，我们就在进行**面向对象编程 (OOP)** 的雏形。
> `this` 就是机器人指向自己的手指：“我要用**我的**电池（`this.battery`），而不是隔壁老王的电池。”

```javascript
/**
 * 对象方法
 * 对象的属性可以是函数
 */

console.log('\n=== 对象方法 ===\n');

const calculator = {
  // 数据属性
  name: '计算器',
  version: '1.0',
  
  // 方法
  add: function(a, b) {
    console.log(`  计算: ${a} + ${b}`);
    return a + b;
  },
  
  // ES6 简写语法(推荐)
  subtract(a, b) {
    console.log(`  计算: ${a} - ${b}`);
    return a - b;
  },
  
  // 方法中使用 this 访问对象属性
  getInfo() {
    console.log(`  ${this.name} v${this.version}`);
  }
};

console.log('调用方法:');
const sum = calculator.add(10, 5);
console.log(`结果: ${sum}\n`);

const diff = calculator.subtract(10, 5);
console.log(`结果: ${diff}\n`);

calculator.getInfo();
```

### 1.4 嵌套对象

```javascript
/**
 * 嵌套对象
 * 对象的属性可以是另一个对象
 */

console.log('\n=== 嵌套对象 ===\n');

const student = {
  name: 'Charlie',
  age: 20,
  // 嵌套对象
  address: {
    city: 'Shanghai',
    street: 'Nanjing Road',
    zipCode: '200000'
  },
  // 数组属性
  scores: [85, 90, 88]
};

console.log('学生信息:', student);

// 访问嵌套属性
console.log('\n访问嵌套属性:');
console.log('  城市:', student.address.city);
console.log('  街道:', student.address['street']);

// 修改嵌套属性
student.address.city = 'Guangzhou';
console.log('  修改后的城市:', student.address.city);

// 访问数组属性
console.log('\n访问数组:');
console.log('  第一门成绩:', student.scores[0]);
console.log('  所有成绩:', student.scores);
```

---

## 2. 对象的高级操作

### 2.1 Object 静态方法

```javascript
/**
 * Object 的静态方法
 */

console.log('\n=== Object 静态方法 ===\n');

const product = {
  id: 1,
  name: '笔记本电脑',
  price: 5999,
  brand: 'Apple'
};

console.log('原始对象:', product);

// Object.keys() - 获取所有键
console.log('\nObject.keys():');
const keys = Object.keys(product);
console.log('  所有键:', keys);

// Object.values() - 获取所有值
console.log('\nObject.values():');
const values = Object.values(product);
console.log('  所有值:', values);

// Object.entries() - 获取键值对数组
console.log('\nObject.entries():');
const entries = Object.entries(product);
console.log('  键值对:');
entries.forEach(([key, value]) => {
  console.log(`    ${key}: ${value}`);
});

// Object.assign() - 复制/合并对象
console.log('\nObject.assign():');
const defaults = { color: 'gray', weight: 2 };
const custom = { color: 'silver' };

const merged = Object.assign({}, defaults, custom);
console.log('  合并结果:', merged);

// Object.freeze() - 冻结对象(不可修改)
console.log('\nObject.freeze():');
const frozen = Object.freeze({ name: 'Frozen' });
// frozen.name = 'Changed'; // ❌ 严格模式下会报错,非严格模式静默失败
console.log('  冻结的对象:', frozen);

// Object.seal() - 密封对象(可修改属性,不可添加/删除)
console.log('\nObject.seal():');
const sealed = Object.seal({ name: 'Sealed' });
sealed.name = 'Changed'; // ✅ 可以修改
// sealed.age = 20; // ❌ 不能添加新属性
console.log('  密封的对象:', sealed);
```

### 2.2 对象的遍历

> **🧬 The Biology: The Prototype Chain (DNA)**
> 当你遍历一个对象时（特别是用 `for...in`），你可能会惊讶地发现一些你没定义的属性。
> 这是因为 JavaScript 的对象有 **DNA 继承**（原型链）。
> 对象不仅拥有自己的属性，还继承了它“父亲”（Prototype）的属性。
> `for...in` 会顺着 DNA 链向上爬，把祖宗十八代的属性都翻出来。
> **防御措施**: 使用 `Object.keys()` 或 `Object.entries()`，它们只关心对象**自己**的属性（Own Properties），不关心祖先的遗产。

```javascript
/**
 * 遍历对象
 */

console.log('\n=== 遍历对象 ===\n');

const book = {
  title: 'JavaScript 高级程序设计',
  author: 'Nicholas C. Zakas',
  year: 2011,
  pages: 1032
};

console.log('书籍信息:', book);

// 方法1: for...in 循环
console.log('\n方法1: for...in');
for (const key in book) {
  console.log(`  ${key}: ${book[key]}`);
}

// 方法2: Object.keys() + forEach
console.log('\n方法2: Object.keys() + forEach');
Object.keys(book).forEach(key => {
  console.log(`  ${key}: ${book[key]}`);
});

// 方法3: Object.entries() (推荐)
console.log('\n方法3: Object.entries()');
Object.entries(book).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});
```

### 2.3 对象的复制

> **🧶 The Metaphor: The Red String of Fate (Pointers)**
> 想象对象是一个**气球**，而变量是拴着气球的**线**。
> *   `const a = {}`：你吹了一个气球，手里拿着线 `a`。
> *   `const b = a`：你没有吹新气球，只是从 `a` 那里分出了一根新线 `b` 拴在**同一个气球**上。
> *   `b.color = 'red'`：你顺着线 `b` 把气球涂红了。
> *   `console.log(a.color)`：顺着线 `a` 看，气球当然也是红的。
> 
> **浅拷贝 (Shallow Copy)** 就像是把气球里的东西（属性）拿出来，装进一个新气球里。但如果里面还有小气球（嵌套对象），那你只是把小气球的线复制了一份。

```javascript
/**
 * 对象的复制
 * 浅拷贝 vs 深拷贝
 */

console.log('\n=== 对象复制 ===\n');

const original = {
  name: 'Alice',
  age: 25,
  address: {
    city: 'Beijing'
  }
};

console.log('原始对象:', original);

// ⚠️ 直接赋值 - 引用复制(不是拷贝)
console.log('\n直接赋值:');

> ### 🎓 CS Master's Bridge: Pointers Everywhere
> For a C++ dev, this is obvious, but let's be precise:
> *   **Primitives** (number, string) are **Values** (stored on Stack or directly in the pointer via "Pointer Tagging").
> *   **Objects** are **Pointers** (References to Heap).
>
> ```cpp
> // C++ Analogy
> const auto original = new Object(); // pointer is const
> auto reference = original;          // copying the pointer address
> ```
> When you do `const obj = {}`, you are creating a `User* const obj`. You can't change where `obj` points (the address), but you CAN change the memory it points to (`obj->name = "Bob"`).
const reference = original;
reference.age = 30;
console.log('  修改后,原始对象:', original.age); // 30 (也被修改了!)

// ✅ 浅拷贝 - 使用 Object.assign()
console.log('\n浅拷贝 (Object.assign):');
const shallow1 = Object.assign({}, original);
shallow1.age = 26;
console.log('  修改 age,原始对象:', original.age); // 25 (未被修改)

// ⚠️ 但是嵌套对象还是引用
shallow1.address.city = 'Shanghai';
console.log('  修改嵌套对象,原始:', original.address.city); // 'Shanghai' (被修改了!)

// ✅ 浅拷贝 - 使用展开运算符(推荐)
console.log('\n浅拷贝 (展开运算符):');
const shallow2 = { ...original };
console.log('  展开运算符复制:', shallow2);

// ✅ 深拷贝 - 使用 JSON (简单方法,有限制)
console.log('\n深拷贝 (JSON):');
const deep = JSON.parse(JSON.stringify(original));

> **🌌 The Sci-Fi: The Teleporter (JSON Serialization)**
> `JSON.stringify` 和 `JSON.parse` 的组合就像是《星际迷航》里的**传送门**。
> 1.  **Stringify (分解)**: 把一个复杂的对象（人）瞬间分解成一串字符串（原子流）。在这个过程中，所有**非物质**的东西（函数、Undefined、Symbol）都会丢失，因为它们无法被序列化。
> 2.  **Parse (重组)**: 在另一个地方（新变量），根据原子流重新组装出一个一模一样的人。
> 
> 虽然这是最简单的深拷贝方法，但要小心它的**副作用**（丢失数据）。

deep.address.city = 'Guangzhou';
console.log('  修改深拷贝,原始:', original.address.city); // 'Shanghai' (未被修改)

// ⚠️ JSON 方法的限制
console.log('\nJSON 深拷贝的限制:');
const withFunction = {
  name: 'Test',
  method: function() { return 'hello'; },
  date: new Date(),
  undefined: undefined
};

const jsonCopy = JSON.parse(JSON.stringify(withFunction));
console.log('  原始:', withFunction);
console.log('  JSON 复制:', jsonCopy); 
// 注意: method 函数丢失, date 变成字符串, undefined 丢失
```

---

## 3. 数组基础

### 3.1 创建和访问数组

> **📏 The History: Why Start at Zero?**
> 为什么数组索引从 0 开始，而不是 1？
> 这不是为了折磨初学者，而是源于 C 语言的**指针算术**。
> `array[i]` 的本质是 `*(memory_address + i * element_size)`。
> *   索引 0 意味着：从起始地址偏移 0 个单位（就是第一个元素）。
> *   索引 1 意味着：从起始地址偏移 1 个单位。
> 
> 所以，索引本质上是**偏移量 (Offset)**，而不是**计数 (Count)**。
> 虽然 JS 是高级语言，但它保留了这个来自底层的习惯，作为对计算机历史的致敬。

```javascript
/**
 * 数组基础
 */

console.log('\n=== 数组基础 ===\n');

// 创建数组
const fruits = ['apple', 'banana', 'orange'];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, 'two', true, { name: 'obj' }, [1, 2]];

console.log('水果数组:', fruits);
console.log('数字数组:', numbers);
console.log('混合数组:', mixed);

// 访问数组元素(索引从 0 开始)
console.log('\n访问元素:');
console.log('  第一个水果:', fruits[0]);
console.log('  最后一个水果:', fruits[fruits.length - 1]);

// 数组长度
console.log('\n数组长度:');
console.log('  水果数量:', fruits.length);

// 修改元素
fruits[1] = 'grape';
console.log('  修改后:', fruits);

// 添加元素
fruits[fruits.length] = 'mango'; // 不推荐
console.log('  添加后:', fruits);
```

> ### 🔧 Under the Hood: The "Array" Lie
> In C, an array is a contiguous block of memory. In JS, `Array` is technically a special `Object` with integer keys. However, V8 tries hard to optimize it.
>
> *   **Packed Elements**: `[1, 2, 3]` → V8 stores this as a contiguous C-array of Smis (Small Integers). **Fast.**
> *   **Holey Elements**: `const a = [1, 2]; a[100] = 3;` → You just created "holes" (indices 2-99). V8 downgrades this array to a **Dictionary (Hash Map)**. Access becomes `O(1)` hash lookup instead of `O(1)` pointer arithmetic. **Slow.**
> *   **Double Elements**: If you add a float `arr[0] = 1.5`, V8 has to box everything or switch the backing store to `FixedDoubleArray`.
>
> **Advice**: Don't treat JS Arrays like `std::vector` with infinite flexibility. Keep them **Packed** (no holes) and **Monomorphic** (same type) for max performance.

### 3.2 数组的基本方法

> **📚 The Metaphor: The Stack of Books**
> 数组最基本的操作 `push` 和 `pop`，实际上是在模拟一个**栈 (Stack)** 结构。
> 想象一摞书：
> *   `push`: 把新书放在最上面。
> *   `pop`: 把最上面的书拿走。
> 
> 这种 **LIFO (Last In, First Out)** 的模式在计算机科学中无处不在（函数调用栈、撤销操作）。
> 而 `unshift` 和 `shift` 则是在模拟 **队列 (Queue)**，就像排队买票。
> **性能警示**: `unshift`（插队）比 `push`（排队尾）慢得多，因为插队时，后面所有人都得往后挪一步（索引重排）。

```javascript
/**
 * 数组的基本操作方法
 */

console.log('\n=== 数组基本方法 ===\n');

const arr = ['a', 'b', 'c'];
console.log('原始数组:', arr);

// push() - 在末尾添加元素
console.log('\npush() - 末尾添加:');
arr.push('d');
console.log('  添加 d:', arr);

// pop() - 删除并返回最后一个元素
console.log('\npop() - 删除末尾:');
const last = arr.pop();
console.log('  删除的元素:', last);
console.log('  删除后:', arr);

// unshift() - 在开头添加元素
console.log('\nunshift() - 开头添加:');
arr.unshift('z');
console.log('  添加 z:', arr);

// shift() - 删除并返回第一个元素
console.log('\nshift() - 删除开头:');
const first = arr.shift();
console.log('  删除的元素:', first);
console.log('  删除后:', arr);

// splice() - 添加/删除元素
console.log('\nsplice() - 多功能操作:');
const nums = [1, 2, 3, 4, 5];
console.log('  原数组:', nums);

// 删除元素: splice(起始索引, 删除数量)
const removed = nums.splice(2, 1); // 删除索引 2 的元素
console.log('  删除索引 2:', removed, '→', nums);

// 插入元素: splice(起始索引, 0, 新元素...)
nums.splice(2, 0, 'x', 'y'); // 在索引 2 插入
console.log('  插入元素:', nums);

// 替换元素: splice(起始索引, 删除数量, 新元素...)
nums.splice(1, 2, 'a', 'b'); // 删除并替换
console.log('  替换元素:', nums);

// slice() - 提取数组片段(不修改原数组)
console.log('\nslice() - 提取片段:');
const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
console.log('  原数组:', colors);

const slice1 = colors.slice(1, 3); // 提取索引 1-2
console.log('  slice(1, 3):', slice1);

const slice2 = colors.slice(2); // 从索引 2 到末尾
console.log('  slice(2):', slice2);

const slice3 = colors.slice(-2); // 最后两个元素
console.log('  slice(-2):', slice3);

console.log('  原数组未变:', colors);

// concat() - 合并数组
console.log('\nconcat() - 合并数组:');
const arr1 = [1, 2];
const arr2 = [3, 4];
const arr3 = [5, 6];

const combined = arr1.concat(arr2, arr3);
console.log('  合并结果:', combined);
console.log('  原数组未变:', arr1);

// join() - 转换为字符串
console.log('\njoin() - 转换为字符串:');
const words = ['Hello', 'World', 'JavaScript'];
console.log('  用空格连接:', words.join(' '));
console.log('  用逗号连接:', words.join(', '));
console.log('  用短横线连接:', words.join('-'));

// reverse() - 反转数组(修改原数组)
console.log('\nreverse() - 反转:');
const sequence = [1, 2, 3, 4, 5];
console.log('  原数组:', sequence);
sequence.reverse();
console.log('  反转后:', sequence);

// indexOf() / lastIndexOf() - 查找元素
console.log('\nindexOf() - 查找索引:');
const animals = ['cat', 'dog', 'bird', 'cat'];
console.log('  数组:', animals);
console.log('  indexOf("cat"):', animals.indexOf('cat'));      // 0
console.log('  lastIndexOf("cat"):', animals.lastIndexOf('cat')); // 3
console.log('  indexOf("fish"):', animals.indexOf('fish'));    // -1 (不存在)

// includes() - 检查是否包含
console.log('\nincludes() - 检查包含:');
console.log('  是否包含 dog:', animals.includes('dog'));
console.log('  是否包含 fish:', animals.includes('fish'));
```

---

## 4. 数组的高级方法

### 4.1 map() - 映射转换

> **🏭 The Metaphor: The Assembly Line**
> 数组方法 (`map`, `filter`, `reduce`) 就是**工业流水线**。
> *   `for` 循环是**手工作坊**：你亲自拿一个零件，敲打它，然后放进箱子里。容易出错，难以并行。
> *   `map` 是**冲压机**：原料进去，成品出来。你只关心“怎么变”，不关心“怎么拿”。
> *   `filter` 是**质检员**：不合格的扔掉。
> *   `reduce` 是**组装工**：把一堆零件组装成一个成品（求和、聚合）。
> 
> **函数式编程 (FP)** 的精髓在于：**声明式 (Declarative)** —— 告诉机器“我要什么”，而不是“怎么做”。

```javascript
/**
 * map() - 将数组的每个元素转换为新值
 */

console.log('\n=== map() 映射转换 ===\n');

// 示例1: 数字数组加倍
const numbers = [1, 2, 3, 4, 5];
console.log('原数组:', numbers);

const doubled = numbers.map(n => {
  console.log(`  处理: ${n} → ${n * 2}`);
  return n * 2;
});
console.log('结果:', doubled);

// 示例2: 提取对象属性
console.log('\n提取对象属性:');
const users = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 }
];

const names = users.map(user => user.name);
console.log('用户名:', names);

// 示例3: 对象转换
console.log('\n对象转换:');
const products = [
  { name: '苹果', price: 5 },
  { name: '香蕉', price: 3 }
];

const withTax = products.map(p => ({
  ...p,
  priceWithTax: p.price * 1.1
}));
console.log('加税后:', withTax);
```

> ### 🎓 CS Master's Bridge: The Functional Trinity
> If you come from C++11/20 or Rust, you'll recognize this pattern immediately.
> *   `map` = `std::transform` (C++) / `iter.map()` (Rust)
> *   `filter` = `std::copy_if` (C++) / `iter.filter()` (Rust)
> *   `reduce` = `std::accumulate` (C++) / `iter.fold()` (Rust)
>
> In JS, these are **Higher-Order Functions** (take functions as arguments). They are the cornerstone of "Declarative Programming" in the frontend.
> **Why?** Because they encourage **Immutability**. Unlike `for` loops which often rely on side-effects (pushing to an external array), these methods return *new* arrays, making data flow predictable.

### 4.2 filter() - 过滤筛选

```javascript
/**
 * filter() - 筛选符合条件的元素
 */

console.log('\n=== filter() 过滤筛选 ===\n');

// 示例1: 筛选偶数
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('原数组:', nums);

const evens = nums.filter(n => {
  const isEven = n % 2 === 0;
  console.log(`  ${n}: ${isEven ? '✅ 保留' : '❌ 过滤'}`);
  return isEven;
});
console.log('偶数:', evens);

// 示例2: 筛选成年人
console.log('\n筛选成年人:');
const people = [
  { name: 'Alice', age: 17 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 15 },
  { name: 'David', age: 30 }
];

const adults = people.filter(p => p.age >= 18);
console.log('成年人:', adults);

// 示例3: 多条件筛选
console.log('\n多条件筛选:');
const items = [
  { name: '笔记本', price: 5999, inStock: true },
  { name: '鼠标', price: 99, inStock: false },
  { name: '键盘', price: 299, inStock: true },
  { name: '显示器', price: 1999, inStock: true }
];

const available = items.filter(item => 
  item.inStock && item.price < 2000
);
console.log('可购买商品 (有货且<2000):', available);
```

### 4.3 reduce() - 归约计算

```javascript
/**
 * reduce() - 将数组归约为单个值
 */

console.log('\n=== reduce() 归约计算 ===\n');

// 示例1: 求和
const numbers = [1, 2, 3, 4, 5];
console.log('原数组:', numbers);

const sum = numbers.reduce((accumulator, current) => {
  console.log(`  累加: ${accumulator} + ${current} = ${accumulator + current}`);
  return accumulator + current;
}, 0); // 0 是初始值

console.log('总和:', sum);

// 示例2: 求最大值
console.log('\n求最大值:');
const scores = [85, 92, 78, 95, 88];
console.log('分数:', scores);

const max = scores.reduce((max, score) => {
  const newMax = score > max ? score : max;
  console.log(`  比较: max=${max}, score=${score}, 新max=${newMax}`);
  return newMax;
});

console.log('最高分:', max);

// 示例3: 对象统计
console.log('\n对象统计:');
const cart = [
  { name: '苹果', price: 5, quantity: 3 },
  { name: '香蕉', price: 3, quantity: 5 },
  { name: '橙子', price: 4, quantity: 2 }
];

const total = cart.reduce((sum, item) => {
  const itemTotal = item.price * item.quantity;
  console.log(`  ${item.name}: ${item.price} × ${item.quantity} = ${itemTotal}`);
  return sum + itemTotal;
}, 0);

console.log('购物车总价:', total);

// 示例4: 数组转对象
console.log('\n数组转对象:');
const pairs = [['name', 'Alice'], ['age', 25], ['city', 'Beijing']];
console.log('键值对数组:', pairs);

const obj = pairs.reduce((result, [key, value]) => {
  result[key] = value;
  return result;
}, {});

console.log('转换后的对象:', obj);
```

### 4.4 find() 和 findIndex()

```javascript
/**
 * find() - 查找第一个符合条件的元素
 * findIndex() - 查找第一个符合条件元素的索引
 */

console.log('\n=== find() 和 findIndex() ===\n');

const students = [
  { id: 1, name: 'Alice', score: 85 },
  { id: 2, name: 'Bob', score: 92 },
  { id: 3, name: 'Charlie', score: 78 },
  { id: 4, name: 'David', score: 95 }
];

console.log('学生列表:', students);

// find() - 返回元素
console.log('\nfind() - 查找分数 > 90 的学生:');
const topStudent = students.find(s => s.score > 90);
console.log('  结果:', topStudent);

// findIndex() - 返回索引
console.log('\nfindIndex() - 查找名为 Charlie 的索引:');
const charlieIndex = students.findIndex(s => s.name === 'Charlie');
console.log('  索引:', charlieIndex);

// 找不到的情况
console.log('\n找不到的情况:');
const notFound = students.find(s => s.score > 100);
const notFoundIndex = students.findIndex(s => s.score > 100);
console.log('  find 结果:', notFound);      // undefined
console.log('  findIndex 结果:', notFoundIndex); // -1
```

### 4.5 every() 和 some()

```javascript
/**
 * every() - 检查是否所有元素都符合条件
 * some() - 检查是否至少有一个元素符合条件
 */

console.log('\n=== every() 和 some() ===\n');

const numbers = [2, 4, 6, 8, 10];
console.log('数组:', numbers);

// every() - 全部满足
console.log('\nevery() - 是否全是偶数:');
const allEven = numbers.every(n => {
  const isEven = n % 2 === 0;
  console.log(`  ${n}: ${isEven}`);
  return isEven;
});
console.log('结果:', allEven); // true

// some() - 至少一个满足
console.log('\nsome() - 是否有大于 5 的数:');
const hasLarge = numbers.some(n => {
  const isLarge = n > 5;
  console.log(`  ${n}: ${isLarge}`);
  return isLarge;
});
console.log('结果:', hasLarge); // true

// 实际应用: 表单验证
console.log('\n实际应用 - 表单验证:');
const formFields = [
  { name: 'username', value: 'alice', valid: true },
  { name: 'email', value: '', valid: false },
  { name: 'password', value: '123456', valid: true }
];

const allValid = formFields.every(field => field.valid);
const hasInvalid = formFields.some(field => !field.valid);

console.log('  表单字段:', formFields);
console.log('  全部有效:', allValid);      // false
console.log('  有无效项:', hasInvalid);    // true
```

### 4.6 sort() - 排序

```javascript
/**
 * sort() - 数组排序(修改原数组)
 */

console.log('\n=== sort() 排序 ===\n');

// ⚠️ 默认排序(按字符串)
console.log('默认排序问题:');
const nums = [10, 5, 40, 25, 100];
console.log('  原数组:', nums);
// nums.sort(); // [10, 100, 25, 40, 5] - 按字符串排序!
// console.log('  默认排序:', nums);

// ✅ 数字排序 - 提供比较函数
console.log('\n数字排序:');
const numbers = [10, 5, 40, 25, 100];
console.log('  原数组:', numbers);

// 升序
numbers.sort((a, b) => a - b);
console.log('  升序:', numbers);

// 降序
numbers.sort((a, b) => b - a);
console.log('  降序:', numbers);

// 对象数组排序
console.log('\n对象数组排序:');
const people = [
  { name: 'Charlie', age: 35 },
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
];

console.log('  原数组:', people);

// 按年龄升序
people.sort((a, b) => a.age - b.age);
console.log('  按年龄升序:', people);

// 按名字排序
people.sort((a, b) => a.name.localeCompare(b.name));
console.log('  按名字排序:', people);
```

### 4.7 链式调用

```javascript
/**
 * 链式调用 - 组合多个数组方法
 */

console.log('\n=== 链式调用 ===\n');

const products = [
  { name: '笔记本', category: '电脑', price: 5999, inStock: true },
  { name: '鼠标', category: '配件', price: 99, inStock: false },
  { name: '键盘', category: '配件', price: 299, inStock: true },
  { name: '显示器', category: '电脑', price: 1999, inStock: true },
  { name: '音箱', category: '配件', price: 499, inStock: true }
];

console.log('商品列表:', products);

// 任务: 找出所有有货的配件,按价格排序,提取名称
console.log('\n链式处理:');
const result = products
  .filter(p => {
    console.log(`  过滤: ${p.name} - 配件=${p.category === '配件'}, 有货=${p.inStock}`);
    return p.category === '配件' && p.inStock;
  })
  .sort((a, b) => {
    console.log(`  排序: ${a.name}(${a.price}) vs ${b.name}(${b.price})`);
    return a.price - b.price;
  })
  .map(p => {
    console.log(`  提取: ${p.name}`);
    return p.name;
  });

console.log('\n最终结果:', result);

// 复杂示例: 计算有货商品的平均价格
console.log('\n计算平均价格:');
const average = products
  .filter(p => p.inStock)
  .map(p => p.price)
  .reduce((sum, price, index, array) => {
    return index === array.length - 1 
      ? (sum + price) / array.length 
      : sum + price;
  }, 0);

console.log('有货商品平均价:', average.toFixed(2));
```

---

## 5. 解构赋值

### 5.1 数组解构

> **📦 The Metaphor: The Unpacking (Destructuring)**
> 解构（Destructuring）就像是**拆快递**。
> 以前（ES5），你收到一个大箱子（数组/对象），你得自己动手把里面的东西一个个拿出来，分别放到桌子上（赋值给变量）。
> 现在（ES6），你只需要指着箱子说：“我要里面的第一个、第二个东西，分别叫 A 和 B。”
> JS 引擎会自动帮你把箱子拆开，把东西递到你手里。这是一种**声明式**的数据提取方式。

```javascript
/**
 * 数组解构
 * 从数组中快速提取值
 */

console.log('\n=== 数组解构 ===\n');

// 基本解构
const colors = ['red', 'green', 'blue'];
const [first, second, third] = colors;

console.log('数组:', colors);
console.log('解构:');
console.log('  第一个:', first);
console.log('  第二个:', second);
console.log('  第三个:', third);

// 跳过元素
console.log('\n跳过元素:');
const numbers = [1, 2, 3, 4, 5];
const [a, , c, , e] = numbers; // 跳过索引 1 和 3
console.log('  a:', a, 'c:', c, 'e:', e);

// 剩余元素
console.log('\n剩余元素:');
const [head, ...rest] = numbers;
console.log('  第一个:', head);
console.log('  其余的:', rest);

// 默认值
console.log('\n默认值:');
const [x, y, z = 0] = [1, 2];
console.log('  x:', x, 'y:', y, 'z:', z); // z 使用默认值

// 交换变量
console.log('\n交换变量:');
let num1 = 10;
let num2 = 20;
console.log('  交换前:', { num1, num2 });

[num1, num2] = [num2, num1];
console.log('  交换后:', { num1, num2 });

// 函数返回多个值
console.log('\n函数返回多个值:');
function getMinMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}

const [min, max] = getMinMax([3, 7, 2, 9, 1]);
console.log(`  最小值: ${min}, 最大值: ${max}`);
```

> ### 🎭 Geek & Fun: Pattern Matching "Lite"
> Destructuring is basically **Pattern Matching** (like in Rust/Haskell/Scala) but ordered from Wish.com.
> *   It extracts data by mirroring the structure.
> *   **Limitations**: You can't match on types or values (e.g., `case [x, 1] => ...` is not supported directly in assignment).
> *   **Cool Trick**: It's the only clean way to swap variables in JS without a temp variable: `[a, b] = [b, a]`. (Under the hood, the engine still uses a temp register, but your code looks 10x cooler).

### 5.2 对象解构

```javascript
/**
 * 对象解构
 * 从对象中快速提取属性
 */

console.log('\n=== 对象解构 ===\n');

// 基本解构
const user = {
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
};

console.log('对象:', user);

const { name, age, email } = user;
console.log('解构:');
console.log('  name:', name);
console.log('  age:', age);
console.log('  email:', email);

// 重命名变量
console.log('\n重命名变量:');
const { name: userName, age: userAge } = user;
console.log('  userName:', userName);
console.log('  userAge:', userAge);

// 默认值
console.log('\n默认值:');
const { name: n, city = 'Unknown' } = user; // city 不存在,使用默认值
console.log('  name:', n);
console.log('  city:', city);

// 嵌套解构
console.log('\n嵌套解构:');
const student = {
  id: 1,
  info: {
    name: 'Bob',
    age: 20
  },
  scores: {
    math: 90,
    english: 85
  }
};

const {
  info: { name: studentName, age: studentAge },
  scores: { math }
} = student;

console.log('  学生名:', studentName);
console.log('  年龄:', studentAge);
console.log('  数学分数:', math);

// 函数参数解构
console.log('\n函数参数解构:');
function printUser({ name, age, email = 'no email' }) {
  console.log(`  姓名: ${name}`);
  console.log(`  年龄: ${age}`);
  console.log('  邮箱: ${email}`);
}

printUser({ name: 'Charlie', age: 30 });
```

---

## 6. 展开运算符

### 6.1 数组展开

> **💥 The Metaphor: The Explosion (Spread Operator)**
> 展开运算符 `...` 就像是一次**定向爆破**。
> 它把一个紧密打包的容器（数组/对象）瞬间**炸开**，让里面的元素散落出来。
> *   `[...arr1, ...arr2]`: 把两个箱子炸开，碎片混在一起，装进一个新箱子（合并）。
> *   `func(...args)`: 把箱子里的东西炸开，一个个喂给函数（参数传递）。
> 
> 这是一种极其暴力的美学，消灭了无数冗余的 `concat` 和 `apply` 代码。

```javascript
/**
 * 展开运算符 (...)
 * 展开数组元素
 */

console.log('\n=== 数组展开 ===\n');

// 复制数组
const original = [1, 2, 3];
const copy = [...original];

console.log('原数组:', original);
console.log('复制:', copy);
console.log('是同一个数组:', original === copy); // false

// 合并数组
console.log('\n合并数组:');
const arr1 = [1, 2];
const arr2 = [3, 4];
const arr3 = [5, 6];

const merged = [...arr1, ...arr2, ...arr3];
console.log('  合并结果:', merged);

// 在数组中插入元素
console.log('\n插入元素:');
const base = ['a', 'b', 'c'];
const inserted = ['x', ...base, 'y'];
console.log('  插入后:', inserted);

// 函数参数
console.log('\n函数参数:');
const numbers = [5, 2, 9, 1, 7];

const max = Math.max(...numbers); // 等同于 Math.max(5, 2, 9, 1, 7)
console.log('  最大值:', max);

// 字符串转数组
console.log('\n字符串转数组:');
const str = 'Hello';
const chars = [...str];
console.log(`  "${str}" →`, chars);
```

### 6.2 对象展开

```javascript
/**
 * 对象展开
 */

console.log('\n=== 对象展开 ===\n');

// 复制对象
const user = { name: 'Alice', age: 25 };
const userCopy = { ...user };

console.log('原对象:', user);
console.log('复制:', userCopy);
console.log('是同一个对象:', user === userCopy); // false

// 合并对象
console.log('\n合并对象:');
const defaults = {
  theme: 'light',
  language: 'zh',
  fontSize: 14
};

const userSettings = {
  theme: 'dark',
  fontSize: 16
};

const finalSettings = { ...defaults, ...userSettings };
console.log('  默认设置:', defaults);
console.log('  用户设置:', userSettings);
console.log('  最终设置:', finalSettings);
// theme 和 fontSize 被覆盖

// 添加/覆盖属性
console.log('\n添加/覆盖属性:');
const product = {
  id: 1,
  name: '笔记本',
  price: 5999
};

const updatedProduct = {
  ...product,
  price: 5499,        // 覆盖
  discount: 0.1       // 添加
};

console.log('  原商品:', product);
console.log('  更新后:', updatedProduct);

// 条件属性
console.log('\n条件属性:');
const includeExtra = true;

const obj = {
  name: 'Test',
  ...(includeExtra && { extra: 'Extra data' })
};

console.log('  对象:', obj);
```

---

## 7. 实战示例

### 示例1: 购物车管理

```javascript
/**
 * 购物车管理系统
 */

console.log('\n=== 购物车管理 ===\n');

// 购物车类
class ShoppingCart {
```

> ### 🔧 Under the Hood: The "Class" Deception
> Don't be fooled by the `class` keyword. JS does **NOT** have classes in the C++/Java sense (blueprints for creating objects).
> *   **Syntactic Sugar**: This `class` block is just sugar over **Prototypal Inheritance**.
> *   **Reality**: `ShoppingCart` is actually a **Function**. `addItem` is just a property on `ShoppingCart.prototype`.
> *   **Runtime**: When you call `new ShoppingCart()`, JS creates a new object and links its `__proto__` pointer to `ShoppingCart.prototype`.
> *   **Vtable?**: There is no static Vtable. Method resolution is a dynamic walk up the prototype chain (linked list lookup).
```javascript
// 购物车类
  constructor() {
    this.items = [];
    console.log('创建购物车');
  }
  
  // 添加商品
  addItem(product, quantity = 1) {
    console.log(`\n添加商品: ${product.name} × ${quantity}`);
    
    // 检查是否已存在
    const existingIndex = this.items.findIndex(
      item => item.product.id === product.id
    );
    
    if (existingIndex >= 0) {
      // 已存在,增加数量
      this.items[existingIndex].quantity += quantity;
      console.log('  商品已存在,增加数量');
    } else {
      // 新商品
      this.items.push({ product, quantity });
      console.log('  添加新商品');
    }
  }
  
  // 删除商品
  removeItem(productId) {
    console.log(`\n删除商品 ID: ${productId}`);
    const index = this.items.findIndex(
      item => item.product.id === productId
    );
    
    if (index >= 0) {
      const removed = this.items.splice(index, 1);
      console.log('  已删除:', removed[0].product.name);
    } else {
      console.log('  商品不存在');
    }
  }
  
  // 更新数量
  updateQuantity(productId, quantity) {
    console.log(`\n更新数量: ID=${productId}, 数量=${quantity}`);
    const item = this.items.find(
      item => item.product.id === productId
    );
    
    if (item) {
      item.quantity = quantity;
      console.log(`  已更新: ${item.product.name} → ${quantity}`);
    }
  }
  
  // 计算总价
  getTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }
  
  // 获取商品数量
  getItemCount() {
    return this.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  }
  
  // 显示购物车
  display() {
    console.log('\n购物车内容:');
    
    if (this.items.length === 0) {
      console.log('  购物车为空');
      return;
    }
    
    this.items.forEach(({ product, quantity }) => {
      const subtotal = product.price * quantity;
      console.log(
        `  ${product.name}: ¥${product.price} × ${quantity} = ¥${subtotal}`
      );
    });
    
    console.log(`\n  商品数量: ${this.getItemCount()}`);
    console.log(`  总价: ¥${this.getTotal()}`);
  }
}

// 测试购物车
const cart = new ShoppingCart();

const products = [
  { id: 1, name: '笔记本', price: 5999 },
  { id: 2, name: '鼠标', price: 99 },
  { id: 3, name: '键盘', price: 299 }
];

cart.addItem(products[0], 1);
cart.addItem(products[1], 2);
cart.addItem(products[2], 1);
cart.addItem(products[1], 1); // 鼠标再加一个

cart.display();

cart.updateQuantity(2, 5); // 鼠标改为 5 个
cart.display();

cart.removeItem(3); // 删除键盘
cart.display();
```

### 示例2: 学生成绩统计

```javascript
/**
 * 学生成绩统计系统
 */

console.log('\n\n=== 学生成绩统计 ===\n');

const students = [
  { id: 1, name: 'Alice', scores: { math: 85, english: 92, physics: 78 } },
  { id: 2, name: 'Bob', scores: { math: 92, english: 88, physics: 95 } },
  { id: 3, name: 'Charlie', scores: { math: 78, english: 85, physics: 82 } },
  { id: 4, name: 'David', scores: { math: 95, english: 90, physics: 93 } }
];

console.log('学生列表:', students);

// 计算每个学生的平均分
console.log('\n计算平均分:');
const studentsWithAvg = students.map(student => {
  const scores = Object.values(student.scores);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  console.log(`  ${student.name}: ${average.toFixed(2)}`);
  
  return {
    ...student,
    average: parseFloat(average.toFixed(2))
  };
});

// 找出平均分最高的学生
console.log('\n最高平均分:');
const topStudent = studentsWithAvg.reduce((top, student) => {
  return student.average > top.average ? student : top;
});

console.log(`  ${topStudent.name}: ${topStudent.average}`);

// 统计各科平均分
console.log('\n各科平均分:');
const subjects = ['math', 'english', 'physics'];

subjects.forEach(subject => {
  const avg = students
    .map(s => s.scores[subject])
    .reduce((sum, score) => sum + score, 0) / students.length;
  
  console.log(`  ${subject}: ${avg.toFixed(2)}`);
});

// 按平均分排序
console.log('\n按平均分排序:');
const sorted = [...studentsWithAvg].sort((a, b) => b.average - a.average);

sorted.forEach((student, index) => {
  console.log(`  ${index + 1}. ${student.name}: ${student.average}`);
});

// 筛选优秀学生(平均分 >= 90)
console.log('\n优秀学生 (≥90):');
const excellent = studentsWithAvg.filter(s => s.average >= 90);

excellent.forEach(student => {
  console.log(`  ${student.name}: ${student.average}`);
});
```

---

## 8. 最佳实践

### 8.1 选择合适的方法

```javascript
/**
 * 选择合适的数组方法
 */

console.log('\n=== 选择合适的方法 ===\n');

const numbers = [1, 2, 3, 4, 5];

// ❌ 避免: 使用 forEach 返回新数组
console.log('不推荐的做法:');
const doubled1 = [];
numbers.forEach(n => {
  doubled1.push(n * 2);
});
console.log('  使用 forEach:', doubled1);

// ✅ 推荐: 使用 map
console.log('\n推荐的做法:');
const doubled2 = numbers.map(n => n * 2);
console.log('  使用 map:', doubled2);

// ❌ 避免: 使用 forEach 查找元素
console.log('\n查找元素:');
let found;
numbers.forEach(n => {
  if (n > 3 && !found) {
    found = n;
  }
});
console.log('  forEach 查找:', found);

// ✅ 推荐: 使用 find
const found2 = numbers.find(n => n > 3);
console.log('  find 查找:', found2);
```

### 8.2 避免修改原数组

```javascript
/**
 * 不可变性 - 避免修改原数组
 */

console.log('\n=== 不可变性 ===\n');

const original = [1, 2, 3];

// ❌ 避免: 直接修改原数组
console.log('修改原数组:');
console.log('  修改前:', original);
original.push(4);
console.log('  修改后:', original); // 原数组被改变

// ✅ 推荐: 创建新数组
const arr = [1, 2, 3];
console.log('\n创建新数组:');
console.log('  原数组:', arr);

const newArr = [...arr, 4];
console.log('  新数组:', newArr);
console.log('  原数组:', arr); // 未改变

// ✅ 推荐: 使用不修改原数组的方法
const filtered = arr.filter(n => n > 1);
const mapped = arr.map(n => n * 2);
const sliced = arr.slice(1, 3);

console.log('\n使用非变更方法:');
console.log('  原数组:', arr);
console.log('  filter:', filtered);
console.log('  map:', mapped);
console.log('  slice:', sliced);
```

### 8.3 性能考虑

```javascript
/**
 * 性能优化
 */

console.log('\n=== 性能考虑 ===\n');

// ✅ 推荐: 提前结束循环
console.log('提前结束循环:');
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 使用 some 可以提前结束
const hasLarge = nums.some(n => {
  console.log(`  检查: ${n}`);
  return n > 5;
});
console.log('结果:', hasLarge);

// ✅ 推荐: 链式调用时考虑顺序
console.log('\n链式调用顺序:');

// 不好: 先 map 再 filter(处理所有元素)
const result1 = nums
  .map(n => n * 2)     // 处理 10 个元素
  .filter(n => n > 10); // 再过滤

// 更好: 先 filter 再 map(减少处理元素)
const result2 = nums
  .filter(n => n > 5)   // 只保留 5 个元素
  .map(n => n * 2);     // 只处理 5 个元素

console.log('  结果相同:', JSON.stringify(result1) === JSON.stringify(result2));
```

---

## 9. 章节练习

### 练习1: 对象操作

创建一个 `book` 对象,包含:
- title: 书名
- author: 作者
- year: 出版年份
- getAge(): 方法,返回书的年龄(当前年份 - 出版年份)

<details>
<summary>查看答案</summary>

```javascript
const book = {
  title: 'JavaScript 高级程序设计',
  author: 'Nicholas C. Zakas',
  year: 2011,
  
  getAge() {
    const currentYear = new Date().getFullYear();
    return currentYear - this.year;
  }
};

console.log('书籍:', book);
console.log('书龄:', book.getAge(), '年');
```
</details>

### 练习2: 数组方法

给定数组:
```javascript
const numbers = [15, 8, 23, 42, 4, 16];
```

完成以下任务:
1. 找出所有偶数
2. 将所有数字乘以 2
3. 计算总和
4. 找出最大值

<details>
<summary>查看答案</summary>

```javascript
const numbers = [15, 8, 23, 42, 4, 16];

console.log('原数组:', numbers);

// 1. 找出偶数
const evens = numbers.filter(n => n % 2 === 0);
console.log('偶数:', evens);

// 2. 乘以 2
const doubled = numbers.map(n => n * 2);
console.log('乘以2:', doubled);

// 3. 计算总和
const sum = numbers.reduce((total, n) => total + n, 0);
console.log('总和:', sum);

// 4. 找出最大值
const max = Math.max(...numbers);
// 或: const max = numbers.reduce((max, n) => n > max ? n : max);
console.log('最大值:', max);
```
</details>

### 练习3: 解构和展开

给定两个对象:
```javascript
const user1 = { name: 'Alice', age: 25, city: 'Beijing' };
const user2 = { age: 26, email: 'alice@example.com' };
```

完成:
1. 合并两个对象,user2 的属性覆盖 user1
2. 使用解构提取 name 和 email
3. 创建一个新对象,包含 user1 的所有属性,但 age + 1

<details>
<summary>查看答案</summary>

```javascript
const user1 = { name: 'Alice', age: 25, city: 'Beijing' };
const user2 = { age: 26, email: 'alice@example.com' };

// 1. 合并对象
const merged = { ...user1, ...user2 };
console.log('合并后:', merged);

// 2. 解构
const { name, email } = merged;
console.log('name:', name, 'email:', email);

// 3. 创建新对象
const updated = {
  ...user1,
  age: user1.age + 1
};
console.log('年龄+1:', updated);
```
</details>

### 练习4: 综合应用

实现一个函数 `groupByCategory(products)`,将商品数组按类别分组:

输入:
```javascript
[
  { name: '苹果', category: '水果', price: 5 },
  { name: '西红柿', category: '蔬菜', price: 3 },
  { name: '香蕉', category: '水果', price: 4 }
]
```

输出:
```javascript
{
  水果: [
    { name: '苹果', category: '水果', price: 5 },
    { name: '香蕉', category: '水果', price: 4 }
  ],
  蔬菜: [
    { name: '西红柿', category: '蔬菜', price: 3 }
  ]
}
```

<details>
<summary>查看答案</summary>

```javascript
function groupByCategory(products) {
  console.log('按类别分组:');
  
  return products.reduce((groups, product) => {
    const category = product.category;
    
    // 如果该类别不存在,创建空数组
    if (!groups[category]) {
      groups[category] = [];
      console.log(`  创建类别: ${category}`);
    }
    
    // 添加商品到对应类别
    groups[category].push(product);
    console.log(`  添加 ${product.name} 到 ${category}`);
    
    return groups;
  }, {});
}

// 测试
const products = [
  { name: '苹果', category: '水果', price: 5 },
  { name: '西红柿', category: '蔬菜', price: 3 },
  { name: '香蕉', category: '水果', price: 4 },
  { name: '黄瓜', category: '蔬菜', price: 2 }
];

const grouped = groupByCategory(products);
console.log('\n结果:', grouped);
```
</details>

### 练习5: 数据处理

给定订单数据:
```javascript
const orders = [
  { id: 1, customer: 'Alice', items: [{ product: 'A', price: 10, qty: 2 }] },
  { id: 2, customer: 'Bob', items: [{ product: 'B', price: 20, qty: 1 }, { product: 'C', price: 15, qty: 3 }] },
  { id: 3, customer: 'Alice', items: [{ product: 'A', price: 10, qty: 1 }] }
];
```

计算:
1. 每个订单的总价
2. 所有订单的总价
3. Alice 的订单总价

<details>
<summary>查看答案</summary>

```javascript
const orders = [
  { id: 1, customer: 'Alice', items: [{ product: 'A', price: 10, qty: 2 }] },
  { id: 2, customer: 'Bob', items: [{ product: 'B', price: 20, qty: 1 }, { product: 'C', price: 15, qty: 3 }] },
  { id: 3, customer: 'Alice', items: [{ product: 'A', price: 10, qty: 1 }] }
];

console.log('订单数据:', orders);

// 1. 每个订单的总价
console.log('\n每个订单总价:');
const ordersWithTotal = orders.map(order => {
  const total = order.items.reduce((sum, item) => {
    return sum + (item.price * item.qty);
  }, 0);
  
  console.log(`  订单 ${order.id} (${order.customer}): ¥${total}`);
  
  return { ...order, total };
});

// 2. 所有订单的总价
const grandTotal = ordersWithTotal.reduce((sum, order) => {
  return sum + order.total;
}, 0);

console.log('\n所有订单总价: ¥' + grandTotal);

// 3. Alice 的订单总价
const aliceTotal = ordersWithTotal
  .filter(order => order.customer === 'Alice')
  .reduce((sum, order) => sum + order.total, 0);

console.log('Alice 的订单总价: ¥' + aliceTotal);
```
</details>

---

## 📚 下一步

恭喜你完成了第3章的学习!现在你已经掌握了:
- ✅ 对象的创建、访问和操作
- ✅ 数组的常用方法和高级方法
- ✅ 解构赋值的使用
- ✅ 展开运算符的应用
- ✅ 数据处理的实战技巧

**准备好了吗?** 让我们继续学习[第4章:异步编程入门](../04-async-basics/)!

---

## 📖 参考资源

- [MDN - 对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_Objects)
- [MDN - 数组](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN - 解构赋值](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [MDN - 展开语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
