# 第 6 章:原型链与原型继承 — JavaScript 对象的家族 DNA

> *"In JavaScript, there are no classes. There are only objects linked to other objects."*  
> — Kyle Simpson, *You Don't Know JS*
>
> 如果你以为 JavaScript 的 `class` 和 Java 的 `class` 是一回事,那你被骗了。JS 没有类——从来没有。它只有对象,以及对象之间的**链接**。`class` 关键字是 2015 年才贴上去的一层壁纸。撕开壁纸,你会看到一根叫做"原型链"的铁链,它从 1995 年 Brendan Eich 创造 JavaScript 的那一天起就在那里了。这一章,我们要做的不是学习 `class` 语法糖,而是**揭开 JavaScript 对象系统的真相**。

## 📖 本章内容

1. [对象的秘密:`[[Prototype]]`](#1-对象的秘密prototype)
2. [原型链查找机制](#2-原型链查找机制)
3. [`Object.create()` 与原型式继承](#3-objectcreate-与原型式继承)
4. [构造函数与 `new` 的四步骤](#4-构造函数与-new-的四步骤)
5. [`prototype` vs `__proto__` vs `Object.getPrototypeOf()`](#5-prototype-vs-__proto__-vs-objectgetprototypeof)
6. [原型链 vs ES6 Class](#6-原型链-vs-es6-class)
7. [`instanceof` 的原型链遍历](#7-instanceof-的原型链遍历)
8. [实战:不用 Class 实现继承](#8-实战不用-class-实现继承)
9. [🧘 Zen of Code: 接受语言的本性](#9-🧘-zen-of-code-接受语言的本性)
10. [最佳实践与常见陷阱](#10-最佳实践与常见陷阱)
11. [章节练习](#11-章节练习)

---

## 1. 对象的秘密:`[[Prototype]]`

> 🎭 **The Drama: 家族遗传与 DNA 链**
>
> 想象一下人类的遗传系统。你有你父亲的鼻子、你母亲的眼睛。当有人问你"你会弹钢琴吗?"如果你自己不会,你会去问你爸妈:"我爸会吗?"如果你爸也不会,你会去问你爷爷。这条血缘链一直追溯到你的祖先。
>
> JavaScript 的对象系统**完全是这个模型**。每个 JS 对象都有一个隐藏的"父亲"(原型)。当你访问 `obj.someProperty`,如果 `obj` 自己没有这个属性,它会去问它的原型。原型也没有?再问原型的原型。这条**家族血脉**就是原型链。
>
> 你在 Stage 1 Ch03 学到的 `toString()` 方法,为什么所有对象都有?因为它们的祖先 `Object.prototype` 有。**这不是类继承,这是家族遗传**。

### 1.1 每个对象都有一个隐藏链接

在 JavaScript 中,几乎每个对象都有一个**隐藏的内部属性** `[[Prototype]]` (注意是双方括号,你不能直接访问它)。这个属性指向另一个对象——这个对象就是**原型**。

```javascript
// 创建一个普通对象
const person = {
  name: 'Alice',
  age: 25
};

// person 对象有一个隐藏的 [[Prototype]] 链接
// 它指向 Object.prototype
console.log(person.toString()); // "[object Object]"
// person 自己没有 toString,它从 Object.prototype 继承来的
```

### 1.2 访问原型的方式

虽然 `[[Prototype]]` 是内部属性,但我们有三种方式访问它:

```javascript
const obj = { x: 1 };

// 方式 1: Object.getPrototypeOf() (推荐,标准方法)
const proto1 = Object.getPrototypeOf(obj);

// 方式 2: __proto__ 属性 (非标准,但广泛支持)
const proto2 = obj.__proto__;

// 方式 3: 构造函数的 prototype 属性 (针对构造函数创建的对象)
const proto3 = obj.constructor.prototype;

console.log(proto1 === proto2); // true
console.log(proto1 === proto3); // true
```

> 完整的原型访问演示见 [`examples/01-prototype-basics.js`](./examples/01-prototype-basics.js)

---

## 2. 原型链查找机制

> 🌌 **The Big Picture: 向上溯源的委托链**
>
> 当你调用 `obj.method()` 时,JavaScript 引擎执行的不是"查找 obj 的 method",而是沿着一条链向上搜索:
>
> 1. **第一站**: 检查 `obj` 自己有没有 `method` 属性。有?调用它。
> 2. **第二站**: 没有?检查 `obj.[[Prototype]]` 有没有。有?调用它。
> 3. **第三站**: 还没有?检查 `obj.[[Prototype]].[[Prototype]]` 有没有。
> 4. **终点站**: 一直向上,直到遇到 `null` (原型链的终点)。如果还没找到,返回 `undefined`。
>
> 这就是**原型链查找 (Prototype Chain Lookup)**。它不是"复制"属性(像类继承),而是"委托"——对象说:"我没有这个能力,问我爸去。"

### 2.1 原型链的层级结构

```javascript
const animal = {
  type: 'Animal',
  breathe() {
    return `${this.type} is breathing`;
  }
};

const dog = Object.create(animal); // dog 的原型是 animal
dog.breed = 'Labrador';
dog.bark = function() {
  return `${this.breed} is barking`;
};

const myDog = Object.create(dog); // myDog 的原型是 dog
myDog.name = 'Buddy';

// 原型链: myDog -> dog -> animal -> Object.prototype -> null

console.log(myDog.name);     // 'Buddy' (自己的属性)
console.log(myDog.breed);    // 'Labrador' (从 dog 继承)
console.log(myDog.type);     // 'Animal' (从 animal 继承)
console.log(myDog.breathe());// 'Animal is breathing' (从 animal 继承方法)
```

### 2.2 查找的性能考量

> ⚛️ **The Science: 时间复杂度的真相**
>
> 原型链查找是 **O(n)** 操作,`n` 是链的深度。如果你的原型链有 10 层,最坏情况下要查 10 次。但现代 JS 引擎(V8, SpiderMonkey)做了大量优化:
>
> - **Inline Cache (IC)**: 引擎记住了上次查找的位置。如果你连续访问 100 次 `obj.method`,只有第一次慢,后面 99 次都是 O(1)。
> - **Hidden Classes (V8 术语,也叫 Shapes/Maps)**: 引擎给同样"形状"的对象分配同样的优化路径。
>
> **教训**: 不要过度担心原型链性能(除非你在写 3D 引擎的热路径代码)。但**不要动态修改原型**——这会破坏 V8 的优化。

> 完整的原型链查找演示见 [`examples/02-prototype-chain.js`](./examples/02-prototype-chain.js)

---

## 3. `Object.create()` 与原型式继承

> 🎭 **The Drama: 不用 `new` 的继承方式**
>
> 在 ES5 (2009) 之前,如果你想创建一个对象并指定它的原型,你只能用构造函数 + `new`。这导致了一个荒谬的局面:你明明想做的是"创建一个对象,它的父亲是 `animal`",但你不得不写一个构造函数、写 `prototype` 赋值、然后用 `new` 调用。
>
> Douglas Crockford (JSON 的发明者) 在 2006 年的文章 *"Prototypal Inheritance in JavaScript"* 中提出了一个激进的想法:为什么不直接说"我要一个对象,它的原型是这个"?
>
> ES5 听取了这个建议,给了我们 `Object.create()`——**原型式继承的正名**。

### 3.1 `Object.create()` 的用法

```javascript
// 创建一个原型对象
const animal = {
  type: 'Animal',
  eat() {
    console.log(`${this.name} is eating`);
  }
};

// 用 animal 作为原型创建新对象
const dog = Object.create(animal);
dog.name = 'Rex';
dog.breed = 'German Shepherd';
dog.bark = function() {
  console.log('Woof!');
};

console.log(dog.type);  // 'Animal' (从 animal 继承)
dog.eat();              // 'Rex is eating' (this 绑定到 dog)
dog.bark();             // 'Woof!' (dog 自己的方法)
```

### 3.2 创建没有原型的对象

```javascript
// 创建一个完全"干净"的对象,连 Object.prototype 都没有
const pureObject = Object.create(null);

pureObject.name = 'Pure';
console.log(pureObject.toString); // undefined (没有 toString!)

// 这种对象常用于字典/哈希表,避免原型污染
const dict = Object.create(null);
dict['toString'] = 'some value'; // 不会和 Object.prototype.toString 冲突
```

### 3.3 `Object.create()` vs 对象字面量

```javascript
// ❌ 错误理解:Object.create 只是创建对象的另一种方式
// ✅ 正确理解:Object.create 让你精确控制原型链

// 对象字面量:原型总是 Object.prototype
const obj1 = { x: 1 };
// 相当于 const obj1 = Object.create(Object.prototype); obj1.x = 1;

// Object.create:你决定原型是什么
const obj2 = Object.create({ x: 1 }); // 原型是 { x: 1 }
console.log(obj2.x); // 1 (从原型继承,不是自己的属性)
```

> 完整的 `Object.create()` 用法见 [`examples/03-inheritance-patterns.js`](./examples/03-inheritance-patterns.js)

---

## 4. 构造函数与 `new` 的四步骤

> ⚛️ **The Science: `new` 关键字的魔法拆解**
>
> 在 Java 里,`new Dog()` 是在内存中分配一个 Dog 类的实例。在 JavaScript 里,`new` **不是创建类的实例**——它只是一个普通函数调用,外加四个副作用:
>
> **`new Dog('Buddy')` 的四步骤**:
> 1. **创建空对象**: `const obj = {};`
> 2. **链接原型**: `obj.[[Prototype]] = Dog.prototype;` (设置原型链)
> 3. **绑定 this**: 用 `obj` 作为 `this`,调用 `Dog.call(obj, 'Buddy')`
> 4. **返回对象**: 如果 `Dog` 函数返回了对象,返回那个对象;否则返回 `obj`
>
> 理解这四步,你就理解了为什么"忘写 `new`"会导致灾难——`this` 绑定到了全局对象!

### 4.1 构造函数模式

```javascript
// 构造函数(约定首字母大写)
function Dog(name, breed) {
  // 当用 new 调用时,this 指向新创建的对象
  this.name = name;
  this.breed = breed;
}

// 在 prototype 上添加方法(所有实例共享)
Dog.prototype.bark = function() {
  console.log(`${this.name} says Woof!`);
};

// 用 new 创建实例
const myDog = new Dog('Buddy', 'Golden Retriever');
const yourDog = new Dog('Max', 'Bulldog');

myDog.bark();   // 'Buddy says Woof!'
yourDog.bark(); // 'Max says Woof!'

// 验证原型链
console.log(myDog.__proto__ === Dog.prototype); // true
```

### 4.2 `new` 的手动实现

```javascript
// 自己实现 new 的行为
function myNew(Constructor, ...args) {
  // 步骤 1: 创建空对象
  const obj = {};
  
  // 步骤 2: 链接原型
  Object.setPrototypeOf(obj, Constructor.prototype);
  
  // 步骤 3: 绑定 this 并调用构造函数
  const result = Constructor.apply(obj, args);
  
  // 步骤 4: 返回对象(如果构造函数返回对象则返回那个,否则返回 obj)
  return (typeof result === 'object' && result !== null) ? result : obj;
}

// 测试
const dog = myNew(Dog, 'Charlie', 'Poodle');
dog.bark(); // 'Charlie says Woof!'
```

### 4.3 忘记 `new` 的灾难

```javascript
function Person(name) {
  this.name = name; // 没有 new 时,this 指向全局对象!
}

// ❌ 忘记 new
const person = Person('Alice');
console.log(person);      // undefined (函数没返回值)
console.log(window.name); // 'Alice' (污染了全局对象!)

// ✅ 正确用法
const person2 = new Person('Bob');
console.log(person2.name); // 'Bob'
```

> 完整的构造函数和 `new` 机制见 [`examples/04-class-vs-prototype.js`](./examples/04-class-vs-prototype.js)

---

## 5. `prototype` vs `__proto__` vs `Object.getPrototypeOf()`

> 🧠 **CS Master's Bridge: 三个容易混淆的概念**
>
> 这是 JavaScript 中最臭名昭著的命名灾难。三个看起来相似的东西,含义完全不同:
>
> | 概念 | 是什么 | 存在于 | 用途 |
> |------|--------|--------|------|
> | `Constructor.prototype` | 一个普通对象 | **函数**对象上 | 作为"蓝图",用 `new Constructor()` 创建的对象会继承它 |
> | `obj.__proto__` | 指向原型的链接 | **所有对象**上 | 指向该对象的原型(非标准,但广泛支持) |
> | `Object.getPrototypeOf(obj)` | 返回原型的函数 | 全局 Object 上 | 标准方式获取对象的原型 |
>
> **记忆法**:
> - `prototype` 是给**函数**用的"模板",上面放共享的方法。
> - `__proto__` 是**对象**用来找到自己原型的"指针"。
> - `getPrototypeOf` 是**标准 API**,做的事和 `__proto__` 一样。

### 5.1 `prototype` 属性:函数的专利

```javascript
function Animal(name) {
  this.name = name;
}

// 所有函数(除了箭头函数)都有 prototype 属性
console.log(typeof Animal.prototype); // 'object'

// 在 prototype 上添加方法
Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

const dog = new Animal('Dog');

// dog 自己没有 speak 方法
console.log(dog.hasOwnProperty('speak')); // false

// 但它可以通过原型链访问到
dog.speak(); // 'Dog makes a sound'

// dog 的 __proto__ 指向 Animal.prototype
console.log(dog.__proto__ === Animal.prototype); // true
```

### 5.2 `__proto__` vs `Object.getPrototypeOf()`

```javascript
const obj = { x: 1 };

// ❌ 非标准(但所有浏览器都支持)
const proto1 = obj.__proto__;

// ✅ 标准方法(ES5+)
const proto2 = Object.getPrototypeOf(obj);

console.log(proto1 === proto2); // true
console.log(proto1 === Object.prototype); // true
```

### 5.3 完整的原型链关系图

```javascript
function Dog(name) {
  this.name = name;
}

const myDog = new Dog('Buddy');

// 关系链:
console.log(myDog.__proto__ === Dog.prototype);              // true
console.log(Dog.prototype.__proto__ === Object.prototype);   // true
console.log(Object.prototype.__proto__ === null);            // true

// 因此完整链是:
// myDog -> Dog.prototype -> Object.prototype -> null
```

> 完整的原型属性对比见 [`examples/01-prototype-basics.js`](./examples/01-prototype-basics.js)

---

## 6. 原型链 vs ES6 Class

> 🎭 **The Drama: 壁纸与墙壁**
>
> ES6 (2015) 给了我们 `class` 关键字。很多人松了一口气:"终于有类了!"
>
> 但真相是:**`class` 只是原型的语法糖**。它不是 Java 的 Class,它只是让原型继承写起来"看起来像 Java"的一层壁纸。
>
> ```javascript
> // ES6 Class
> class Dog {
>   constructor(name) { this.name = name; }
>   bark() { console.log('Woof!'); }
> }
> ```
>
> 编译后(或者说,它的真实含义)是:
>
> ```javascript
> function Dog(name) { this.name = name; }
> Dog.prototype.bark = function() { console.log('Woof!'); };
> ```
>
> **这不是新功能,这是新语法**。墙壁还是那面墙壁,只是贴了一层壁纸。

### 6.1 Class 语法与原型的等价性

```javascript
// ✅ 使用 ES6 Class
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

// ✅ 使用原型(等价实现)
function Animal2(name) {
  this.name = name;
}

Animal2.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

// 两者创建的对象完全相同
const cat1 = new Animal('Cat');
const cat2 = new Animal2('Cat');

cat1.speak(); // 'Cat makes a sound'
cat2.speak(); // 'Cat makes a sound'

// 验证原型链完全一样
console.log(cat1.__proto__ === Animal.prototype); // true
console.log(cat2.__proto__ === Animal2.prototype); // true
```

### 6.2 Class 的继承与原型继承

```javascript
// ✅ Class 继承
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log('Animal sound'); }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }
  bark() { console.log('Woof!'); }
}

// ✅ 原型继承(等价实现)
function Animal2(name) { this.name = name; }
Animal2.prototype.speak = function() { console.log('Animal sound'); };

function Dog2(name, breed) {
  Animal2.call(this, name); // 调用父类构造函数
  this.breed = breed;
}

// 设置原型链
Dog2.prototype = Object.create(Animal2.prototype);
Dog2.prototype.constructor = Dog2;
Dog2.prototype.bark = function() { console.log('Woof!'); };
```

### 6.3 Class 的优势与局限

**✅ Class 的优势**:
- **可读性**: 更接近其他语言(Java/C#)的语法,降低学习曲线
- **语法简洁**: `extends` 和 `super` 比手动设置原型链简单
- **严格模式**: Class 内部自动运行在严格模式,避免常见错误
- **不可提升**: Class 声明不会提升,避免提升带来的困惑

**❌ Class 的局限**:
- **只是语法糖**: 底层还是原型,遇到复杂场景还是要理解原型
- **没有私有属性**: 直到 ES2022 的 `#privateField`,而且浏览器支持参差不齐
- **误导性**: 让人以为 JS 有"真正的类",实际上没有

> 完整的 Class vs 原型对比见 [`examples/04-class-vs-prototype.js`](./examples/04-class-vs-prototype.js)

---

## 7. `instanceof` 的原型链遍历

> ⚛️ **The Science: `instanceof` 是如何工作的**
>
> `obj instanceof Constructor` 的语义是:"obj 是 Constructor 的实例吗?"
>
> 但它的**实际算法**是:
> 1. 获取 `Constructor.prototype`
> 2. 沿着 `obj` 的原型链向上查找
> 3. 如果找到 `Constructor.prototype`,返回 `true`
> 4. 如果到达 `null` 还没找到,返回 `false`
>
> **重要推论**: `instanceof` 检查的不是"谁创建了这个对象",而是"原型链上是否有这个原型"。

### 7.1 基本用法

```javascript
function Animal(name) { this.name = name; }
function Dog(name) { Animal.call(this, name); }
Dog.prototype = Object.create(Animal.prototype);

const myDog = new Dog('Buddy');

console.log(myDog instanceof Dog);     // true
console.log(myDog instanceof Animal);  // true
console.log(myDog instanceof Object);  // true (所有对象都继承自 Object)
```

### 7.2 `instanceof` 的边界情况

```javascript
// 1. 原始类型总是返回 false
console.log(5 instanceof Number);        // false
console.log('hello' instanceof String);  // false
console.log(true instanceof Boolean);    // false

// 包装对象才返回 true
console.log(new Number(5) instanceof Number); // true

// 2. 手动修改原型链会影响结果
const obj = {};
console.log(obj instanceof Array); // false

Object.setPrototypeOf(obj, Array.prototype);
console.log(obj instanceof Array); // true (虽然它不是真正的数组!)
```

### 7.3 手动实现 `instanceof`

```javascript
function myInstanceof(obj, Constructor) {
  // 获取构造函数的 prototype
  const prototype = Constructor.prototype;
  
  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj);
  
  // 沿着原型链向上查找
  while (proto !== null) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}

// 测试
function Dog() {}
const dog = new Dog();

console.log(myInstanceof(dog, Dog));    // true
console.log(myInstanceof(dog, Object)); // true
console.log(myInstanceof(dog, Array));  // false
```

> 完整的 `instanceof` 机制见 [`examples/02-prototype-chain.js`](./examples/02-prototype-chain.js)

---

## 8. 实战:不用 Class 实现继承

> 🧰 **The Toolbox: 原型继承的三种模式**
>
> 在 ES6 `class` 之前,JavaScript 社区发明了多种继承模式。理解它们不仅是历史考古,更能让你在遇到老代码或特殊场景时游刃有余。

### 8.1 原型链继承

```javascript
// 父类
function Animal(name) {
  this.name = name;
  this.colors = ['white', 'black'];
}

Animal.prototype.getName = function() {
  return this.name;
};

// 子类
function Dog(name, breed) {
  this.breed = breed;
}

// 继承:将 Dog 的原型设置为 Animal 的实例
Dog.prototype = new Animal();

const dog1 = new Dog('Buddy', 'Golden');
const dog2 = new Dog('Max', 'Bulldog');

// ❌ 问题 1:所有实例共享引用类型属性
dog1.colors.push('brown');
console.log(dog2.colors); // ['white', 'black', 'brown'] (被污染了!)

// ❌ 问题 2:无法向父类构造函数传参
console.log(dog1.getName()); // undefined (因为 Dog 构造函数没有调用 Animal)
```

### 8.2 构造函数继承(经典继承)

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['white', 'black'];
}

Animal.prototype.getName = function() {
  return this.name;
};

function Dog(name, breed) {
  // 调用父类构造函数
  Animal.call(this, name); // ✅ 解决了传参和属性共享问题
  this.breed = breed;
}

const dog1 = new Dog('Buddy', 'Golden');
const dog2 = new Dog('Max', 'Bulldog');

dog1.colors.push('brown');
console.log(dog2.colors); // ['white', 'black'] (隔离了!)

// ❌ 问题:无法继承父类原型上的方法
console.log(dog1.getName); // undefined (Animal.prototype.getName 没被继承)
```

### 8.3 组合继承(最常用)

```javascript
function Animal(name) {
  this.name = name;
  this.colors = ['white', 'black'];
}

Animal.prototype.getName = function() {
  return this.name;
};

function Dog(name, breed) {
  // 1. 继承属性
  Animal.call(this, name);
  this.breed = breed;
}

// 2. 继承方法
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // 修复 constructor 指向

Dog.prototype.bark = function() {
  return `${this.name} is barking`;
};

const dog = new Dog('Buddy', 'Golden');
console.log(dog.getName());  // 'Buddy' (继承了方法)
console.log(dog.bark());     // 'Buddy is barking'

dog.colors.push('brown');
const dog2 = new Dog('Max', 'Bulldog');
console.log(dog2.colors); // ['white', 'black'] (属性隔离)
```

### 8.4 实战案例:Todo 应用的数据模型

```javascript
// 基类:任务项
function TodoItem(title) {
  this.id = Date.now() + Math.random();
  this.title = title;
  this.completed = false;
  this.createdAt = new Date();
}

TodoItem.prototype.toggle = function() {
  this.completed = !this.completed;
  return this;
};

TodoItem.prototype.setTitle = function(newTitle) {
  this.title = newTitle;
  return this;
};

// 子类:带优先级的任务
function PriorityTodo(title, priority) {
  TodoItem.call(this, title);
  this.priority = priority; // 'low', 'medium', 'high'
}

PriorityTodo.prototype = Object.create(TodoItem.prototype);
PriorityTodo.prototype.constructor = PriorityTodo;

PriorityTodo.prototype.setPriority = function(newPriority) {
  this.priority = newPriority;
  return this;
};

// 使用
const todo = new PriorityTodo('学习原型链', 'high');
console.log(todo.title);       // '学习原型链'
console.log(todo.priority);    // 'high'
todo.toggle();
console.log(todo.completed);   // true

// 验证继承
console.log(todo instanceof PriorityTodo); // true
console.log(todo instanceof TodoItem);     // true
```

> 完整的继承模式实现见 [`examples/03-inheritance-patterns.js`](./examples/03-inheritance-patterns.js)

---

## 9. 🧘 Zen of Code: 接受语言的本性

> 🧘 **Zen of Code: 不要试图把 JavaScript 变成 Java**
>
> JavaScript 的原型继承不是"残废的类继承"——它是一种不同的、有时更灵活的继承模型。
>
> **柏拉图 vs 亚里士多德的世界观**:
>
> - **柏拉图 (Plato)**: 理念世界先于现实世界。有一个抽象的"狗"的理念(Class),现实中的每只狗都是这个理念的投射(Instance)。Java/C++ 的类系统来自这个哲学。
>
> - **亚里士多德 (Aristotle)**: 没有抽象的理念,只有具体的事物。事物之间通过相似性关联。这只狗像那只狗,因为它们有共同的祖先。JavaScript 的原型继承来自这个哲学。
>
> Brendan Eich 在 1995 年受 Self 语言(纯原型语言)的影响,刻意选择了原型继承。这不是"JS 太简陋所以没有类",而是一种**不同的世界观**。
>
> **真正掌握一门语言,意味着理解它的设计哲学,而不是把你熟悉的范式强加于它。**

### 9.1 原型继承的优势

```javascript
// ✅ 动态性:可以在运行时修改"类"的行为
function Dog(name) { this.name = name; }
const dog1 = new Dog('Buddy');

// 所有狗突然学会了新技能!
Dog.prototype.swim = function() {
  console.log(`${this.name} is swimming`);
};

dog1.swim(); // 'Buddy is swimming' (dog1 是在 swim 定义之前创建的!)

// 在 Java 中这是不可能的:编译后的 .class 文件是静态的
```

```javascript
// ✅ 多态:不需要接口或抽象类
const duck = {
  quack() { console.log('Quack!'); }
};

const person = {
  quack() { console.log('I am imitating a duck!'); }
};

function makeItQuack(thing) {
  thing.quack(); // Duck Typing:如果它走起来像鸭子、叫起来像鸭子,它就是鸭子
}

makeItQuack(duck);   // 'Quack!'
makeItQuack(person); // 'I am imitating a duck!'

// 不需要 duck 和 person 继承自同一个类
```

### 9.2 何时使用原型,何时使用 Class

| 场景 | 推荐 | 原因 |
|------|------|------|
| 新项目,团队熟悉 OOP | `class` | 可读性好,降低学习曲线 |
| 需要继承层级 | `class` | `extends` 比手动原型链简洁 |
| 需要动态修改"类"的行为 | 原型 | `class` 的静态性更强 |
| 性能关键路径(如游戏引擎) | 原型 | 避免 `class` 的额外抽象层 |
| 维护老代码 | 原型 | 老代码就是用原型写的 |
| 想深入理解 JS | 原型 | `class` 只是语法糖,学原型才是根本 |

---

## 10. 最佳实践与常见陷阱

### 10.1 ✅ 最佳实践

**1. 优先使用 `Object.getPrototypeOf()` 而不是 `__proto__`**

```javascript
// ❌ 非标准
const proto = obj.__proto__;

// ✅ 标准方法
const proto = Object.getPrototypeOf(obj);
```

**2. 不要直接修改 `Object.prototype`**

```javascript
// ❌ 污染所有对象
Object.prototype.myMethod = function() { /* ... */ };

// ✅ 使用独立的原型对象
const myProto = {
  myMethod() { /* ... */ }
};
const obj = Object.create(myProto);
```

**3. 在构造函数中修复 `constructor` 指向**

```javascript
function Animal() {}
function Dog() {}

// ❌ 忘记修复 constructor
Dog.prototype = Object.create(Animal.prototype);
console.log(new Dog().constructor === Dog); // false!

// ✅ 修复 constructor
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
console.log(new Dog().constructor === Dog); // true
```

**4. 使用 `hasOwnProperty` 区分自有属性和继承属性**

```javascript
const obj = Object.create({ inherited: true });
obj.own = true;

console.log('inherited' in obj); // true (包括继承的)
console.log(obj.hasOwnProperty('inherited')); // false
console.log(obj.hasOwnProperty('own'));       // true

// 更安全的方式(防止 obj 重写了 hasOwnProperty)
console.log(Object.prototype.hasOwnProperty.call(obj, 'own')); // true
```

### 10.2 ☠️ 常见陷阱

**陷阱 1:忘记 `new` 导致 `this` 指向全局对象**

```javascript
function Person(name) {
  this.name = name;
}

// ❌ 忘记 new
const person = Person('Alice');
console.log(person);      // undefined
console.log(window.name); // 'Alice' (在浏览器中)

// ✅ 防御式编程:检测 new
function SafePerson(name) {
  if (!(this instanceof SafePerson)) {
    return new SafePerson(name); // 自动补上 new
  }
  this.name = name;
}

const person2 = SafePerson('Bob'); // 即使忘记 new 也能工作
console.log(person2.name); // 'Bob'
```

**陷阱 2:原型链上的引用类型属性被共享**

```javascript
function Person() {}
Person.prototype.hobbies = []; // ❌ 引用类型放在原型上

const alice = new Person();
const bob = new Person();

alice.hobbies.push('reading');
console.log(bob.hobbies); // ['reading'] (被污染了!)

// ✅ 引用类型属性放在构造函数中
function Person2() {
  this.hobbies = []; // 每个实例有自己的数组
}

const alice2 = new Person2();
const bob2 = new Person2();

alice2.hobbies.push('reading');
console.log(bob2.hobbies); // [] (隔离的)
```

**陷阱 3:箭头函数没有 `prototype` 属性**

```javascript
// ❌ 箭头函数不能用作构造函数
const Dog = (name) => {
  this.name = name;
};

console.log(Dog.prototype); // undefined

// const myDog = new Dog('Buddy'); // TypeError: Dog is not a constructor

// ✅ 只有普通函数才能用 new
function Dog2(name) {
  this.name = name;
}

const myDog = new Dog2('Buddy'); // ✅ 正常工作
```

**陷阱 4:直接赋值 `prototype` 会丢失 `constructor`**

```javascript
function Dog() {}

// ❌ 直接赋值对象字面量
Dog.prototype = {
  bark() { console.log('Woof!'); }
};

console.log(new Dog().constructor === Dog); // false! (指向 Object)

// ✅ 修复 constructor
Dog.prototype = {
  constructor: Dog, // 手动添加
  bark() { console.log('Woof!'); }
};

console.log(new Dog().constructor === Dog); // true
```

---

## 11. 章节练习

### 练习 1:原型链追踪

**难度**: ⭐⭐  
**涉及知识点**: 原型链查找、`Object.getPrototypeOf()`

**题目描述**:
给定以下代码,请在不运行代码的情况下,预测每个 `console.log` 的输出:

```javascript
function Animal() {}
Animal.prototype.type = 'Animal';

function Dog() {}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.breed = 'Unknown';

const myDog = new Dog();
myDog.name = 'Buddy';

console.log(myDog.name);
console.log(myDog.breed);
console.log(myDog.type);
console.log(myDog.toString);
console.log(myDog.hasOwnProperty('name'));
console.log(myDog.hasOwnProperty('breed'));
```

<details>
<summary>💡 参考答案</summary>

```javascript
console.log(myDog.name);       // 'Buddy' (自有属性)
console.log(myDog.breed);      // 'Unknown' (从 Dog.prototype 继承)
console.log(myDog.type);       // 'Animal' (从 Animal.prototype 继承)
console.log(myDog.toString);   // [Function: toString] (从 Object.prototype 继承)
console.log(myDog.hasOwnProperty('name'));  // true (name 是自有属性)
console.log(myDog.hasOwnProperty('breed')); // false (breed 是继承属性)
```

**查找路径**:
- `myDog.name`: myDog(找到) ✓
- `myDog.breed`: myDog(没有) → Dog.prototype(找到) ✓
- `myDog.type`: myDog(没有) → Dog.prototype(没有) → Animal.prototype(找到) ✓
- `myDog.toString`: myDog → Dog.prototype → Animal.prototype → Object.prototype(找到) ✓

</details>

---

### 练习 2:实现一个深度克隆函数

**难度**: ⭐⭐⭐  
**涉及知识点**: 原型链、`Object.create()`、递归

**题目描述**:
实现一个 `deepClone(obj)` 函数,要求:
1. 克隆对象的所有自有属性
2. 保持原型链不变(克隆对象的原型应该和原对象相同)
3. 处理嵌套对象
4. 处理数组

```javascript
function deepClone(obj) {
  // 你的代码
}

// 测试
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() { return 'Sound'; };

const original = new Animal('Dog');
original.hobbies = ['running', 'playing'];
original.friend = { name: 'Cat' };

const cloned = deepClone(original);

// 要求:
console.log(cloned.name);              // 'Dog'
console.log(cloned.speak());           // 'Sound' (继承方法可用)
console.log(cloned instanceof Animal); // true (原型链保持)
console.log(cloned !== original);      // true (不是同一个对象)
console.log(cloned.hobbies !== original.hobbies); // true (深拷贝)
```

<details>
<summary>💡 参考答案</summary>

```javascript
function deepClone(obj) {
  // 处理 null 和非对象类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  // 创建一个新对象,保持原型链
  const cloned = Object.create(Object.getPrototypeOf(obj));
  
  // 递归克隆所有自有属性
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}
```

**关键点**:
1. `Object.create(Object.getPrototypeOf(obj))`: 保持原型链
2. `hasOwnProperty`: 只克隆自有属性,不克隆继承属性
3. 递归处理嵌套对象和数组
4. 处理边界情况(null、非对象类型)

</details>

---

### 练习 3:手写继承链

**难度**: ⭐⭐⭐⭐  
**涉及知识点**: 构造函数、原型链、组合继承

**题目描述**:
不使用 ES6 `class` 语法,用原型实现以下继承关系:

```
Shape (形状基类)
  ├── Rectangle (矩形)
  └── Circle (圆形)
```

要求:
1. `Shape` 有 `color` 属性和 `getColor()` 方法
2. `Rectangle` 有 `width`、`height` 属性和 `getArea()` 方法
3. `Circle` 有 `radius` 属性和 `getArea()` 方法
4. 所有子类都能访问父类的方法

<details>
<summary>💡 参考答案</summary>

> 完整实现见 [`examples/03-inheritance-patterns.js`](./examples/03-inheritance-patterns.js)

简要思路:

```javascript
// 父类
function Shape(color) {
  this.color = color;
}

Shape.prototype.getColor = function() {
  return this.color;
};

// 子类 Rectangle
function Rectangle(color, width, height) {
  Shape.call(this, color); // 调用父类构造函数
  this.width = width;
  this.height = height;
}

Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.getArea = function() {
  return this.width * this.height;
};

// 子类 Circle
function Circle(color, radius) {
  Shape.call(this, color);
  this.radius = radius;
}

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.getArea = function() {
  return Math.PI * this.radius * this.radius;
};

// 测试
const rect = new Rectangle('red', 10, 5);
console.log(rect.getColor()); // 'red'
console.log(rect.getArea());  // 50

const circle = new Circle('blue', 3);
console.log(circle.getColor()); // 'blue'
console.log(circle.getArea());  // 28.274...
```

**核心模式** (组合继承):
1. 构造函数中调用 `ParentConstructor.call(this, ...)` 继承属性
2. `Child.prototype = Object.create(Parent.prototype)` 继承方法
3. `Child.prototype.constructor = Child` 修复 constructor 指向

</details>

---

## 📚 本章知识网络

### 向前连接

| 前置章节 | 关联内容 |
|---------|---------|
| Stage 1 Ch03: 对象和数组 | 对象的"DNA继承"旁注,现在完整展开 |
| Stage 1 Ch02: 函数/this | `new` 对 this 的绑定,现在揭示底层原理 |

### 向后连接

| 后续章节 | 铺垫内容 |
|---------|---------|
| Stage 2 Ch02: ES6 Class | Class 是原型的语法糖,有了原型基础才能理解 Class 的边界 |
| Stage 3 Ch02: 装饰器 | 装饰器修改的是 `prototype` 上的属性描述符 |
| Stage 2 Ch10: JS 执行机制 | 执行上下文的创建与原型链的查找机制 |

---

## 🎓 章节总结

在本章中,你学到了:

1. **原型链的本质**: 每个对象都有一个隐藏的 `[[Prototype]]` 链接,指向它的原型对象
2. **原型链查找**: 属性访问沿着原型链向上查找,直到 `null`
3. **`Object.create()`**: 创建对象并指定原型的标准方法
4. **`new` 的四步骤**: 创建对象 → 链接原型 → 绑定 this → 返回对象
5. **三个易混淆的概念**: `Constructor.prototype`(函数的模板)、`obj.__proto__`(对象的原型链接)、`Object.getPrototypeOf()`(标准 API)
6. **Class vs 原型**: Class 只是原型的语法糖,底层还是原型链
7. **继承模式**: 组合继承(构造函数继承属性 + 原型链继承方法)是最常用的模式
8. **哲学思考**: 原型继承是亚里士多德式的"事物相似性",不是柏拉图式的"理念投射"

**下一章预告**: 在 Stage 2 Ch02,你将学习 ES6 Class 语法、继承、静态方法等。有了本章的原型基础,你会理解 Class 的每一行代码背后发生了什么。

---

> **历史叙事: Brendan Eich 的十日创世纪**
>
> 1995 年 5 月,网景公司(Netscape)给了 Brendan Eich 一个任务:"做一个像 Java 的脚本语言,给浏览器用。" 但 Eich 本人更喜欢 Scheme(函数式)和 Self(原型)。
>
> 他在 10 天内创造了 JavaScript 的第一个版本(当时叫 Mocha)。为了满足管理层"看起来像 Java"的要求,他加入了 `new` 关键字。但在底层,他采用了 Self 的原型继承——每个对象都可以直接作为另一个对象的原型,不需要类。
>
> 这个妥协导致了 20 年的困惑。人们看到 `new`,以为有 Class;看到 `prototype`,以为是残废的 Class。直到 Kyle Simpson 在 2014 年写了 *You Don't Know JS*,社区才开始正视:"JS 就是原型语言,接受它。"
>
> 2015 年,ES6 引入了 `class` 关键字——一个精美的语法糖,让原型继承写起来"像 Java"。但墙壁还是那面墙壁,只是贴了一层壁纸。
>
> **教训**: 理解一门语言的历史,就是理解它的设计取舍。JavaScript 的原型系统不是设计失误,而是 Brendan Eich 在"管理层的政治要求"和"自己的技术理想"之间的折中产物。
