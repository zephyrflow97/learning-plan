# 第 4 章:异步编程入门

在本章中,你将学习 JavaScript 中最重要的概念之一——异步编程。你将理解为什么需要异步、如何使用回调函数、Promise 和 async/await,以及如何处理异步操作中的错误。

## 📖 本章内容

1. [为什么需要异步](#1-为什么需要异步)
2. [回调函数](#2-回调函数)
3. [Promise 基础](#3-promise-基础)
4. [async/await](#4-asyncawait)
5. [错误处理](#5-错误处理)
6. [并发控制](#6-并发控制)
7. [实战示例](#7-实战示例)
8. [最佳实践](#8-最佳实践)
9. [章节练习](#9-章节练习)

---

## 1. 为什么需要异步

### 1.1 同步 vs 异步

> **🎭 The Drama: The Lonely Single Thread**
> 想象 JavaScript 主线程是一个**只有一只手的厨师**（单线程）。
> 他一次只能切一个洋葱（执行一个任务）。无论顾客（用户）催得再急，他也不能同时炒菜和洗碗。
> 
> *   **同步 (Synchronous)**: 厨师切洋葱时，全餐厅的人都得盯着他看，不能点菜，不能上厕所，直到他切完。页面卡死（Freezing）。
> *   **异步 (Asynchronous)**: 厨师把煲汤的任务交给**电饭煲**（浏览器内核/Node API），定好闹钟（回调），然后立刻转头去切洋葱。
> *   **Event Loop**: 就是那个**强迫症检票员**。他永远在盯着电饭煲和厨师。只有当厨师手里的活干完了（Call Stack 空了），他才会大喊：“汤好了！（执行回调）”。

```javascript
/**
 * 同步代码 vs 异步代码
 */

console.log('=== 同步 vs 异步 ===\n');

// 同步代码 - 按顺序执行,会阻塞后续代码
console.log('同步示例:');
console.log('  1. 开始');
console.log('  2. 执行任务');
console.log('  3. 结束');

// 异步代码 - 不阻塞后续代码
console.log('\n异步示例:');
console.log('  1. 开始');

setTimeout(() => {
  console.log('  2. 异步任务完成');
}, 1000);

console.log('  3. 继续执行'); // 不会等待 setTimeout

// 输出顺序:
// 1. 开始
// 3. 继续执行
// 2. 异步任务完成 (1秒后)
```

> ### 🎓 CS Master's Bridge: 协作式多任务 (Cooperative Multitasking)
> JavaScript 是**单线程**的。这意味着没有 `std::thread` 或 `pthread_create`。
>
> 这里的机制类似于操作系统中的**协作式多任务**（Cooperative Multitasking）或嵌入式系统中的**中断处理**（Interrupt Handling）。
> *   **Main Thread**: 执行同步代码（CPU 密集型）。
> *   **Event Loop**: 这是一个无限循环 `while(true) { check_queue(); }`。
> *   **Task Queue**: `setTimeout` 并没有让线程“休眠”。它只是告诉宿主环境（浏览器/Node）：“1秒后，把这个回调函数扔进任务队列”。
> *   **Execution**: 当主线程空闲（Call Stack 为空）时，Event Loop 才会从队列中取出任务执行。
>
> **🔧 Under the Hood: Macrotasks vs Microtasks**
> V8 实际上维护了两个队列：
> 1.  **Macrotask Queue (Task Queue)**: `setTimeout`, `setInterval`, I/O, UI Rendering.
> 2.  **Microtask Queue**: `Promise.then`, `queueMicrotask`, `MutationObserver`.
>
> **优先级规则**:
> *   每次 Event Loop 循环（Tick），先执行一个 Macrotask。
> *   然后**清空整个 Microtask Queue**。
> *   这意味着 Microtasks 总是比 Macrotasks 优先执行，甚至可以“饿死” Event Loop（如果你无限递归地创建 Microtasks）。
>
> ```javascript
> console.log('1');
> setTimeout(() => console.log('4'), 0); // Macrotask
> Promise.resolve().then(() => console.log('3')); // Microtask
> console.log('2');
> // Output: 1 -> 2 -> 3 -> 4
> ```

### 1.2 异步的应用场景

```javascript
/**
 * 异步编程的常见场景
 */

console.log('\n=== 异步应用场景 ===\n');

// 场景1: 定时器
console.log('场景1: 定时器');
setTimeout(() => {
  console.log('  定时器: 1秒后执行');
}, 1000);

// 场景2: 事件监听(在浏览器中)
// document.addEventListener('click', () => {
//   console.log('  用户点击了页面');
// });

// 场景3: 网络请求(模拟)
console.log('\n场景2: 网络请求(模拟)');
console.log('  发送请求...');

// 模拟异步网络请求
function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ id: 1, name: 'Alice' });
    }, 1000);
  });
}

fetchData().then(data => {
  console.log('  收到数据:', data);
});

console.log('  请求已发出,继续执行其他任务');

// 场景4: 文件读写(Node.js)
// const fs = require('fs');
// fs.readFile('file.txt', (err, data) => {
//   console.log('  文件内容:', data);
// });
```

---

## 2. 回调函数

### 2.1 什么是回调函数?

> **📞 The Metaphor: "Don't Call Us, We'll Call You"**
> 回调函数 (Callback) 就像是**好莱坞原则**。
> 你去面试演员，导演不会让你在现场等结果（阻塞）。
> 导演说：“你留个电话号码（Callback），有结果了我打给你。”
> 你就可以回家做别的事了（异步）。
> 当决定做好了（Event Triggered），导演就会拨通那个电话（Execute Callback）。
> 
> **控制反转 (Inversion of Control)**: 你把执行后续逻辑的**控制权**交给了导演（第三方库/运行时），而不是自己掌握。

回调函数是作为参数传递给另一个函数的函数,在特定事件发生或任务完成时被调用。

```javascript
/**
 * 回调函数基础
 */

console.log('\n\n=== 回调函数 ===\n');

// 简单的回调示例
function greet(name, callback) {
  console.log(`Hello, ${name}!`);
  callback();
}

greet('Alice', () => {
  console.log('回调函数被执行了');
});

// 带参数的回调
console.log('\n带参数的回调:');
function calculate(a, b, operation) {
  const result = operation(a, b);
  console.log(`计算结果: ${result}`);
  return result;
}

calculate(10, 5, (x, y) => x + y);  // 加法
calculate(10, 5, (x, y) => x - y);  // 减法
calculate(10, 5, (x, y) => x * y);  // 乘法
```

### 2.2 异步回调

```javascript
/**
 * 异步回调
 */

console.log('\n=== 异步回调 ===\n');

// 模拟异步操作
function loadUserData(userId, callback) {
  console.log(`加载用户 ${userId} 的数据...`);
  
  setTimeout(() => {
    const user = {
      id: userId,
      name: 'Alice',
      email: 'alice@example.com'
    };
    
    console.log('数据加载完成');
    callback(null, user); // 第一个参数是错误,第二个是数据
  }, 1000);
}

// 使用异步回调
console.log('开始加载');
loadUserData(1, (error, user) => {
  if (error) {
    console.log('错误:', error);
  } else {
    console.log('用户数据:', user);
  }
});
console.log('继续执行其他任务');
```

### 2.3 回调地狱

> **👹 The Horror: The Pyramid of Doom**
> 欢迎来到 **Callback Hell**，也被称为“末日金字塔”。
> 这里的代码形状像一个向右倒下的金字塔，每一层缩进都是通向深渊的台阶。
> 在这里，错误处理（Error Handling）变成了不可能完成的任务。
> 如果第 10 层回调抛出了错误，第 1 层的 `try-catch` 根本听不到它的哀嚎——因为它们不在同一个时空（Tick）里。

```javascript
/**
 * 回调地狱 (Callback Hell)
 * 多层嵌套的回调导致代码难以阅读和维护
 */

console.log('\n=== 回调地狱 ===\n');

// 模拟多个异步操作
function step1(callback) {
  console.log('执行步骤 1...');
  setTimeout(() => {
    console.log('步骤 1 完成');
    callback(null, '步骤1结果');
  }, 1000);
}

function step2(data, callback) {
  console.log(`执行步骤 2,数据: ${data}`);
  setTimeout(() => {
    console.log('步骤 2 完成');
    callback(null, '步骤2结果');
  }, 1000);
}

function step3(data, callback) {
  console.log(`执行步骤 3,数据: ${data}`);
  setTimeout(() => {
    console.log('步骤 3 完成');
    callback(null, '步骤3结果');
  }, 1000);
}

// ❌ 回调地狱 - 难以阅读
step1((err, result1) => {
  if (err) {
    console.log('错误:', err);
  } else {
    step2(result1, (err, result2) => {
      if (err) {
        console.log('错误:', err);
      } else {
        step3(result2, (err, result3) => {
          if (err) {
            console.log('错误:', err);
          } else {
            console.log('所有步骤完成:', result3);
          }
        });
      }
    });
  }
});

// ⚠️ 这种嵌套结构难以维护,这就是为什么需要 Promise
```

> ### 🎭 Geek & Fun: 盗梦空间 (Inception)
> 欢迎来到 **Callback Hell**（回调地狱），也被称为 "Pyramid of Doom"（末日金字塔）。
>
> 这就像是俄罗斯套娃，或者电影《盗梦空间》：
> *   第一层梦境：`step1`
> *   第二层梦境：`step2`
> *   第三层梦境：`step3`
>
> 如果你在第 3 层抛出一个异常，第 1 层的 `try-catch` 是捕获不到的！因为第 3 层是在未来的某个 Event Loop tick 中执行的，那时的调用栈早已重置。
> **C++ 类比**: 这就像是把整个程序的控制流写在了一堆嵌套的 lambda 表达式里，也就是所谓的 **Continuation-Passing Style (CPS)**。虽然在函数式编程中很常见，但在命令式语言中简直是灾难。

---

## 3. Promise 基础

### 3.1 什么是 Promise?

> **📦 The Metaphor: Schrödinger's Box**
> Promise 是一个**薛定谔的盒子**。
> 当你拿到它时，你不知道里面是**死猫**（Rejected Error）还是**活猫**（Resolved Value）。
> 它的状态是 `Pending`（叠加态）。
> 但与量子力学不同的是，这个盒子一旦打开（Settled），状态就**坍缩**了，永远不会再变。
> 你不能让死猫复活，也不能让活猫死去。这就是 **Immutability** 的力量。

Promise 是一个代表异步操作最终完成或失败的对象。它有三种状态:
- **Pending**(进行中): 初始状态
- **Fulfilled**(已成功): 操作成功完成
- **Rejected**(已失败): 操作失败

```javascript
/**
 * Promise 基础
 */

console.log('\n\n=== Promise 基础 ===\n');

// 创建一个简单的 Promise
const simplePromise = new Promise((resolve, reject) => {
  console.log('Promise 创建,开始异步操作');
  
  setTimeout(() => {
    const success = true;
    
    if (success) {
      resolve('操作成功!'); // 成功时调用 resolve
    } else {
      reject('操作失败!');  // 失败时调用 reject
    }
  }, 1000);
});

console.log('Promise 已创建,状态: pending');

> ### 🎓 CS Master's Bridge: Future & State Machine
> Promise 在计算机科学中并不是新概念。
> *   **C++**: 对应 `std::future` 和 `std::promise`。
> *   **Java**: 对应 `CompletableFuture`。
> *   **C#**: 对应 `Task`。
>
> 本质上，Promise 是一个**状态机 (State Machine)**。
> 它只有三种状态转换：
> 1.  `Pending` → `Fulfilled` (One-way ticket)
> 2.  `Pending` → `Rejected` (One-way ticket)
>
> 一旦状态改变，它就**不可变 (Immutable)** 了。这解决了回调地狱中“控制反转”的问题——你不再把控制权交给第三方库的回调，而是拿回一个代表未来值的对象（Future Value）。

// 使用 Promise
simplePromise
  .then(result => {
    console.log('成功:', result);
  })
  .catch(error => {
    console.log('失败:', error);
  });

console.log('继续执行其他代码');
```

### 3.2 Promise 的基本用法

```javascript
/**
 * Promise 的基本操作
 */

console.log('\n=== Promise 基本用法 ===\n');

// 模拟异步操作的函数
function fetchUser(userId) {
  console.log(`获取用户 ${userId} 的信息...`);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId > 0) {
        const user = {
          id: userId,
          name: `User${userId}`,
          email: `user${userId}@example.com`
        };
        console.log('用户信息获取成功');
        resolve(user);
      } else {
        console.log('用户 ID 无效');
        reject(new Error('Invalid user ID'));
      }
    }, 1000);
  });
}

// 使用 Promise
console.log('开始请求');

fetchUser(1)
  .then(user => {
    console.log('收到用户:', user);
    return user.name; // then 可以返回值给下一个 then
  })
  .then(name => {
    console.log('用户名:', name);
  })
  .catch(error => {
    console.log('捕获错误:', error.message);
  })
  .finally(() => {
    console.log('操作完成(无论成功或失败)');
  });
```

### 3.3 Promise 链式调用

> **⛓️ The Metaphor: The Assembly Line (流水线)**
> Promise 链就像是工厂里的**流水线**。
> *   `.then()` 是流水线上的一个个**工位**。
> *   上一个工位处理完原料（Data），把半成品传给下一个工位。
> *   如果中间任何一个工位出了问题（Error），流水线会紧急停止，直接把废品送到**检修区** (`.catch()`)。
> *   这比嵌套的回调（金字塔）优雅得多，因为它把“向右的缩进”变成了“向下的流动”。

```javascript
/**
 * Promise 链式调用
 * 解决回调地狱问题
 */

console.log('\n=== Promise 链式调用 ===\n');

// 将之前的回调地狱改为 Promise
function promiseStep1() {
  console.log('执行步骤 1...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('步骤 1 完成');
      resolve('步骤1结果');
    }, 1000);
  });
}

function promiseStep2(data) {
  console.log(`执行步骤 2,数据: ${data}`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('步骤 2 完成');
      resolve('步骤2结果');
    }, 1000);
  });
}

function promiseStep3(data) {
  console.log(`执行步骤 3,数据: ${data}`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('步骤 3 完成');
      resolve('步骤3结果');
    }, 1000);
  });
}

// ✅ 链式调用 - 清晰易读
promiseStep1()
  .then(result1 => {
    console.log('收到:', result1);
    return promiseStep2(result1);
  })
  .then(result2 => {
    console.log('收到:', result2);
    return promiseStep3(result2);
  })
  .then(result3 => {
    console.log('所有步骤完成:', result3);
  })
  .catch(error => {
    console.log('错误:', error);
  });
```

### 3.4 Promise 静态方法

```javascript
/**
 * Promise 的静态方法
 */

console.log('\n=== Promise 静态方法 ===\n');

// Promise.resolve() - 创建已成功的 Promise
console.log('Promise.resolve():');
const resolved = Promise.resolve('立即成功');
resolved.then(result => console.log('  结果:', result));

// Promise.reject() - 创建已失败的 Promise
console.log('\nPromise.reject():');
const rejected = Promise.reject('立即失败');
rejected.catch(error => console.log('  错误:', error));

// Promise.all() - 等待所有 Promise 完成
console.log('\nPromise.all():');

const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
  .then(results => {
    console.log('  所有完成:', results); // [1, 2, 3]
  });

// 模拟并行请求
console.log('\n并行请求示例:');

function fetchFromAPI(endpoint, delay) {
  console.log(`  请求: ${endpoint}`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`  ${endpoint} 完成`);
      resolve({ endpoint, data: `${endpoint} 的数据` });
    }, delay);
  });
}

Promise.all([
  fetchFromAPI('/users', 1000),
  fetchFromAPI('/posts', 800),
  fetchFromAPI('/comments', 600)
])
  .then(results => {
    console.log('  所有 API 请求完成:');
    results.forEach(r => console.log(`    - ${r.endpoint}:`, r.data));
  });

// Promise.race() - 返回第一个完成的 Promise
console.log('\nPromise.race():');

Promise.race([
  new Promise(resolve => setTimeout(() => resolve('快'), 500)),
  new Promise(resolve => setTimeout(() => resolve('慢'), 1000))
])
  .then(result => {
    console.log('  第一个完成:', result); // '快'
  });

> ### 🐛 Sherlock Mode: 竞态条件 (Race Conditions)
> `Promise.race` 是调试并发 Bug 的好帮手，但也容易引入 Bug。
>
> **经典陷阱**: 假设你用 `race` 来实现超时控制（网络请求 vs 5秒超时）。
> 如果超时先发生，网络请求 Promise **并没有被取消**！它依然在后台运行，依然会占用带宽，依然会尝试解析 JSON，甚至在将来抛出一个未捕获的异常。
>
> **解决方案**: 使用 `AbortController` (DOM API) 来真正地取消底层的网络请求，而不仅仅是忽略它的结果。这体现了资源管理的**RAII** (Resource Acquisition Is Initialization) 思想。

// Promise.allSettled() - 等待所有 Promise 结束(无论成功或失败)
console.log('\nPromise.allSettled():');

Promise.allSettled([
  Promise.resolve('成功1'),
  Promise.reject('失败'),
  Promise.resolve('成功2')
])
  .then(results => {
    console.log('  所有结束:');
    results.forEach((result, i) => {
      console.log(`    ${i + 1}. ${result.status}:`, result.value || result.reason);
    });
  });
```

---

## 4. async/await

### 4.1 什么是 async/await?

> **⏸️ The Metaphor: The Time Freeze**
> `async/await` 是 JavaScript 给开发者的一颗**时间暂停胶囊**。
> 当你写下 `await` 时，你并没有阻塞线程（厨师没有停下来发呆）。
> 相反，你把当前的函数**冻结**在时间里（保存上下文），然后把控制权交还给 Event Loop（厨师去干别的活了）。
> 当 Promise 完成时，JS 引擎会**解冻**这个函数，让它以为时间从未流逝，继续向下执行。
> 这就是**协程 (Coroutine)** 的魔法——让异步代码读起来像同步代码一样顺滑。

`async/await` 是基于 Promise 的语法糖,让异步代码看起来像同步代码,更易读易写。

```javascript
/**
 * async/await 基础
 */

console.log('\n\n=== async/await 基础 ===\n');

// async 函数总是返回 Promise
async function simpleAsync() {
  console.log('async 函数执行');
  return 'Hello'; // 自动包装在 Promise.resolve() 中
}

console.log('调用 async 函数');

> ### 🔧 Under the Hood: 协程 (Coroutines)
> `async/await` 看起来像魔法，但它其实是 **Generator + Promise** 的语法糖。
>
> 在底层，它实现了一个无栈协程（Stackless Coroutine）：
> 1.  `async` 函数被编译成一个状态机。
> 2.  `await` 关键字相当于一个 **Yield Point**。
> 3.  当遇到 `await p` 时，函数**暂停执行**，保存当前的寄存器和上下文（Context），并将控制权交还给 Event Loop。
> 4.  当 `p` resolve 时，Event Loop 恢复该函数的执行（Resume），就像什么都没发生过一样。
>
> **De-sugared Implementation (伪代码)**:
> ```javascript
> function asyncFn() {
>   return spawn(function* () { // Generator
>     console.log('start');
>     const result = yield fetchUser(); // Yield Point
>     console.log(result);
>   });
> }
> ```
> 这与 C++20 的 `co_await` 机制非常相似。
simpleAsync().then(result => {
  console.log('返回值:', result);
});

// await 等待 Promise 完成
async function waitExample() {
  console.log('\nawait 示例:');
  console.log('  开始等待...');
  
  const result = await new Promise(resolve => {
    setTimeout(() => {
      resolve('等待结束');
    }, 1000);
  });
  
  console.log('  结果:', result);
  console.log('  继续执行');
}

waitExample();
```

### 4.2 async/await vs Promise

```javascript
/**
 * async/await vs Promise 对比
 */

console.log('\n=== async/await vs Promise ===\n');

// Promise 方式
console.log('Promise 方式:');
function getUserWithPromise(userId) {
  return fetchUser(userId)
    .then(user => {
      console.log('  获取到用户:', user.name);
      return fetchUserPosts(userId);
    })
    .then(posts => {
      console.log('  获取到文章:', posts.length, '篇');
      return posts;
    });
}

// async/await 方式
console.log('\nasync/await 方式:');
async function getUserWithAsync(userId) {
  const user = await fetchUser(userId);
  console.log('  获取到用户:', user.name);
  
  const posts = await fetchUserPosts(userId);
  console.log('  获取到文章:', posts.length, '篇');
  
  return posts;
}

// 辅助函数
function fetchUser(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ id, name: 'Alice' });
    }, 500);
  });
}

function fetchUserPosts(userId) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, title: '文章1' },
        { id: 2, title: '文章2' }
      ]);
    }, 500);
  });
}

// 使用
// getUserWithPromise(1);
// getUserWithAsync(1);
```

### 4.3 async/await 的实际应用

```javascript
/**
 * async/await 实际应用
 */

console.log('\n=== async/await 实际应用 ===\n');

// 示例: 顺序执行多个异步操作
async function processUser(userId) {
  console.log(`处理用户 ${userId}:`);
  
  try {
    // 1. 获取用户信息
    console.log('  1. 获取用户信息...');
    const user = await fetchUser(userId);
    console.log(`     用户: ${user.name}`);
    
    // 2. 获取用户文章
    console.log('  2. 获取用户文章...');
    const posts = await fetchUserPosts(userId);
    console.log(`     文章: ${posts.length} 篇`);
    
    // 3. 获取第一篇文章的评论
    console.log('  3. 获取评论...');
    const comments = await fetchComments(posts[0].id);
    console.log(`     评论: ${comments.length} 条`);
    
    console.log('  处理完成!\n');
    
    return {
      user,
      postsCount: posts.length,
      commentsCount: comments.length
    };
    
  } catch (error) {
    console.log('  处理失败:', error.message);
    throw error;
  }
}

function fetchComments(postId) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, text: '评论1' },
        { id: 2, text: '评论2' },
        { id: 3, text: '评论3' }
      ]);
    }, 500);
  });
}

// 使用
// processUser(1);
```

---

## 5. 错误处理

> **📉 The Law: Murphy's Law (墨菲定律)**
> "凡是可能出错的事，就一定会出错。"
> 在异步编程中，这句话是铁律。网络会断，服务器会挂，JSON 会解析失败。
> 如果你只写了 `.then()` 而没写 `.catch()`，你就是在**裸奔**。
> 你的程序不是在处理“成功”，而是在处理“异常”。成功只是异常处理流程中的一个特例。
> **防御性编程**：假设一切都会失败，然后编写代码来处理这些失败。

### 5.1 Promise 错误处理

```javascript
/**
 * Promise 错误处理
 */

console.log('\n\n=== Promise 错误处理 ===\n');

// 使用 .catch() 捕获错误
function riskyOperation() {
  console.log('执行危险操作...');
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const random = Math.random();
      
      if (random > 0.5) {
        console.log('操作成功 (random:', random.toFixed(2), ')');
        resolve('成功');
      } else {
        console.log('操作失败 (random:', random.toFixed(2), ')');
        reject(new Error('Random failure'));
      }
    }, 1000);
  });
}

riskyOperation()
  .then(result => {
    console.log('结果:', result);
  })
  .catch(error => {
    console.log('捕获错误:', error.message);
  })
  .finally(() => {
    console.log('清理资源');
  });

// 链式调用中的错误传递
console.log('\n链式调用错误传递:');

Promise.resolve(1)
  .then(n => {
    console.log('  步骤1:', n);
    return n + 1;
  })
  .then(n => {
    console.log('  步骤2:', n);
    throw new Error('步骤2失败'); // 抛出错误
  })
  .then(n => {
    console.log('  步骤3:', n); // 不会执行
    return n + 1;
  })
  .catch(error => {
    console.log('  捕获:', error.message);
    return 0; // 可以返回值继续链式调用
  })
  .then(n => {
    console.log('  步骤4:', n); // 会执行
  });
```

### 5.2 async/await 错误处理

```javascript
/**
 * async/await 错误处理
 */

console.log('\n=== async/await 错误处理 ===\n');

// 使用 try-catch
async function safeOperation() {
  console.log('安全操作:');
  
  try {
    console.log('  尝试执行...');
    const result = await riskyOperation();
    console.log('  成功:', result);
    return result;
    
  } catch (error) {
    console.log('  捕获错误:', error.message);
    console.log('  执行备用方案');
    return '备用结果';
    
  } finally {
    console.log('  清理资源');
  }
}

// safeOperation();

// 多个 await 的错误处理
async function multipleOperations() {
  console.log('\n多个操作的错误处理:');
  
  try {
    console.log('  操作1...');
    const result1 = await riskyOperation();
    console.log('  操作1成功:', result1);
    
    console.log('  操作2...');
    const result2 = await riskyOperation();
    console.log('  操作2成功:', result2);
    
    console.log('  所有操作完成');
    
  } catch (error) {
    console.log('  某个操作失败:', error.message);
    // 第一个失败的操作会中断后续操作
  }
}

// multipleOperations();

// 并行操作的错误处理
async function parallelOperations() {
  console.log('\n并行操作的错误处理:');
  
  try {
    const results = await Promise.allSettled([
      riskyOperation(),
      riskyOperation(),
      riskyOperation()
    ]);
    
    console.log('  所有操作结束:');
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        console.log(`    操作${i + 1}: ✅ ${result.value}`);
      } else {
        console.log(`    操作${i + 1}: ❌ ${result.reason.message}`);
      }
    });
    
  } catch (error) {
    console.log('  意外错误:', error.message);
  }
}

// parallelOperations();
```

---

## 6. 并发控制

### 6.1 并行 vs 串行

```javascript
/**
 * 并行 vs 串行执行
 */

console.log('\n\n=== 并行 vs 串行 ===\n');

// 模拟异步任务
function task(name, duration) {
  console.log(`  ${name} 开始 (耗时 ${duration}ms)`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`  ${name} 完成`);
      resolve(name);
    }, duration);
  });
}

// 串行执行 - 一个接一个
async function sequential() {
  console.log('串行执行:');
  const start = Date.now();
  
  await task('任务1', 1000);
  await task('任务2', 1000);
  await task('任务3', 1000);
  
  const duration = Date.now() - start;
  console.log(`总耗时: ${duration}ms\n`);
}

// 并行执行 - 同时进行
async function parallel() {
  console.log('并行执行:');
  const start = Date.now();
  
  await Promise.all([
    task('任务A', 1000),
    task('任务B', 1000),
    task('任务C', 1000)
  ]);
  
  const duration = Date.now() - start;
  console.log(`总耗时: ${duration}ms\n`);
}

// 运行示例
// sequential(); // 约 3000ms
// setTimeout(() => parallel(), 3500); // 约 1000ms
```

### 6.2 控制并发数量

```javascript
/**
 * 限制并发数量
 * 防止同时发起过多请求
 */

console.log('=== 限制并发数量 ===\n');

// 并发控制函数
async function limitConcurrency(tasks, limit) {
  console.log(`并发控制: 最多 ${limit} 个任务同时执行`);
  
  const results = [];
  const executing = [];
  
  for (const [index, task] of tasks.entries()) {
    // 创建 Promise
    const promise = Promise.resolve().then(() => task(index));
    results.push(promise);
    
    // 如果达到并发限制,等待一个完成
    if (limit <= tasks.length) {
      const executing Promise = promise.then(() => {
        executing.splice(executing.indexOf(executingPromise), 1);
      });
      executing.push(executingPromise);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  return Promise.all(results);
}

// 测试任务
function createTask(duration) {
  return async (index) => {
    console.log(`  任务 ${index + 1} 开始 (${duration}ms)`);
    await new Promise(resolve => setTimeout(resolve, duration));
    console.log(`  任务 ${index + 1} 完成`);
    return `结果${index + 1}`;
  };
}

// 示例: 10 个任务,最多 3 个并发
const tasks = Array(10).fill(null).map(() => createTask(1000));

// limitConcurrency(tasks, 3).then(results => {
//   console.log('所有任务完成:', results);
// });
```

---

## 7. 实战示例

### 示例1: 数据获取和处理

```javascript
/**
 * 实战示例: 数据获取和处理
 * 模拟从API获取数据并处理
 */

console.log('\n\n=== 实战示例: 数据获取 ===\n');

// 模拟 API 调用
const API = {
  fetchUser(id) {
    console.log(`  API: 获取用户 ${id}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id,
          name: `User${id}`,
          email: `user${id}@example.com`,
          postIds: [1, 2, 3]
        });
      }, 500);
    });
  },
  
  fetchPost(id) {
    console.log(`  API: 获取文章 ${id}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id,
          title: `Post ${id}`,
          content: `Content of post ${id}`,
          likes: Math.floor(Math.random() * 100)
        });
      }, 300);
    });
  }
};

// 获取用户及其所有文章
async function getUserWithPosts(userId) {
  console.log(`获取用户 ${userId} 的完整信息:\n`);
  
  try {
    // 1. 获取用户信息
    const user = await API.fetchUser(userId);
    console.log(`\n获取到用户: ${user.name}`);
    
    // 2. 并行获取所有文章
    console.log(`\n获取用户的 ${user.postIds.length} 篇文章:`);
    const posts = await Promise.all(
      user.postIds.map(postId => API.fetchPost(postId))
    );
    
    // 3. 处理数据
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    
    console.log(`\n处理完成:`);
    console.log(`  用户: ${user.name}`);
    console.log(`  文章数: ${posts.length}`);
    console.log(`  总点赞: ${totalLikes}`);
    
    return {
      user,
      posts,
      totalLikes
    };
    
  } catch (error) {
    console.log('错误:', error.message);
    throw error;
  }
}

// getUserWithPosts(1);
```

### 示例2: 重试机制

```javascript
/**
 * 实战示例: 自动重试机制
 */

console.log('\n=== 实战示例: 重试机制 ===\n');

// 带重试的异步函数
async function retry(fn, maxAttempts = 3, delay = 1000) {
  console.log(`重试配置: 最多 ${maxAttempts} 次,间隔 ${delay}ms`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\n尝试 ${attempt}/${maxAttempts}:`);
      const result = await fn();
      console.log('  成功!');
      return result;
      
    } catch (error) {
      console.log(`  失败: ${error.message}`);
      
      if (attempt === maxAttempts) {
        console.log('  已达最大重试次数');
        throw error;
      }
      
      console.log(`  等待 ${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 不稳定的操作(模拟)
let attemptCount = 0;
function unstableOperation() {
  attemptCount++;
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 前两次失败,第三次成功
      if (attemptCount < 3) {
        reject(new Error(`Attempt ${attemptCount} failed`));
      } else {
        resolve('Operation succeeded');
      }
    }, 500);
  });
}

// 使用重试
// retry(() => unstableOperation(), 3, 1000)
//   .then(result => console.log('\n最终结果:', result))
//   .catch(error => console.log('\n最终失败:', error.message));
```

### 示例3: 超时控制

```javascript
/**
 * 实战示例: 超时控制
 */

console.log('\n=== 实战示例: 超时控制 ===\n');

// 带超时的 Promise
function withTimeout(promise, timeoutMs) {
  console.log(`设置超时: ${timeoutMs}ms`);
  
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

// 慢操作
function slowOperation(duration) {
  console.log(`执行慢操作 (${duration}ms)...`);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('操作完成');
      resolve('Success');
    }, duration);
  });
}

// 测试超时
async function testTimeout() {
  console.log('测试1: 操作在超时前完成');
  try {
    const result = await withTimeout(slowOperation(1000), 2000);
    console.log('结果:', result);
  } catch (error) {
    console.log('错误:', error.message);
  }
  
  console.log('\n测试2: 操作超时');
  try {
    const result = await withTimeout(slowOperation(3000), 2000);
    console.log('结果:', result);
  } catch (error) {
    console.log('错误:', error.message);
  }
}

// testTimeout();
```

---

## 8. 最佳实践

### 8.1 优先使用 async/await

```javascript
/**
 * 优先使用 async/await
 */

console.log('\n\n=== 最佳实践 ===\n');

// ❌ 避免: 复杂的 Promise 链
function badExample() {
  return fetchUser(1)
    .then(user => {
      return fetchUserPosts(user.id)
        .then(posts => {
          return { user, posts };
        });
    })
    .then(data => {
      return processData(data);
    });
}

// ✅ 推荐: 使用 async/await
async function goodExample() {
  const user = await fetchUser(1);
  const posts = await fetchUserPosts(user.id);
  return processData({ user, posts });
}

function processData(data) {
  return Promise.resolve(data);
}
```

### 8.2 合理使用并行

```javascript
/**
 * 合理使用并行执行
 */

console.log('=== 并行执行 ===\n');

// ❌ 避免: 不必要的串行
async function inefficient() {
  const user = await fetchUser(1);
  const settings = await fetchSettings(1);
  const profile = await fetchProfile(1);
  return { user, settings, profile };
}

// ✅ 推荐: 并行执行独立操作
async function efficient() {
  const [user, settings, profile] = await Promise.all([
    fetchUser(1),
    fetchSettings(1),
    fetchProfile(1)
  ]);
  return { user, settings, profile };
}

function fetchSettings(id) {
  return Promise.resolve({ theme: 'dark' });
}

function fetchProfile(id) {
  return Promise.resolve({ bio: 'Bio' });
}
```

### 8.3 始终处理错误

```javascript
/**
 * 始终处理错误
 */

console.log('=== 错误处理 ===\n');

// ❌ 避免: 忽略错误
async function badErrorHandling() {
  const data = await fetchData(); // 如果失败,整个应用可能崩溃
  return data;
}

// ✅ 推荐: 处理所有可能的错误
async function goodErrorHandling() {
  try {
    const data = await fetchData();
    return { success: true, data };
  } catch (error) {
    console.log('获取数据失败:', error.message);
    return { success: false, error: error.message };
  }
}

function fetchData() {
  return Promise.reject(new Error('Network error'));
}
```

### 8.4 避免在循环中使用 await

```javascript
/**
 * 避免在循环中不必要的 await
 */

console.log('=== 循环中的 await ===\n');

const ids = [1, 2, 3, 4, 5];

// ❌ 避免: 串行执行所有请求
async function slowFetch() {
  const results = [];
  for (const id of ids) {
    const user = await fetchUser(id); // 每次都等待
    results.push(user);
  }
  return results;
}

// ✅ 推荐: 并行执行
async function fastFetch() {
  return Promise.all(ids.map(id => fetchUser(id)));
}

// ⚠️ 注意: 如果确实需要串行(例如有依赖关系),才使用循环中的 await
async function sequentialWhenNeeded() {
  const results = [];
  for (const id of ids) {
    const previous = results[results.length - 1];
    // 假设每个请求依赖前一个结果
    const user = await fetchUserDependent(id, previous);
    results.push(user);
  }
  return results;
}

function fetchUserDependent(id, previous) {
  return fetchUser(id);
}
```

---

## 9. 章节练习

### 练习1: Promise 基础

编写一个函数 `delay(ms)`,返回一个在指定毫秒后 resolve 的 Promise。

<details>
<summary>查看答案</summary>

```javascript
function delay(ms) {
  console.log(`延迟 ${ms}ms`);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('延迟结束');
      resolve();
    }, ms);
  });
}

// 使用
delay(1000).then(() => {
  console.log('1秒后执行');
});

// 或者配合 async/await
async function test() {
  console.log('开始');
  await delay(1000);
  console.log('1秒后');
}
```
</details>

### 练习2: async/await

将以下 Promise 链式调用改写为 async/await:

```javascript
function getData() {
  return fetchUser(1)
    .then(user => fetchUserPosts(user.id))
    .then(posts => posts.filter(p => p.likes > 50))
    .then(popularPosts => console.log(popularPosts));
}
```

<details>
<summary>查看答案</summary>

```javascript
async function getData() {
  const user = await fetchUser(1);
  const posts = await fetchUserPosts(user.id);
  const popularPosts = posts.filter(p => p.likes > 50);
  console.log(popularPosts);
  return popularPosts;
}
```
</details>

### 练习3: 错误处理

实现一个 `safeExecute(fn)` 函数,执行异步函数并捕获错误,返回 `{ success, data, error }` 格式的结果。

<details>
<summary>查看答案</summary>

```javascript
async function safeExecute(fn) {
  console.log('安全执行函数');
  
  try {
    const data = await fn();
    console.log('执行成功');
    
    return {
      success: true,
      data,
      error: null
    };
    
  } catch (error) {
    console.log('执行失败:', error.message);
    
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

// 测试
async function test() {
  // 成功情况
  const result1 = await safeExecute(async () => {
    return '成功的数据';
  });
  console.log('结果1:', result1);
  
  // 失败情况
  const result2 = await safeExecute(async () => {
    throw new Error('Something went wrong');
  });
  console.log('结果2:', result2);
}
```
</details>

### 练习4: 并行请求

实现一个函数,并行获取多个用户的信息,但如果任何一个请求失败,返回已成功的结果。

<details>
<summary>查看答案</summary>

```javascript
async function fetchMultipleUsers(userIds) {
  console.log(`获取 ${userIds.length} 个用户`);
  
  const promises = userIds.map(id => 
    fetchUser(id).catch(error => {
      console.log(`用户 ${id} 获取失败:`, error.message);
      return null; // 失败时返回 null
    })
  );
  
  const results = await Promise.all(promises);
  
  // 过滤掉失败的结果
  const successfulUsers = results.filter(user => user !== null);
  
  console.log(`成功获取 ${successfulUsers.length}/${userIds.length} 个用户`);
  
  return successfulUsers;
}

// 测试
// fetchMultipleUsers([1, 2, 3, 4, 5]).then(users => {
//   console.log('用户列表:', users);
// });
```
</details>

### 练习5: 综合应用

实现一个函数 `fetchWithRetry(url, options)`,支持:
- 自动重试(最多 3 次)
- 超时控制(5 秒)
- 指数退避(重试间隔: 1s, 2s, 4s)

<details>
<summary>查看答案</summary>

```javascript
async function fetchWithRetry(url, options = {}) {
  const {
    maxRetries = 3,
    timeout = 5000,
    baseDelay = 1000
  } = options;
  
  console.log(`请求: ${url}`);
  console.log(`配置: 重试${maxRetries}次, 超时${timeout}ms\n`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试 ${attempt}/${maxRetries}`);
      
      // 创建带超时的请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('请求成功!\n');
      
      return data;
      
    } catch (error) {
      console.log(`失败: ${error.message}`);
      
      if (attempt === maxRetries) {
        console.log('已达最大重试次数\n');
        throw error;
      }
      
      // 指数退避
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`等待 ${delay}ms 后重试...\n`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 使用示例 (在浏览器中)
// fetchWithRetry('https://api.example.com/data', {
//   maxRetries: 3,
//   timeout: 5000
// })
//   .then(data => console.log('数据:', data))
//   .catch(error => console.log('最终失败:', error.message));
```
</details>

---

## 📚 下一步

恭喜你完成了第4章的学习!现在你已经掌握了:
- ✅ 异步编程的概念和必要性
- ✅ 回调函数和回调地狱
- ✅ Promise 的创建和使用
- ✅ async/await 语法
- ✅ 错误处理和并发控制
- ✅ 异步编程的最佳实践

**准备好了吗?** 让我们继续学习[第5章:DOM 操作基础](../05-dom-basics/)!

---

## 📖 参考资源

- [MDN - 异步 JavaScript](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous)
- [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN - async/await](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous/Async_await)
- [JavaScript.info - Promises](https://zh.javascript.info/promise-basics)
