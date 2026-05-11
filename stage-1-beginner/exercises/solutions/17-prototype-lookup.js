/**
 * @file 17-prototype-lookup.js
 * @description 原型链查找机制分析
 * @difficulty 进阶 ⭐⭐⭐
 */

console.log('=== 练习 17：原型链查找 ===\n');

/**
 * 追踪原型链查找过程
 * @param {object} obj - 起始对象
 * @param {string} prop - 要查找的属性名
 * @returns {*} 找到的值或 undefined
 */
function tracePrototypeChain(obj, prop) {
  console.log(`\n🔍 查找属性 "${prop}" 的过程:\n`);
  
  let current = obj;
  let depth = 0;
  const maxDepth = 10; // 防止无限循环
  
  while (current !== null && depth < maxDepth) {
    const indent = '  '.repeat(depth);
    const objName = current.constructor?.name || 'Object';
    
    console.log(`${indent}[深度 ${depth}] 检查 ${objName}`);
    
    if (current.hasOwnProperty(prop)) {
      const value = current[prop];
      console.log(`${indent}  ✅ 在自有属性中找到!`);
      console.log(`${indent}  值: ${JSON.stringify(value)}`);
      console.log(`${indent}  类型: ${typeof value}`);
      return value;
    } else {
      console.log(`${indent}  ❌ 自有属性中未找到`);
      
      // 检查是否继承了这个属性
      if (prop in current && !current.hasOwnProperty(prop)) {
        console.log(`${indent}  💡 但在原型链上存在（继承的）`);
      }
    }
    
    current = Object.getPrototypeOf(current);
    depth++;
    
    if (current !== null) {
      console.log(`${indent}  ⬆️  向上查找...\n`);
    }
  }
  
  console.log(`  ❌ 遍历完原型链（到达 null），属性不存在\n`);
  return undefined;
}

// ===== 测试案例 =====

console.log('=== 测试案例 1：属性屏蔽 ===');

const obj1 = {
  a: 1,
  b: 2
};

// 设置原型对象
const proto1 = {
  b: 20,  // 会被 obj1.b 屏蔽
  c: 3
};

Object.setPrototypeOf(obj1, proto1);

tracePrototypeChain(obj1, 'a');  // 在 obj1 自身找到
tracePrototypeChain(obj1, 'b');  // 在 obj1 自身找到（屏蔽了原型的 b）
tracePrototypeChain(obj1, 'c');  // 在原型中找到
tracePrototypeChain(obj1, 'd');  // 找不到

console.log('\n=== 测试案例 2：多层原型链 ===');

function GrandParent() {
  this.level = 'grandparent';
}
GrandParent.prototype.inheritedMethod = function() {
  return 'from grandparent';
};

function Parent() {
  this.level = 'parent';
}
Parent.prototype = Object.create(GrandParent.prototype);
Parent.prototype.parentMethod = function() {
  return 'from parent';
};

function Child() {
  this.level = 'child';
  this.ownProp = 'child own';
}
Child.prototype = Object.create(Parent.prototype);

const child = new Child();

tracePrototypeChain(child, 'ownProp');           // 在 child 自身
tracePrototypeChain(child, 'parentMethod');      // 在 Parent.prototype
tracePrototypeChain(child, 'inheritedMethod');   // 在 GrandParent.prototype
tracePrototypeChain(child, 'toString');          // 在 Object.prototype
tracePrototypeChain(child, 'nonexistent');       // 不存在

console.log('\n=== 测试案例 3：内置对象的原型链 ===');

const arr = [1, 2, 3];
tracePrototypeChain(arr, 'push');        // Array.prototype
tracePrototypeChain(arr, 'hasOwnProperty'); // Object.prototype

console.log('\n=== 属性屏蔽演示 ===');

const parent = {
  prop: 'parent value',
  method: function() { return 'parent method'; }
};

const child2 = Object.create(parent);
console.log('子对象创建后:');
console.log('  child2.prop:', child2.prop);  // 'parent value' (继承)

child2.prop = 'child value';  // 屏蔽父对象的属性
console.log('\n设置 child2.prop 后:');
console.log('  child2.prop:', child2.prop);           // 'child value' (自有)
console.log('  parent.prop:', parent.prop);           // 'parent value' (未改变)
console.log('  child2.hasOwnProperty("prop"):', child2.hasOwnProperty('prop')); // true

console.log('\n=== 练习 17 完成 ===\n');

console.log('💡 关键知识点:');
console.log('1. 属性查找从对象自身开始');
console.log('2. 沿着 __proto__ 链向上查找');
console.log('3. 找到第一个匹配就停止（屏蔽机制）');
console.log('4. 到达 null 时查找失败');
console.log('5. hasOwnProperty() 只检查自有属性');
console.log('6. in 操作符检查整条原型链');
