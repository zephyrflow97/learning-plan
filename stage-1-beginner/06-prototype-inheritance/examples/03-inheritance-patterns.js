/**
 * @file 03-inheritance-patterns.js
 * @description JavaScript 中的各种继承模式演进
 * @prerequisites 01-prototype-basics.js, 02-prototype-chain.js
 * @related Stage 2 Ch02 ES6 Class
 */

console.log('=== JavaScript 继承模式演进 ===\n');

// ============================================
// 1. 原型链继承 (Prototypal Inheritance)
// ============================================
console.log('[INFO] 1. 原型链继承 - 最简单但有缺陷\n');

function Animal(name) {
  this.name = name;
  this.colors = ['white', 'black']; // 引用类型
  console.log(`[CONSTRUCTOR] Animal created: ${name}`);
}

Animal.prototype.getName = function() {
  return this.name;
};

Animal.prototype.makeSound = function() {
  return 'Some sound';
};

function Dog() {
  console.log('[CONSTRUCTOR] Dog created');
}

// 核心: 将 Dog 的原型设置为 Animal 的实例
Dog.prototype = new Animal('Default Dog');

console.log('[SETUP] Dog.prototype = new Animal()\n');

const dog1 = new Dog();
const dog2 = new Dog();

console.log('[TRACE] dog1.getName():', dog1.getName()); // 'Default Dog'
console.log('[TRACE] dog1.makeSound():', dog1.makeSound()); // 'Some sound'

// ❌ 问题 1: 所有实例共享引用类型属性
console.log('\n[PROBLEM 1] 引用类型属性共享:');
dog1.colors.push('brown');
console.log('  dog1.colors:', dog1.colors); // ['white', 'black', 'brown']
console.log('  dog2.colors:', dog2.colors); // ['white', 'black', 'brown'] (被污染!)

// ❌ 问题 2: 无法向父类构造函数传参
console.log('\n[PROBLEM 2] 无法向父类传参:');
console.log('  创建 Dog 实例时无法指定 Animal 的 name');
console.log('  所有 Dog 的 name 都是 "Default Dog"\n');

console.log('[CONCLUSION] 原型链继承简单但不实用,很少单独使用\n');

// ============================================
// 2. 构造函数继承 (Constructor Stealing)
// ============================================
console.log('[INFO] 2. 构造函数继承 - 解决了属性共享问题\n');

function Animal2(name) {
  this.name = name;
  this.colors = ['white', 'black'];
  console.log(`[CONSTRUCTOR] Animal2 created: ${name}`);
}

Animal2.prototype.getName = function() {
  return this.name;
};

function Dog2(name, breed) {
  // 核心: 借用父类构造函数
  Animal2.call(this, name); // ✅ 解决了传参和属性共享
  this.breed = breed;
  console.log(`[CONSTRUCTOR] Dog2 created: ${name}, ${breed}`);
}

const dog3 = new Dog2('Buddy', 'Golden Retriever');
const dog4 = new Dog2('Max', 'Bulldog');

console.log('[TRACE] dog3.name:', dog3.name); // 'Buddy' (✅ 可以传参了)
console.log('[TRACE] dog3.breed:', dog3.breed); // 'Golden Retriever'

// ✅ 属性隔离
console.log('\n[SOLVED] 属性隔离:');
dog3.colors.push('brown');
console.log('  dog3.colors:', dog3.colors); // ['white', 'black', 'brown']
console.log('  dog4.colors:', dog4.colors); // ['white', 'black'] (未受影响)

// ❌ 问题: 无法继承父类原型上的方法
console.log('\n[PROBLEM] 无法继承原型方法:');
console.log('  dog3.getName:', dog3.getName); // undefined
console.log('  因为 Dog2.prototype 和 Animal2.prototype 没有建立连接\n');

console.log('[CONCLUSION] 构造函数继承解决了属性问题,但丢失了方法继承\n');

// ============================================
// 3. 组合继承 (Combination Inheritance)
// ============================================
console.log('[INFO] 3. 组合继承 - 结合原型链和构造函数 (最常用)\n');

