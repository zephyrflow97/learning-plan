/**
 * @file 04-tdz-and-closures.js
 * @description 演示暂时性死区 (TDZ) 陷阱与闭包的底层词法环境实现
 * @prerequisites 01-execution-context.js, 02-lexical-environment.js, 03-hoisting-unified.js
 * @related Stage 1 Ch02 函数和作用域 — 闭包入门
 */

console.log('=== 暂时性死区 (TDZ) 与闭包底层 ===\n');

// ============================================
// Part 1: 暂时性死区 (TDZ)
// ============================================
console.log('[INFO] ========== Part 1: TDZ 陷阱 ==========\n');

// ============================================
// 1. TDZ 的基本行为
// ============================================
console.log('[INFO] 1. TDZ 基本行为\n');

{
  // ---- TDZ 开始 ----
  // x 已注册到 Environment Record，但状态为 "uninitialized"

  try {
    console.log(x); // 触发 TDZ
  } catch (e) {
    console.log('[TDZ] 声明前访问 let 变量:', e.message);
  }

  // ---- TDZ 结束 ----
  let x = 42;
  console.log('[OK]  声明后访问 let 变量:', x);
}
console.log('');

// ============================================
// 2. typeof 在 TDZ 中也不安全
// ============================================
console.log('[INFO] 2. typeof 在 TDZ 中的行为\n');

// 对于从未声明的变量，typeof 是安全的
console.log('[SAFE] typeof neverDeclared:', typeof neverDeclared); // 'undefined' (不报错)

// 但对于 TDZ 中的变量，typeof 也会报错！
{
  try {
    eval('typeof tdzVar; let tdzVar = 1;');
  } catch (e) {
    console.log('[TDZ] typeof 对 TDZ 变量也报错:', e.message);
  }
}
console.log('[EXPLAIN] 引擎区分 "未声明" 和 "声明但未初始化" 两种状态\n');

// ============================================
// 3. 函数参数的 TDZ
// ============================================
console.log('[INFO] 3. 函数参数中的 TDZ\n');

// 参数默认值从左到右求值
function safeParams(a = 1, b = a) {
  // a 先求值(=1)，然后 b 求值时 a 已可用
  console.log('[SAFE] a:', a, 'b:', b);
}
safeParams(); // a: 1, b: 1

// 反过来就触发 TDZ
try {
  eval('(function(a = b, b = 1) {})()')
} catch (e) {
  console.log('[TDZ] 参数 a = b 时 b 还未初始化:', e.message);
}
console.log('[EXPLAIN] 函数参数从左到右求值，后面的参数可引用前面的，但反过来不行\n');

// ============================================
// 4. 循环中的 TDZ
// ============================================
console.log('[INFO] 4. 循环中的 TDZ\n');

// for 循环的初始化部分：每次迭代 i 是"已初始化"的
for (let i = 0; i < 3; i++) {
  console.log('[LOOP] i =', i, '(已初始化，不在 TDZ)');
}

// 但如果在 for 块内声明同名变量...
for (let i = 0; i < 1; i++) {
  // let j 在 for 体内声明，在声明前处于 TDZ
  // (取消注释可验证)
  // console.log(j); // ReferenceError
  let j = i * 10;
  console.log('[LOOP] j =', j);
}
console.log('');

// ============================================
// Part 2: 闭包的底层实现
// ============================================
console.log('[INFO] ========== Part 2: 闭包底层 ==========\n');

// ============================================
// 5. 闭包 = 函数 + 词法环境引用
// ============================================
console.log('[INFO] 5. 闭包的本质\n');

