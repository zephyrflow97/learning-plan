/**
 * @file 02-prototype-chain.js
 * @description 深入演示 JavaScript 原型链的查找机制
 * @prerequisites Stage 1 Ch03 对象和数组, 01-prototype-basics.js
 * @related Stage 2 Ch02 ES6 Class
 */

console.log('=== JavaScript 原型链查找机制 ===\n');

// ============================================
// 1. 原型链的基本结构
// ============================================
console.log('[INFO] 1. 构建一条简单的原型链\n');

const grandparent = {
  familyName: 'Smith',
  heritage: 'British',
  getFamilyName() {
    return this.familyName;
  }
};

const parent = Object.create(grandparent);
parent.occupation = 'Engineer';
parent.skills = ['coding', 'design'];

const child = Object.create(parent);
child.name = 'Alice';
child.age = 10;

console.log('[STRUCTURE] 原型链结构:');
console.log('child -> parent -> grandparent -> Object.prototype -> null\n');

console.log('[TRACE] child 自己的属性:', Object.keys(child)); // ['name', 'age']
console.log('[TRACE] child.name (自有属性):', child.name); // 'Alice'
console.log('[TRACE] child.occupation (从 parent 继承):', child.occupation); // 'Engineer'
console.log('[TRACE] child.familyName (从 grandparent 继承):', child.familyName); // 'Smith'
console.log('[TRACE] child.toString (从 Object.prototype 继承):', typeof child.toString); // 'function'

console.log('\n[VERIFY] 验证原型链:');
console.log('  child.__proto__ === parent:', Object.getPrototypeOf(child) === parent); // true
console.log('  parent.__proto__ === grandparent:', Object.getPrototypeOf(parent) === grandparent); // true
console.log('  grandparent.__proto__ === Object.prototype:', Object.getPrototypeOf(grandparent) === Object.prototype); // true
console.log('  Object.prototype.__proto__ === null:', Object.getPrototypeOf(Object.prototype) === null); // true

console.log('\n');

// ============================================
// 2. 原型链查找的详细过程
// ============================================
console.log('[INFO] 2. 原型链查找的步骤追踪\n');

function logPropertyLookup(obj, prop) {
  console.log(`[LOOKUP] 查找 ${prop} 属性...`);
  
  let current = obj;
  let depth = 0;
  
  while (current !== null) {
    const indent = '  '.repeat(depth);
    if (current.hasOwnProperty(prop)) {
      console.log(`${indent}✓ 在第 ${depth} 层找到: ${current[prop]}`);
      return;
    } else {
      console.log(`${indent}✗ 当前层没有,向上查找...`);
    }
    current = Object.getPrototypeOf(current);
    depth++;
  }
  
  console.log(`  ✗ 查到 null,返回 undefined`);
}

logPropertyLookup(child, 'name');        // 第 0 层找到
console.log('');
logPropertyLookup(child, 'occupation');  // 第 1 层找到
console.log('');
logPropertyLookup(child, 'heritage');    // 第 2 层找到
console.log('');
logPropertyLookup(child, 'nonExistent'); // 找不到

console.log('\n');

// ============================================
// 3. this 绑定与原型链
// ============================================
console.log('[INFO] 3. 继承的方法中的 this 绑定\n');

const animal = {
  type: 'Animal',
  describe() {
    return `I am a ${this.type}, my name is ${this.name}`;
  }
};

const dog = Object.create(animal);
dog.type = 'Dog';
dog.name = 'Buddy';

const cat = Object.create(animal);
cat.type = 'Cat';
cat.name = 'Whiskers';

console.log('[TRACE] dog.describe():', dog.describe());
// "I am a Dog, my name is Buddy"
// this 绑定到 dog 对象

console.log('[TRACE] cat.describe():', cat.describe());
// "I am a Cat, my name is Whiskers"
// this 绑定到 cat 对象

console.log('\n[INSIGHT] 即使方法定义在原型上,this 依然指向调用者\n');

// ============================================
// 4. 属性遮蔽 (Property Shadowing)
// ============================================
console.log('[INFO] 4. 属性遮蔽: 子对象覆盖原型属性\n');

const base = {
  value: 'base value',
  getValue() {
    return this.value;
  }
};

const derived = Object.create(base);
console.log('[TRACE] derived.value (继承):', derived.value); // 'base value'

// 在 derived 上添加同名属性
derived.value = 'derived value';
console.log('[TRACE] derived.value (自有属性):', derived.value); // 'derived value'

// 原型上的属性被"遮蔽"了,但没有被修改
console.log('[VERIFY] base.value:', base.value); // 'base value' (未受影响)

console.log('\n[INSIGHT] 同名属性在自有对象上会遮蔽原型上的属性');
console.log('[INSIGHT] 但不影响原型本身和其他继承者\n');

// ============================================
// 5. 原型链的陷阱: 共享引用类型
// ============================================
console.log('[INFO] 5. 引用类型属性的共享问题\n');

