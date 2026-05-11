/**
 * @file 03-hoisting-unified.js
 * @description 演示 var/let/const/function/class 五种声明的提升行为差异
 * @prerequisites Stage 1 Ch02 函数和作用域, 01-execution-context.js
 * @related Stage 2 Ch10 TDZ (04-tdz-and-closures.js)
 */

console.log('=== 变量提升的统一模型 ===\n');

// ============================================
// 1. var 提升：注册 + 初始化为 undefined
// ============================================
console.log('[INFO] 1. var 提升\n');

console.log('[TRACE] 声明前访问 myVar:', typeof myVar, '→', myVar);
// 创建阶段: myVar 已注册到 VariableEnvironment，初始化为 undefined
// 所以访问不报错，得到 undefined

var myVar = 'hello';
console.log('[TRACE] 声明后访问 myVar:', typeof myVar, '→', myVar);
console.log('[EXPLAIN] var 在创建阶段: 注册 + 初始化为 undefined\n');

// ============================================
// 2. let 提升：注册但不初始化（TDZ）
// ============================================
console.log('[INFO] 2. let 提升 (TDZ)\n');

// 取消下面的注释会看到 ReferenceError
// console.log(myLet); // ReferenceError: Cannot access 'myLet' before initialization

try {
  // 用 eval 来安全演示 TDZ 错误
  eval('console.log(beforeLet); let beforeLet = 42;');
} catch (e) {
  console.log('[TDZ] let 声明前访问报错:', e.message);
}

let myLet = 'world';
console.log('[TRACE] 声明后访问 myLet:', myLet);
console.log('[EXPLAIN] let 在创建阶段: 注册但不初始化 → 声明前访问触发 TDZ 错误\n');

// ============================================
// 3. const 提升：和 let 一样有 TDZ
// ============================================
console.log('[INFO] 3. const 提升 (TDZ)\n');

try {
  eval('console.log(beforeConst); const beforeConst = 42;');
} catch (e) {
  console.log('[TDZ] const 声明前访问报错:', e.message);
}

const myConst = 'constant';
console.log('[TRACE] 声明后访问 myConst:', myConst);
console.log('[EXPLAIN] const 和 let 的提升行为相同，但 const 必须在声明时赋值\n');

// ============================================
// 4. function 声明提升：注册 + 初始化为函数体
// ============================================
console.log('[INFO] 4. function 声明提升（整体提升）\n');

console.log('[TRACE] 声明前调用 hoistedFn:', hoistedFn());
// 创建阶段: hoistedFn 被注册并初始化为函数体 → 可以立即调用

function hoistedFn() {
  return '我被整体提升了!';
}

console.log('[TRACE] 声明后调用 hoistedFn:', hoistedFn());
console.log('[EXPLAIN] function 声明在创建阶段: 注册 + 初始化为完整函数体\n');

// ============================================
// 5. 函数表达式 vs 函数声明
// ============================================
console.log('[INFO] 5. 函数表达式不会整体提升\n');

console.log('[TRACE] 声明前 typeof fnExprVar:', typeof fnExprVar);
// var fnExprVar → 创建阶段初始化为 undefined
// 调用 undefined() 会 TypeError

try {
  fnExprVar();
} catch (e) {
  console.log('[ERROR] var 函数表达式声明前调用:', e.message);
}

var fnExprVar = function() { return '我是 var 函数表达式'; };

// let 函数表达式会触发 TDZ
try {
  eval('fnExprLet(); let fnExprLet = function() {}');
} catch (e) {
  console.log('[ERROR] let 函数表达式声明前调用:', e.message);
}

console.log('[EXPLAIN] 函数表达式只提升变量，不提升函数体');
console.log('[EXPLAIN] var 表达式 → undefined (TypeError)，let 表达式 → TDZ (ReferenceError)\n');

// ============================================
// 6. class 提升：注册但不初始化（和 let/const 一样）
// ============================================
console.log('[INFO] 6. class 声明提升 (TDZ)\n');

try {
  eval('new MyClass(); class MyClass {}');
} catch (e) {
  console.log('[TDZ] class 声明前实例化报错:', e.message);
}

class MyClass {
  constructor() {
    this.name = 'MyClass';
  }
}

console.log('[TRACE] 声明后实例化:', new MyClass().name);
console.log('[EXPLAIN] class 在创建阶段: 注册但不初始化 → 声明前使用触发 TDZ\n');

// ============================================
// 7. 提升行为总结对比
// ============================================
console.log('[INFO] 7. 五种声明的提升行为总结\n');

console.log('┌──────────────┬────────────────────┬─────────────────┬──────────┐');
console.log('│ 声明类型     │ 创建阶段           │ 声明前访问      │ 作用域   │');
console.log('├──────────────┼────────────────────┼─────────────────┼──────────┤');
console.log('│ var          │ 注册 + 初始化 undef│ undefined       │ 函数级   │');
console.log('│ let          │ 注册，不初始化     │ ReferenceError  │ 块级     │');
console.log('│ const        │ 注册，不初始化     │ ReferenceError  │ 块级     │');
console.log('│ function     │ 注册 + 初始化函数体│ 可正常调用      │ 函数级   │');
console.log('│ class        │ 注册，不初始化     │ ReferenceError  │ 块级     │');
console.log('└──────────────┴────────────────────┴─────────────────┴──────────┘');
console.log('');

// ============================================
// 8. 同名声明的优先级
// ============================================
console.log('[INFO] 8. 同名 var 和 function 的优先级\n');

// 在新的函数作用域中演示，避免和全局冲突
function priorityDemo() {
  console.log('[TRACE] typeof sameName (创建阶段后):', typeof sameName);
  // 创建阶段: var sameName → undefined, 然后 function sameName 覆盖为函数体
  // 所以 typeof sameName 是 'function'

  var sameName = 'I am a string';
  function sameName() { return 'I am a function'; }

  console.log('[TRACE] typeof sameName (执行阶段后):', typeof sameName);
  // 执行阶段: var sameName = 'I am a string' 将 sameName 覆盖为字符串
}

priorityDemo();
console.log('[EXPLAIN] 创建阶段: function 声明覆盖 var 声明');
console.log('[EXPLAIN] 执行阶段: var 赋值又覆盖 function\n');

// ============================================
// 9. 重复声明的处理
// ============================================
console.log('[INFO] 9. 重复声明\n');

// var 允许重复声明
var duplicate = 'first';
var duplicate = 'second';  // 不报错，直接覆盖
console.log('[VAR] 重复 var 声明:', duplicate);

// let/const 不允许重复声明（同一作用域）
// let duplicate2 = 'first';
// let duplicate2 = 'second'; // SyntaxError: Identifier 'duplicate2' has already been declared
console.log('[LET] let/const 重复声明会触发 SyntaxError');
console.log('[EXPLAIN] var 的宽松性是 ES3 时代的遗留，let/const 更严格更安全');

console.log('\n=== 提升模型示例结束 ===');