function Animal3(name) {
  this.name = name;
  this.colors = ['white', 'black'];
  console.log(`[CONSTRUCTOR] Animal3 created: ${name}`);
}

Animal3.prototype.getName = function() {
  return this.name;
};

Animal3.prototype.makeSound = function() {
  return 'Animal sound';
};

function Dog3(name, breed) {
  // 步骤 1: 继承属性 (构造函数继承)
  Animal3.call(this, name);
  this.breed = breed;
  console.log(`[CONSTRUCTOR] Dog3 created: ${name}, ${breed}`);
}

// 步骤 2: 继承方法 (原型链继承)
Dog3.prototype = Object.create(Animal3.prototype);

// 步骤 3: 修复 constructor 指向
Dog3.prototype.constructor = Dog3;

// 步骤 4: 添加子类方法
Dog3.prototype.bark = function() {
  return `${this.name} says Woof!`;
};

const dog5 = new Dog3('Buddy', 'Golden Retriever');
const dog6 = new Dog3('Max', 'Bulldog');

console.log('[TRACE] dog5.name:', dog5.name); // 'Buddy' (✅ 属性继承)
console.log('[TRACE] dog5.breed:', dog5.breed); // 'Golden Retriever'
console.log('[TRACE] dog5.getName():', dog5.getName()); // 'Buddy' (✅ 方法继承)
console.log('[TRACE] dog5.makeSound():', dog5.makeSound()); // 'Animal sound'
console.log('[TRACE] dog5.bark():', dog5.bark()); // 'Buddy says Woof!' (✅ 子类方法)

// ✅ 属性隔离
console.log('\n[SOLVED] 所有问题都解决了:');
dog5.colors.push('brown');
console.log('  dog5.colors:', dog5.colors); // ['white', 'black', 'brown']
console.log('  dog6.colors:', dog6.colors); // ['white', 'black'] (隔离)

// ✅ 验证继承链
console.log('\n[VERIFY] 继承链验证:');
console.log('  dog5 instanceof Dog3:', dog5 instanceof Dog3); // true
console.log('  dog5 instanceof Animal3:', dog5 instanceof Animal3); // true
console.log('  dog5 instanceof Object:', dog5 instanceof Object); // true
console.log('  dog5.constructor === Dog3:', dog5.constructor === Dog3); // true (修复后)

console.log('\n[CONCLUSION] 组合继承是 ES6 之前最常用的继承模式\n');

// ============================================
// 4. 原型式继承 (Prototypal Inheritance - Douglas Crockford)
// ============================================
console.log('[INFO] 4. 原型式继承 - Object.create() 的思想起源\n');

// Douglas Crockford 2006 年提出的模式
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

const person = {
  name: 'Default',
  friends: ['Alice', 'Bob'],
  sayHello() {
    return `Hello, I'm ${this.name}`;
  }
};

console.log('[PATTERN] 用一个对象作为原型创建新对象');

const person1 = object(person); // 等价于 Object.create(person)
person1.name = 'Charlie';

const person2 = object(person);
person2.name = 'David';

console.log('[TRACE] person1.name:', person1.name); // 'Charlie'
console.log('[TRACE] person1.sayHello():', person1.sayHello()); // 'Hello, I'm Charlie'

// ❌ 同样的问题: 引用类型共享
person1.friends.push('Eve');
console.log('[PROBLEM] person2.friends:', person2.friends); // ['Alice', 'Bob', 'Eve']

console.log('\n[NOTE] ES5 引入了 Object.create() 规范化了这个模式');
console.log('[USE_CASE] 适合"对象继承对象"的场景,不需要构造函数\n');

// ============================================
// 5. 寄生式继承 (Parasitic Inheritance)
// ============================================
console.log('[INFO] 5. 寄生式继承 - 在原型式继承基础上增强\n');

function createPerson(original) {
  const clone = Object.create(original); // 原型式继承
  
  // 增强对象
  clone.sayHi = function() {
    return `Hi, I'm ${this.name}`;
  };
  
  return clone;
}

const basePerson = {
  name: 'Base',
  age: 30
};

