# 阶段 1 练习题与评估

欢迎来到阶段 1 的练习与评估部分！通过完成这些练习，你将巩固所学的 JavaScript 基础知识，并检验自己的掌握程度。

## 📋 练习说明

### 练习结构

本练习集包含：
- **15 个编程练习题**（难度递增）
- **自我评估测验**（选择题和简答题）
- **阶段完成检查清单**

### 学习建议

1. **独立完成**：先尝试自己解决问题，不要立即查看答案
2. **理解优先**：重点是理解解决方案，而不是记忆代码
3. **多种方法**：尝试用不同方式解决同一问题
4. **调试实践**：遇到错误时，学习如何调试
5. **记录笔记**：记录遇到的问题和解决方法

### 如何使用

1. 创建一个 `practice.js` 文件
2. 按顺序完成练习题
3. 在浏览器或 Node.js 中运行代码
4. 完成后对照参考答案
5. 完成自我评估测验
6. 检查完成清单

---

## 📝 编程练习题

### 练习 1: 变量和数据类型（基础）

**题目**：创建变量存储个人信息，并计算年龄

```javascript
/**
 * 要求：
 * 1. 使用 const 定义常量 CURRENT_YEAR = 2024
 * 2. 创建变量存储：姓名(name)、出生年份(birthYear)、城市(city)
 * 3. 计算年龄(age)
 * 4. 输出格式："姓名：XXX，年龄：XX，城市：XXX"
 */

// 在这里编写代码
```

<details>
<summary>💡 提示</summary>

- 使用 `const` 声明不会改变的值
- 使用 `let` 声明会改变的值
- 年龄 = 当前年份 - 出生年份
- 使用模板字符串输出

</details>

<details>
<summary>✅ 参考答案</summary>

```javascript
// 日志：开始练习 1
console.log('=== 练习 1：变量和数据类型 ===\n');

// 定义常量
const CURRENT_YEAR = 2024;
console.log('当前年份:', CURRENT_YEAR);

// 创建变量
const name = 'Alice';
const birthYear = 1998;
const city = 'Beijing';

// 计算年龄
const age = CURRENT_YEAR - birthYear;
console.log('计算年龄:', age);

// 输出结果
console.log(`姓名：${name}，年龄：${age}，城市：${city}`);

console.log('\n练习 1 完成\n');
```

**知识点**：
- `const` 和 `let` 的使用
- 变量命名规范（驼峰命名）
- 常量使用大写下划线
- 模板字符串
- 基本算术运算

</details>

---

### 练习 2: 条件判断（基础）

**题目**：根据分数判定成绩等级

```javascript
/**
 * 要求：
 * 1. 定义变量 score 存储分数
 * 2. 根据分数判定等级：
 *    - 90-100: A (优秀)
 *    - 80-89: B (良好)
 *    - 70-79: C (中等)
 *    - 60-69: D (及格)
 *    - 0-59: F (不及格)
 * 3. 输出等级和评语
 * 4. 添加数据验证（分数必须在 0-100 之间）
 */

// 在这里编写代码
```

<details>
<summary>💡 提示</summary>

- 使用 `if...else if...else` 语句
- 从高分到低分判断
- 先验证数据有效性
- 记录日志便于调试

</details>

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 2：条件判断 ===\n');

const score = 85;
console.log('输入分数:', score);

// 数据验证
if (score < 0 || score > 100) {
  console.log('❌ 错误：分数必须在 0-100 之间');
} else {
  // 判定等级
  let grade;
  let comment;
  
  console.log('开始判定等级...');
  
  if (score >= 90) {
    grade = 'A';
    comment = '优秀';
    console.log('  分数 >= 90 → A');
  } else if (score >= 80) {
    grade = 'B';
    comment = '良好';
    console.log('  分数 >= 80 → B');
  } else if (score >= 70) {
    grade = 'C';
    comment = '中等';
    console.log('  分数 >= 70 → C');
  } else if (score >= 60) {
    grade = 'D';
    comment = '及格';
    console.log('  分数 >= 60 → D');
  } else {
    grade = 'F';
    comment = '不及格';
    console.log('  分数 < 60 → F');
  }
  
  console.log(`\n等级：${grade} (${comment})`);
}

console.log('\n练习 2 完成\n');
```

**知识点**：
- `if...else if...else` 条件语句
- 逻辑运算符（`||`）
- 数据验证
- 变量声明和赋值

</details>

---

### 练习 3: 循环和数组（基础）

**题目**：计算数组中所有数字的总和与平均值

```javascript
/**
 * 要求：
 * 1. 定义数组 numbers = [10, 20, 30, 40, 50]
 * 2. 使用循环计算总和
 * 3. 计算平均值
 * 4. 输出结果，保留 2 位小数
 */

// 在这里编写代码
```

<details>
<summary>💡 提示</summary>

- 使用 `for` 或 `for...of` 循环
- 累加变量初始值为 0
- 平均值 = 总和 / 数量
- 使用 `toFixed(2)` 保留小数

</details>

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 3：循环和数组 ===\n');

const numbers = [10, 20, 30, 40, 50];
console.log('数组:', numbers);

// 计算总和
let sum = 0;

console.log('\n计算总和:');
for (const num of numbers) {
  console.log(`  累加: ${sum} + ${num} = ${sum + num}`);
  sum += num;
}

console.log(`总和: ${sum}`);

// 计算平均值
const average = sum / numbers.length;
console.log(`平均值: ${average.toFixed(2)}`);

console.log('\n练习 3 完成\n');
```

**知识点**：
- 数组定义和访问
- `for...of` 循环
- 累加运算
- `toFixed()` 方法
- 数组的 `length` 属性

</details>

---

### 练习 4: 函数基础（中级）

**题目**：创建温度转换函数

```javascript
/**
 * 要求：
 * 1. 创建函数 celsiusToFahrenheit(celsius)：摄氏度转华氏度
 *    公式：F = C × 9/5 + 32
 * 2. 创建函数 fahrenheitToCelsius(fahrenheit)：华氏度转摄氏度
 *    公式：C = (F - 32) × 5/9
 * 3. 添加参数验证（必须是数字）
 * 4. 测试多个温度值
 */

// 在这里编写代码
```

<details>
<summary>💡 提示</summary>

- 函数要有清晰的参数和返回值
- 使用 `typeof` 验证参数类型
- 记录转换过程
- 保留 2 位小数

</details>

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 4：函数基础 ===\n');

/**
 * 摄氏度转华氏度
 * @param {number} celsius 摄氏度
 * @returns {number} 华氏度
 */
function celsiusToFahrenheit(celsius) {
  console.log(`\n转换: ${celsius}°C → ?°F`);
  
  // 验证参数
  if (typeof celsius !== 'number') {
    console.log('❌ 错误：参数必须是数字');
    return null;
  }
  
  // 计算
  const fahrenheit = celsius * 9/5 + 32;
  console.log(`计算: ${celsius} × 9/5 + 32 = ${fahrenheit.toFixed(2)}`);
  
  return fahrenheit;
}

/**
 * 华氏度转摄氏度
 * @param {number} fahrenheit 华氏度
 * @returns {number} 摄氏度
 */
function fahrenheitToCelsius(fahrenheit) {
  console.log(`\n转换: ${fahrenheit}°F → ?°C`);
  
  // 验证参数
  if (typeof fahrenheit !== 'number') {
    console.log('❌ 错误：参数必须是数字');
    return null;
  }
  
  // 计算
  const celsius = (fahrenheit - 32) * 5/9;
  console.log(`计算: (${fahrenheit} - 32) × 5/9 = ${celsius.toFixed(2)}`);
  
  return celsius;
}

// 测试
console.log('\n测试函数:');
const f1 = celsiusToFahrenheit(0);    // 32°F
const f2 = celsiusToFahrenheit(100);  // 212°F
const c1 = fahrenheitToCelsius(32);   // 0°C
const c2 = fahrenheitToCelsius(212);  // 100°C

