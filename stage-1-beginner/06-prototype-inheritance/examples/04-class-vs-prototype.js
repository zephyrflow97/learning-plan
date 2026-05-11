/**
 * @file 04-class-vs-prototype.js
 * @description ES6 Class 与原型继承的对比及真相
 * @prerequisites 03-inheritance-patterns.js
 * @related Stage 2 Ch02 ES6 Class
 */

console.log('=== ES6 Class vs 原型继承 ===\n');

// ============================================
// 1. Class 只是语法糖
// ============================================
console.log('[INFO] 1. Class 是原型继承的语法糖\n');

// ✅ ES6 Class 语法
class Animal {
  constructor(name) {
    this.name = name;
    console.log(`[Class] Animal created: ${name}`);
  }
  
  speak() {
    return `${this.name} makes a sound`;
  }
  
  static isAnimal(obj) {
    return obj instanceof Animal;
  }
}

// ✅ 等价的原型实现
function AnimalProto(name) {
  this.name = name;
  console.log(`[Proto] Animal created: ${name}`);
}

AnimalProto.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

AnimalProto.isAnimal = function(obj) {
  return obj instanceof AnimalProto;
};

// 验证等价性
const cat1 = new Animal('Cat');
const cat2 = new AnimalProto('Cat');

console.log('[COMPARE] 实例方法:');
console.log('  cat1.speak():', cat1.speak());
console.log('  cat2.speak():', cat2.speak());

console.log('\n[COMPARE] 静态方法:');
console.log('  Animal.isAnimal(cat1):', Animal.isAnimal(cat1));
console.log('  AnimalProto.isAnimal(cat2):', AnimalProto.isAnimal(cat2));

console.log('\n[COMPARE] 原型链:');
console.log('  cat1.__proto__ === Animal.prototype:', cat1.__proto__ === Animal.prototype); // true
console.log('  cat2.__proto__ === AnimalProto.prototype:', cat2.__proto__ === AnimalProto.prototype); // true

console.log('\n[CONCLUSION] Class 和原型函数在运行时完全等价!\n');

// ============================================
// 2. Class 继承 vs 原型继承
// ============================================
console.log('[INFO] 2. 继承的等价性\n');

// ✅ Class 继承
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
    console.log(`[Class] Dog created: ${name}, ${breed}`);
  }
  
  bark() {
    return `${this.name} barks`;
  }
  
  // 重写父类方法
  speak() {
    return `${this.name} says Woof!`;
  }
}

// ✅ 等价的原型继承 (寄生组合式)
function DogProto(name, breed) {
  AnimalProto.call(this, name); // 调用父类构造函数
  this.breed = breed;
  console.log(`[Proto] Dog created: ${name}, ${breed}`);
}

// 设置原型链
DogProto.prototype = Object.create(AnimalProto.prototype);
DogProto.prototype.constructor = DogProto;

DogProto.prototype.bark = function() {
  return `${this.name} barks`;
};

DogProto.prototype.speak = function() {
  return `${this.name} says Woof!`;
};

// 验证
const dog1 = new Dog('Buddy', 'Golden');
const dog2 = new DogProto('Max', 'Bulldog');

console.log('[COMPARE] 属性继承:');
console.log('  dog1.name:', dog1.name);
console.log('  dog2.name:', dog2.name);

console.log('\n[COMPARE] 方法继承:');
console.log('  dog1.speak():', dog1.speak());
console.log('  dog2.speak():', dog2.speak());
console.log('  dog1.bark():', dog1.bark());
console.log('  dog2.bark():', dog2.bark());

console.log('\n[COMPARE] instanceof:');
console.log('  dog1 instanceof Dog:', dog1 instanceof Dog); // true
console.log('  dog1 instanceof Animal:', dog1 instanceof Animal); // true
console.log('  dog2 instanceof DogProto:', dog2 instanceof DogProto); // true
console.log('  dog2 instanceof AnimalProto:', dog2 instanceof AnimalProto); // true

console.log('\n[CONCLUSION] extends 就是寄生组合式继承的语法糖\n');

// ============================================
// 3. Class 的独有特性
// ============================================
console.log('[INFO] 3. Class 的独有特性 (不只是语法糖)\n');

// 特性 1: Class 声明不会提升
console.log('[FEATURE 1] Class 不会提升:\n');

try {
  const instance = new MyClass(); // ❌ ReferenceError
} catch (e) {
  console.log('[ERROR] 无法在声明前使用 Class:', e.message);
}