const person3 = createPerson(basePerson);
person3.name = 'Frank';

console.log('[TRACE] person3.name:', person3.name); // 'Frank'
console.log('[TRACE] person3.age:', person3.age); // 30 (继承)
console.log('[TRACE] person3.sayHi():', person3.sayHi()); // 'Hi, I'm Frank' (增强)

console.log('\n[USE_CASE] 工厂函数模式,适合一次性创建增强对象');
console.log('[DRAWBACK] 方法不能复用,每个对象都有自己的 sayHi 副本\n');

// ============================================
// 6. 寄生组合式继承 (Parasitic Combination Inheritance)
// ============================================
console.log('[INFO] 6. 寄生组合式继承 - 最优雅的继承方式\n');

function inheritPrototype(child, parent) {
  const prototype = Object.create(parent.prototype); // 创建副本
  prototype.constructor = child; // 修复 constructor
  child.prototype = prototype; // 赋值
}

function Animal4(name) {
  this.name = name;
  this.colors = ['white', 'black'];
  console.log(`[CONSTRUCTOR] Animal4 created: ${name}`);
}

Animal4.prototype.getName = function() {
  return this.name;
};

function Dog4(name, breed) {
  Animal4.call(this, name); // 只调用一次父类构造函数
  this.breed = breed;
  console.log(`[CONSTRUCTOR] Dog4 created: ${name}, ${breed}`);
}

// 使用寄生组合式继承
inheritPrototype(Dog4, Animal4);

Dog4.prototype.bark = function() {
  return `${this.name} barks`;
};

const dog7 = new Dog4('Lucky', 'Beagle');

console.log('[TRACE] dog7.name:', dog7.name); // 'Lucky'
console.log('[TRACE] dog7.getName():', dog7.getName()); // 'Lucky'
console.log('[TRACE] dog7.bark():', dog7.bark()); // 'Lucky barks'

console.log('\n[ADVANTAGE] 相比组合继承:');
console.log('  - 只调用一次父类构造函数 (性能更好)');
console.log('  - 避免在子类原型上创建多余属性');
console.log('[CONCLUSION] ES6 class 的 extends 就是基于这个模式实现的\n');

// ============================================
// 7. 实战: 完整的几何图形继承体系
// ============================================
console.log('[INFO] 7. 实战案例: 几何图形继承体系\n');

// 基类: Shape
function Shape(color) {
  this.color = color;
  console.log(`[Shape] 创建形状: ${color}`);
}

Shape.prototype.getColor = function() {
  return this.color;
};

Shape.prototype.describe = function() {
  return `A ${this.color} shape`;
};

// 子类: Rectangle
function Rectangle(color, width, height) {
  Shape.call(this, color); // 继承属性
  this.width = width;
  this.height = height;
  console.log(`[Rectangle] 创建矩形: ${width}x${height}`);
}

inheritPrototype(Rectangle, Shape); // 继承方法

Rectangle.prototype.getArea = function() {
  return this.width * this.height;
};

Rectangle.prototype.describe = function() {
  return `A ${this.color} rectangle (${this.width}x${this.height})`;
};

// 子类: Circle
function Circle(color, radius) {
  Shape.call(this, color);
  this.radius = radius;
  console.log(`[Circle] 创建圆形: 半径 ${radius}`);
}

inheritPrototype(Circle, Shape);

Circle.prototype.getArea = function() {
  return Math.PI * this.radius * this.radius;
};

Circle.prototype.describe = function() {
  return `A ${this.color} circle (radius: ${this.radius})`;
};

// 使用
console.log('\n[DEMO] 创建图形实例:\n');

const rect = new Rectangle('red', 10, 5);
console.log('[OUTPUT]', rect.describe());
console.log('[OUTPUT] Area:', rect.getArea());
console.log('[OUTPUT] Color:', rect.getColor());

console.log('');

const circle = new Circle('blue', 3);
console.log('[OUTPUT]', circle.describe());
console.log('[OUTPUT] Area:', circle.getArea().toFixed(2));
console.log('[OUTPUT] Color:', circle.getColor());