console.log('\n结果:');
console.log(`  0°C = ${f1}°F`);
console.log(`  100°C = ${f2}°F`);
console.log(`  32°F = ${c1}°C`);
console.log(`  212°F = ${c2}°C`);

console.log('\n练习 4 完成\n');
```

**知识点**：
- 函数声明和调用
- 参数和返回值
- 类型验证（`typeof`）
- JSDoc 注释
- 数学运算

</details>

---

### 练习 5: 对象操作（中级）

**题目**：创建和操作学生对象

```javascript
/**
 * 要求：
 * 1. 创建学生对象，包含：姓名、年龄、成绩数组、计算平均分方法
 * 2. 添加方法 addScore(score) 添加成绩
 * 3. 添加方法 getAverage() 计算平均分
 * 4. 添加方法 getInfo() 返回学生信息字符串
 * 5. 测试所有方法
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 5：对象操作 ===\n');

const student = {
  name: 'Alice',
  age: 18,
  scores: [85, 90, 88],
  
  // 添加成绩
  addScore(score) {
    console.log(`添加成绩: ${score}`);
    
    if (typeof score !== 'number' || score < 0 || score > 100) {
      console.log('❌ 错误：成绩必须在 0-100 之间');
      return;
    }
    
    this.scores.push(score);
    console.log('当前成绩:', this.scores);
  },
  
  // 计算平均分
  getAverage() {
    console.log('\n计算平均分:');
    
    if (this.scores.length === 0) {
      console.log('暂无成绩');
      return 0;
    }
    
    const sum = this.scores.reduce((total, score) => {
      console.log(`  累加: ${total} + ${score}`);
      return total + score;
    }, 0);
    
    const average = sum / this.scores.length;
    console.log(`平均分: ${average.toFixed(2)}`);
    
    return average;
  },
  
  // 获取学生信息
  getInfo() {
    const average = this.getAverage();
    return `姓名：${this.name}，年龄：${this.age}，平均分：${average.toFixed(2)}`;
  }
};

// 测试
console.log('初始信息:');
console.log(student.getInfo());

console.log('\n添加新成绩:');
student.addScore(92);
student.addScore(95);

console.log('\n最终信息:');
console.log(student.getInfo());

console.log('\n练习 5 完成\n');
```

**知识点**：
- 对象字面量
- 对象方法
- `this` 关键字
- 数组的 `reduce()` 方法
- 方法调用

</details>

---

### 练习 6: 数组方法（中级）

**题目**：处理商品数据

```javascript
/**
 * 要求：
 * 给定商品数组：
 * const products = [
 *   { id: 1, name: '笔记本', price: 5999, stock: 10 },
 *   { id: 2, name: '鼠标', price: 99, stock: 0 },
 *   { id: 3, name: '键盘', price: 299, stock: 5 },
 *   { id: 4, name: '显示器', price: 1999, stock: 3 }
 * ];
 * 
 * 1. 筛选出有库存的商品
 * 2. 计算总库存价值
 * 3. 找出最贵的商品
 * 4. 获取所有商品名称数组
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 6：数组方法 ===\n');

const products = [
  { id: 1, name: '笔记本', price: 5999, stock: 10 },
  { id: 2, name: '鼠标', price: 99, stock: 0 },
  { id: 3, name: '键盘', price: 299, stock: 5 },
  { id: 4, name: '显示器', price: 1999, stock: 3 }
];

console.log('商品列表:', products);

// 1. 筛选有库存的商品
console.log('\n1. 筛选有库存的商品:');
const inStock = products.filter(p => {
  const hasStock = p.stock > 0;
  console.log(`  ${p.name}: 库存=${p.stock} → ${hasStock ? '✅' : '❌'}`);
  return hasStock;
});
console.log('有库存的商品:', inStock.map(p => p.name));

// 2. 计算总库存价值
console.log('\n2. 计算总库存价值:');
const totalValue = products.reduce((sum, p) => {
  const value = p.price * p.stock;
  console.log(`  ${p.name}: ¥${p.price} × ${p.stock} = ¥${value}`);
  return sum + value;
}, 0);
console.log(`总库存价值: ¥${totalValue}`);

// 3. 找出最贵的商品
console.log('\n3. 找出最贵的商品:');
const mostExpensive = products.reduce((max, p) => {
  console.log(`  比较: ${max.name}(¥${max.price}) vs ${p.name}(¥${p.price})`);
  return p.price > max.price ? p : max;
});
console.log(`最贵: ${mostExpensive.name} - ¥${mostExpensive.price}`);

// 4. 获取所有商品名称
console.log('\n4. 获取所有商品名称:');
const names = products.map(p => p.name);
console.log('商品名称:', names);

console.log('\n练习 6 完成\n');
```

**知识点**：
- `filter()` 筛选数组
- `reduce()` 归约计算
- `map()` 映射转换
- 箭头函数
- 对象属性访问

</details>

---

### 练习 7: 闭包应用（中级）

**题目**：创建计数器工厂

```javascript
/**
 * 要求：
 * 1. 创建函数 createCounter(initialValue)
 * 2. 返回对象包含方法：
 *    - increment(): 加 1
 *    - decrement(): 减 1
 *    - getValue(): 获取当前值
 *    - reset(): 重置为初始值
 * 3. 创建多个独立的计数器测试
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 7：闭包应用 ===\n');

/**
 * 创建计数器
 * @param {number} initialValue 初始值
 * @returns {object} 计数器对象
 */
function createCounter(initialValue = 0) {
  console.log(`创建计数器，初始值: ${initialValue}`);
  
  // 私有变量（闭包）
  let count = initialValue;
  const initial = initialValue;
  
  return {
    increment() {
      count++;
      console.log(`  +1 → ${count}`);
      return count;
    },
    
    decrement() {
      count--;
      console.log(`  -1 → ${count}`);
      return count;
    },
    
    getValue() {
      console.log(`  当前值: ${count}`);
      return count;
    },
    
    reset() {
      count = initial;
      console.log(`  重置为: ${count}`);
      return count;
    }
  };
}

// 测试
console.log('\n测试计数器 1:');
const counter1 = createCounter(0);
counter1.increment();  // 1
counter1.increment();  // 2
counter1.decrement();  // 1
counter1.getValue();   // 1

console.log('\n测试计数器 2:');
const counter2 = createCounter(10);
counter2.increment();  // 11
counter2.increment();  // 12
counter2.reset();      // 10

console.log('\n验证独立性:');
console.log('counter1:');
counter1.getValue();   // 1 (未受 counter2 影响)
console.log('counter2:');
counter2.getValue();   // 10

console.log('\n练习 7 完成\n');
```

**知识点**：
- 闭包
- 私有变量
- 工厂函数
- 对象方法
- 函数返回对象

</details>

---

### 练习 8: Promise 基础（中级）

**题目**：模拟异步数据加载

```javascript
/**
 * 要求：
 * 1. 创建函数 fetchUserData(userId)
 * 2. 返回 Promise，1 秒后 resolve 用户数据
 * 3. 如果 userId <= 0，reject 错误
 * 4. 使用 .then() 和 .catch() 处理结果
 * 5. 测试成功和失败情况
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 8：Promise 基础 ===\n');

/**
 * 模拟获取用户数据
 * @param {number} userId 用户 ID
 * @returns {Promise} Promise 对象
 */
function fetchUserData(userId) {
  console.log(`请求用户数据: ID=${userId}`);
  
  return new Promise((resolve, reject) => {
    console.log('  处理中...');
    
    setTimeout(() => {
      if (userId <= 0) {
        console.log('  ❌ 无效的用户 ID');
        reject(new Error('Invalid user ID'));
      } else {
        const user = {
          id: userId,
          name: `User${userId}`,
          email: `user${userId}@example.com`,
          createdAt: new Date().toISOString()
        };
        console.log('  ✅ 数据获取成功');
        resolve(user);
      }
    }, 1000);
  });
}