class MyClass {}

// 对比:函数声明会提升
const instance2 = new MyFunction(); // ✅ 正常工作
function MyFunction() {}

console.log('[TRACE] MyFunction 被提升,可以在声明前使用\n');

// 特性 2: Class 内部自动启用严格模式
console.log('[FEATURE 2] Class 内部自动严格模式:\n');

class StrictClass {
  constructor() {
    // 在严格模式下,this 为 undefined 而不是全局对象
    console.log('[TRACE] StrictClass 中的严格模式已启用');
  }
}

// 特性 3: Class 方法不可枚举
console.log('[FEATURE 3] Class 方法不可枚举:\n');

class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return `Hello, ${this.name}`;
  }
}

function PersonProto(name) {
  this.name = name;
}

PersonProto.prototype.greet = function() {
  return `Hello, ${this.name}`;
};

const p1 = new Person('Alice');
const p2 = new PersonProto('Bob');

console.log('[TRACE] for...in 遍历 Person 实例:');
for (let key in p1) {
  console.log('  ', key); // 只有 'name' (greet 不可枚举)
}

console.log('\n[TRACE] for...in 遍历 PersonProto 实例:');
for (let key in p2) {
  console.log('  ', key); // 'name' 和 'greet' (greet 可枚举)
}

console.log('\n');

// 特性 4: Class 必须用 new 调用
console.log('[FEATURE 4] Class 必须用 new 调用:\n');

try {
  const person = Person('Charlie'); // ❌ TypeError
} catch (e) {
  console.log('[ERROR] Class 不能作为普通函数调用:', e.message);
}

// 函数可以不用 new 调用
const person3 = PersonProto('David'); // ✅ 不报错 (但会污染全局)
console.log('[WARNING] 普通函数忘记 new 不会报错,但会有副作用\n');

// ============================================
// 4. super 关键字的威力
// ============================================
console.log('[INFO] 4. super 关键字 - Class 独有的便利\n');

class Shape {
  constructor(color) {
    this.color = color;
  }
  
  describe() {
    return `A ${this.color} shape`;
  }
}

class Rectangle extends Shape {
  constructor(color, width, height) {
    super(color); // 必须先调用 super
    this.width = width;
    this.height = height;
  }
  
  describe() {
    // super.describe() 调用父类方法
    const baseDesc = super.describe();
    return `${baseDesc} (${this.width}x${this.height})`;
  }
  
  getArea() {
    return this.width * this.height;
  }
}

const rect = new Rectangle('red', 10, 5);
console.log('[TRACE] rect.describe():', rect.describe());
// "A red shape (10x5)"

console.log('\n[COMPARE] 用原型实现调用父类方法:');

function ShapeProto(color) {
  this.color = color;
}

ShapeProto.prototype.describe = function() {
  return `A ${this.color} shape`;
};

function RectangleProto(color, width, height) {
  ShapeProto.call(this, color);
  this.width = width;
  this.height = height;
}

RectangleProto.prototype = Object.create(ShapeProto.prototype);
RectangleProto.prototype.constructor = RectangleProto;

RectangleProto.prototype.describe = function() {
  // 必须显式调用父类方法,且要绑定 this
  const baseDesc = ShapeProto.prototype.describe.call(this);
  return `${baseDesc} (${this.width}x${this.height})`;
};

const rect2 = new RectangleProto('blue', 8, 4);
console.log('[TRACE] rect2.describe():', rect2.describe());

console.log('\n[INSIGHT] super 比 ParentClass.prototype.method.call(this) 简洁得多\n');

// ============================================
// 5. 静态方法与属性
// ============================================
console.log('[INFO] 5. 静态方法与属性\n');

class MathHelper {
  static PI = 3.14159; // ES2022: 静态字段
  
  static add(a, b) {
    return a + b;
  }
  
  static multiply(a, b) {
    return a * b;
  }
}

console.log('[TRACE] MathHelper.PI:', MathHelper.PI);
console.log('[TRACE] MathHelper.add(2, 3):', MathHelper.add(2, 3));
console.log('[TRACE] MathHelper.multiply(4, 5):', MathHelper.multiply(4, 5));

// 等价的原型实现
function MathHelperProto() {}

MathHelperProto.PI = 3.14159;
MathHelperProto.add = function(a, b) { return a + b; };
MathHelperProto.multiply = function(a, b) { return a * b; };

