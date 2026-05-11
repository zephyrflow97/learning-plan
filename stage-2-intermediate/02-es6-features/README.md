# ES6+ 现代特性

## 学习目标

完成本章节后，你将能够：

1. 掌握 ES6+ 模块系统（import/export）
2. 理解和使用类（Class）和继承
3. 掌握迭代器（Iterator）和生成器（Generator）
4. 理解 Symbol 类型和 Map/Set 数据结构
5. 熟练使用可选链和空值合并运算符
6. 掌握解构赋值和展开运算符的高级用法

## 前置知识

- JavaScript 基础语法
- 函数和对象
- TypeScript 基础类型

## 1. 模块系统（Modules）

> **🧱 The Metaphor: The Lego Blocks**
> 在 ES6 之前，JavaScript 的代码组织就像是一堆**散落的粘土**（全局变量污染）。
> 模块系统（Modules）将代码变成了**乐高积木**。
> 每个文件都是一块独立的积木，拥有自己的私有空间。
> `export` 是积木上的**凸起**（接口），`import` 是积木底部的**凹槽**（依赖）。
> 通过这种方式，我们可以搭建出摩天大楼（大型应用），而不用担心底层的积木会互相融合变形。

ES6 引入了标准化的模块系统，取代了 CommonJS 和 AMD。

### 1.1 导出（Export）

```typescript
// math.ts - 数学工具模块

// 命名导出
export function add(a: number, b: number): number {
  console.log(`[TRACE] math.add: ${a} + ${b}`);
  return a + b;
}

export function subtract(a: number, b: number): number {
  console.log(`[TRACE] math.subtract: ${a} - ${b}`);
  return a - b;
}

// 导出常量
export const PI = 3.14159;
export const E = 2.71828;

// 导出类
export class Calculator {
  multiply(a: number, b: number): number {
    console.log(`[TRACE] Calculator.multiply: ${a} * ${b}`);
    return a * b;
  }
  
  divide(a: number, b: number): number {
    if (b === 0) {
      console.log('[ERROR] Calculator.divide: 除数不能为零');
      throw new Error('除数不能为零');
    }
    console.log(`[TRACE] Calculator.divide: ${a} / ${b}`);
    return a / b;
  }
}

// 导出接口
export interface MathOperation {
  (a: number, b: number): number;
}

// 默认导出
export default class MathUtils {
  static max(...numbers: number[]): number {
    console.log(`[TRACE] MathUtils.max: 输入数组长度 ${numbers.length}`);
    return Math.max(...numbers);
  }
  
  static min(...numbers: number[]): number {
    console.log(`[TRACE] MathUtils.min: 输入数组长度 ${numbers.length}`);
    return Math.min(...numbers);
  }
}
```

### 1.2 导入（Import）

```typescript
// app.ts - 使用数学模块

// 导入命名导出
import { add, subtract, PI } from './math';

console.log(`[INFO] 加法结果: ${add(10, 5)}`);
console.log(`[INFO] 减法结果: ${subtract(10, 5)}`);
console.log(`[INFO] 圆周率: ${PI}`);

// 导入所有命名导出为一个对象
import * as MathModule from './math';

console.log(`[INFO] 使用模块对象: ${MathModule.add(3, 4)}`);
console.log(`[INFO] 自然常数: ${MathModule.E}`);

// 导入默认导出
import MathUtils from './math';

console.log(`[INFO] 最大值: ${MathUtils.max(1, 5, 3, 9, 2)}`);

// 导入默认和命名导出
import MathUtils2, { Calculator } from './math';

const calc = new Calculator();
console.log(`[INFO] 乘法结果: ${calc.multiply(4, 5)}`);

// 重命名导入
import { add as addition, subtract as subtraction } from './math';

console.log(`[INFO] 重命名后的加法: ${addition(7, 3)}`);

// 仅执行模块（副作用导入）
import './initialize-app';  // 执行模块中的代码但不导入任何内容
```

### 1.3 重新导出

```typescript
// index.ts - 模块聚合

// 重新导出所有命名导出
export * from './math';
export * from './string-utils';

// 重新导出默认导出（需要命名）
export { default as MathUtils } from './math';
export { default as StringUtils } from './string-utils';

// 选择性重新导出
export { add, subtract } from './math';

console.log('[INFO] 模块索引文件加载完成');
```

### 1.4 动态导入

```typescript
// 动态导入（代码分割）
async function loadMathModule() {
  console.log('[INFO] 开始动态加载数学模块...');
  
  try {
    const mathModule = await import('./math');
    const result = mathModule.add(10, 20);
    console.log(`[INFO] 动态导入结果: ${result}`);
    return result;
  } catch (error) {
    console.log(`[ERROR] 模块加载失败: ${error}`);
    throw error;
  }
}

// 条件导入
async function conditionalImport(useAdvanced: boolean) {
  console.log(`[INFO] 条件导入: useAdvanced=${useAdvanced}`);
  
  if (useAdvanced) {
    const advancedMath = await import('./advanced-math');
    return advancedMath.default;
  } else {
    const basicMath = await import('./basic-math');
    return basicMath.default;
  }
}

loadMathModule();
```