// 测试成功情况
console.log('测试 1: 有效的用户 ID\n');
fetchUserData(1)
  .then(user => {
    console.log('收到用户数据:');
    console.log('  ID:', user.id);
    console.log('  姓名:', user.name);
    console.log('  邮箱:', user.email);
  })
  .catch(error => {
    console.log('错误:', error.message);
  })
  .finally(() => {
    console.log('请求完成\n');
  });

// 测试失败情况
setTimeout(() => {
  console.log('测试 2: 无效的用户 ID\n');
  fetchUserData(-1)
    .then(user => {
      console.log('收到用户数据:', user);
    })
    .catch(error => {
      console.log('捕获错误:', error.message);
    })
    .finally(() => {
      console.log('请求完成\n');
      console.log('练习 8 完成\n');
    });
}, 1500);
```

**知识点**：
- Promise 构造函数
- `resolve` 和 `reject`
- `.then()` 和 `.catch()`
- `.finally()`
- 异步操作
- `setTimeout`

</details>

---

### 练习 9: async/await（中级）

**题目**：将 Promise 改写为 async/await

```javascript
/**
 * 要求：
 * 1. 使用练习 8 的 fetchUserData 函数
 * 2. 创建 async 函数 getUserInfo(userId)
 * 3. 使用 try-catch 处理错误
 * 4. 顺序获取多个用户数据
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 9：async/await ===\n');

// 使用练习 8 的函数
// (假设 fetchUserData 已定义)

/**
 * 获取用户信息
 * @param {number} userId 用户 ID
 */
async function getUserInfo(userId) {
  console.log(`\n获取用户 ${userId} 的信息:`);
  
  try {
    const user = await fetchUserData(userId);
    
    console.log('✅ 获取成功:');
    console.log(`  姓名: ${user.name}`);
    console.log(`  邮箱: ${user.email}`);
    
    return user;
    
  } catch (error) {
    console.log('❌ 获取失败:', error.message);
    return null;
  }
}

/**
 * 获取多个用户
 */
async function getMultipleUsers() {
  console.log('开始获取多个用户...\n');
  
  // 顺序获取
  const user1 = await getUserInfo(1);
  const user2 = await getUserInfo(2);
  const user3 = await getUserInfo(-1); // 会失败
  
  console.log('\n获取完成');
  console.log('成功:', user1 && user2 ? '2个' : '部分失败');
}

// 执行
getMultipleUsers().then(() => {
  console.log('\n练习 9 完成\n');
});
```

**知识点**：
- `async` 函数
- `await` 关键字
- `try-catch` 错误处理
- 异步函数调用
- 顺序执行异步操作

</details>

---

### 练习 10: DOM 操作（中级）

**题目**：动态创建列表

```javascript
/**
 * 要求（在浏览器环境中运行）：
 * 1. 创建函数 renderList(items)
 * 2. 动态创建 ul 列表
 * 3. 为每个 item 创建 li 元素
 * 4. 添加删除按钮，点击删除对应项
 * 5. 使用事件委托处理删除
 * 
 * HTML:
 * <div id="app"></div>
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 10：DOM 操作 ===\n');

/**
 * 渲染列表
 * @param {Array} items 列表项
 */
function renderList(items) {
  console.log('渲染列表，项目数:', items.length);
  
  // 获取容器
  const app = document.getElementById('app');
  
  // 清空容器
  app.innerHTML = '';
  
  // 创建列表
  const ul = document.createElement('ul');
  ul.id = 'itemList';
  ul.style.listStyle = 'none';
  ul.style.padding = '0';
  
  // 创建列表项
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.style.padding = '10px';
    li.style.marginBottom = '5px';
    li.style.background = '#f0f0f0';
    li.style.borderRadius = '4px';
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    
    // 文本
    const span = document.createElement('span');
    span.textContent = item;
    
    // 删除按钮
    const button = document.createElement('button');
    button.textContent = '删除';
    button.dataset.index = index;
    button.style.padding = '5px 10px';
    button.style.cursor = 'pointer';
    
    li.appendChild(span);
    li.appendChild(button);
    ul.appendChild(li);
  });
  
  // 事件委托
  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const index = parseInt(e.target.dataset.index);
      console.log('删除项目:', items[index]);
      
      // 删除项目
      items.splice(index, 1);
      
      // 重新渲染
      renderList(items);
    }
  });
  
  app.appendChild(ul);
  console.log('列表渲染完成');
}

// 测试数据
const fruits = ['苹果', '香蕉', '橙子', '葡萄'];

// 渲染（需要在浏览器中运行）
// renderList(fruits);

