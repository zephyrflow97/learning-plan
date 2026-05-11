/**
 * @file 01-error-types.ts
 * @description 演示 JavaScript 内置错误类型体系 — Error, TypeError, RangeError, ReferenceError, SyntaxError
 * @prerequisites Stage 2 Ch01 TypeScript 基础
 * @related Stage 2 Ch08 自定义错误类 (02-custom-errors.ts)
 */

console.log('=== JavaScript 内置错误类型体系 ===\n');

// ============================================
// 1. Error 基类 — 所有错误的始祖
// ============================================
console.log('[INFO] 1. Error 基类\n');

const basicError = new Error('Something went wrong');
console.log('[TRACE] error.name:', basicError.name);           // "Error"
console.log('[TRACE] error.message:', basicError.message);     // "Something went wrong"
console.log('[TRACE] error.stack 前两行:');
console.log(basicError.stack?.split('\n').slice(0, 2).join('\n'));

// Error 的 stack 属性不是标准的一部分,但所有现代引擎都支持
console.log('[VERIFY] typeof error.stack:', typeof basicError.stack); // "string"
console.log();

// ============================================
// 2. TypeError — 类型不匹配
// ============================================
console.log('[INFO] 2. TypeError — 最常见的运行时错误\n');

// 场景 1: 读取 null/undefined 的属性
try {
  const user: any = null;
  console.log(user.name);
} catch (error: unknown) {
  if (error instanceof TypeError) {
    console.log('[TRACE] 场景1 — 读取 null 的属性');
    console.log('[TRACE] message:', error.message);
    console.log('[VERIFY] error instanceof TypeError:', true);
  }
}

// 场景 2: 调用非函数值
try {
  const notAFunction: any = 42;
  notAFunction();
} catch (error: unknown) {
  if (error instanceof TypeError) {
    console.log('[TRACE] 场景2 — 调用非函数值');
    console.log('[TRACE] message:', error.message);
  }
}

// 场景 3: 调用不存在的方法
try {
  const num: any = 42;
  num.toUpperCase();
} catch (error: unknown) {
  if (error instanceof TypeError) {
    console.log('[TRACE] 场景3 — 调用不存在的方法');
    console.log('[TRACE] message:', error.message);
  }
}
console.log();

// ============================================
// 3. RangeError — 值超出有效范围
// ============================================
console.log('[INFO] 3. RangeError — 数值越界\n');

// 场景 1: 无效的数组长度
try {
  const arr = new Array(-1);
} catch (error: unknown) {
  if (error instanceof RangeError) {
    console.log('[TRACE] 场景1 — 负数数组长度');
    console.log('[TRACE] message:', error.message);
  }
}

// 场景 2: toFixed 超出范围
try {
  const num = 1.5;
  num.toFixed(200);
} catch (error: unknown) {
  if (error instanceof RangeError) {
    console.log('[TRACE] 场景2 — toFixed(200) 超出范围');
    console.log('[TRACE] message:', error.message);
  }
}

// 场景 3: 栈溢出 (递归无终止条件)
try {
  function infiniteRecursion(): never {
    return infiniteRecursion();
  }
  infiniteRecursion();
} catch (error: unknown) {
  if (error instanceof RangeError) {
    console.log('[TRACE] 场景3 — 栈溢出 (Maximum call stack size exceeded)');
    console.log('[TRACE] message:', error.message);
  }
}
console.log();

// ============================================
// 4. ReferenceError — 变量不存在
// ============================================
console.log('[INFO] 4. ReferenceError — 引用不存在的变量\n');

try {
  // @ts-ignore — 故意触发 ReferenceError
  console.log(nonExistentVariable);
} catch (error: unknown) {
  if (error instanceof ReferenceError) {
    console.log('[TRACE] 访问未声明的变量');
    console.log('[TRACE] message:', error.message);
  }
}

// 注意区别: 对象上不存在的属性不是 ReferenceError
const obj: Record<string, unknown> = {};
console.log('[TRACE] obj.nonExistent:', obj.nonExistent); // undefined (不报错!)
console.log('[VERIFY] 对象属性不存在返回 undefined, 不是 ReferenceError');
console.log();

// ============================================
// 5. SyntaxError — 语法不合法
// ============================================
console.log('[INFO] 5. SyntaxError — 运行时可捕获的语法错误\n');