function createCounter(name) {
  let count = 0;
  // increment 的 [[Environment]] → createCounter 的词法环境
  // 即使 createCounter 返回后，count 仍然可通过 [[Environment]] 访问

  return {
    increment() {
      count++;
      console.log('[CLOSURE]', name, '计数:', count);
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counterA = createCounter('A');
const counterB = createCounter('B');

counterA.increment(); // A 计数: 1
counterA.increment(); // A 计数: 2
counterB.increment(); // B 计数: 1

console.log('[VERIFY] counterA.getCount():', counterA.getCount()); // 2
console.log('[VERIFY] counterB.getCount():', counterB.getCount()); // 1
console.log('[EXPLAIN] 每次调用 createCounter 创建新的词法环境');
console.log('[EXPLAIN] counterA 和 counterB 闭包不同的词法环境，count 互不影响\n');

// ============================================
// 6. 经典的循环闭包问题
// ============================================
console.log('[INFO] 6. 循环闭包经典问题\n');

// ❌ var + 闭包: 所有闭包共享同一个 i
console.log('[BUG] var 版本:');
var fnsVar = [];
for (var i = 0; i < 3; i++) {
  fnsVar.push(function() { return i; });
}
console.log('  fnsVar[0]():', fnsVar[0]()); // 3
console.log('  fnsVar[1]():', fnsVar[1]()); // 3
console.log('  fnsVar[2]():', fnsVar[2]()); // 3
console.log('  [WHY] var i 是函数作用域，三个闭包引用同一个 i，循环结束 i = 3\n');

// ✅ let 修复: 每次迭代新的词法环境
console.log('[FIX] let 版本:');
var fnsLet = [];
for (let j = 0; j < 3; j++) {
  fnsLet.push(function() { return j; });
}
console.log('  fnsLet[0]():', fnsLet[0]()); // 0
console.log('  fnsLet[1]():', fnsLet[1]()); // 1
console.log('  fnsLet[2]():', fnsLet[2]()); // 2
console.log('  [WHY] let j 每次迭代创建新的词法环境，每个闭包有自己的 j\n');

// ✅ IIFE 修复 (ES5 时代的做法)
console.log('[FIX] IIFE 版本 (ES5):');
var fnsIIFE = [];
for (var k = 0; k < 3; k++) {
  fnsIIFE.push((function(captured) {
    return function() { return captured; };
  })(k)); // IIFE 立即执行，k 的值被 captured 参数捕获
}
console.log('  fnsIIFE[0]():', fnsIIFE[0]()); // 0
console.log('  fnsIIFE[1]():', fnsIIFE[1]()); // 1
console.log('  fnsIIFE[2]():', fnsIIFE[2]()); // 2
console.log('  [WHY] IIFE 创建新的函数作用域，captured 独立于外层 k\n');

// ============================================
// 7. 闭包的内存影响
// ============================================
console.log('[INFO] 7. 闭包与内存\n');

function memoryDemo() {
  // ❌ 闭包意外持有大对象
  function createHeavyClosure() {
    const bigData = new Array(10000).fill('heavy');
    // 返回的函数不使用 bigData，但闭包仍可能持有整个词法环境
    return function() {
      return 'I am lightweight';
    };
  }

  // ✅ 手动释放不需要的大对象
  function createSmartClosure() {
    let bigData = new Array(10000).fill('heavy');
    const length = bigData.length;  // 提取需要的数据
    bigData = null;                 // 显式释放
    return function() {
      return 'Data had ' + length + ' items';
    };
  }

  const heavy = createHeavyClosure();
  const smart = createSmartClosure();

  console.log('[MEMORY] heavy():', heavy());
  console.log('[MEMORY] smart():', smart());
  console.log('[EXPLAIN] V8 会优化未引用的变量，但显式释放更可靠');
}

memoryDemo();
console.log('');

// ============================================
// 8. 闭包的实际应用: 模块模式
// ============================================
console.log('[INFO] 8. 闭包实战: 模块模式 (Module Pattern)\n');

const calculator = (function() {
  // 私有状态 — 外界无法直接访问
  let history = [];

  // 公共接口 — 通过闭包访问私有状态
  return {
    add(a, b) {
      const result = a + b;
      history.push(a + ' + ' + b + ' = ' + result);
      return result;
    },
    subtract(a, b) {
      const result = a - b;
      history.push(a + ' - ' + b + ' = ' + result);
      return result;
    },
    getHistory() {
      return [...history]; // 返回副本，防止外部修改
    }
  };
})();

console.log('[MODULE] calculator.add(5, 3):', calculator.add(5, 3));
console.log('[MODULE] calculator.subtract(10, 4):', calculator.subtract(10, 4));
console.log('[MODULE] 历史记录:', calculator.getHistory());
console.log('[MODULE] calculator.history:', calculator.history); // undefined — 真正的私有！
console.log('[EXPLAIN] 闭包实现了真正的私有变量 — 在 ES6 class 的 #private 之前');
console.log('[EXPLAIN] 这就是 jQuery、Lodash 等库曾经使用的封装模式');

console.log('\n=== TDZ 与闭包示例结束 ===');