## 2. 类（Classes）

ES6 引入了基于类的面向对象编程语法。

### 2.1 基本类定义

```typescript
class Person {
  // 属性声明（TypeScript 特性）
  name: string;
  age: number;
  private _email: string;  // 私有属性
  
  // 构造函数
  constructor(name: string, age: number, email: string) {
    console.log(`[INFO] 创建 Person 实例: ${name}`);
    this.name = name;
    this.age = age;
    this._email = email;
  }
  
  // 方法
  greet(): void {
    console.log(`[LOG] ${this.name} 说: 你好！`);
  }
  
  // Getter
  get email(): string {
    console.log('[TRACE] 访问 email getter');
    return this._email;
  }
  
  // Setter
  set email(value: string) {
    console.log(`[TRACE] 设置 email: ${value}`);
    if (value.includes('@')) {
      this._email = value;
    } else {
      console.log('[ERROR] 无效的邮箱格式');
      throw new Error('无效的邮箱格式');
    }
  }
  
  // 静态方法
  static create(name: string, age: number, email: string): Person {
    console.log('[INFO] 使用工厂方法创建 Person');
    return new Person(name, age, email);
  }
  
  // 静态属性
  static species = 'Homo sapiens';
}

// 使用类
const person = new Person('Alice', 25, 'alice@example.com');
person.greet();
console.log(`[INFO] Email: ${person.email}`);

const person2 = Person.create('Bob', 30, 'bob@example.com');
console.log(`[INFO] 物种: ${Person.species}`);
```

### 2.2 继承（Inheritance）

> **🧬 The Metaphor: The Genetic Inheritance**
> 类继承就像是**生物进化**。
> 子类（Child）继承了父类（Parent）的基因（属性和方法）。
> *   **复用**: 子类天生就会父类的技能，不用重新学。
> *   **重写 (Override)**: 子类可以进化出更强的技能，覆盖父类的旧技能。
> *   **多态 (Polymorphism)**: 虽然大家都是 `Animal`，但 `Dog` 会汪汪叫，`Cat` 会喵喵叫。
> 
> **警示**: 不要为了复用代码而滥用继承（组合优于继承）。如果仅仅因为“香蕉”和“大猩猩”都“喜欢森林”，就让它们继承同一个父类，你会得到一个拿着香蕉的大猩猩，而你其实只想要香蕉。

```typescript
// 基类
class Animal {
  protected name: string;  // protected: 子类可以访问
  
  constructor(name: string) {
    console.log(`[INFO] 创建 Animal: ${name}`);
    this.name = name;
  }
  
  move(distance: number): void {
    console.log(`[LOG] ${this.name} 移动了 ${distance} 米`);
  }
  
  makeSound(): void {
    console.log('[LOG] 动物发出声音');
  }
}

// 派生类
class Dog extends Animal {
  private breed: string;
  
  constructor(name: string, breed: string) {
    super(name);  // 调用父类构造函数
    console.log(`[INFO] 创建 Dog: ${name}, 品种: ${breed}`);
    this.breed = breed;
  }
  
  // 重写父类方法
  makeSound(): void {
    console.log(`[SOUND] ${this.name} 叫: 汪汪汪！`);
  }
  
  // 新增方法
  fetch(): void {
    console.log(`[LOG] ${this.name} 去捡球了`);
  }
  
  // 访问父类方法
  moveAndSound(distance: number): void {
    super.move(distance);
    this.makeSound();
  }
}

class Cat extends Animal {
  constructor(name: string) {
    super(name);
    console.log(`[INFO] 创建 Cat: ${name}`);
  }
  
  makeSound(): void {
    console.log(`[SOUND] ${this.name} 叫: 喵喵喵！`);
  }
  
  climb(): void {
    console.log(`[LOG] ${this.name} 爬树了`);
  }
}

// 使用继承
const dog = new Dog('Buddy', 'Golden Retriever');
dog.makeSound();
dog.fetch();
dog.moveAndSound(10);

const cat = new Cat('Whiskers');
cat.makeSound();
cat.climb();
```

### 2.3 访问修饰符

