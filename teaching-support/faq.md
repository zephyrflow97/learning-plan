# 常见问题解答 (FAQ)

本文档收集了学习 JavaScript 和 TypeScript 过程中最常见的问题及其解答。每个问题都提供了多个层次的解释，适应不同理解程度的学习者。

---

## 📑 目录

- [JavaScript 基础](#javascript-基础)
- [函数和作用域](#函数和作用域)
- [异步编程](#异步编程)
- [TypeScript 类型系统](#typescript-类型系统)
- [调试和错误处理](#调试和错误处理)
- [工具和环境](#工具和环境)

---

## JavaScript 基础

### Q1: `let`、`const` 和 `var` 有什么区别？

**简单版（初学者）**：  
- `var` 是旧的方式，现在很少用  
- `let` 用于会改变的变量  
- `const` 用于不会改变的变量

**详细版（进阶）**：
```javascript
// var: 函数作用域，可以重新声明，会提升
var x = 1;
var x = 2; // ✅ 可以重新声明
console.log('[示例] var 可以重新声明:', x); // 2

// let: 块作用域，不能重新声明，不会提升
let y = 1;
// let y = 2; // ❌ 错误：不能重新声明
y = 2; // ✅ 可以重新赋值
console.log('[示例] let 可以重新赋值:', y); // 2

// const: 块作用域，不能重新声明，不能重新赋值
const z = 1;
// z = 2; // ❌ 错误：不能重新赋值
console.log('[示例] const 不能重新赋值:', z); // 1
```

**最佳实践（专家）**：
- 默认使用 `const`，除非你知道变量会改变
- 如果需要重新赋值，使用 `let`
- 避免使用 `var`，它的作用域规则容易导致bug

**常见陷阱**：
```javascript
// 陷阱：const 对象的属性可以修改
const obj = { count: 1 };
obj.count = 2; // ✅ 可以！const 只保护变量绑定，不保护值
console.log('[陷阱] const 对象属性可修改:', obj.count); // 2

// 但不能重新赋值整个对象
// obj = { count: 3 }; // ❌ 错误
```

---

### Q2: `==` 和 `===` 有什么区别？

**简单版**：  
- `==` 会尝试转换类型  
- `===` 严格比较，不转换类型

**详细示例**：
```javascript
console.log('[比较] "5" == 5:', "5" == 5);   // true (类型转换)
console.log('[比较] "5" === 5:', "5" === 5); // false (严格)

console.log('[比较] 0 == false:', 0 == false);   // true
console.log('[比较] 0 === false:', 0 === false); // false

console.log('[比较] null == undefined:', null == undefined);   // true
console.log('[比较] null === undefined:', null === undefined); // false
```

**最佳实践**：  
始终使用 `===` 和 `!==`，除非你有特定理由使用 `==`。

**记忆技巧**：  
3个等号 = 3个检查（值、类型、严格）

---

### Q3: 如何复制数组或对象？

**简单版**：
```javascript
// 复制数组 - 使用展开运算符
const arr1 = [1, 2, 3];
const arr2 = [...arr1];
console.log('[复制] 数组:', arr2); // [1, 2, 3]

// 复制对象
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1 };
console.log('[复制] 对象:', obj2); // { a: 1, b: 2 }
```

**注意事项（重要！）**：
```javascript
// ⚠️ 这只是浅拷贝！
const original = {
  name: 'Alice',
  address: { city: 'Beijing' }
};

const copy = { ...original };
copy.address.city = 'Shanghai'; // 修改了嵌套对象

console.log('[陷阱] 原始对象也被修改:', original.address.city); // Shanghai

// ✅ 深拷贝的方法
const deepCopy = JSON.parse(JSON.stringify(original));
// 或使用专门的库如 lodash.cloneDeep
```

**其他方法**：
```javascript
// 数组复制的其他方法
const arr = [1, 2, 3];

const copy1 = arr.slice();           // 方法1
const copy2 = Array.from(arr);       // 方法2
const copy3 = arr.map(x => x);       // 方法3
const copy4 = [...arr];              // 方法4（推荐）

console.log('[方法] 所有方法都创建了新数组');
```

---

## 函数和作用域

### Q4: 普通函数和箭头函数有什么区别？

**简单版**：  
箭头函数写法更简洁，但`this`的行为不同。

**对比示例**：
```javascript
// 普通函数
function add(a, b) {
  return a + b;
}

// 箭头函数
const add = (a, b) => a + b;

console.log('[语法] 箭头函数更简洁');
```

**关键区别 - this 绑定**：
```javascript
const obj = {
  name: 'Object',
  
  // 普通函数：this 指向调用它的对象
  regularMethod: function() {
    console.log('[普通函数] this.name:', this.name); // 'Object'
    
    setTimeout(function() {
      console.log('[普通函数内部] this.name:', this.name); // undefined
      // this 丢失了！
    }, 100);
  },
  
  // 箭头函数：this 继承外层作用域
  arrowMethod: function() {
    console.log('[箭头外层] this.name:', this.name); // 'Object'
    
    setTimeout(() => {
      console.log('[箭头内部] this.name:', this.name); // 'Object'
      // this 保持不变！
    }, 100);
  }
};

obj.regularMethod();
obj.arrowMethod();
```

**何时使用**：
- ✅ 箭头函数：回调函数、数组方法、不需要自己的 this
- ✅ 普通函数：对象方法、构造函数、需要 arguments 对象

---

### Q5: 什么是闭包？为什么重要？

**简单版**：  
闭包就是函数可以"记住"它被创建时的环境。

**比喻解释**：
```
想象一个背包：
- 函数创建时，它把当前环境打包进背包
- 即使离开了原来的地方，背包还是跟着它
- 它可以随时打开背包，使用里面的东西
```

**代码示例**：
```javascript
function createCounter() {
  let count = 0; // 这个变量被"关闭"在函数内
  
  return function() {
    count++;
    console.log('[闭包] 当前计数:', count);
    return count;
  };
}

const counter1 = createCounter();
const counter2 = createCounter();

counter1(); // 1
counter1(); // 2
console.log('[闭包] counter1 有自己的 count');

counter2(); // 1
counter2(); // 2
console.log('[闭包] counter2 有自己独立的 count');
```

**实际应用**：
```javascript
// 应用1：数据私有化
function createBankAccount(initialBalance) {
  let balance = initialBalance; // 私有变量
  
  return {
    deposit(amount) {
      balance += amount;
      console.log(`[存款] 存入 ${amount}, 余额: ${balance}`);
    },
    
    withdraw(amount) {
      if (amount <= balance) {
        balance -= amount;
        console.log(`[取款] 取出 ${amount}, 余额: ${balance}`);
      } else {
        console.log('[取款] 余额不足');
      }
    },
    
    getBalance() {
      console.log('[查询] 当前余额:', balance);
      return balance;
    }
  };
}

const myAccount = createBankAccount(1000);
myAccount.deposit(500);   // 存入 500, 余额: 1500
myAccount.withdraw(300);  // 取出 300, 余额: 1200
// 无法直接访问 balance 变量！
```

**常见问题**：
```javascript
// 问题：循环中的闭包
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log('[错误] i =', i); // 全部输出 3
  }, 100);
}

// 解决方案1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log('[正确] i =', i); // 输出 0, 1, 2
  }, 100);
}

// 解决方案2：立即执行函数
for (var i = 0; i < 3; i++) {
  (function(i) {
    setTimeout(function() {
      console.log('[IIFE] i =', i); // 输出 0, 1, 2
    }, 100);
  })(i);
}
```

---

## 异步编程

### Q6: Promise、async/await 和回调函数的区别？

**简单版**：  
这是处理异步操作的三种方式，一代比一代好用。

**演进历史**：
```javascript
// 第一代：回调函数（Callback Hell 回调地狱）
getData(function(data1) {
  console.log('[回调1] 获取数据:', data1);
  
  processData(data1, function(data2) {
    console.log('[回调2] 处理数据:', data2);
    
    saveData(data2, function(result) {
      console.log('[回调3] 保存结果:', result);
      // 嵌套太深，难以维护！
    });
  });
});

// 第二代：Promise（链式调用）
getData()
  .then(data1 => {
    console.log('[Promise1] 获取数据:', data1);
    return processData(data1);
  })
  .then(data2 => {
    console.log('[Promise2] 处理数据:', data2);
    return saveData(data2);
  })
  .then(result => {
    console.log('[Promise3] 保存结果:', result);
  })
  .catch(error => {
    console.log('[Promise] 错误处理:', error);
  });

// 第三代：async/await（看起来像同步代码）
async function processEverything() {
  try {
    const data1 = await getData();
    console.log('[Async1] 获取数据:', data1);
    
    const data2 = await processData(data1);
    console.log('[Async2] 处理数据:', data2);
    
    const result = await saveData(data2);
    console.log('[Async3] 保存结果:', result);
    
  } catch (error) {
    console.log('[Async] 错误处理:', error);
  }
}
```

**何时使用**：
- 回调：简单的一次性异步操作（现在很少用）
- Promise：需要链式调用、并行处理
- async/await：复杂的异步流程（推荐！）

---

### Q7: 如何处理多个并发请求？

**问题场景**：  
需要同时发起多个API请求，等它们都完成。

**解决方案**：
```javascript
// ❌ 错误：串行执行（慢）
async function fetchDataSerial() {
  console.log('[串行] 开始:', Date.now());
  
  const user = await fetchUser();      // 等1秒
  const posts = await fetchPosts();    // 再等1秒
  const comments = await fetchComments(); // 再等1秒
  
  console.log('[串行] 总耗时: 约3秒');
  return { user, posts, comments };
}

// ✅ 正确：并行执行（快）
async function fetchDataParallel() {
  console.log('[并行] 开始:', Date.now());
  
  // 同时发起三个请求
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  
  console.log('[并行] 总耗时: 约1秒');
  return { user, posts, comments };
}
```

**Promise 组合方法**：
```javascript
// Promise.all - 全部成功才成功
Promise.all([promise1, promise2, promise3])
  .then(([result1, result2, result3]) => {
    console.log('[All] 全部成功');
  })
  .catch(error => {
    console.log('[All] 有一个失败就会进这里');
  });

// Promise.race - 最快的那个决定结果
Promise.race([promise1, promise2, promise3])
  .then(result => {
    console.log('[Race] 最快的结果:', result);
  });

// Promise.allSettled - 等全部完成（无论成功失败）
Promise.allSettled([promise1, promise2, promise3])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`[AllSettled] ${index} 成功:`, result.value);
      } else {
        console.log(`[AllSettled] ${index} 失败:`, result.reason);
      }
    });
  });
```

---

## TypeScript 类型系统

### Q8: TypeScript 的 `interface` 和 `type` 有什么区别？

**简单版**：  
95% 的情况下它们可以互换使用。

**主要区别**：
```typescript
// 1. interface 可以被扩展（extends）
interface Animal {
  name: string;
}

interface Dog extends Animal {
  bark(): void;
}

// type 使用交叉类型（&）
type Animal = {
  name: string;
};

type Dog = Animal & {
  bark(): void;
};

console.log('[区别1] 扩展方式不同');

// 2. interface 可以重复声明（自动合并）
interface User {
  name: string;
}

interface User {
  age: number;
}

// 合并后：User { name: string; age: number }
console.log('[区别2] interface 支持声明合并');

// 3. type 可以使用联合类型
type Status = 'pending' | 'success' | 'error';
type ID = string | number;

console.log('[区别3] type 支持更复杂的类型操作');
```

**推荐用法**：
- ✅ 定义对象形状：用 `interface`
- ✅ 联合类型、工具类型：用 `type`
- ✅ 公共 API：用 `interface`（方便扩展）

---

### Q9: 什么时候使用 `any`、`unknown` 和 `never`？

**类型安全性排序**：
```
never > unknown > any
(最安全)        (最不安全)
```

**详细解释**：
```typescript
// any: "我不想要类型检查"（不推荐）
let value1: any = 'hello';
value1.foo.bar.baz; // ❌ 没有类型检查，运行时错误
console.log('[any] 跳过所有类型检查');

// unknown: "我不知道类型，但要安全使用"
let value2: unknown = 'hello';
// value2.toUpperCase(); // ❌ 错误：需要先检查类型

if (typeof value2 === 'string') {
  value2.toUpperCase(); // ✅ 类型收窄后可以使用
}
console.log('[unknown] 需要类型检查才能使用');

// never: "这个值永远不应该存在"
function throwError(message: string): never {
  throw new Error(message);
  // 永远不会正常返回
}

function infiniteLoop(): never {
  while (true) {
    // 永远不会结束
  }
}

console.log('[never] 表示不可能的值');
```

**实际应用**：
```typescript
// unknown 的典型用法：处理不确定的输入
function parseJSON(jsonString: string): unknown {
  return JSON.parse(jsonString);
}

const result = parseJSON('{"name":"Alice"}');

// 必须验证类型
if (typeof result === 'object' && result !== null && 'name' in result) {
  console.log('[安全] 姓名:', result.name);
}

// never 的典型用法：穷举检查
type Shape = Circle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    default:
      // 如果有遗漏的类型，这里会报错
      const _exhaustive: never = shape;
      throw new Error('未处理的形状类型');
  }
}
```

---

## 调试和错误处理

### Q10: 如何有效地调试 JavaScript 代码？

**基础方法**：
```javascript
// 方法1：console.log（最常用）
function calculateTotal(items) {
  console.log('[DEBUG] 输入items:', items);
  
  let total = 0;
  for (const item of items) {
    console.log('[DEBUG] 当前item:', item);
    total += item.price;
    console.log('[DEBUG] 累计total:', total);
  }
  
  console.log('[DEBUG] 最终结果:', total);
  return total;
}

// 方法2：console.table（查看数组/对象）
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
];
console.table(users);
console.log('[DEBUG] console.table 更直观');

// 方法3：console.trace（查看调用栈）
function deep3() {
  console.trace('[DEBUG] 调用栈:');
}
function deep2() { deep3(); }
function deep1() { deep2(); }
deep1();
```

**进阶技巧**：
```javascript
// 技巧1：条件断点（只在特定条件下打印）
function processItem(item, index) {
  if (index === 5) {
    debugger; // 浏览器会在这里暂停
  }
  
  // 或者
  if (item.price > 1000) {
    console.log('[ALERT] 高价商品:', item);
  }
}

// 技巧2：分组日志
console.group('[处理订单]');
console.log('订单ID:', orderId);
console.log('用户:', user);
console.log('商品:', items);
console.groupEnd();

// 技巧3：性能测量
console.time('[性能] 数据处理');
processLargeData();
console.timeEnd('[性能] 数据处理'); // 显示耗时
```

**浏览器开发者工具**：
```
1. Sources 面板：设置断点
2. Network 面板：查看请求
3. Console 面板：执行代码
4. Performance 面板：性能分析
```

---

### Q11: 如何优雅地处理错误？

**基本原则**：
```javascript
// ❌ 错误：忽略错误
async function fetchData() {
  const data = await api.getData(); // 如果失败会怎样？
  return data;
}

// ✅ 正确：处理错误
async function fetchData() {
  try {
    console.log('[API] 开始请求数据');
    const data = await api.getData();
    console.log('[API] 数据获取成功');
    return data;
    
  } catch (error) {
    console.error('[API] 请求失败:', error);
    // 根据错误类型采取不同措施
    if (error.code === 'NETWORK_ERROR') {
      console.log('[处理] 网络错误，稍后重试');
      throw new Error('网络连接失败，请检查网络');
    } else {
      console.log('[处理] 其他错误');
      throw error;
    }
  }
}
```

**错误分类处理**：
```javascript
// 自定义错误类
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    console.log('[Error] 创建验证错误:', message);
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
    console.log('[Error] 创建网络错误:', message);
  }
}

// 统一错误处理
function handleError(error) {
  console.log('[ErrorHandler] 错误类型:', error.name);
  
  if (error instanceof ValidationError) {
    console.log('[Handler] 显示表单错误提示');
  } else if (error instanceof NetworkError) {
    console.log('[Handler] 显示网络错误提示');
  } else {
    console.log('[Handler] 显示通用错误提示');
  }
}
```

---

## 工具和环境

### Q12: 如何配置 TypeScript 项目？

**最小配置**：
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

**推荐配置（详细）**：
```json
{
  "compilerOptions": {
    // 编译目标
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    
    // 输出设置
    "outDir": "./dist",
    "rootDir": "./src",
    
    // 严格检查
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    
    // 模块解析
    "esModuleInterop": true,
    "moduleResolution": "node",
    
    // 其他
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Q13: npm 和 yarn 有什么区别？

**简单版**：  
它们都是包管理器，功能类似，选一个用就行。

**对比**：
```bash
# 安装依赖
npm install package-name
yarn add package-name

# 全局安装
npm install -g package-name
yarn global add package-name

# 移除依赖
npm uninstall package-name
yarn remove package-name

# 安装所有依赖
npm install
yarn install  # 或直接 yarn
```

**性能对比**：
```
yarn 特点：
✅ 更快（并行安装）
✅ 离线模式
✅ 确定性（yarn.lock）

npm 特点：
✅ 内置于 Node.js
✅ 更广泛的使用
✅ npm 7+ 速度已接近 yarn
```

**推荐**：  
新项目用 npm（简单），团队项目看团队习惯。

---

## 总结

记住：**没有愚蠢的问题，只有不问的疑惑**。

遇到问题时：
1. 先查看错误信息
2. 使用 console.log 调试
3. 查阅官方文档
4. 搜索 Stack Overflow
5. 向教学代理提问

每个问题都是学习的机会！

---

## 补充资源

- [MDN Web Docs](https://developer.mozilla.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [JavaScript.info](https://javascript.info/)
