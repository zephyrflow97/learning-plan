/**
 * @file 16-prototype-inheritance.js
 * @description 不用 class 关键字实现继承链
 * @difficulty 基础 ⭐⭐
 */

console.log('=== 练习 16：原型链继承 ===\n');

// 父类构造函数
function Animal(name) {
  console.log(`[构造] 创建 Animal: ${name}`);
  this.name = name;
}

// 父类方法
Animal.prototype.speak = function() {
  console.log(`${this.name} 发出声音`);
};

Animal.prototype.move = function() {
  console.log(`${this.name} 在移动`);
};

// 子类构造函数
function Dog(name, breed) {
  console.log(`[构造] 创建 Dog: ${name}, ${breed}`);
  
  // 调用父构造函数，继承属性
  Animal.call(this, name);
  
  // 子类特有属性
  this.breed = breed;
}

// 建立原型链
console.log('\n[原型链] 设置 Dog.prototype = Object.create(Animal.prototype)');
Dog.prototype = Object.create(Animal.prototype);

// 修复 constructor 指向
console.log('[原型链] 修复 Dog.prototype.constructor = Dog\n');
Dog.prototype.constructor = Dog;

// 子类特有方法
Dog.prototype.bark = function() {
  console.log(`${this.name} 汪汪叫！`);
};

Dog.prototype.wagTail = function() {
  console.log(`${this.name} 摇尾巴`);
};

// 测试
console.log('=== 测试实例 ===\n');

const dog1 = new Dog('旺财', '金毛');
const dog2 = new Dog('小黑', '拉布拉多');

console.log('\n--- 访问属性 ---');
console.log('dog1.name:', dog1.name);      // 旺财
console.log('dog1.breed:', dog1.breed);    // 金毛

console.log('\n--- 调用方法 ---');
dog1.speak();     // 继承自 Animal
dog1.move();      // 继承自 Animal
dog1.bark();      // Dog 特有
dog1.wagTail();   // Dog 特有

console.log('\n--- instanceof 检查 ---');
console.log('dog1 instanceof Dog:', dog1 instanceof Dog);         // true
console.log('dog1 instanceof Animal:', dog1 instanceof Animal);   // true
console.log('dog1 instanceof Object:', dog1 instanceof Object);   // true

console.log('\n--- constructor 检查 ---');
console.log('dog1.constructor === Dog:', dog1.constructor === Dog);           // true
console.log('Dog.prototype.constructor === Dog:', Dog.prototype.constructor === Dog); // true

console.log('\n--- 原型链查找 ---');
console.log('dog1.__proto__ === Dog.prototype:', dog1.__proto__ === Dog.prototype);
console.log('Dog.prototype.__proto__ === Animal.prototype:', Dog.prototype.__proto__ === Animal.prototype);
console.log('Animal.prototype.__proto__ === Object.prototype:', Animal.prototype.__proto__ === Object.prototype);

console.log('\n--- 方法来源 ---');
console.log('dog1.hasOwnProperty("name"):', dog1.hasOwnProperty('name'));           // true (自有属性)
console.log('dog1.hasOwnProperty("speak"):', dog1.hasOwnProperty('speak'));         // false (继承)
console.log('"speak" in dog1:', 'speak' in dog1);                                   // true (可访问)

console.log('\n=== 练习 16 完成 ===\n');

// 关键点总结
console.log('💡 关键知识点:');
console.log('1. 使用 Animal.call(this, name) 继承属性');
console.log('2. 使用 Object.create(Animal.prototype) 建立原型链');
console.log('3. 修复 constructor 指向保持语义正确');
console.log('4. instanceof 沿原型链检查');
console.log('5. 方法在原型上共享，节省内存');