console.log('练习 10 完成（需在浏览器环境运行）\n');
```

**知识点**：
- `document.createElement()`
- `appendChild()`
- 事件委托
- `dataset` 属性
- 动态样式设置
- DOM 操作

</details>

---

### 练习 11: localStorage 应用（中高级）

**题目**：实现简单的笔记应用

```javascript
/**
 * 要求：
 * 1. 创建对象 NotesApp，包含方法：
 *    - addNote(text): 添加笔记
 *    - deleteNote(id): 删除笔记
 *    - getNotes(): 获取所有笔记
 *    - saveToStorage(): 保存到 localStorage
 *    - loadFromStorage(): 从 localStorage 加载
 * 2. 笔记对象包含：id, text, createdAt
 * 3. 实现数据持久化
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 11：localStorage 应用 ===\n');

const NotesApp = {
  // 数据
  notes: [],
  storageKey: 'notes',
  
  // 初始化
  init() {
    console.log('初始化笔记应用');
    this.loadFromStorage();
    console.log(`加载了 ${this.notes.length} 条笔记`);
  },
  
  // 添加笔记
  addNote(text) {
    console.log(`\n添加笔记: "${text}"`);
    
    if (!text || !text.trim()) {
      console.log('❌ 笔记内容不能为空');
      return false;
    }
    
    const note = {
      id: Date.now(),
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    
    this.notes.push(note);
    this.saveToStorage();
    
    console.log('✅ 笔记已添加');
    console.log('  ID:', note.id);
    console.log('  时间:', note.createdAt);
    
    return note;
  },
  
  // 删除笔记
  deleteNote(id) {
    console.log(`\n删除笔记: ID=${id}`);
    
    const index = this.notes.findIndex(note => note.id === id);
    
    if (index === -1) {
      console.log('❌ 笔记不存在');
      return false;
    }
    
    const deleted = this.notes.splice(index, 1)[0];
    this.saveToStorage();
    
    console.log('✅ 笔记已删除');
    console.log('  内容:', deleted.text);
    
    return true;
  },
  
  // 获取所有笔记
  getNotes() {
    console.log(`\n获取所有笔记 (共 ${this.notes.length} 条):`);
    
    this.notes.forEach((note, i) => {
      console.log(`  ${i + 1}. [${note.id}] ${note.text}`);
      console.log(`     创建于: ${note.createdAt}`);
    });
    
    return this.notes;
  },
  
  // 保存到 localStorage
  saveToStorage() {
    try {
      const json = JSON.stringify(this.notes);
      localStorage.setItem(this.storageKey, json);
      console.log('  💾 已保存到 localStorage');
      return true;
    } catch (error) {
      console.log('  ❌ 保存失败:', error.message);
      return false;
    }
  },
  
  // 从 localStorage 加载
  loadFromStorage() {
    try {
      const json = localStorage.getItem(this.storageKey);
      
      if (json) {
        this.notes = JSON.parse(json);
        console.log('  📂 从 localStorage 加载成功');
      } else {
        this.notes = [];
        console.log('  📂 localStorage 为空，初始化为空数组');
      }
      
      return true;
    } catch (error) {
      console.log('  ❌ 加载失败:', error.message);
      this.notes = [];
      return false;
    }
  }
};

// 测试
NotesApp.init();
NotesApp.addNote('学习 JavaScript');
NotesApp.addNote('完成练习题');
NotesApp.addNote('复习重点内容');
NotesApp.getNotes();

const firstNoteId = NotesApp.notes[0].id;
NotesApp.deleteNote(firstNoteId);
NotesApp.getNotes();

console.log('\n练习 11 完成\n');
```

**知识点**：
- 对象方法
- `localStorage` API
- `JSON.stringify()` 和 `JSON.parse()`
- 数组的 `findIndex()` 方法
- 错误处理

</details>

---

### 练习 12: 数据处理综合（高级）

**题目**：处理嵌套的订单数据

```javascript
/**
 * 要求：
 * 给定订单数组（每个订单包含商品数组）：
 * const orders = [
 *   {
 *     id: 1,
 *     customer: 'Alice',
 *     items: [
 *       { product: 'A', price: 10, qty: 2 },
 *       { product: 'B', price: 20, qty: 1 }
 *     ]
 *   },
 *   {
 *     id: 2,
 *     customer: 'Bob',
 *     items: [
 *       { product: 'B', price: 20, qty: 2 },
 *       { product: 'C', price: 15, qty: 3 }
 *     ]
 *   }
 * ];
 * 
 * 1. 计算每个订单的总价
 * 2. 计算所有订单的总价
 * 3. 找出最大的订单
 * 4. 统计每个商品的销售数量
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 12：数据处理综合 ===\n');

const orders = [
  {
    id: 1,
    customer: 'Alice',
    items: [
      { product: 'A', price: 10, qty: 2 },
      { product: 'B', price: 20, qty: 1 }
    ]
  },
  {
    id: 2,
    customer: 'Bob',
    items: [
      { product: 'B', price: 20, qty: 2 },
      { product: 'C', price: 15, qty: 3 }
    ]
  },
  {
    id: 3,
    customer: 'Alice',
    items: [
      { product: 'A', price: 10, qty: 1 }
    ]
  }
];

console.log('订单数据:', orders);

// 1. 计算每个订单的总价
console.log('\n1. 计算每个订单的总价:');
const ordersWithTotal = orders.map(order => {
  const total = order.items.reduce((sum, item) => {
    const itemTotal = item.price * item.qty;
    console.log(`  订单 ${order.id} - ${item.product}: ¥${item.price} × ${item.qty} = ¥${itemTotal}`);
    return sum + itemTotal;
  }, 0);
  
  console.log(`  订单 ${order.id} 总计: ¥${total}\n`);
  
  return { ...order, total };
});

// 2. 计算所有订单的总价
console.log('2. 计算所有订单的总价:');
const grandTotal = ordersWithTotal.reduce((sum, order) => {
  console.log(`  累加: ¥${sum} + ¥${order.total}`);
  return sum + order.total;
}, 0);
console.log(`总计: ¥${grandTotal}\n`);

// 3. 找出最大的订单
console.log('3. 找出最大的订单:');
const largestOrder = ordersWithTotal.reduce((max, order) => {
  console.log(`  比较: 订单${max.id}(¥${max.total}) vs 订单${order.id}(¥${order.total})`);
  return order.total > max.total ? order : max;
});
console.log(`最大订单: 订单${largestOrder.id} (${largestOrder.customer}) - ¥${largestOrder.total}\n`);

// 4. 统计每个商品的销售数量
console.log('4. 统计每个商品的销售数量:');
const productStats = orders.reduce((stats, order) => {
  order.items.forEach(item => {
    if (!stats[item.product]) {
      stats[item.product] = 0;
    }
    stats[item.product] += item.qty;
    console.log(`  ${item.product}: ${stats[item.product]} (订单${order.id} +${item.qty})`);
  });
  return stats;
}, {});

console.log('\n商品销量统计:');
Object.entries(productStats).forEach(([product, qty]) => {
  console.log(`  ${product}: ${qty} 件`);
});

console.log('\n练习 12 完成\n');
```

**知识点**：
- 嵌套数据处理
- `map()` 和 `reduce()` 组合使用
- 对象展开运算符
- `Object.entries()`
- 复杂的数据归约

</details>

---

### 练习 13: 防抖函数（高级）

**题目**：实现防抖(debounce)函数

```javascript
/**
 * 要求：
 * 1. 创建 debounce(func, delay) 函数
 * 2. 返回防抖后的函数
 * 3. 只有在停止调用 delay 毫秒后才执行 func
 * 4. 测试防抖效果
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 13：防抖函数 ===\n');

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} delay 延迟时间(毫秒)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay) {
  console.log(`创建防抖函数，延迟: ${delay}ms`);
  
  let timeoutId = null;
  
  return function(...args) {
    console.log('  防抖函数被调用，重置定时器');
    
    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
      console.log('    清除旧定时器');
    }
    
    // 设置新的定时器
    timeoutId = setTimeout(() => {
      console.log(`    ${delay}ms 后执行实际函数`);
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

// 测试函数
function search(keyword) {
  console.log(`      🔍 搜索: "${keyword}"\n`);
}

// 创建防抖版本
const debouncedSearch = debounce(search, 500);

// 模拟快速输入
console.log('\n模拟用户快速输入:\n');

debouncedSearch('j');
setTimeout(() => debouncedSearch('ja'), 100);
setTimeout(() => debouncedSearch('jav'), 200);
setTimeout(() => debouncedSearch('java'), 300);
setTimeout(() => debouncedSearch('javas'), 400);
setTimeout(() => debouncedSearch('javasc'), 450);
setTimeout(() => debouncedSearch('javascr'), 480);
setTimeout(() => debouncedSearch('javascri'), 490);
setTimeout(() => debouncedSearch('javascript'), 495);

// 只有最后一次会在 500ms 后执行

setTimeout(() => {
  console.log('练习 13 完成\n');
}, 1500);
```

**知识点**：
- 闭包
- `setTimeout` 和 `clearTimeout`
- 高阶函数
- `apply()` 方法
- 剩余参数 (`...args`)

</details>

---

### 练习 14: 深拷贝（高级）

**题目**：实现深拷贝函数

```javascript
/**
 * 要求：
 * 1. 创建 deepClone(obj) 函数
 * 2. 能够拷贝嵌套对象和数组
 * 3. 处理 null、基本类型、Date 对象
 * 4. 测试深拷贝效果（修改副本不影响原对象）
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 14：深拷贝 ===\n');

/**
 * 深拷贝函数
 * @param {*} obj 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
function deepClone(obj) {
  console.log('深拷贝:', typeof obj);
  
  // 处理 null 和基本类型
  if (obj === null || typeof obj !== 'object') {
    console.log('  基本类型或 null，直接返回');
    return obj;
  }
  
  // 处理 Date
  if (obj instanceof Date) {
    console.log('  Date 对象');
    return new Date(obj.getTime());
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    console.log('  数组，长度:', obj.length);
    return obj.map(item => deepClone(item));
  }
  
  // 处理对象
  console.log('  对象，键数:', Object.keys(obj).length);
  const cloned = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      console.log(`    拷贝属性: ${key}`);
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// 测试
const original = {
  name: 'Alice',
  age: 25,
  hobbies: ['reading', 'coding'],
  address: {
    city: 'Beijing',
    street: 'Main St'
  },
  date: new Date('2024-01-01')
};

console.log('\n原始对象:');
console.log(original);

console.log('\n执行深拷贝:\n');
const cloned = deepClone(original);

console.log('\n拷贝后的对象:');
console.log(cloned);

// 修改副本
console.log('\n修改副本:');
cloned.name = 'Bob';
cloned.hobbies.push('gaming');
cloned.address.city = 'Shanghai';

console.log('\n原始对象（未被修改）:');
console.log('  name:', original.name);           // Alice
console.log('  hobbies:', original.hobbies);     // ['reading', 'coding']
console.log('  city:', original.address.city);   // Beijing

console.log('\n拷贝对象（已修改）:');
console.log('  name:', cloned.name);             // Bob
console.log('  hobbies:', cloned.hobbies);       // ['reading', 'coding', 'gaming']
console.log('  city:', cloned.address.city);     // Shanghai

console.log('\n验证独立性:');
console.log('  两个对象是否相同:', original === cloned); // false
console.log('  嵌套对象是否相同:', original.address === cloned.address); // false

console.log('\n练习 14 完成\n');
```

**知识点**：
- 递归
- 类型检查
- `Array.isArray()`
- `instanceof`
- `hasOwnProperty()`
- 对象和数组的深拷贝

</details>

---

### 练习 15: 综合应用（高级）

**题目**：实现简易的事件发射器(EventEmitter)

---

## 📝 原型链练习题（新增）

### 练习 16: 原型链基础（中级）

**题目**：探索原型链查找机制

```javascript
/**
 * 要求：
 * 1. 创建一个对象 animal，包含属性 type: 'animal' 和方法 eat()
 * 2. 创建一个对象 dog，使用 Object.create(animal)
 * 3. 为 dog 添加属性 name: 'Buddy' 和方法 bark()
 * 4. 验证原型链：
 *    - dog 可以访问 eat() 方法吗？
 *    - dog.hasOwnProperty('eat') 返回什么？
 *    - Object.getPrototypeOf(dog) === animal 吗？
 * 5. 添加详细日志追踪属性查找过程
 */