console.log('\n[COMPARE] 原型实现:');
console.log('  MathHelperProto.PI:', MathHelperProto.PI);
console.log('  MathHelperProto.add(2, 3):', MathHelperProto.add(2, 3));

console.log('\n[INSIGHT] 静态成员是函数对象的属性,不在 prototype 上\n');

// ============================================
// 6. Getter 和 Setter
// ============================================
console.log('[INFO] 6. Getter 和 Setter\n');

class Temperature {
  constructor(celsius) {
    this._celsius = celsius; // 私有约定: _开头
  }
  
  get fahrenheit() {
    return this._celsius * 9/5 + 32;
  }
  
  set fahrenheit(value) {
    this._celsius = (value - 32) * 5/9;
  }
  
  get celsius() {
    return this._celsius;
  }
  
  set celsius(value) {
    this._celsius = value;
  }
}

const temp = new Temperature(25);
console.log('[TRACE] temp.celsius:', temp.celsius); // 25
console.log('[TRACE] temp.fahrenheit:', temp.fahrenheit); // 77

temp.fahrenheit = 86;
console.log('[TRACE] 设置 fahrenheit = 86 后:');
console.log('  temp.celsius:', temp.celsius); // 30
console.log('  temp.fahrenheit:', temp.fahrenheit); // 86

console.log('\n[COMPARE] 用原型实现 getter/setter:');

function TemperatureProto(celsius) {
  this._celsius = celsius;
}

Object.defineProperty(TemperatureProto.prototype, 'fahrenheit', {
  get() {
    return this._celsius * 9/5 + 32;
  },
  set(value) {
    this._celsius = (value - 32) * 5/9;
  }
});

const temp2 = new TemperatureProto(25);
console.log('  temp2.fahrenheit:', temp2.fahrenheit); // 77

console.log('\n[INSIGHT] Class 的 getter/setter 语法更简洁\n');

// ============================================
// 7. 私有字段 (ES2022)
// ============================================
console.log('[INFO] 7. 私有字段 - 真正的封装 (ES2022)\n');

class BankAccount {
  #balance = 0; // 私有字段(# 开头)
  
  constructor(initialBalance) {
    this.#balance = initialBalance;
  }
  
  deposit(amount) {
    this.#balance += amount;
    console.log(`[BankAccount] 存入 ${amount}, 余额: ${this.#balance}`);
  }
  
  withdraw(amount) {
    if (amount > this.#balance) {
      console.log('[BankAccount] 余额不足');
      return false;
    }
    this.#balance -= amount;
    console.log(`[BankAccount] 取出 ${amount}, 余额: ${this.#balance}`);
    return true;
  }
  
  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount(100);
account.deposit(50);
account.withdraw(30);
console.log('[TRACE] account.getBalance():', account.getBalance());

// 私有字段无法从外部访问
console.log('\n[TRACE] account.#balance:', typeof account['#balance']); // undefined
console.log('[SECURITY] 私有字段真正无法从外部访问 (不只是约定)\n');

console.log('[NOTE] 原型继承无法实现真正的私有字段 (只能用 WeakMap 模拟)\n');

// ============================================
// 8. new.target 元属性
// ============================================
console.log('[INFO] 8. new.target - 检测构造函数调用\n');

class Base {
  constructor() {
    console.log('[TRACE] new.target.name:', new.target.name);
    if (new.target === Base) {
      throw new Error('Base class cannot be instantiated directly');
    }
  }
}

class Derived extends Base {
  constructor() {
    super();
    console.log('[Derived] 实例创建成功');
  }
}

console.log('[TEST] 创建 Derived 实例:');
const derived = new Derived(); // ✅ 正常

console.log('\n[TEST] 尝试创建 Base 实例:');
try {
  const base = new Base(); // ❌ 抛出错误
} catch (e) {
  console.log('[ERROR]', e.message);
}

console.log('\n[USE_CASE] new.target 可用于实现抽象类\n');

// ============================================
// 9. Class 的性能考量
// ============================================
console.log('[INFO] 9. Class vs 原型的性能对比\n');

const ITERATIONS = 1000000;

// 测试 Class
class TestClass {
  constructor(value) {
    this.value = value;
  }
  