```typescript
class BankAccount {
  public accountNumber: string;      // 公共属性（默认）
  protected balance: number;          // 受保护属性
  private pin: string;                // 私有属性
  readonly createdAt: Date;           // 只读属性
  
  constructor(accountNumber: string, initialBalance: number, pin: string) {
    console.log(`[INFO] 创建银行账户: ${accountNumber}`);
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
    this.pin = pin;
    this.createdAt = new Date();
  }
  
  // 公共方法
  public deposit(amount: number): void {
    console.log(`[TRACE] 存款: ${amount}`);
    if (amount > 0) {
      this.balance += amount;
      console.log(`[INFO] 存款成功，当前余额: ${this.balance}`);
    } else {
      console.log('[ERROR] 存款金额必须大于0');
    }
  }
  
  // 受保护方法（子类可以访问）
  protected validatePin(inputPin: string): boolean {
    console.log('[TRACE] 验证 PIN');
    return this.pin === inputPin;
  }
  
  // 私有方法（只能在类内部访问）
  private logTransaction(type: string, amount: number): void {
    console.log(`[LOG] 交易记录: ${type}, 金额: ${amount}, 时间: ${new Date()}`);
  }
  
  public withdraw(amount: number, inputPin: string): boolean {
    console.log(`[TRACE] 取款: ${amount}`);
    
    if (!this.validatePin(inputPin)) {
      console.log('[ERROR] PIN 错误');
      return false;
    }
    
    if (amount > this.balance) {
      console.log('[ERROR] 余额不足');
      return false;
    }
    
    this.balance -= amount;
    this.logTransaction('取款', amount);
    console.log(`[INFO] 取款成功，当前余额: ${this.balance}`);
    return true;
  }
  
  // 参数属性简写（TypeScript 特性）
  constructor2(
    public accountNumber2: string,
    protected balance2: number,
    private pin2: string
  ) {
    // 自动创建并初始化属性
    console.log('[INFO] 使用参数属性创建账户');
  }
}

const account = new BankAccount('123456', 1000, '1234');
account.deposit(500);
account.withdraw(200, '1234');
// account.balance;  // ❌ 错误：protected 属性不能在类外部访问
// account.pin;      // ❌ 错误：private 属性不能在类外部访问
```

### 2.4 抽象类

```typescript
// 抽象类不能被实例化，只能被继承
abstract class Shape {
  protected color: string;
  
  constructor(color: string) {
    console.log(`[INFO] 创建形状，颜色: ${color}`);
    this.color = color;
  }
  
  // 抽象方法（子类必须实现）
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;
  
  // 具体方法（子类可以直接使用）
  getColor(): string {
    console.log(`[TRACE] 获取颜色: ${this.color}`);
    return this.color;
  }
  
  describe(): void {
    console.log(`[LOG] 这是一个${this.color}的形状，面积: ${this.calculateArea()}`);
  }
}

class Circle extends Shape {
  private radius: number;
  
  constructor(color: string, radius: number) {
    super(color);
    console.log(`[INFO] 创建圆形，半径: ${radius}`);
    this.radius = radius;
  }
  
  calculateArea(): number {
    const area = Math.PI * this.radius ** 2;
    console.log(`[TRACE] 计算圆形面积: ${area}`);
    return area;
  }
  
  calculatePerimeter(): number {
    const perimeter = 2 * Math.PI * this.radius;
    console.log(`[TRACE] 计算圆形周长: ${perimeter}`);
    return perimeter;
  }
}

class Rectangle extends Shape {
  constructor(
    color: string,
    private width: number,
    private height: number
  ) {
    super(color);
    console.log(`[INFO] 创建矩形，宽: ${width}, 高: ${height}`);
  }
  
  calculateArea(): number {
    const area = this.width * this.height;
    console.log(`[TRACE] 计算矩形面积: ${area}`);
    return area;
  }
  
  calculatePerimeter(): number {
    const perimeter = 2 * (this.width + this.height);
    console.log(`[TRACE] 计算矩形周长: ${perimeter}`);
    return perimeter;
  }
}

// 使用抽象类
// const shape = new Shape('red');  // ❌ 错误：不能实例化抽象类

const circle = new Circle('red', 5);
circle.describe();

const rectangle = new Rectangle('blue', 4, 6);
rectangle.describe();
```

## 3. 迭代器（Iterators）

> **🎓 CS Master's Bridge: The Iterator Pattern**
>
> 这就是 GoF 设计模式中的 **Iterator Pattern**。
> *   **C++**: `std::vector<int>::iterator` 重载了 `++` 和 `*` 操作符。
> *   **JS**: 实现了 `next()` 方法，返回 `{ value, done }`。
>
> `for...of` 循环本质上是 `while(!it.next().done)` 的语法糖。

### 3.1 可迭代对象