// 在这里编写代码
```

<details>
<summary>💡 提示</summary>

- 使用 `Object.create()` 创建基于原型的对象
- 使用 `hasOwnProperty()` 区分自有属性和继承属性
- 使用 `Object.getPrototypeOf()` 获取对象的原型
- 观察属性查找如何沿原型链上溯

</details>

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 16：原型链基础 ===\n');

// 1. 创建基础对象 animal
const animal = {
  type: 'animal',
  eat() {
    console.log(`[${this.name || 'Unknown'}] 正在吃东西...`);
  }
};

console.log('创建 animal 对象:');
console.log('  type:', animal.type);
console.log('  方法: eat()');

// 2. 使用 Object.create 创建 dog
console.log('\n使用 Object.create 创建 dog:');
const dog = Object.create(animal);
console.log('  dog.__proto__ === animal?', Object.getPrototypeOf(dog) === animal);

// 3. 添加 dog 的自有属性和方法
dog.name = 'Buddy';
dog.bark = function() {
  console.log(`[${this.name}] 汪汪汪！`);
};

console.log('\n为 dog 添加自有属性:');
console.log('  name:', dog.name);
console.log('  方法: bark()');

// 4. 验证原型链
console.log('\n=== 验证原型链 ===');

// 测试 1: dog 可以访问 eat() 吗？
console.log('\n测试 1: dog 可以访问 eat() 吗？');
console.log('  typeof dog.eat:', typeof dog.eat);
console.log('  调用 dog.eat():');
dog.eat();

// 测试 2: hasOwnProperty
console.log('\n测试 2: 区分自有属性和继承属性');
console.log('  dog.hasOwnProperty("name"):', dog.hasOwnProperty('name'));  // true (自有)
console.log('  dog.hasOwnProperty("eat"):', dog.hasOwnProperty('eat'));    // false (继承)
console.log('  dog.hasOwnProperty("type"):', dog.hasOwnProperty('type'));  // false (继承)

// 测试 3: 原型链关系
console.log('\n测试 3: 原型链关系');
console.log('  Object.getPrototypeOf(dog) === animal:', Object.getPrototypeOf(dog) === animal);
console.log('  dog.__proto__ === animal:', dog.__proto__ === animal);

// 测试 4: 属性查找过程模拟
console.log('\n测试 4: 模拟属性查找过程');
function findProperty(obj, prop) {
  console.log(`\n查找属性 "${prop}":`);
  let current = obj;
  let depth = 0;
  
  while (current) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}[层级 ${depth}] 检查对象`);
    
    if (current.hasOwnProperty(prop)) {
      console.log(`${indent}  ✓ 找到! 值:`, current[prop]);
      return current[prop];
    }
    
    console.log(`${indent}  ✗ 未找到,向上查找...`);
    current = Object.getPrototypeOf(current);
    depth++;
    
    if (depth > 10) {
      console.log('  [安全退出] 防止无限循环');
      break;
    }
  }
  
  console.log('  [结束] 到达原型链顶端,返回 undefined');
  return undefined;
}

findProperty(dog, 'name');  // 自有属性
findProperty(dog, 'eat');   // 继承属性
findProperty(dog, 'notExist');  // 不存在