  getValue() {
    return this.value;
  }
}

console.time('Class 实例创建');
for (let i = 0; i < ITERATIONS; i++) {
  const obj = new TestClass(i);
  obj.getValue();
}
console.timeEnd('Class 实例创建');

// 测试原型
function TestProto(value) {
  this.value = value;
}

TestProto.prototype.getValue = function() {
  return this.value;
};

console.time('原型函数实例创建');
for (let i = 0; i < ITERATIONS; i++) {
  const obj = new TestProto(i);
  obj.getValue();
}
console.timeEnd('原型函数实例创建');

console.log('\n[RESULT] 性能几乎完全相同 (Class 只是语法糖)\n');

// ============================================
// 10. 何时使用 Class,何时使用原型
// ============================================
console.log('[INFO] 10. 选择建议\n');

const recommendations = `
╔════════════════════════════════╦═════════════════════════════════════════════╗
║ 场景                           ║ 推荐                                        ║
╠════════════════════════════════╬═════════════════════════════════════════════╣
║ 新项目                         ║ ✅ Class (可读性好,团队熟悉)                ║
║ 需要继承层级                   ║ ✅ Class (extends/super 语法简洁)           ║
║ 需要真正的私有字段             ║ ✅ Class (# 私有字段)                       ║
║ 维护老代码                     ║ ⚠️  原型 (保持一致性)                       ║
║ 深入理解 JS                    ║ 📚 学习原型 (理解底层原理)                  ║
║ 库/框架开发                    ║ ⚠️  看情况 (考虑兼容性和捆绑体积)           ║
║ 需要函数提升                   ║ ⚠️  原型 (Class 不提升)                     ║
║ 极致性能优化                   ║ ⚡ 两者都可 (性能几乎相同)                  ║
╚════════════════════════════════╩═════════════════════════════════════════════╝
`;

console.log(recommendations);

console.log('[PRINCIPLE] 选择原则:');
console.log('  1. 优先使用 Class (除非有特殊原因)');
console.log('  2. 理解原型 (知道 Class 背后发生了什么)');
console.log('  3. 保持一致性 (项目内统一风格)');
console.log('  4. 团队共识 > 个人偏好\n');

// ============================================
// 11. Class 的局限性
// ============================================
console.log('[INFO] 11. Class 的局限性 (误导性)\n');

console.log('[LIMITATION 1] Class 不是"真正的类":');
console.log('  - JS 没有类型系统检查 (不像 Java/C#)');
console.log('  - Class 只是构造函数 + 原型的语法糖');
console.log('  - 可以动态修改 Class (添加方法、修改原型)');

console.log('\n[LIMITATION 2] 私有字段的怪异行为:');

class Weird {
  #private = 'secret';
  
  getPrivate() {
    return this.#private;
  }
}

const w1 = new Weird();
console.log('[TRACE] w1.getPrivate():', w1.getPrivate()); // 'secret'

const fakeWeird = {
  getPrivate: w1.getPrivate
};

try {
  console.log('[TRACE] fakeWeird.getPrivate():', fakeWeird.getPrivate());
} catch (e) {
  console.log('[ERROR] 在非实例上调用私有字段方法会报错:', e.message);
}

console.log('\n[LIMITATION 3] 不支持多重继承:');
console.log('  - JS 只支持单继承链');
console.log('  - 需要多重能力时使用 Mixin 模式');

console.log('\n');

// ============================================
// 总结
// ============================================
console.log('=== 本文件演示总结 ===\n');
console.log('✅ 1. Class 是原型继承的语法糖,底层完全等价');
console.log('✅ 2. extends 就是寄生组合式继承的语法糖');
console.log('✅ 3. Class 有独有特性: 不提升、严格模式、方法不可枚举、必须 new');
console.log('✅ 4. super 关键字比原型调用父类方法简洁得多');
console.log('✅ 5. 静态方法/属性是函数对象的属性,不在 prototype 上');
console.log('✅ 6. getter/setter 语法比 Object.defineProperty 简洁');
console.log('✅ 7. 私有字段 (#) 是真正的私有,原型无法模拟');
console.log('✅ 8. new.target 可用于实现抽象类');
console.log('✅ 9. Class 和原型的性能几乎完全相同');
console.log('✅ 10. 新项目优先用 Class,但必须理解原型原理');
console.log('✅ 11. Class 有局限性: 不是真正的类、不支持多重继承\n');

console.log('[PHILOSOPHY] JavaScript 的身份认同:');
console.log('  Class 让 JS "看起来像 Java",但 JS 的灵魂还是原型。');
console.log('  理解原型,才能理解 Class 的边界和行为。');
console.log('  不要试图把 JS 变成 Java,接受它的本性。\n');

console.log('[END] 原型与继承系列演示完成!');