// 验证继承关系
console.log('\n[VERIFY] 继承关系:');
console.log('  rect instanceof Rectangle:', rect instanceof Rectangle); // true
console.log('  rect instanceof Shape:', rect instanceof Shape); // true
console.log('  rect instanceof Object:', rect instanceof Object); // true
console.log('  circle instanceof Circle:', circle instanceof Circle); // true
console.log('  circle instanceof Shape:', circle instanceof Shape); // true

console.log('\n');

// ============================================
// 8. 混入模式 (Mixin Pattern)
// ============================================
console.log('[INFO] 8. 混入模式 - 多重继承的替代方案\n');

// 定义 mixins
const canEat = {
  eat(food) {
    return `${this.name} is eating ${food}`;
  }
};

const canWalk = {
  walk() {
    return `${this.name} is walking`;
  }
};

const canSwim = {
  swim() {
    return `${this.name} is swimming`;
  }
};

// 混入工具函数
function mixin(target, ...sources) {
  Object.assign(target, ...sources);
}

// 使用混入
function Duck(name) {
  this.name = name;
}

// 给 Duck.prototype 混入多个能力
mixin(Duck.prototype, canEat, canWalk, canSwim);

const duck = new Duck('Donald');

console.log('[TRACE] duck.eat("bread"):', duck.eat('bread'));
console.log('[TRACE] duck.walk():', duck.walk());
console.log('[TRACE] duck.swim():', duck.swim());

console.log('\n[PATTERN] Mixin 允许"组合"多个能力,而不是"继承"层级');
console.log('[USE_CASE] 适合需要多个正交特性的场景\n');

// ============================================
// 9. 实战: Todo 应用的数据模型继承
// ============================================
console.log('[INFO] 9. 实战案例: Todo 应用数据模型\n');

// 基类: TodoItem
function TodoItem(title) {
  this.id = Date.now() + Math.random();
  this.title = title;
  this.completed = false;
  this.createdAt = new Date();
  console.log(`[TodoItem] 创建任务: ${title}`);
}

TodoItem.prototype.toggle = function() {
  this.completed = !this.completed;
  console.log(`[TodoItem] 任务 "${this.title}" ${this.completed ? '已完成' : '未完成'}`);
  return this;
};

TodoItem.prototype.setTitle = function(newTitle) {
  this.title = newTitle;
  return this;
};

TodoItem.prototype.getInfo = function() {
  const status = this.completed ? '✓' : '○';
  return `${status} ${this.title}`;
};

// 子类: PriorityTodo (带优先级)
function PriorityTodo(title, priority) {
  TodoItem.call(this, title);
  this.priority = priority || 'medium'; // 'low', 'medium', 'high'
  console.log(`[PriorityTodo] 优先级: ${this.priority}`);
}

inheritPrototype(PriorityTodo, TodoItem);

PriorityTodo.prototype.setPriority = function(newPriority) {
  this.priority = newPriority;
  console.log(`[PriorityTodo] 更新优先级: ${newPriority}`);
  return this;
};

PriorityTodo.prototype.getInfo = function() {
  const status = this.completed ? '✓' : '○';
  const priorityIcon = { low: '⬇️', medium: '➡️', high: '⬆️' }[this.priority];
  return `${status} ${priorityIcon} ${this.title}`;
};

// 子类: RecurringTodo (重复任务)
function RecurringTodo(title, interval) {
  TodoItem.call(this, title);
  this.interval = interval; // 'daily', 'weekly', 'monthly'
  this.nextDueDate = this.calculateNextDue();
  console.log(`[RecurringTodo] 重复间隔: ${interval}`);
}

inheritPrototype(RecurringTodo, TodoItem);

RecurringTodo.prototype.calculateNextDue = function() {
  const now = new Date();
  const intervals = {
    daily: 1,
    weekly: 7,
    monthly: 30
  };
  const days = intervals[this.interval] || 1;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
};

RecurringTodo.prototype.complete = function() {
  this.completed = true;
  this.nextDueDate = this.calculateNextDue();
  console.log(`[RecurringTodo] 任务完成,下次时间: ${this.nextDueDate.toDateString()}`);
  return this;
};