```typescript
// 实现自定义可迭代对象
class Range {
  constructor(
    private start: number,
    private end: number
  ) {
    console.log(`[INFO] 创建 Range: ${start} 到 ${end}`);
  }
  
  // 实现 Symbol.iterator 方法
  [Symbol.iterator](): Iterator<number> {
    console.log('[TRACE] 创建迭代器');
    let current = this.start;
    const end = this.end;
    
    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          const value = current++;
          console.log(`[TRACE] 迭代器返回: ${value}`);
          return { value, done: false };
        } else {
          console.log('[TRACE] 迭代完成');
          return { value: undefined, done: true };
        }
      }
    };
  }
}

// 使用可迭代对象
const range = new Range(1, 5);

console.log('[INFO] 使用 for...of 遍历:');
for (const num of range) {
  console.log(`[LOG] 数字: ${num}`);
}

console.log('[INFO] 使用展开运算符:');
const numbers = [...range];
console.log(`[LOG] 数组: ${numbers}`);
```

### 3.2 内置可迭代对象

```typescript
// 数组
const arr = [1, 2, 3, 4, 5];
console.log('[INFO] 遍历数组:');
for (const item of arr) {
  console.log(`[LOG] 元素: ${item}`);
}

// 字符串
const str = 'Hello';
console.log('[INFO] 遍历字符串:');
for (const char of str) {
  console.log(`[LOG] 字符: ${char}`);
}

// Map
const map = new Map([
  ['name', 'Alice'],
  ['age', '25']
]);
console.log('[INFO] 遍历 Map:');
for (const [key, value] of map) {
  console.log(`[LOG] ${key}: ${value}`);
}

// Set
const set = new Set([1, 2, 3, 4, 5]);
console.log('[INFO] 遍历 Set:');
for (const item of set) {
  console.log(`[LOG] 元素: ${item}`);
}
```

## 4. 生成器（Generators）

> **⏯️ The Metaphor: The Pause Button**
> 普通函数就像是**过山车**：一旦开始（调用），就必须一口气跑完全程，中间停不下来。
> 生成器（Generator）给函数装上了一个**暂停键**（`yield`）。
> *   函数可以运行一半，暂停，把控制权交还给调用者。
> *   调用者可以做点别的事，然后按**播放键**（`next`），函数从上次暂停的地方继续运行。
> 
> 这不仅仅是好玩，它是**异步编程**（Async/Await）的基石，也是实现**无限序列**（Infinite Sequence）的魔法。

生成器是一种特殊的迭代器，可以暂停和恢复执行。

> **🔧 Under the Hood: Stackless Coroutines**
>
> Generator 是 **Stackless Coroutines (无栈协程)** 的实现。
> *   **State Machine**: 编译器将 Generator 函数转换成一个状态机 (Switch-Case)。
> *   **Context Saving**: `yield` 关键字会保存当前的局部变量和指令指针 (IP) 到堆上的 Generator 对象中。
> *   **Context Restoring**: `next()` 方法会恢复上下文，并跳转到上次 `yield` 之后的位置继续执行。
>
> 这与 C++20 的 `co_yield` 机制非常相似。

### 4.1 基本生成器

```typescript
// 生成器函数使用 function* 语法
function* numberGenerator(): Generator<number> {
  console.log('[INFO] 生成器开始执行');
  
  yield 1;
  console.log('[TRACE] 生成器恢复执行 (after 1)');
  
  yield 2;
  console.log('[TRACE] 生成器恢复执行 (after 2)');
  
  yield 3;
  console.log('[TRACE] 生成器恢复执行 (after 3)');
  
  console.log('[INFO] 生成器执行完成');
}

// 使用生成器
const gen = numberGenerator();
console.log(`[LOG] 第一次调用: ${gen.next().value}`);
console.log(`[LOG] 第二次调用: ${gen.next().value}`);
console.log(`[LOG] 第三次调用: ${gen.next().value}`);
console.log(`[LOG] 第四次调用: ${JSON.stringify(gen.next())}`);

// 使用 for...of 遍历生成器
console.log('[INFO] 使用 for...of:');
for (const num of numberGenerator()) {
  console.log(`[LOG] 数字: ${num}`);
}
```

### 4.2 生成器参数

```typescript
function* parameterizedGenerator(): Generator<number, void, number> {
  console.log('[INFO] 生成器启动');
  
  const value1 = yield 1;
  console.log(`[TRACE] 接收到参数: ${value1}`);
  
  const value2 = yield 2;
  console.log(`[TRACE] 接收到参数: ${value2}`);
  
  yield 3;
  console.log('[INFO] 生成器完成');
}

const gen2 = parameterizedGenerator();
console.log(`[LOG] ${gen2.next().value}`);      // 启动生成器
console.log(`[LOG] ${gen2.next(10).value}`);    // 传入 10
console.log(`[LOG] ${gen2.next(20).value}`);    // 传入 20
```

### 4.3 实际应用：无限序列

