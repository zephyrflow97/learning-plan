/**
 * @file 18-my-instanceof.js
 * @description 手动实现 instanceof 运算符
 * @difficulty 挑战 ⭐⭐⭐⭐
 */

console.log('=== 练习 18：手动实现 instanceof ===\n');

/**
 * 自定义 instanceof 实现
 * @param {*} obj - 要检查的对象
 * @param {Function} Constructor - 构造函数
 * @returns {boolean} 是否是该构造函数的实例
 */
function myInstanceof(obj, Constructor) {
  console.log(`\n🔍 检查: obj instanceof ${Constructor.name}`);
  console.log('────────────────────────────────────');
  
  // 边界情况：基本类型和 null
  if (obj === null || obj === undefined) {
    console.log('  ❌ 对象是 null 或 undefined');
    console.log('  结果: false\n');
    return false;
  }
  
  if (typeof obj !== 'object' && typeof obj !== 'function') {
    console.log(`  ❌ 不是对象类型 (typeof obj = ${typeof obj})`);
    console.log('  结果: false\n');
    return false;
  }
  
  // 获取构造函数的 prototype
  const prototype = Constructor.prototype;
  console.log(`  目标 prototype: ${Constructor.name}.prototype`);
  
  if (prototype === null || prototype === undefined) {
    throw new TypeError('构造函数的 prototype 无效');
  }
  
  // 获取对象的原型链
  let current = Object.getPrototypeOf(obj);
  let depth = 1;
  const maxDepth = 100; // 防止无限循环
  
  // 遍历原型链
  while (current !== null && depth <= maxDepth) {
    const currentName = current.constructor?.name || 'Unknown';
    console.log(`  [深度 ${depth}] 当前原型: ${currentName}.prototype`);
    
    // 比较原型
    if (current === prototype) {
      console.log(`  ✅ 找到匹配! ${currentName} === ${Constructor.name}`);
      console.log('  结果: true\n');
      return true;
    }
    
    console.log(`       ${currentName} !== ${Constructor.name}, 继续向上...`);
    current = Object.getPrototypeOf(current);
    depth++;
  }
  
  if (depth > maxDepth) {
    console.log('  ⚠️  达到最大深度限制');
  }
  
  console.log(`  ❌ 遍历完整条原型链，未找到匹配`);
  console.log('  结果: false\n');
  return false;
}

// ===== 测试构造函数 =====

function Animal(name) {
  this.name = name;
}

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

// 建立继承
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

function Cat(name) {
  Animal.call(this, name);
}

Cat.prototype = Object.create(Animal.prototype);
Cat.prototype.constructor = Cat;

// ===== 测试用例 =====

console.log('=== 测试用例 ===\n');

const dog = new Dog('旺财', '金毛');
const cat = new Cat('喵喵');
const plainObj = {};

console.log('【测试 1】dog instanceof Dog');
const test1a = myInstanceof(dog, Dog);
const test1b = dog instanceof Dog;
console.log(`自定义结果: ${test1a}, 原生结果: ${test1b}, 匹配: ${test1a === test1b} ✅`);

console.log('\n【测试 2】dog instanceof Animal');
const test2a = myInstanceof(dog, Animal);
const test2b = dog instanceof Animal;
console.log(`自定义结果: ${test2a}, 原生结果: ${test2b}, 匹配: ${test2a === test2b} ✅`);

console.log('\n【测试 3】dog instanceof Object');
const test3a = myInstanceof(dog, Object);
const test3b = dog instanceof Object;
console.log(`自定义结果: ${test3a}, 原生结果: ${test3b}, 匹配: ${test3a === test3b} ✅`);

console.log('\n【测试 4】dog instanceof Cat');
const test4a = myInstanceof(dog, Cat);
const test4b = dog instanceof Cat;
console.log(`自定义结果: ${test4a}, 原生结果: ${test4b}, 匹配: ${test4a === test4b} ✅`);

console.log('\n【测试 5】dog instanceof Array');
const test5a = myInstanceof(dog, Array);
const test5b = dog instanceof Array;
console.log(`自定义结果: ${test5a}, 原生结果: ${test5b}, 匹配: ${test5a === test5b} ✅`);

console.log('\n【测试 6】plainObj instanceof Object');
const test6a = myInstanceof(plainObj, Object);
const test6b = plainObj instanceof Object;
console.log(`自定义结果: ${test6a}, 原生结果: ${test6b}, 匹配: ${test6a === test6b} ✅`);

console.log('\n【测试 7】null instanceof Object');
const test7a = myInstanceof(null, Object);
const test7b = null instanceof Object;
console.log(`自定义结果: ${test7a}, 原生结果: ${test7b}, 匹配: ${test7a === test7b} ✅`);

console.log('\n【测试 8】基本类型 "hello" instanceof String');
const test8a = myInstanceof('hello', String);
const test8b = 'hello' instanceof String;
console.log(`自定义结果: ${test8a}, 原生结果: ${test8b}, 匹配: ${test8a === test8b} ✅`);

console.log('\n【测试 9】数字 42 instanceof Number');
const test9a = myInstanceof(42, Number);
const test9b = 42 instanceof Number;
console.log(`自定义结果: ${test9a}, 原生结果: ${test9b}, 匹配: ${test9a === test9b} ✅`);

console.log('\n【测试 10】数组实例');
const arr = [1, 2, 3];
const test10a = myInstanceof(arr, Array);
const test10b = arr instanceof Array;
console.log(`自定义结果: ${test10a}, 原生结果: ${test10b}, 匹配: ${test10a === test10b} ✅`);

console.log('\n=== 可视化原型链 ===\n');

function visualizePrototypeChain(obj) {
  console.log('原型链结构:');
  let current = obj;
  let depth = 0;
  
  while (current !== null && depth < 10) {
    const indent = '  '.repeat(depth);
    const name = current.constructor?.name || 'Object';
    const isProto = depth > 0;
    
    if (isProto) {
      console.log(`${indent}↑ [[Prototype]]`);
    }
    console.log(`${indent}${name}${isProto ? '.prototype' : ' (实例)'}`);
    
    current = Object.getPrototypeOf(current);
    depth++;
  }
  
  console.log(`${'  '.repeat(depth)}↑ [[Prototype]]`);
  console.log(`${'  '.repeat(depth)}null\n`);
}

visualizePrototypeChain(dog);

console.log('=== 练习 18 完成 ===\n');

console.log('💡 关键知识点:');
console.log('1. instanceof 检查构造函数的 prototype 是否在对象的原型链上');
console.log('2. 基本类型返回 false (除非使用包装对象)');
console.log('3. null 和 undefined 返回 false');
console.log('4. 遍历原型链直到找到匹配或到达 null');
console.log('5. Object 是几乎所有对象的原型链顶端');