console.log('\n练习 16 完成\n');
```

**知识点**：
- `Object.create()` 创建对象
- 原型链查找机制
- `hasOwnProperty()` vs 继承属性
- `Object.getPrototypeOf()` 获取原型
- 属性查找沿链上溯

</details>

---

### 练习 17: 构造函数与 new（中高级）

**题目**：理解 `new` 关键字的四步骤

```javascript
/**
 * 要求：
 * 1. 创建构造函数 Person(name, age)
 * 2. 在 Person.prototype 上添加方法 greet()
 * 3. 手动实现 new 的四步骤（不使用 new 关键字）
 * 4. 对比使用 new 和手动实现的结果
 * 5. 测试 instanceof 运算符
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 17：构造函数与 new ===\n');

// 1. 创建构造函数
function Person(name, age) {
  console.log(`[构造函数] 执行 Person(${name}, ${age})`);
  console.log('  this:', this);
  
  this.name = name;
  this.age = age;
  
  console.log('  设置属性完成');
}

// 2. 在原型上添加方法
Person.prototype.greet = function() {
  console.log(`你好,我是 ${this.name},今年 ${this.age} 岁`);
};

console.log('Person 构造函数已定义');
console.log('Person.prototype.greet 已添加\n');

// 3. 手动实现 new 的四步骤
function myNew(constructor, ...args) {
  console.log('[myNew] 开始手动实现 new 的四步骤\n');
  
  // 步骤 1: 创建空对象
  console.log('步骤 1: 创建空对象 {}');
  const obj = {};
  
  // 步骤 2: 将对象的 __proto__ 指向构造函数的 prototype
  console.log('步骤 2: obj.__proto__ = constructor.prototype');
  Object.setPrototypeOf(obj, constructor.prototype);
  console.log('  验证: obj.__proto__ === Person.prototype?', Object.getPrototypeOf(obj) === Person.prototype);
  
  // 步骤 3: 用这个对象作为 this 调用构造函数
  console.log('\n步骤 3: 用 obj 作为 this 调用构造函数');
  const result = constructor.apply(obj, args);
  
  // 步骤 4: 如果构造函数返回对象,则返回该对象,否则返回新对象
  console.log('\n步骤 4: 返回值处理');
  console.log('  构造函数返回值类型:', typeof result);
  const finalResult = (result && typeof result === 'object') ? result : obj;
  console.log('  最终返回:', finalResult === obj ? 'obj (新对象)' : 'result (构造函数返回值)');
  
  console.log('[myNew] 完成\n');
  return finalResult;
}

// 4. 对比测试
console.log('=== 对比测试 ===\n');

console.log('测试 1: 使用 new 关键字');
const alice = new Person('Alice', 25);
console.log('结果:', alice);
alice.greet();

console.log('\n---\n');

console.log('测试 2: 使用手动实现的 myNew');
const bob = myNew(Person, 'Bob', 30);
console.log('结果:', bob);
bob.greet();

// 5. 测试 instanceof
console.log('\n=== 测试 instanceof ===');
console.log('alice instanceof Person:', alice instanceof Person);
console.log('bob instanceof Person:', bob instanceof Person);
console.log('alice instanceof Object:', alice instanceof Object);

// 验证原型链
console.log('\n=== 验证原型链 ===');
console.log('alice.__proto__ === Person.prototype:', Object.getPrototypeOf(alice) === Person.prototype);
console.log('bob.__proto__ === Person.prototype:', Object.getPrototypeOf(bob) === Person.prototype);

console.log('\n练习 17 完成\n');
```

**知识点**：
- 构造函数的定义
- `new` 的四步骤
- `Function.prototype.apply()`
- `instanceof` 的原理
- 原型链关系

</details>

---

### 练习 18: 不用 Class 实现继承（高级）

**题目**：用原型链实现继承（不使用 ES6 Class）

```javascript
/**
 * 要求：
 * 1. 创建父类构造函数 Animal(name)
 * 2. 在 Animal.prototype 上添加方法 speak()
 * 3. 创建子类构造函数 Dog(name, breed)
 * 4. 实现继承：Dog 继承 Animal
 * 5. 在 Dog.prototype 上添加方法 bark()
 * 6. 测试继承关系和方法调用
 * 7. 修复 constructor 指向
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 18：不用 Class 实现继承 ===\n');

// 1. 父类构造函数
function Animal(name) {
  console.log(`[Animal 构造函数] name=${name}`);
  this.name = name;
}

// 2. 父类方法
Animal.prototype.speak = function() {
  console.log(`${this.name} 发出声音`);
};

console.log('Animal 类已定义\n');

// 3. 子类构造函数
function Dog(name, breed) {
  console.log(`[Dog 构造函数] name=${name}, breed=${breed}`);
  
  // 调用父类构造函数（继承属性）
  console.log('  调用 Animal.call(this, name)');
  Animal.call(this, name);
  
  // 子类特有属性
  this.breed = breed;
}

// 4. 实现继承（继承方法）
console.log('设置继承关系:');
console.log('  Dog.prototype = Object.create(Animal.prototype)');

// ❌ 错误方式: Dog.prototype = Animal.prototype (会污染父类原型)
// ❌ 错误方式: Dog.prototype = new Animal() (会调用父类构造函数)

// ✅ 正确方式: 使用 Object.create
Dog.prototype = Object.create(Animal.prototype);

// 7. 修复 constructor 指向
console.log('  修复 constructor 指向');
Dog.prototype.constructor = Dog;

// 5. 子类特有方法
Dog.prototype.bark = function() {
  console.log(`${this.name} (${this.breed}) 说: 汪汪汪!`);
};

console.log('Dog 类已定义,继承关系已建立\n');

// 6. 测试
console.log('=== 测试继承 ===\n');

const myDog = new Dog('Buddy', 'Golden Retriever');

console.log('\n对象信息:');
console.log('  name:', myDog.name);
console.log('  breed:', myDog.breed);

console.log('\n调用方法:');
myDog.speak();  // 继承自 Animal
myDog.bark();   // Dog 自己的方法

console.log('\n=== 验证继承关系 ===');
console.log('instanceof Animal:', myDog instanceof Animal);
console.log('instanceof Dog:', myDog instanceof Dog);
console.log('instanceof Object:', myDog instanceof Object);

console.log('\n=== 验证原型链 ===');
console.log('myDog.__proto__ === Dog.prototype:', Object.getPrototypeOf(myDog) === Dog.prototype);
console.log('Dog.prototype.__proto__ === Animal.prototype:', Object.getPrototypeOf(Dog.prototype) === Animal.prototype);

console.log('\n=== 验证 constructor ===');
console.log('myDog.constructor === Dog:', myDog.constructor === Dog);
console.log('Dog.prototype.constructor === Dog:', Dog.prototype.constructor === Dog);

console.log('\n=== 原型链可视化 ===');
console.log('myDog');
console.log('  └─> Dog.prototype');
console.log('        └─> Animal.prototype');
console.log('              └─> Object.prototype');
console.log('                    └─> null');

console.log('\n练习 18 完成\n');
```

**知识点**：
- 构造函数继承（属性继承）
- 原型链继承（方法继承）
- `Object.create()` 的正确使用
- `constructor` 修复
- `instanceof` 沿原型链检查
- 继承的常见陷阱

</details>

---

## 📊 自我评估测验

```javascript
/**
 * 要求：
 * 1. 创建 EventEmitter 类
 * 2. 实现方法：
 *    - on(event, callback): 注册事件监听器
 *    - off(event, callback): 移除事件监听器
 *    - emit(event, ...args): 触发事件
 *    - once(event, callback): 只监听一次
 * 3. 测试所有功能
 */

// 在这里编写代码
```

<details>
<summary>✅ 参考答案</summary>

```javascript
console.log('=== 练习 15：事件发射器 ===\n');

/**
 * 事件发射器类
 */
class EventEmitter {
  constructor() {
    console.log('创建 EventEmitter 实例');
    this.events = {}; // 存储事件监听器
  }
  
  /**
   * 注册事件监听器
   * @param {string} event 事件名
   * @param {Function} callback 回调函数
   */
  on(event, callback) {
    console.log(`注册事件: ${event}`);
    
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    console.log(`  当前监听器数量: ${this.events[event].length}`);
  }
  
  /**
   * 移除事件监听器
   * @param {string} event 事件名
   * @param {Function} callback 回调函数
   */
  off(event, callback) {
    console.log(`移除事件: ${event}`);
    
    if (!this.events[event]) {
      console.log('  事件不存在');
      return;
    }
    
    const index = this.events[event].indexOf(callback);
    
    if (index > -1) {
      this.events[event].splice(index, 1);
      console.log('  监听器已移除');
    } else {
      console.log('  监听器不存在');
    }
  }
  
  /**
   * 触发事件
   * @param {string} event 事件名
   * @param  {...any} args 参数
   */
  emit(event, ...args) {
    console.log(`\n触发事件: ${event}，参数:`, args);
    
    if (!this.events[event]) {
      console.log('  没有监听器');
      return;
    }
    
    console.log(`  执行 ${this.events[event].length} 个监听器:`);
    
    this.events[event].forEach((callback, i) => {
      console.log(`    监听器 ${i + 1}:`);
      callback(...args);
    });
  }
  
  /**
   * 只监听一次
   * @param {string} event 事件名
   * @param {Function} callback 回调函数
   */
  once(event, callback) {
    console.log(`注册一次性事件: ${event}`);
    
    const wrapper = (...args) => {
      console.log('      (一次性监听器)');
      callback(...args);
      this.off(event, wrapper);
      console.log('      已自动移除');
    };
    
    this.on(event, wrapper);
  }
}

// 测试
const emitter = new EventEmitter();

// 定义监听器
function onUserLogin(username) {
  console.log(`      用户登录: ${username}`);
}

function onDataUpdate(data) {
  console.log(`      数据更新:`, data);
}

// 注册事件
console.log('\n注册事件:\n');
emitter.on('login', onUserLogin);
emitter.on('login', (username) => {
  console.log(`      欢迎, ${username}!`);
});

emitter.once('dataUpdate', onDataUpdate);

// 触发事件
emitter.emit('login', 'Alice');
emitter.emit('login', 'Bob');

emitter.emit('dataUpdate', { count: 100 });
emitter.emit('dataUpdate', { count: 200 }); // 不会执行（已移除）

// 移除监听器
console.log('\n\n移除监听器:\n');
emitter.off('login', onUserLogin);

console.log('\n移除后再次触发:\n');
emitter.emit('login', 'Charlie'); // 只执行一个监听器

