/**
 * @file 01-prototype-basics.js
 * @description 演示 JavaScript 原型的基础概念
 * @prerequisites Stage 1 Ch03 对象和数组
 * @related Stage 2 Ch02 ES6 Class
 */

console.log('=== JavaScript 原型基础 ===\n');

// ============================================
// 1. 每个对象都有原型
// ============================================
console.log('[INFO] 1. 每个对象都有隐藏的 [[Prototype]] 链接\n');

const person = {
  name: 'Alice',
  age: 25
};

console.log('[TRACE] 创建了一个普通对象:', person);
console.log('[TRACE] person 自己的属性:', Object.keys(person)); // ['name', 'age']

// person 自己没有 toString 方法,但可以调用
console.log('[TRACE] 调用 person.toString():', person.toString()); // "[object Object]"
console.log('[QUESTION] 为什么 person 能调用 toString?因为它从原型继承来的!\n');

// ============================================
// 2. 访问对象的原型
// ============================================
console.log('[INFO] 2. 访问原型的三种方式\n');

const obj = { x: 1, y: 2 };

// 方式 1: Object.getPrototypeOf() (推荐,ES5 标准方法)
const proto1 = Object.getPrototypeOf(obj);
console.log('[TRACE] Object.getPrototypeOf(obj):', proto1);

// 方式 2: __proto__ 属性 (非标准,但广泛支持)
const proto2 = obj.__proto__;
console.log('[TRACE] obj.__proto__:', proto2);

// 方式 3: constructor.prototype (通过构造函数)
const proto3 = obj.constructor.prototype;
console.log('[TRACE] obj.constructor.prototype:', proto3);

console.log('[VERIFY] 三种方式指向同一个对象:', proto1 === proto2 && proto2 === proto3); // true
console.log('[VERIFY] 都指向 Object.prototype:', proto1 === Object.prototype, '\n'); // true

// ============================================
// 3. Object.prototype 是原型链的顶端
// ============================================
console.log('[INFO] 3. 原型链的终点\n');

console.log('[TRACE] Object.prototype 的原型是:', Object.getPrototypeOf(Object.prototype)); // null
console.log('[INSIGHT] null 是原型链的终点,所有对象最终都追溯到 Object.prototype\n');

// ============================================
// 4. hasOwnProperty: 区分自有属性和继承属性
// ============================================
console.log('[INFO] 4. 自有属性 vs 继承属性\n');

const myObj = {
  ownProp: 'I belong to myObj'
};

console.log('[TRACE] myObj.ownProp:', myObj.ownProp); // 自有属性
console.log('[TRACE] myObj.toString:', typeof myObj.toString); // 'function' (继承自 Object.prototype)

console.log('[VERIFY] myObj.hasOwnProperty("ownProp"):', myObj.hasOwnProperty('ownProp')); // true
console.log('[VERIFY] myObj.hasOwnProperty("toString"):', myObj.hasOwnProperty('toString')); // false

console.log('[INSIGHT] hasOwnProperty 只检查自有属性,不检查原型链\n');

// ============================================
// 5. in 操作符: 检查整个原型链
// ============================================
console.log('[INFO] 5. in 操作符 vs hasOwnProperty\n');

console.log('[TRACE] "ownProp" in myObj:', 'ownProp' in myObj); // true
console.log('[TRACE] "toString" in myObj:', 'toString' in myObj); // true (检查原型链)

console.log('[COMPARE] hasOwnProperty 只查自己, in 操作符查整个原型链\n');

// ============================================
// 6. 创建没有原型的对象
// ============================================
console.log('[INFO] 6. 创建"纯净"的对象\n');

const pureObj = Object.create(null); // 没有原型,连 Object.prototype 都没有
pureObj.name = 'Pure Object';

console.log('[TRACE] pureObj.name:', pureObj.name); // 'Pure Object'
console.log('[TRACE] pureObj.toString:', pureObj.toString); // undefined (没有继承 toString!)
console.log('[TRACE] Object.getPrototypeOf(pureObj):', Object.getPrototypeOf(pureObj)); // null

console.log('[USE_CASE] 纯净对象常用于字典/哈希表,避免原型污染\n');

// 示例:原型污染问题
const normalDict = {};
normalDict['toString'] = 'some value';
console.log('[WARNING] normalDict.toString:', typeof normalDict.toString); // 'string' (覆盖了方法!)

const pureDict = Object.create(null);
pureDict['toString'] = 'some value';
console.log('[SAFE] pureDict.toString:', typeof pureDict.toString); // 'string' (没有冲突)

console.log('\n');

// ============================================
// 7. 函数的 prototype 属性
// ============================================
console.log('[INFO] 7. 函数的 prototype 属性 (构造函数用)\n');

function Dog(name) {
  this.name = name;
}

console.log('[TRACE] Dog 是函数,有 prototype 属性:', typeof Dog.prototype); // 'object'

// 在 prototype 上添加方法
Dog.prototype.bark = function() {
  return `${this.name} says Woof!`;
};

console.log('[TRACE] Dog.prototype.bark:', Dog.prototype.bark);

// 用 new 创建实例
const myDog = new Dog('Buddy');
console.log('[TRACE] myDog.name:', myDog.name); // 'Buddy'
console.log('[TRACE] myDog.bark():', myDog.bark()); // 'Buddy says Woof!'