```typescript
// 斐波那契数列生成器
function* fibonacci(): Generator<number> {
  console.log('[INFO] 斐波那契生成器启动');
  let [prev, curr] = [0, 1];
  
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
    console.log(`[TRACE] 下一个斐波那契数准备中...`);
  }
}

// 获取前 10 个斐波那契数
const fib = fibonacci();
const first10 = [];
for (let i = 0; i < 10; i++) {
  first10.push(fib.next().value);
}
console.log(`[INFO] 前 10 个斐波那契数: ${first10}`);

// ID 生成器
function* idGenerator(): Generator<string> {
  console.log('[INFO] ID 生成器启动');
  let id = 1;
  
  while (true) {
    yield `ID-${id++}`;
    console.log(`[TRACE] 生成 ID: ID-${id - 1}`);
  }
}

const idGen = idGenerator();
console.log(`[LOG] ${idGen.next().value}`);
console.log(`[LOG] ${idGen.next().value}`);
console.log(`[LOG] ${idGen.next().value}`);
```

### 4.4 生成器组合

```typescript
function* gen1(): Generator<number> {
  yield 1;
  yield 2;
}

function* gen2(): Generator<number> {
  yield 3;
  yield 4;
}

function* combinedGenerator(): Generator<number> {
  console.log('[INFO] 组合生成器启动');
  
  yield* gen1();  // 委托给 gen1
  console.log('[TRACE] gen1 完成，切换到 gen2');
  
  yield* gen2();  // 委托给 gen2
  console.log('[TRACE] gen2 完成');
}

console.log('[INFO] 遍历组合生成器:');
for (const num of combinedGenerator()) {
  console.log(`[LOG] 数字: ${num}`);
}
```

## 5. Symbol

Symbol 是 ES6 引入的新的原始数据类型，表示独一无二的值。

### 5.1 创建 Symbol

```typescript
// 创建 Symbol
const sym1 = Symbol();
const sym2 = Symbol('description');

console.log(`[INFO] Symbol 1: ${sym1.toString()}`);
console.log(`[INFO] Symbol 2: ${sym2.toString()}`);

// 每个 Symbol 都是唯一的
const sym3 = Symbol('description');
console.log(`[DEBUG] sym2 === sym3: ${sym2 === sym3}`);  // false

// Symbol.for() 创建全局 Symbol
const globalSym1 = Symbol.for('app.id');
const globalSym2 = Symbol.for('app.id');
console.log(`[DEBUG] globalSym1 === globalSym2: ${globalSym1 === globalSym2}`);  // true

// Symbol.keyFor() 获取全局 Symbol 的键
const key = Symbol.keyFor(globalSym1);
console.log(`[INFO] 全局 Symbol 键: ${key}`);
```

### 5.2 Symbol 作为属性键

```typescript
// 使用 Symbol 作为对象属性键
const ID = Symbol('id');
const user = {
  name: 'Alice',
  age: 25,
  [ID]: 12345  // Symbol 属性
};

console.log(`[INFO] 用户名: ${user.name}`);
console.log(`[INFO] 用户 ID: ${user[ID]}`);

// Symbol 属性不会出现在 for...in 循环中
console.log('[INFO] 遍历属性:');
for (const key in user) {
  console.log(`[LOG] ${key}: ${user[key as keyof typeof user]}`);
}

// 获取 Symbol 属性
const symbols = Object.getOwnPropertySymbols(user);
console.log(`[INFO] Symbol 属性数量: ${symbols.length}`);
```

### 5.3 内置 Symbol

```typescript
// Symbol.iterator - 定义默认迭代器
class Counter {
  constructor(private max: number) {
    console.log(`[INFO] 创建计数器，最大值: ${max}`);
  }
  
  [Symbol.iterator]() {
    let count = 0;
    const max = this.max;
    
    return {
      next() {
        if (count < max) {
          return { value: count++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

const counter = new Counter(5);
console.log(`[INFO] 计数器数组: ${[...counter]}`);

// Symbol.toStringTag - 自定义对象的字符串描述
class ValidatorClass {
  get [Symbol.toStringTag]() {
    return 'Validator';
  }
}

const validator = new ValidatorClass();
console.log(`[INFO] 对象类型: ${Object.prototype.toString.call(validator)}`);

// Symbol.hasInstance - 自定义 instanceof 行为
class MyArray {
  static [Symbol.hasInstance](instance: any) {
    console.log('[TRACE] 检查 instanceof');
    return Array.isArray(instance);
  }
}

console.log(`[DEBUG] [] instanceof MyArray: ${[] instanceof MyArray}`);
```

## 6. Map 和 Set

### 6.1 Map

> **🗺️ The Metaphor: The True Dictionary**
> 普通对象 (`{}`) 就像是一本**残缺的字典**。
> *   它的键（Key）只能是字符串或 Symbol。
> *   它没有直接的 `size` 属性告诉你它有多少条目。
> *   它还混杂着原型链上的“杂质”。
> 
> **Map** 是**真正的字典**。
> *   **万物皆可为键**: 你可以用对象、函数、甚至另一个 Map 作为键。
> *   **有序**: 它记得你插入的顺序。
> *   **纯净**: 它只包含你放进去的东西，没有继承的噪音。
> 
> 当你需要频繁增删键值对，或者键不是字符串时，请毫不犹豫地选择 Map。