console.log('\n练习 15 完成\n');
```

**知识点**：
- ES6 类
- 对象作为数据结构
- 数组方法（`indexOf`, `splice`, `forEach`）
- 剩余参数和展开运算符
- 闭包（once 方法）
- 设计模式（观察者模式）

</details>

---

## 📊 自我评估测验

完成练习题后，通过以下测验检验你的理解程度。

### 选择题

**1. 以下哪个是正确的变量声明方式？**
- A. `var const name = 'Alice';`
- B. `let const age = 25;`
- C. `const name = 'Alice';`
- D. `constant name = 'Alice';`

<details>
<summary>查看答案</summary>
答案：C

解释：`const` 用于声明常量，语法是 `const 变量名 = 值;`
</details>

---

**2. 以下哪个数组方法会修改原数组？**
- A. `map()`
- B. `filter()`
- C. `push()`
- D. `slice()`

<details>
<summary>查看答案</summary>
答案：C

解释：`push()` 会在数组末尾添加元素并修改原数组。`map()`, `filter()`, `slice()` 都返回新数组。
</details>

---

**3. Promise 的三种状态是？**
- A. pending, fulfilled, rejected
- B. waiting, success, error
- C. loading, done, failed
- D. ready, complete, stopped

<details>
<summary>查看答案</summary>
答案：A

解释：Promise 有三种状态：pending（进行中）、fulfilled（已成功）、rejected（已失败）。
</details>

---

**4. 如何正确使用事件委托？**
- A. 为每个子元素添加事件监听器
- B. 在父元素上监听，通过 event.target 判断
- C. 使用全局事件监听
- D. 不需要事件监听

<details>
<summary>查看答案</summary>
答案：B

解释：事件委托是在父元素上添加监听器，利用事件冒泡，通过 `event.target` 判断实际触发的元素。
</details>

---

**5. 闭包的主要用途是？**
- A. 提高代码运行速度
- B. 创建私有变量
- C. 减少内存使用
- D. 简化代码结构

<details>
<summary>查看答案</summary>
答案：B

解释：闭包可以创建私有变量，外部无法直接访问，常用于数据封装和模块化。
</details>

---

### 简答题

**1. 解释原型链的工作原理。**

<details>
<summary>查看答案</summary>

**原型链**是 JavaScript 对象属性查找的机制：

1. **基本概念**：
   - 每个对象都有一个内部属性 `[[Prototype]]`（可通过 `__proto__` 访问）
   - 当访问对象的属性时，如果对象自身没有，会沿原型链向上查找
   - 原型链的终点是 `Object.prototype.__proto__`（值为 `null`）

2. **查找过程**：
   ```javascript
   const obj = { a: 1 };
   // 查找 obj.toString
   // 1. obj 自身没有 toString
   // 2. 查找 obj.__proto__ (Object.prototype)
   // 3. 找到 Object.prototype.toString
   ```

3. **重要特性**：
   - 属性查找是"向上"的，不能向下查找
   - 修改属性总是在对象自身，不会影响原型
   - `hasOwnProperty()` 区分自有属性和继承属性

4. **实际应用**：
   - ES6 Class 是原型的语法糖
   - 所有 JavaScript 对象都基于原型链
   - 理解原型链是掌握 JavaScript 的关键

</details>

---

**2. 解释 `let`、`const` 和 `var` 的区别。**

<details>
<summary>查看答案</summary>

**区别：**

1. **作用域**
   - `var`: 函数作用域
   - `let`/`const`: 块级作用域

2. **重复声明**
   - `var`: 可以重复声明
   - `let`/`const`: 不能重复声明

3. **变量提升**
   - `var`: 会提升，值为 undefined
   - `let`/`const`: 会提升，但存在暂时性死区

4. **重新赋值**
   - `var`/`let`: 可以重新赋值
   - `const`: 不能重新赋值（但对象/数组内容可变）

**推荐**：默认使用 `const`，需要改变时用 `let`，避免使用 `var`。
</details>

---

**2. 什么是事件冒泡？如何阻止？**

<details>
<summary>查看答案</summary>

**事件冒泡**：
- 事件从目标元素向上传播到父元素、祖先元素的过程
- 例如：点击按钮 → div → body → html → document

**阻止冒泡**：
```javascript
element.addEventListener('click', (e) => {
  e.stopPropagation(); // 阻止冒泡
});
```

**阻止默认行为**：
```javascript
element.addEventListener('click', (e) => {
  e.preventDefault(); // 阻止默认行为（如链接跳转）
});
```

**事件委托**利用了冒泡机制，在父元素上统一处理子元素事件。
</details>

---

**3. Promise 和 async/await 有什么关系？**

<details>
<summary>查看答案</summary>

**关系**：
- `async/await` 是基于 Promise 的语法糖
- 使异步代码看起来像同步代码，更易读

**Promise 方式**：
```javascript
fetchData()
  .then(data => processData(data))
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

**async/await 方式**：
```javascript
async function getData() {
  try {
    const data = await fetchData();
    const result = await processData(data);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

**何时使用**：
- 复杂的异步流程：优先使用 `async/await`
- 简单的单个异步操作：`Promise` 也可以
- 并行操作：结合 `Promise.all()` 使用
</details>

---

**4. 如何避免 XSS 攻击？**

<details>
<summary>查看答案</summary>

**XSS (跨站脚本攻击)** 是通过注入恶意脚本来攻击网站。

**防范方法**：

1. **使用 textContent 而不是 innerHTML**
   ```javascript
   // ✅ 安全
   element.textContent = userInput;
   
   // ❌ 危险
   element.innerHTML = userInput;
   ```

2. **转义 HTML**
   ```javascript
   function escapeHTML(text) {
     const div = document.createElement('div');
     div.textContent = text;
     return div.innerHTML;
   }
   ```

3. **使用 DOMPurify 库**
   ```javascript
   const clean = DOMPurify.sanitize(userInput);
   ```

4. **验证和清理输入**
   - 不信任任何用户输入
   - 白名单验证
   - 限制输入长度和格式

5. **CSP (内容安全策略)**
   - 使用 HTTP 头限制脚本来源
</details>

---

**5. localStorage 和 sessionStorage 的区别？**

<details>
<summary>查看答案</summary>

| 特性 | localStorage | sessionStorage |
|------|--------------|----------------|
| **持久性** | 永久存储，除非手动删除 | 标签页关闭后清除 |
| **作用域** | 同源（协议+域名+端口） | 同源 + 同标签页 |
| **容量** | 约 5-10MB | 约 5-10MB |
| **跨标签共享** | 是 | 否 |

**使用场景**：

**localStorage**：
- 用户偏好设置（主题、语言）
- 本地缓存数据
- 购物车（非敏感）

**sessionStorage**：
- 表单数据（临时）
- 单次会话状态
- 向导步骤进度

**共同点**：
- 只能存储字符串
- 需要 `JSON.stringify()` / `JSON.parse()`
- 同步 API
- 不会随 HTTP 请求发送
</details>

---

## ✅ 阶段完成检查清单

在进入下一阶段前，请确保你能够做到以下几点：

### JavaScript 基础
- [ ] 理解 `const`、`let` 的使用场景
- [ ] 能够正确使用 `if`、`switch`、`for`、`while`
- [ ] 理解数据类型和类型转换
- [ ] 能够使用模板字符串

### 函数
- [ ] 能够声明和调用函数
- [ ] 理解函数参数和返回值
- [ ] 掌握箭头函数语法
- [ ] 理解作用域和闭包
- [ ] 能够解释 `this` 的绑定规则

### 对象和数组
- [ ] 能够创建和操作对象
- [ ] 熟练使用数组方法（`map`、`filter`、`reduce`）
- [ ] 理解解构赋值
- [ ] 掌握展开运算符
- [ ] 能够处理嵌套数据结构

### 异步编程
- [ ] 理解同步和异步的区别
- [ ] 能够创建和使用 Promise
- [ ] 掌握 `async`/`await` 语法
- [ ] 能够处理异步错误
- [ ] 理解 Promise 的链式调用

### DOM 操作
- [ ] 能够选择 DOM 元素
- [ ] 能够修改元素内容和样式
- [ ] 能够创建和删除元素
- [ ] 理解事件处理和事件委托
- [ ] 能够进行表单验证

### 浏览器 API
- [ ] 能够使用 localStorage 存储数据
- [ ] 理解 JSON 序列化和反序列化
- [ ] 了解 cookie 和 storage 的区别

### 实战能力
- [ ] 完成待办事项应用项目
- [ ] 能够组织和结构化代码
- [ ] 能够调试和解决问题
- [ ] 理解并应用最佳实践

### 代码质量
- [ ] 代码有适当的注释和日志
- [ ] 遵循命名规范
- [ ] 能够处理错误和边界情况
- [ ] 代码结构清晰，易于维护

---

## 🎯 下一步

### 如果检查清单大部分勾选 ✅

恭喜！你已经掌握了 JavaScript 基础，可以：
1. **进入阶段 2** - [TypeScript 入门](../../stage-2-intermediate/)
2. **分享作品** - 将待办应用部署到 GitHub Pages
3. **扩展项目** - 尝试添加更多功能

### 如果还有不熟悉的部分 ⚠️

建议：
1. **重点复习** - 回顾不熟悉的章节
2. **多做练习** - 重做相关练习题
3. **实践应用** - 在项目中使用这些知识
4. **寻求帮助** - 查看 FAQ 或参考资源

### 持续学习建议

1. **每天编码** - 保持编程习惯
2. **阅读文档** - MDN 是最好的参考
3. **参与社区** - Stack Overflow、GitHub
4. **构建项目** - 实践是最好的老师

---

## 📚 参考资源

### 在线练习平台
- [LeetCode](https://leetcode.cn/) - 算法练习
- [Codewars](https://www.codewars.com/) - 编程挑战
- [JavaScript30](https://javascript30.com/) - 30 个 JS 项目

### 学习资源
- [MDN JavaScript 指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide)
- [JavaScript.info](https://zh.javascript.info/)
- [Eloquent JavaScript](https://eloquentjavascript.net/)

### 代码质量
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 🆕 原型链与原型继承练习

### 练习 16: 不用 class 关键字实现继承（基础）

**难度**: ⭐⭐
**涉及知识点**: 原型链、构造函数、`Object.create()`、`new` 操作符
**预计时间**: 20分钟

**题目描述**: 

不使用 ES6 的 `class` 关键字，使用原型链实现一个简单的动物继承体系。

**要求**:
1. 创建构造函数 `Animal`，包含 `name` 属性和 `speak()` 方法
2. 创建构造函数 `Dog`，继承自 `Animal`，添加 `breed` 属性
3. 在 `Dog.prototype` 上添加 `bark()` 方法
4. 正确设置原型链，确保 `instanceof` 和 `constructor` 正确
5. 创建实例并测试继承关系

**提示**: 使用 `Object.create()` 或手动设置 `__proto__`

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/16-prototype-inheritance.js`

