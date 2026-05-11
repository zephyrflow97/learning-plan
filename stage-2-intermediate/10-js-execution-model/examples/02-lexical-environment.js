/**
 * @file 02-lexical-environment.js
 * @description 演示词法环境 (Lexical Environment) 的链式查找机制
 * @prerequisites Stage 1 Ch02 函数和作用域, 01-execution-context.js
 * @related Stage 2 Ch10 闭包 (04-tdz-and-closures.js)
 */

console.log('=== 词法环境与作用域链 ===\n');

// ============================================
// 1. 词法环境的链式结构
// ============================================
console.log('[INFO] 1. 词法环境链式查找\n');

var globalX = 'global';

function outer() {
  var outerY = 'outer';

  function middle() {
    var middleZ = 'middle';

    function inner() {
      var innerW = 'inner';

      // 变量查找沿 [[OuterEnv]] 链向上
      console.log('[LOOKUP] innerW:', innerW);    // 当前 Record → 找到
      console.log('[LOOKUP] middleZ:', middleZ);  // 当前没有 → middle 的 Record → 找到
      console.log('[LOOKUP] outerY:', outerY);    // 当前没有 → middle 没有 → outer 的 Record → 找到
      console.log('[LOOKUP] globalX:', globalX);  // 当前没有 → ... → 全局 Record → 找到
    }

    inner();
  }

  middle();
}

outer();
console.log('[CHAIN] inner.Record → middle.Record → outer.Record → global.Record → null\n');

// ============================================
// 2. 词法作用域 vs 动态作用域
// ============================================
console.log('[INFO] 2. 词法作用域（静态作用域）\n');

var scope = 'global scope';

function checkScope() {
  var scope = 'local scope';
  return innerCheck();
}

function innerCheck() {
  // 词法作用域: 看 innerCheck 定义的位置 → 全局
  // 如果是动态作用域: 看 innerCheck 调用的位置 → checkScope 内部
  return scope;
}

var result = checkScope();
console.log('[RESULT] checkScope() 返回:', result); // 'global scope'
console.log('[EXPLAIN] JavaScript 是词法作用域 — 变量查找看定义位置，不看调用位置');
console.log('[EXPLAIN] innerCheck 定义在全局，所以 scope 查找到全局的 "global scope"\n');

// ============================================
// 3. 块级作用域的词法环境
// ============================================
console.log('[INFO] 3. 块级作用域创建新的词法环境\n');

function blockScopeDemo() {
  let a = 'function level';
  console.log('[BLOCK] 函数作用域 a:', a);

  {
    // 进入块级作用域 → 创建新的词法环境
    // 新环境的 [[OuterEnv]] → blockScopeDemo 的词法环境
    let b = 'block level 1';
    console.log('[BLOCK] 块 1 — a:', a);  // 沿 [[OuterEnv]] 找到
    console.log('[BLOCK] 块 1 — b:', b);  // 当前 Record

    {
      // 再嵌套一层 → 又创建新的词法环境
      let c = 'block level 2';
      console.log('[BLOCK] 块 2 — a:', a);  // 两层 [[OuterEnv]]
      console.log('[BLOCK] 块 2 — b:', b);  // 一层 [[OuterEnv]]
      console.log('[BLOCK] 块 2 — c:', c);  // 当前 Record
    }

    // c 的词法环境已被丢弃
    // console.log(c); // ReferenceError
    console.log('[BLOCK] 离开块 2 后，c 不可访问');
  }

  // b 的词法环境已被丢弃
  // console.log(b); // ReferenceError
  console.log('[BLOCK] 离开块 1 后，b 不可访问');
}

blockScopeDemo();
console.log('');

// ============================================
// 4. var 的函数作用域 vs let 的块作用域
// ============================================
console.log('[INFO] 4. var (函数作用域) vs let (块作用域)\n');

function scopeComparison() {
  if (true) {
    var varVariable = 'I am var (function-scoped)';
    let letVariable = 'I am let (block-scoped)';
    console.log('[IF块内] varVariable:', varVariable);
    console.log('[IF块内] letVariable:', letVariable);
  }

  console.log('[IF块外] varVariable:', varVariable); // 可访问 — var 注册在函数的 VariableEnvironment
  // console.log('[IF块外] letVariable:', letVariable); // ReferenceError — let 注册在块的 LexicalEnvironment
  console.log('[IF块外] letVariable: 不可访问 (ReferenceError)');
}

scopeComparison();
console.log('[EXPLAIN] var 注册在 VariableEnvironment (函数级)');
console.log('[EXPLAIN] let 注册在 LexicalEnvironment (块级)\n');

// ============================================
// 5. for 循环中 let 的特殊行为
// ============================================
console.log('[INFO] 5. for 循环中 let 的每次迭代新环境\n');

// var 版本: 三个闭包共享同一个 i
var varFunctions = [];
for (var i = 0; i < 3; i++) {
  varFunctions.push(function() { return i; });
}
console.log('[VAR] varFunctions[0]():', varFunctions[0]()); // 3
console.log('[VAR] varFunctions[1]():', varFunctions[1]()); // 3
console.log('[VAR] varFunctions[2]():', varFunctions[2]()); // 3
console.log('[EXPLAIN] var i 是函数作用域，三个闭包共享同一个 i (循环结束时 i = 3)\n');

// let 版本: 每次迭代创建新的词法环境
var letFunctions = [];
for (let j = 0; j < 3; j++) {
  letFunctions.push(function() { return j; });
}
console.log('[LET] letFunctions[0]():', letFunctions[0]()); // 0
console.log('[LET] letFunctions[1]():', letFunctions[1]()); // 1
console.log('[LET] letFunctions[2]():', letFunctions[2]()); // 2
console.log('[EXPLAIN] let j 在每次迭代创建新的词法环境，每个闭包有自己的 j 副本\n');

// ============================================
// 6. 变量遮蔽 (Shadowing)
// ============================================
console.log('[INFO] 6. 变量遮蔽\n');

var shadow = 'global shadow';

function shadowDemo() {
  var shadow = 'function shadow'; // 遮蔽全局的 shadow
  console.log('[SHADOW] 函数内:', shadow); // 'function shadow'

  {
    let shadow = 'block shadow'; // 遮蔽函数的 shadow
    console.log('[SHADOW] 块内:', shadow); // 'block shadow'
  }

  console.log('[SHADOW] 块后:', shadow); // 'function shadow' — 回到函数级
}

shadowDemo();
console.log('[SHADOW] 函数后:', shadow); // 'global shadow' — 回到全局级
console.log('[EXPLAIN] 内层作用域的同名变量"遮蔽"外层的同名变量');
console.log('[EXPLAIN] 遮蔽不会修改外层变量的值\n');

// ============================================
// 7. 未声明变量的危险行为
// ============================================
console.log('[INFO] 7. 未声明变量（非严格模式的陷阱）\n');

function leakyFunction() {
  // 非严格模式下，给未声明的变量赋值会创建全局变量！
  leakedVar = 'I leaked to global!';
  // 这不是声明，是对全局对象的属性赋值
}

leakyFunction();
console.log('[DANGER] leakedVar:', leakedVar); // 'I leaked to global!'
console.log('[FIX] 始终使用 "use strict" 或 let/const 来避免意外全局变量');

// 清理
delete globalThis.leakedVar;

console.log('\n=== 词法环境示例结束 ===');
