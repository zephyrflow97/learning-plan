/**
 * @file 01-execution-context.js
 * @description 演示 JavaScript 执行上下文的创建、销毁与调用栈行为
 * @prerequisites Stage 1 Ch02 函数和作用域
 * @related Stage 2 Ch10 词法环境 (02-lexical-environment.js)
 */

console.log('=== JavaScript 执行上下文 ===\n');

// ============================================
// 1. 全局执行上下文
// ============================================
console.log('[INFO] 1. 全局执行上下文\n');

var globalVar = 'I live in Global Execution Context';
console.log('[TRACE] 全局变量:', globalVar);
console.log('[TRACE] 全局 this === globalThis:', this === globalThis);
// 浏览器中 this === window，Node.js 中模块顶层 this === module.exports (非 globalThis)
// 但用 node --eval 或者 .js 文件直接运行时有区别

console.log('[CONCEPT] 全局执行上下文在程序启动时自动创建，程序结束时销毁');
console.log('[CONCEPT] 整个程序只有一个全局执行上下文\n');

// ============================================
// 2. 函数执行上下文 — 创建与销毁
// ============================================
console.log('[INFO] 2. 函数执行上下文的生命周期\n');

function greet(name) {
  // [创建阶段] 扫描声明: greeting → undefined
  // [执行阶段] greeting = 'Hello, ' + name
  var greeting = 'Hello, ' + name;
  console.log('[TRACE] 函数内部:', greeting);
  return greeting;
  // return 后，这个函数执行上下文被销毁（出栈）
}

console.log('[TRACE] 调用 greet() 前 — 调用栈: [global]');
var result = greet('World');
console.log('[TRACE] 调用 greet() 后 — 调用栈: [global] (greet 已出栈)');
console.log('[TRACE] result:', result, '\n');

// ============================================
// 3. 调用栈的 LIFO 行为
// ============================================
console.log('[INFO] 3. 调用栈的 LIFO（后进先出）行为\n');

function first() {
  console.log('[STACK] 进入 first() — 栈: [global, first]');
  second();
  console.log('[STACK] first() 即将结束 — 栈: [global, first]');
}

function second() {
  console.log('[STACK] 进入 second() — 栈: [global, first, second]');
  third();
  console.log('[STACK] second() 即将结束 — 栈: [global, first, second]');
}

function third() {
  console.log('[STACK] 进入 third() — 栈: [global, first, second, third]');
  console.log('[STACK] third() 即将结束 — 栈: [global, first, second, third]');
}

first();
console.log('[STACK] 回到全局 — 栈: [global]\n');

// ============================================
// 4. 执行上下文的两个阶段：创建 vs 执行
// ============================================
console.log('[INFO] 4. 创建阶段 vs 执行阶段\n');

// 在 demo 被调用时，创建阶段会先扫描所有声明
function demo() {
  console.log('[CREATION] a 的值:', a);           // undefined (var 创建阶段初始化为 undefined)
  // console.log('[CREATION] b 的值:', b);         // ReferenceError! (let 不初始化 → TDZ)
  console.log('[CREATION] typeof sayHello:', typeof sayHello); // 'function' (函数声明整体提升)

  var a = 10;
  let b = 20;
  function sayHello() { return 'Hello!'; }

  console.log('[EXECUTION] a 的值:', a);           // 10 (执行阶段赋值)
  console.log('[EXECUTION] b 的值:', b);           // 20 (TDZ 结束后可访问)
  console.log('[EXECUTION] sayHello():', sayHello());
}

demo();
console.log('');

// ============================================
// 5. 递归与调用栈深度
// ============================================
console.log('[INFO] 5. 递归调用栈\n');

function factorial(n, depth) {
  var indent = '  '.repeat(depth);
  console.log(indent + '[RECURSE] factorial(' + n + ') — 栈深度: ' + (depth + 2));

  if (n <= 1) {
    console.log(indent + '[RETURN] factorial(' + n + ') = 1');
    return 1;
  }

  var result = n * factorial(n - 1, depth + 1);
  console.log(indent + '[RETURN] factorial(' + n + ') = ' + result);
  return result;
}

console.log('[TRACE] 计算 factorial(5):');
var factResult = factorial(5, 0);
console.log('[RESULT] 5! =', factResult);
console.log('');

// ============================================
// 6. 栈溢出演示（安全版本）
// ============================================
console.log('[INFO] 6. 调用栈溢出\n');

function measureStackDepth() {
  var count = 0;

  function recurse() {
    count++;
    recurse();
  }

  try {
    recurse();
  } catch (e) {
    console.log('[ERROR] 栈溢出! 最大深度约:', count);
    console.log('[ERROR] 错误信息:', e.message);
  }
}

measureStackDepth();
console.log('');

// ============================================
// 7. 执行上下文与 var/function 的关系
// ============================================
console.log('[INFO] 7. 同一执行上下文中 var 和 function 的交互\n');

console.log('[TRACE] typeof foo (执行前):', typeof foo); // 'function'
var foo = 'I am a string';
function foo() { return 'I am a function'; }
console.log('[TRACE] typeof foo (执行后):', typeof foo); // 'string'

console.log('[EXPLAIN] 创建阶段: var foo → undefined, 然后 function foo 覆盖为函数体');
console.log('[EXPLAIN] 执行阶段: var foo = "I am a string" 将 foo 重新赋值为字符串');

console.log('\n=== 执行上下文示例结束 ===');