// 注意: 大多数 SyntaxError 在解析阶段就报错, 无法被 try/catch 捕获
// 但 JSON.parse 和 eval 的 SyntaxError 可以在运行时捕获

try {
  JSON.parse('{invalid json}');
} catch (error: unknown) {
  if (error instanceof SyntaxError) {
    console.log('[TRACE] JSON.parse 无效 JSON');
    console.log('[TRACE] message:', error.message);
    console.log('[VERIFY] error instanceof SyntaxError:', true);
  }
}

try {
  JSON.parse('{"name": "Alice",}'); // 尾逗号在 JSON 中不合法
} catch (error: unknown) {
  if (error instanceof SyntaxError) {
    console.log('[TRACE] JSON 尾逗号语法错误');
    console.log('[TRACE] message:', error.message);
  }
}
console.log();

// ============================================
// 6. URIError — URI 编解码错误
// ============================================
console.log('[INFO] 6. URIError — URI 处理错误\n');

try {
  decodeURIComponent('%');
} catch (error: unknown) {
  if (error instanceof URIError) {
    console.log('[TRACE] decodeURIComponent 无效编码');
    console.log('[TRACE] message:', error.message);
    console.log('[VERIFY] error instanceof URIError:', true);
  }
}
console.log();

// ============================================
// 7. 错误类型的继承关系
// ============================================
console.log('[INFO] 7. 错误类型的继承关系\n');

const typeError = new TypeError('type mismatch');
console.log('[TRACE] TypeError instanceof TypeError:', typeError instanceof TypeError);  // true
console.log('[TRACE] TypeError instanceof Error:', typeError instanceof Error);          // true
console.log('[TRACE] TypeError instanceof Object:', typeError instanceof Object);        // true

const rangeError = new RangeError('out of range');
console.log('[TRACE] RangeError instanceof RangeError:', rangeError instanceof RangeError); // true
console.log('[TRACE] RangeError instanceof Error:', rangeError instanceof Error);           // true

// 所有错误类型都继承自 Error
console.log('[VERIFY] 继承链: TypeError → Error → Object');
console.log();

// ============================================
// 8. 利用 instanceof 做错误分类处理
// ============================================
console.log('[INFO] 8. instanceof 做错误分类处理\n');

function classifyError(error: unknown): string {
  if (error instanceof TypeError) return 'TYPE_ERROR: 检查变量类型和空值';
  if (error instanceof RangeError) return 'RANGE_ERROR: 检查数值范围和递归终止条件';
  if (error instanceof ReferenceError) return 'REFERENCE_ERROR: 检查变量拼写和声明';
  if (error instanceof SyntaxError) return 'SYNTAX_ERROR: 检查 JSON 或动态代码语法';
  if (error instanceof URIError) return 'URI_ERROR: 检查 URI 编码';
  if (error instanceof Error) return `GENERIC_ERROR: ${error.message}`;
  return `UNKNOWN: ${String(error)}`;
}

// 测试分类
const errors: unknown[] = [
  new TypeError('Cannot read property'),
  new RangeError('Maximum call stack'),
  new SyntaxError('Unexpected token'),
  new Error('Generic error'),
  'not an error object',   // JavaScript 允许 throw 任何值
  42,                       // 甚至数字
];

errors.forEach(err => {
  console.log(`[TRACE] ${classifyError(err)}`);
});
console.log();

// ============================================
// 9. throw 任何值 — JavaScript 的"自由"
// ============================================
console.log('[INFO] 9. JavaScript 允许 throw 任何值 (但不推荐)\n');

const throwables = [
  () => { throw new Error('standard error'); },
  () => { throw 'a string error'; },
  () => { throw 42; },
  () => { throw { code: 'CUSTOM', msg: 'object error' }; },
  () => { throw undefined; },
];

throwables.forEach((fn, i) => {
  try {
    fn();
  } catch (error: unknown) {
    const type = typeof error;
    const hasStack = error instanceof Error ? 'YES' : 'NO';
    console.log(`[TRACE] throw #${i + 1}: type=${type}, hasStack=${hasStack}, value=${JSON.stringify(error)}`);
  }
});

console.log();
console.log('[VERIFY] 结论: 只有 throw Error 实例才有调用栈 (stack)');
console.log('[VERIFY] 始终 throw new Error(...), 不要 throw 字符串或数字');

console.log('\n[INFO] === 示例结束 ===');