const prototypeWithArray = {
  colors: ['red', 'blue'] // 引用类型
};

const obj1 = Object.create(prototypeWithArray);
const obj2 = Object.create(prototypeWithArray);

console.log('[TRACE] obj1.colors:', obj1.colors); // ['red', 'blue']
console.log('[TRACE] obj2.colors:', obj2.colors); // ['red', 'blue']

// obj1 修改数组
obj1.colors.push('green');

console.log('[WARNING] obj1 修改后:');
console.log('  obj1.colors:', obj1.colors); // ['red', 'blue', 'green']
console.log('  obj2.colors:', obj2.colors); // ['red', 'blue', 'green'] (也被修改了!)

console.log('\n[DANGER] 原型上的引用类型属性被所有实例共享!');
console.log('[SOLUTION] 应该在构造函数中初始化引用类型属性:\n');

function SafeConstructor() {
  this.colors = ['red', 'blue']; // 每个实例有自己的数组
}

const safe1 = new SafeConstructor();
const safe2 = new SafeConstructor();

safe1.colors.push('green');
console.log('  safe1.colors:', safe1.colors); // ['red', 'blue', 'green']
console.log('  safe2.colors:', safe2.colors); // ['red', 'blue'] (隔离的)

console.log('\n');

// ============================================
// 6. instanceof 的原型链遍历
// ============================================
console.log('[INFO] 6. instanceof 运算符的工作原理\n');

function Animal(name) {
  this.name = name;
}