// 验证原型链
console.log('[VERIFY] myDog.__proto__ === Dog.prototype:', myDog.__proto__ === Dog.prototype); // true
console.log('[VERIFY] Dog.prototype.__proto__ === Object.prototype:', Dog.prototype.__proto__ === Object.prototype); // true

console.log('[CHAIN] myDog -> Dog.prototype -> Object.prototype -> null\n');

// ============================================
// 8. prototype vs __proto__ 的区别
// ============================================
console.log('[INFO] 8. prototype vs __proto__ 的关键区别\n');

function Animal(type) {
  this.type = type;
}

Animal.prototype.speak = function() {
  return `${this.type} makes a sound`;
};

const cat = new Animal('Cat');

console.log('[CONCEPT] Animal.prototype:');
console.log('  - 是 Animal 函数的属性(函数才有)');
console.log('  - 是一个"蓝图"对象');
console.log('  - 用 new Animal() 创建的对象会继承它');
console.log('  - 值:', Animal.prototype);

console.log('\n[CONCEPT] cat.__proto__:');
console.log('  - 是 cat 对象的属性(所有对象都有)');
console.log('  - 指向 cat 的原型对象');
console.log('  - 值:', cat.__proto__);

console.log('\n[VERIFY] cat.__proto__ === Animal.prototype:', cat.__proto__ === Animal.prototype); // true
console.log('[INSIGHT] 它们指向同一个对象,但含义不同!\n');

// ============================================
// 9. 原型的动态性
// ============================================
console.log('[INFO] 9. 原型的动态性\n');

function Bird(name) {
  this.name = name;
}

const bird1 = new Bird('Sparrow');

console.log('[TRACE] 创建 bird1 后,尝试调用 fly()...');
// console.log(bird1.fly()); // 这会报错: bird1.fly is not a function

// 在创建实例后添加方法
Bird.prototype.fly = function() {
  return `${this.name} is flying`;
};

console.log('[TRACE] 在 Bird.prototype 上添加了 fly() 方法');
console.log('[TRACE] 现在 bird1.fly():', bird1.fly()); // 'Sparrow is flying'

const bird2 = new Bird('Eagle');
console.log('[TRACE] bird2.fly():', bird2.fly()); // 'Eagle is flying'

console.log('[INSIGHT] 原型上的修改会立即影响所有实例(包括已创建的实例)\n');

// ============================================
// 10. 原型链查找的性能
// ============================================
console.log('[INFO] 10. 原型链查找的性能考量\n');

const level0 = { value: 0 };
const level1 = Object.create(level0);
level1.value1 = 1;
const level2 = Object.create(level1);
level2.value2 = 2;
const level3 = Object.create(level2);
level3.value3 = 3;

console.log('[SETUP] 创建了一个 4 层深的原型链');

// 访问自有属性: O(1)
console.time('访问自有属性');
for (let i = 0; i < 100000; i++) {
  const x = level3.value3; // 自己的属性
}
console.timeEnd('访问自有属性');

// 访问原型链顶端的属性: O(n)
console.time('访问原型链顶端');
for (let i = 0; i < 100000; i++) {
  const x = level3.value; // 要查找 4 层
}
console.timeEnd('访问原型链顶端');

console.log('[INSIGHT] 原型链越深,查找越慢 (但现代引擎有内联缓存优化)\n');

// ============================================
// 11. 检测对象的构造函数
// ============================================
console.log('[INFO] 11. 对象的 constructor 属性\n');

function Car(brand) {
  this.brand = brand;
}

const myCar = new Car('Toyota');

console.log('[TRACE] myCar.constructor:', myCar.constructor); // [Function: Car]
console.log('[VERIFY] myCar.constructor === Car:', myCar.constructor === Car); // true

console.log('[TRACE] myCar.constructor.name:', myCar.constructor.name); // 'Car'

// constructor 也是从原型继承的
console.log('[VERIFY] myCar.hasOwnProperty("constructor"):', myCar.hasOwnProperty('constructor')); // false
console.log('[VERIFY] Car.prototype.hasOwnProperty("constructor"):', Car.prototype.hasOwnProperty('constructor')); // true

console.log('[INSIGHT] constructor 属性存储在 Constructor.prototype 上\n');

// ============================================
// 总结
// ============================================
console.log('=== 本文件演示总结 ===\n');
console.log('✅ 1. 每个对象都有隐藏的 [[Prototype]] 链接');
console.log('✅ 2. 访问原型: Object.getPrototypeOf() (推荐) 或 __proto__');
console.log('✅ 3. Object.prototype 是原型链的顶端,它的原型是 null');
console.log('✅ 4. hasOwnProperty 区分自有属性和继承属性');
console.log('✅ 5. Object.create(null) 创建没有原型的纯净对象');
console.log('✅ 6. 函数的 prototype 属性是给 new 创建的对象用的"蓝图"');
console.log('✅ 7. obj.__proto__ 指向对象的原型, Constructor.prototype 是构造函数的蓝图');
console.log('✅ 8. 原型上的修改会动态影响所有实例');
console.log('✅ 9. 原型链查找是 O(n),但有内联缓存优化');
console.log('✅ 10. constructor 属性指向创建对象的构造函数\n');

console.log('[NEXT] 下一个文件: 02-prototype-chain.js (深入原型链查找机制)');
