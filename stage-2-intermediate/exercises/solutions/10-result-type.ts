/**
 * @file 10-result-type.ts
 * @description 实现类型安全的 Result 类型
 * @difficulty 基础 ⭐⭐⭐
 */

console.log('=== 练习 10：Result 类型 ===\n');

// ===== Result 类型定义 =====

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// 工厂函数
function ok<T>(value: T): Result<T, never> {
  console.log(`[OK] 创建成功结果: ${value}`);
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  console.log(`[ERR] 创建错误结果: ${error}`);
  return { ok: false, error };
}

// 类型守卫
function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

// 工具函数
function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    console.log(`[UNWRAP] 获取值: ${result.value}`);
    return result.value;
  }
  console.log(`[UNWRAP] 抛出错误: ${result.error}`);
  throw result.error;
}

function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isOk(result)) {
    return result.value;
  }
  console.log(`[UNWRAP_OR] 使用默认值: ${defaultValue}`);
  return defaultValue;
}

// map 函数 - 转换成功值
function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (isOk(result)) {
    console.log('[MAP] 转换成功值');
    try {
      return ok(fn(result.value));
    } catch (error) {
      return err(error as E);
    }
  }
  return result;
}

// mapErr 函数 - 转换错误值
function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (isErr(result)) {
    console.log('[MAP_ERR] 转换错误值');
    return err(fn(result.error));
  }
  return result;
}

// flatMap 函数 - 链式调用
function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (isOk(result)) {
    console.log('[FLAT_MAP] 链式调用');
    return fn(result.value);
  }
  return result;
}

// ===== 实际应用示例 =====

console.log('=== 示例 1：安全除法 ===\n');

function divide(a: number, b: number): Result<number, string> {
  console.log(`[DIVIDE] ${a} / ${b}`);
  
  if (b === 0) {
    return err('除数不能为零');
  }
  
  return ok(a / b);
}

const result1 = divide(10, 2);
if (isOk(result1)) {
  console.log('结果:', result1.value); // 5
} else {
  console.log('错误:', result1.error);
}

const result2 = divide(10, 0);
if (isErr(result2)) {
  console.log('错误:', result2.error); // 除数不能为零
}

console.log('\n=== 示例 2：链式操作 ===\n');

function parseNumber(s: string): Result<number, string> {
  console.log(`[PARSE] "${s}"`);
  const num = parseFloat(s);
  
  if (isNaN(num)) {
    return err(`无法解析: "${s}"`);
  }
  
  return ok(num);
}

function sqrt(n: number): Result<number, string> {
  console.log(`[SQRT] ${n}`);
  
  if (n < 0) {
    return err('负数没有实数平方根');
  }
  
  return ok(Math.sqrt(n));
}

// 链式调用：解析 → 平方根 → 乘2
const input = '16';
const finalResult = flatMap(
  parseNumber(input),
  n => flatMap(sqrt(n), sqrtN => ok(sqrtN * 2))
);

console.log('\n最终结果:');
if (isOk(finalResult)) {
  console.log('✅', finalResult.value); // 8
} else {
  console.log('❌', finalResult.error);
}

console.log('\n=== 示例 3：错误传播 ===\n');

function readUserAge(userId: string): Result<number, string> {
  console.log(`[READ] 读取用户 ${userId} 的年龄`);
  
  // 模拟数据库查询
  const database: Record<string, number> = {
    'user1': 25,
    'user2': 30
  };
  
  const age = database[userId];
  
  if (age === undefined) {
    return err(`用户不存在: ${userId}`);
  }
  
  return ok(age);
}

function checkAdult(age: number): Result<boolean, string> {
  console.log(`[CHECK] 检查年龄 ${age}`);
  
  if (age < 0 || age > 150) {
    return err('年龄无效');
  }
  
  return ok(age >= 18);
}

function canVote(userId: string): Result<boolean, string> {
  console.log(`\n[CAN_VOTE] 检查用户 ${userId} 是否可以投票`);
  
  return flatMap(
    readUserAge(userId),
    age => checkAdult(age)
  );
}

// 测试
console.log(canVote('user1')); // Ok(true)
console.log(canVote('user3')); // Err("用户不存在: user3")

console.log('\n=== 示例 4：批量处理 ===\n');

function processAll<T, E>(
  results: Array<Result<T, E>>
): Result<T[], E> {
  console.log(`[PROCESS_ALL] 处理 ${results.length} 个结果`);
  
  const values: T[] = [];
  
  for (const result of results) {
    if (isOk(result)) {
      values.push(result.value);
    } else {
      // 遇到第一个错误就返回
      console.log('[PROCESS_ALL] 遇到错误，停止处理');
      return result;
    }
  }
  
  console.log('[PROCESS_ALL] 全部成功');
  return ok(values);
}

const results = [
  divide(10, 2),   // Ok(5)
  divide(20, 4),   // Ok(5)
  divide(30, 0),   // Err("除数不能为零")
  divide(40, 8)    // Ok(5)
];

const allResults = processAll(results);
console.log('批量结果:', allResults);

console.log('\n=== 练习 10 完成 ===\n');

console.log('💡 关键知识点:');
console.log('1. Result 类型让错误处理显式化');
console.log('2. 调用者必须检查 ok 字段才能访问 value');
console.log('3. 类型守卫提供类型收窄');
console.log('4. map/flatMap 支持函数式链式调用');
console.log('5. 避免了异常的隐式传播');
console.log('6. 类似 Rust 的 Result 和 Haskell 的 Either');

// 导出供测试使用
export { Result, ok, err, isOk, isErr, unwrap, unwrapOr, map, mapErr, flatMap };