function Dog(name) {
  Animal.call(this, name);
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const myDog = new Dog('Buddy');

console.log('[TRACE] myDog instanceof Dog:', myDog instanceof Dog); // true
console.log('[TRACE] myDog instanceof Animal:', myDog instanceof Animal); // true
console.log('[TRACE] myDog instanceof Object:', myDog instanceof Object); // true
console.log('[TRACE] myDog instanceof Array:', myDog instanceof Array); // false

console.log('\n[ALGORITHM] instanceof 的算法:');
console.log('  1. 获取 Constructor.prototype');
console.log('  2. 沿着 obj 的原型链向上查找');
console.log('  3. 如果找到 Constructor.prototype,返回 true');
console.log('  4. 如果到达 null 还没找到,返回 false\n');

// 手动实现 instanceof
function myInstanceof(obj, Constructor) {
  const prototype = Constructor.prototype;
  let current = Object.getPrototypeOf(obj);
  
  while (current !== null) {
    if (current === prototype) {
      return true;
    }
    current = Object.getPrototypeOf(current);
  }
  
  return false;
}

console.log('[VERIFY] myInstanceof(myDog, Dog):', myInstanceof(myDog, Dog)); // true
console.log('[VERIFY] myInstanceof(myDog, Animal):', myInstanceof(myDog, Animal)); // true
console.log('[VERIFY] myInstanceof(myDog, Array):', myInstanceof(myDog, Array)); // false

console.log('\n');

// ============================================
// 7. 原型链的动态修改
// ============================================
console.log('[INFO] 7. 动态修改原型链的影响\n');

function Bird(name) {
  this.name = name;
}

const bird1 = new Bird('Sparrow');

console.log('[TRACE] 创建 bird1 后,原型链:');
console.log('  bird1 -> Bird.prototype -> Object.prototype -> null');

// 动态修改 Bird.prototype
const oldPrototype = Bird.prototype;
Bird.prototype = {
  fly() {
    return `${this.name} is flying`;
  }
};

const bird2 = new Bird('Eagle');

console.log('\n[TRACE] 修改 Bird.prototype 后创建 bird2...');
console.log('  bird1.__proto__ === oldPrototype:', Object.getPrototypeOf(bird1) === oldPrototype); // true
console.log('  bird2.__proto__ === Bird.prototype:', Object.getPrototypeOf(bird2) === Bird.prototype); // true
console.log('  bird1.__proto__ === bird2.__proto__:', Object.getPrototypeOf(bird1) === Object.getPrototypeOf(bird2)); // false

console.log('\n[WARNING] 已创建的实例不受影响,新实例使用新原型');
console.log('[DANGER] 这会导致同一构造函数的实例有不同的原型链!\n');

// ============================================
// 8. Object.setPrototypeOf 的使用和性能
// ============================================
console.log('[INFO] 8. 使用 Object.setPrototypeOf 修改原型\n');

const proto1 = { type: 'Proto1' };
const proto2 = { type: 'Proto2' };

const obj = { name: 'Object' };
console.log('[TRACE] 初始原型:', Object.getPrototypeOf(obj) === Object.prototype); // true

Object.setPrototypeOf(obj, proto1);
console.log('[TRACE] 修改后原型:', Object.getPrototypeOf(obj) === proto1); // true
console.log('[TRACE] obj.type:', obj.type); // 'Proto1'

Object.setPrototypeOf(obj, proto2);
console.log('[TRACE] 再次修改原型:', Object.getPrototypeOf(obj) === proto2); // true
console.log('[TRACE] obj.type:', obj.type); // 'Proto2'

console.log('\n[WARNING] setPrototypeOf 会破坏 JS 引擎的优化!');
console.log('[PERFORMANCE] 现代引擎(V8)对固定原型链有大量优化');
console.log('[RECOMMENDATION] 避免在生产代码中动态修改原型链\n');

// ============================================
// 9. 多层原型链的实战示例
// ============================================
console.log('[INFO] 9. 实战示例: 几何图形的继承层次\n');

// 基类: 图形
const Shape = {
  type: 'Shape',
  getInfo() {
    return `Type: ${this.type}, Color: ${this.color}`;
  }
};

// 子类: 2D 图形
const Shape2D = Object.create(Shape);
Shape2D.type = '2D Shape';
Shape2D.getDimension = function() {
  return 2;
};

// 孙类: 圆形
const Circle = Object.create(Shape2D);
Circle.type = 'Circle';
Circle.getArea = function() {
  return Math.PI * this.radius * this.radius;
};

// 创建实例
const myCircle = Object.create(Circle);
myCircle.color = 'red';
myCircle.radius = 5;

console.log('[INSTANCE] myCircle 的属性:');
console.log('  自有属性:', { color: myCircle.color, radius: myCircle.radius });
console.log('  继承的 type:', myCircle.type); // 'Circle' (从 Circle)
console.log('  继承的方法 getInfo():', myCircle.getInfo()); // (从 Shape)
console.log('  继承的方法 getDimension():', myCircle.getDimension()); // 2 (从 Shape2D)
console.log('  继承的方法 getArea():', myCircle.getArea().toFixed(2)); // 78.54 (从 Circle)

console.log('\n[CHAIN] 完整原型链:');
console.log('  myCircle -> Circle -> Shape2D -> Shape -> Object.prototype -> null\n');

// ============================================
// 10. 检测原型链的工具方法
// ============================================
console.log('[INFO] 10. 检测和遍历原型链的工具\n');

function getPrototypeChain(obj) {
  const chain = [];
  let current = obj;
  
  while (current !== null) {
    if (current === obj) {
      chain.push('[对象本身]');
    } else if (current === Object.prototype) {
      chain.push('Object.prototype');
    } else if (current.constructor && current.constructor.name) {
      chain.push(`${current.constructor.name}.prototype`);
    } else {
      chain.push('[匿名对象]');
    }
    current = Object.getPrototypeOf(current);
  }
  
  chain.push('null');
  return chain;
}

function Person(name) {
  this.name = name;
}

const alice = new Person('Alice');
console.log('[TOOL] alice 的原型链:', getPrototypeChain(alice).join(' -> '));

console.log('\n[TOOL] myCircle 的原型链:', getPrototypeChain(myCircle).join(' -> '));

// ============================================
// 11. 原型污染攻击示例 (安全警示)
// ============================================
console.log('\n[INFO] 11. 原型污染攻击 (Prototype Pollution)\n');

const userInput = JSON.parse('{"__proto__": {"isAdmin": true}}');

const normalObj = {};
console.log('[BEFORE] normalObj.isAdmin:', normalObj.isAdmin); // undefined

// 危险操作: 直接合并用户输入
Object.assign({}, userInput);

console.log('[AFTER] normalObj.isAdmin:', normalObj.isAdmin); // undefined (现代引擎已防护)

console.log('\n[SECURITY] 原型污染是真实的安全威胁!');
console.log('[PREVENTION] 防御措施:');
console.log('  1. 使用 Object.create(null) 创建字典对象');
console.log('  2. 验证用户输入,过滤 __proto__、constructor 等关键字');
console.log('  3. 使用 Object.freeze() 冻结关键原型\n');

// ============================================
// 总结
// ============================================
console.log('=== 本文件演示总结 ===\n');
console.log('✅ 1. 原型链是从对象向上查找到 null 的链条');
console.log('✅ 2. 属性查找沿着原型链逐层向上,直到找到或到达 null');
console.log('✅ 3. 继承的方法中的 this 绑定到调用者,不是定义者');
console.log('✅ 4. 同名属性在自有对象上会遮蔽原型属性');
console.log('✅ 5. 原型上的引用类型属性被所有实例共享(危险!)');
console.log('✅ 6. instanceof 检查原型链上是否有某个 prototype');
console.log('✅ 7. 动态修改原型会导致已创建和新创建实例的原型不一致');
console.log('✅ 8. Object.setPrototypeOf 会破坏引擎优化,避免使用');
console.log('✅ 9. 可以构建多层原型链实现复杂继承');
console.log('✅ 10. 原型污染是真实的安全威胁,需要防御\n');

console.log('[NEXT] 下一个文件: 03-inheritance-patterns.js (继承模式的演进)');