Map 是键值对的集合，键可以是任意类型。

```typescript
// 创建 Map
const userMap = new Map<number, string>();

// 设置值
userMap.set(1, 'Alice');
userMap.set(2, 'Bob');
userMap.set(3, 'Charlie');
console.log('[INFO] Map 初始化完成');

// 获取值
console.log(`[LOG] 用户 1: ${userMap.get(1)}`);

// 检查键是否存在
console.log(`[DEBUG] 是否存在用户 2: ${userMap.has(2)}`);

// 删除键值对
userMap.delete(3);
console.log(`[INFO] 删除用户 3`);

// 获取大小
console.log(`[INFO] Map 大小: ${userMap.size}`);

// 遍历 Map
console.log('[INFO] 遍历 Map:');
userMap.forEach((value, key) => {
  console.log(`[LOG] ${key}: ${value}`);
});

// 使用 for...of 遍历
console.log('[INFO] 使用 for...of:');
for (const [key, value] of userMap) {
  console.log(`[LOG] ${key} => ${value}`);
}

// 从数组创建 Map
const map2 = new Map([
  ['name', 'Alice'],
  ['age', 25],
  ['city', 'Beijing']
]);

// 获取所有键
console.log(`[INFO] 所有键: ${Array.from(map2.keys())}`);

// 获取所有值
console.log(`[INFO] 所有值: ${Array.from(map2.values())}`);

// 清空 Map
map2.clear();
console.log(`[INFO] Map 已清空，大小: ${map2.size}`);
```

### 6.2 WeakMap

WeakMap 的键必须是对象，且不会阻止垃圾回收。

```typescript
// WeakMap 示例
const weakMap = new WeakMap();

let obj1 = { name: 'Alice' };
let obj2 = { name: 'Bob' };

weakMap.set(obj1, 'User 1');
weakMap.set(obj2, 'User 2');

console.log(`[LOG] obj1 的值: ${weakMap.get(obj1)}`);
console.log(`[DEBUG] 是否有 obj1: ${weakMap.has(obj1)}`);

// WeakMap 的键是弱引用，对象可以被垃圾回收
obj1 = null;  // obj1 可以被垃圾回收
console.log('[INFO] obj1 设置为 null，可以被回收');

// WeakMap 的实际应用：私有数据存储
const privateData = new WeakMap();

class Person {
  constructor(name: string, ssn: string) {
    console.log(`[INFO] 创建 Person: ${name}`);
    this.name = name;
    // 将敏感数据存储在 WeakMap 中
    privateData.set(this, { ssn });
  }
  
  name: string;
  
  getSSN(): string {
    const data = privateData.get(this);
    console.log('[TRACE] 访问私有数据');
    return data ? data.ssn : '';
  }
}

const person = new Person('Alice', '123-45-6789');
console.log(`[INFO] SSN: ${person.getSSN()}`);
```

### 6.3 Set

> **🦄 The Metaphor: The Club of Uniqueness**
> Set 就像是一个**精英俱乐部**。
> 它的入会规则只有一条：**拒绝平庸的复制**。
> 如果你已经在这个俱乐部里了，不管你再申请多少次，门卫都会把你拦在外面。
> 这让 Set 成为了**去重**的神器。
> 扔给它一堆乱七八糟的重复数据，它会还给你一个干净、纯粹、独一无二的集合。

Set 是值的集合，每个值都是唯一的。

```typescript
// 创建 Set
const numberSet = new Set<number>();

// 添加值
numberSet.add(1);
numberSet.add(2);
numberSet.add(3);
numberSet.add(2);  // 重复值会被忽略
console.log(`[INFO] Set 大小: ${numberSet.size}`);

// 检查值是否存在
console.log(`[DEBUG] 是否包含 2: ${numberSet.has(2)}`);

// 删除值
numberSet.delete(3);
console.log('[INFO] 删除值 3');

// 遍历 Set
console.log('[INFO] 遍历 Set:');
numberSet.forEach(value => {
  console.log(`[LOG] 值: ${value}`);
});

// 从数组创建 Set（数组去重）
const arr = [1, 2, 2, 3, 3, 4, 5, 5];
const uniqueSet = new Set(arr);
console.log(`[INFO] 去重后: ${Array.from(uniqueSet)}`);

// Set 操作
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// 并集
const union = new Set([...setA, ...setB]);
console.log(`[INFO] 并集: ${Array.from(union)}`);

// 交集
const intersection = new Set([...setA].filter(x => setB.has(x)));
console.log(`[INFO] 交集: ${Array.from(intersection)}`);

// 差集
const difference = new Set([...setA].filter(x => !setB.has(x)));
console.log(`[INFO] 差集: ${Array.from(difference)}`);
```