**思路说明**:
1. 使用构造函数模拟类的概念
2. 通过 `Object.create()` 建立原型链
3. 修复 `constructor` 指向
4. 调用父构造函数初始化继承的属性

**关键代码**:
```javascript
// 父类构造函数
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(`${this.name} 发出声音`);
};

// 子类构造函数
function Dog(name, breed) {
  // 调用父构造函数
  Animal.call(this, name);
  this.breed = breed;
}

// 建立原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 子类方法
Dog.prototype.bark = function() {
  console.log(`${this.name} 汪汪叫`);
};

// 测试
const dog = new Dog('旺财', '金毛');
console.log(dog.name);           // 旺财
console.log(dog.breed);          // 金毛
dog.speak();                     // 旺财 发出声音
dog.bark();                      // 旺财 汪汪叫
console.log(dog instanceof Dog);      // true
console.log(dog instanceof Animal);   // true
console.log(dog.constructor === Dog); // true
```

</details>

---

### 练习 17: 原型链查找机制分析（进阶）

**难度**: ⭐⭐⭐
**涉及知识点**: 原型链查找、属性屏蔽、`hasOwnProperty`
**预计时间**: 25分钟

**题目描述**: 

分析并预测以下代码的输出，然后实现一个函数追踪原型链查找过程。

**要求**:
1. 预测代码输出并解释原因
2. 实现 `tracePrototypeChain(obj, prop)` 函数
3. 该函数应输出属性查找的完整路径
4. 区分自有属性和继承属性

**提示**: 使用 `Object.getPrototypeOf()` 遍历原型链

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/17-prototype-lookup.js`

**思路说明**:
1. 属性首先在对象自身查找
2. 如果找不到，沿着 `__proto__` 链向上查找
3. 直到找到属性或到达 `null`
4. 使用 `hasOwnProperty` 区分自有和继承属性

**关键代码**:
```javascript
function tracePrototypeChain(obj, prop) {
  console.log(`\n查找属性 "${prop}" 的过程:\n`);
  
  let current = obj;
  let depth = 0;
  
  while (current !== null) {
    const indent = '  '.repeat(depth);
    const objName = current.constructor.name || 'Object';
    
    if (current.hasOwnProperty(prop)) {
      console.log(`${indent}✓ 在 ${objName} 的自有属性中找到`);
      console.log(`${indent}  值: ${current[prop]}`);
      return current[prop];
    } else {
      console.log(`${indent}✗ 在 ${objName} 中未找到，继续向上查找...`);
    }
    
    current = Object.getPrototypeOf(current);
    depth++;
  }
  
  console.log(`  ✗ 查找到原型链末端，属性不存在`);
  return undefined;
}

// 测试
const obj = {
  a: 1,
  b: 2
};

Object.setPrototypeOf(obj, {
  b: 20,
  c: 3
});

tracePrototypeChain(obj, 'a');  // 在 obj 自身找到
tracePrototypeChain(obj, 'b');  // 在 obj 自身找到（屏蔽了原型的 b）
tracePrototypeChain(obj, 'c');  // 在原型中找到
tracePrototypeChain(obj, 'd');  // 找不到
```

</details>

---

### 练习 18: 实现一个简单的 instanceof（挑战）

**难度**: ⭐⭐⭐⭐
**涉及知识点**: 原型链遍历、`instanceof` 原理、类型检查
**预计时间**: 30分钟

**题目描述**: 

手动实现 `instanceof` 运算符的功能，理解其底层原理。

**要求**:
1. 实现 `myInstanceof(obj, Constructor)` 函数
2. 函数应模拟 `instanceof` 的行为
3. 正确处理 `null`、基本类型等边界情况
4. 添加详细的日志输出查找过程
5. 通过测试用例验证

**提示**: `instanceof` 检查构造函数的 `prototype` 是否在对象的原型链上

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `solutions/18-my-instanceof.js`

**思路说明**:
1. `instanceof` 检查右侧构造函数的 `prototype` 属性
2. 是否存在于左侧对象的原型链上
3. 沿着原型链逐层向上查找
4. 处理特殊情况：null、基本类型

**关键代码**:
```javascript
function myInstanceof(obj, Constructor) {
  console.log(`\n检查: ${obj} instanceof ${Constructor.name}`);
  
  // 处理基本类型和 null
  if (obj === null || typeof obj !== 'object') {
    console.log('  ✗ 左侧不是对象，返回 false');
    return false;
  }
  
  // 获取构造函数的 prototype
  const prototype = Constructor.prototype;
  console.log(`  目标 prototype: ${Constructor.name}.prototype`);
  
  // 获取对象的原型
  let current = Object.getPrototypeOf(obj);
  let depth = 1;
  
  // 遍历原型链
  while (current !== null) {
    console.log(`  [深度 ${depth}] 当前原型: ${current.constructor?.name || 'Unknown'}`);
    
    if (current === prototype) {
      console.log(`  ✓ 找到匹配的 prototype，返回 true`);
      return true;
    }
    
    current = Object.getPrototypeOf(current);
    depth++;
  }
  
  console.log(`  ✗ 遍历完原型链，未找到匹配，返回 false`);
  return false;
}

// 测试
function Animal(name) {
  this.name = name;
}

function Dog(name) {
  Animal.call(this, name);
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const dog = new Dog('旺财');

console.log('\n=== 测试用例 ===');
console.log('dog instanceof Dog:', myInstanceof(dog, Dog));       // true
console.log('dog instanceof Animal:', myInstanceof(dog, Animal)); // true
console.log('dog instanceof Object:', myInstanceof(dog, Object)); // true
console.log('dog instanceof Array:', myInstanceof(dog, Array));   // false
console.log('"hello" instanceof String:', myInstanceof('hello', String)); // false
```

</details>

---

**祝你学习愉快！继续加油！** 🚀