// 使用
console.log('\n[DEMO] Todo 应用演示:\n');

const todo1 = new TodoItem('学习 JavaScript 原型');
console.log(todo1.getInfo());
todo1.toggle();
console.log(todo1.getInfo());

console.log('');

const todo2 = new PriorityTodo('完成项目报告', 'high');
console.log(todo2.getInfo());
todo2.toggle();
console.log(todo2.getInfo());

console.log('');

const todo3 = new RecurringTodo('每日锻炼', 'daily');
console.log(todo3.getInfo());
todo3.complete();

console.log('\n[VERIFY] 继承验证:');
console.log('  todo2 instanceof PriorityTodo:', todo2 instanceof PriorityTodo); // true
console.log('  todo2 instanceof TodoItem:', todo2 instanceof TodoItem); // true
console.log('  todo3 instanceof RecurringTodo:', todo3 instanceof RecurringTodo); // true
console.log('  todo3 instanceof TodoItem:', todo3 instanceof TodoItem); // true

console.log('\n');

// ============================================
// 10. 继承模式对比总结
// ============================================
console.log('[INFO] 10. 继承模式对比总结\n');

const comparisonTable = `
╔═══════════════════════╦══════════╦══════════╦══════════╦════════════╗
║ 继承模式               ║ 属性继承 ║ 方法继承 ║ 参数传递 ║ 推荐度     ║
╠═══════════════════════╬══════════╬══════════╬══════════╬════════════╣
║ 原型链继承             ║ ✓ (共享) ║ ✓        ║ ✗        ║ ★☆☆☆☆     ║
║ 构造函数继承           ║ ✓ (隔离) ║ ✗        ║ ✓        ║ ★★☆☆☆     ║
║ 组合继承               ║ ✓ (隔离) ║ ✓        ║ ✓        ║ ★★★★☆     ║
║ 原型式继承             ║ ✓ (共享) ║ ✓        ║ N/A      ║ ★★★☆☆     ║
║ 寄生式继承             ║ ✓ (共享) ║ ✓ (复制) ║ N/A      ║ ★★☆☆☆     ║
║ 寄生组合式继承         ║ ✓ (隔离) ║ ✓        ║ ✓        ║ ★★★★★     ║
║ ES6 Class              ║ ✓ (隔离) ║ ✓        ║ ✓        ║ ★★★★★     ║
╚═══════════════════════╩══════════╩══════════╩══════════╩════════════╝
`;

console.log(comparisonTable);

console.log('[RECOMMENDATION] 实际开发建议:');
console.log('  - 新项目: 使用 ES6 class (语法清晰)');
console.log('  - 理解原理: 学习寄生组合式继承');
console.log('  - 维护老代码: 识别并理解组合继承模式');
console.log('  - 对象复制: 使用 Object.create()');
console.log('  - 多重能力: 使用 Mixin 模式\n');

// ============================================
// 总结
// ============================================
console.log('=== 本文件演示总结 ===\n');
console.log('✅ 1. 原型链继承: 简单但有引用类型共享和无法传参问题');
console.log('✅ 2. 构造函数继承: 解决属性问题但丢失方法继承');
console.log('✅ 3. 组合继承: 结合两者优点,最常用的 ES5 模式');
console.log('✅ 4. 原型式继承: Object.create() 的思想起源');
console.log('✅ 5. 寄生式继承: 工厂函数 + 对象增强');
console.log('✅ 6. 寄生组合式继承: 最优雅,ES6 class 的底层实现');
console.log('✅ 7. Mixin 模式: 组合多个能力,替代多重继承');
console.log('✅ 8. 实战案例: 几何图形、Todo 应用的继承设计');
console.log('✅ 9. inheritPrototype 工具函数: 封装继承逻辑');
console.log('✅ 10. 模式选择: 新项目用 class,理解原理学组合/寄生组合\n');

console.log('[NEXT] 下一个文件: 04-class-vs-prototype.js (ES6 Class 的真相)');