### 6.4 WeakSet

WeakSet 只能存储对象，且不会阻止垃圾回收。

```typescript
const weakSet = new WeakSet();

let obj3 = { id: 1 };
let obj4 = { id: 2 };

weakSet.add(obj3);
weakSet.add(obj4);

console.log(`[DEBUG] 是否包含 obj3: ${weakSet.has(obj3)}`);

weakSet.delete(obj4);
console.log('[INFO] 删除 obj4');

// WeakSet 的实际应用：标记对象
const processedObjects = new WeakSet();

function processObject(obj: object): void {
  if (processedObjects.has(obj)) {
    console.log('[WARNING] 对象已经处理过了');
    return;
  }
  
  console.log('[INFO] 处理对象...');
  // 处理对象的逻辑
  
  processedObjects.add(obj);
  console.log('[INFO] 标记对象为已处理');
}

const myObj = { data: 'test' };
processObject(myObj);
processObject(myObj);  // 第二次调用会被跳过
```

## 7. 可选链和空值合并

### 7.1 可选链（Optional Chaining）

```typescript
interface User {
  name: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  contacts?: {
    email?: string;
    phone?: string;
  };
  getFullName?: () => string;
}

const user1: User = {
  name: 'Alice',
  address: {
    city: 'Beijing'
  }
};

const user2: User = {
  name: 'Bob'
};

// 传统方式（容易出错）
// const street = user1.address.street;  // ❌ 可能报错

// 传统安全方式（冗长）
const street1 = user1 && user1.address && user1.address.street;

// 使用可选链（简洁）
const street2 = user1.address?.street;
console.log(`[INFO] 街道: ${street2 ?? '未设置'}`);

const city = user2.address?.city;
console.log(`[INFO] 城市: ${city ?? '未设置'}`);

// 可选方法调用
const fullName = user1.getFullName?.();
console.log(`[INFO] 全名: ${fullName ?? '方法未定义'}`);

// 可选索引访问
const arr2: string[] | undefined = ['a', 'b', 'c'];
const firstItem = arr2?.[0];
console.log(`[INFO] 第一项: ${firstItem}`);

// 组合使用
const email = user1.contacts?.email ?? user2.contacts?.email ?? '无邮箱';
console.log(`[INFO] 邮箱: ${email}`);
```

### 7.2 空值合并（Nullish Coalescing）

```typescript
// || 运算符的问题
const count1 = 0 || 10;  // 10（0 被视为 falsy）
const count2 = '' || 'default';  // 'default'（空字符串被视为 falsy）

// ?? 运算符只在左侧是 null 或 undefined 时取右侧值
const count3 = 0 ?? 10;  // 0
const count4 = '' ?? 'default';  // ''
const count5 = null ?? 10;  // 10
const count6 = undefined ?? 10;  // 10

console.log(`[DEBUG] count1: ${count1}, count2: ${count2}`);
console.log(`[DEBUG] count3: ${count3}, count4: ${count4}`);
console.log(`[DEBUG] count5: ${count5}, count6: ${count6}`);

// 实际应用：配置默认值
interface Config {
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

function initializeApp(config: Config) {
  const timeout = config.timeout ?? 5000;
  const retries = config.retries ?? 3;
  const debug = config.debug ?? false;
  
  console.log(`[INFO] 配置: timeout=${timeout}, retries=${retries}, debug=${debug}`);
}

initializeApp({ timeout: 0 });  // timeout 保持为 0，不会被替换
initializeApp({});  // 使用默认值
```

### 7.3 空值合并赋值

```typescript
interface Settings {
  theme?: string;
  fontSize?: number;
  language?: string;
}

const settings: Settings = {
  theme: 'dark'
};

// 只在属性为 null 或 undefined 时赋值
settings.fontSize ??= 14;
settings.theme ??= 'light';  // theme 已经有值，不会被覆盖
settings.language ??= 'zh-CN';

console.log(`[INFO] 设置: ${JSON.stringify(settings)}`);
```

## 8. 实践练习

### 练习 1：实现一个模块化的计算器

创建一个计算器模块，包含基本运算和高级运算，使用模块导出。

```typescript
// calculator.ts
export class BasicCalculator {
  add(a: number, b: number): number {
    console.log(`[TRACE] 执行加法: ${a} + ${b}`);
    return a + b;
  }
  
  subtract(a: number, b: number): number {
    console.log(`[TRACE] 执行减法: ${a} - ${b}`);
    return a - b;
  }
}

export class ScientificCalculator extends BasicCalculator {
  power(base: number, exponent: number): number {
    console.log(`[TRACE] 执行幂运算: ${base} ^ ${exponent}`);
    return Math.pow(base, exponent);
  }
  
  sqrt(n: number): number {
    console.log(`[TRACE] 执行平方根: √${n}`);
    return Math.sqrt(n);
  }
}

export default ScientificCalculator;
```

### 练习 2：实现一个迭代器

实现一个分页迭代器，用于分页获取数据。

```typescript
class PageIterator<T> {
  private currentPage = 0;
  
  constructor(
    private data: T[],
    private pageSize: number
  ) {
    console.log(`[INFO] 创建分页迭代器，数据量: ${data.length}, 每页: ${pageSize}`);
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  next(): IteratorResult<T[]> {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    
    if (start >= this.data.length) {
      console.log('[INFO] 分页完成');
      return { value: [], done: true };
    }
    
    const page = this.data.slice(start, end);
    this.currentPage++;
    console.log(`[TRACE] 返回第 ${this.currentPage} 页，元素数: ${page.length}`);
    
    return { value: page, done: false };
  }
}

// 测试
const data = Array.from({ length: 25 }, (_, i) => i + 1);
const pages = new PageIterator(data, 10);

for (const page of pages) {
  console.log(`[LOG] 页面数据: ${page}`);
}
```

### 练习 3：使用 Map 实现缓存

```typescript
class Cache<K, V> {
  private store = new Map<K, { value: V; expireAt: number }>();
  
  set(key: K, value: V, ttl: number = 60000): void {
    const expireAt = Date.now() + ttl;
    this.store.set(key, { value, expireAt });
    console.log(`[INFO] 缓存设置: key=${String(key)}, TTL=${ttl}ms`);
  }
  
  get(key: K): V | undefined {
    const item = this.store.get(key);
    
    if (!item) {
      console.log(`[DEBUG] 缓存未命中: ${String(key)}`);
      return undefined;
    }
    
    if (Date.now() > item.expireAt) {
      console.log(`[INFO] 缓存过期，删除: ${String(key)}`);
      this.store.delete(key);
      return undefined;
    }
    
    console.log(`[DEBUG] 缓存命中: ${String(key)}`);
    return item.value;
  }
  
  clear(): void {
    this.store.clear();
    console.log('[INFO] 缓存已清空');
  }
}

// 测试
const cache = new Cache<string, any>();
cache.set('user:1', { name: 'Alice' }, 1000);
console.log(`[LOG] 获取缓存: ${JSON.stringify(cache.get('user:1'))}`);

// 等待过期
setTimeout(() => {
  console.log(`[LOG] 1 秒后获取: ${cache.get('user:1')}`);
}, 1100);
```

## 9. 常见问题解答

**Q: export 和 export default 有什么区别？**

A:
- `export` 是命名导出，一个模块可以有多个命名导出
- `export default` 是默认导出，一个模块只能有一个默认导出
- 导入时，命名导出需要使用 `{}`，默认导出不需要

**Q: class 和 function 构造函数有什么区别？**

A:
- `class` 是语法糖，底层仍然是基于原型的
- `class` 不能被提升（hoisting）
- `class` 内部默认使用严格模式
- `class` 方法不可枚举

**Q: Map 和普通对象有什么区别？**

A:
- Map 的键可以是任意类型，对象的键只能是字符串或 Symbol
- Map 有 size 属性，对象需要手动计算
- Map 是可迭代的，可以直接用 for...of
- Map 在频繁增删操作时性能更好

## 10. 最佳实践

### 10.1 模块组织

```typescript
// ✅ 推荐：明确的导出
export { add, subtract };
export default Calculator;

// ❌ 不推荐：混乱的导出
export * from './utils';
```

### 10.2 类设计

```typescript
// ✅ 推荐：单一职责
class UserRepository {
  save(user: User): Promise<void> {
    console.log('[TRACE] 保存用户');
    // 数据库操作
    return Promise.resolve();
  }
}

// ❌ 不推荐：职责过多
class UserManager {
  save() {}
  validate() {}
  sendEmail() {}
  generateReport() {}
}
```

### 10.3 使用可选链

```typescript
// ✅ 推荐：使用可选链
const city = user.address?.city ?? '未知';

// ❌ 不推荐：繁琐的检查
const city2 = user && user.address && user.address.city ? user.address.city : '未知';
```

## 11. 小结

本章我们学习了 ES6+ 的现代特性：

- ✅ 模块系统（import/export）
- ✅ 类和继承
- ✅ 迭代器和生成器
- ✅ Symbol 类型
- ✅ Map 和 Set 数据结构
- ✅ 可选链和空值合并

这些特性让 JavaScript/TypeScript 编程更加现代化和类型安全。

## 12. 下一步

- 阅读下一章：[Node.js 基础](../03-nodejs-basics/README.md)
- 完成练习题：[ES6+ 练习](../exercises/README.md#es6-特性)
- 参考资源：[MDN ES6 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
