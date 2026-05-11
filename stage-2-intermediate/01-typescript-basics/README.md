# TypeScript 基础

## 学习目标

完成本章节后，你将能够：

1. 理解 TypeScript 的类型注解和类型推断机制
2. 掌握 TypeScript 的基本类型系统
3. 熟练使用接口（interface）和类型别名（type）
4. 理解联合类型和交叉类型的应用场景
5. 掌握类型断言的正确使用方法
6. 能够配置和使用 TypeScript 编译器

## 前置知识

- JavaScript 基础语法
- 函数和对象的使用
- ES6+ 基本特性

## 为什么选择 TypeScript？

> **🛡️ The Metaphor: The Safety Net**
> JavaScript 就像是在没有安全网的高空走钢丝。你可能走得很顺（运行正常），也可能因为一个小石子（拼写错误）就摔得粉身碎骨（运行时崩溃）。
> TypeScript 就是那张**安全网**。
> 它在编译阶段（你上台表演之前）就抓住了你所有的失误。
> 虽然配置它需要一点时间（搭建安全网），但当你重构几千行代码而没有引入一个 Bug 时，你会感谢它的存在。

TypeScript 是 JavaScript 的超集，它添加了静态类型系统。这带来了以下好处：

- **编译时错误检查**：在代码运行前发现错误
- **更好的 IDE 支持**：代码补全、重构、跳转定义
- **代码文档化**：类型本身就是最好的文档
- **提高可维护性**：大型项目中显著降低 bug 率
- **渐进式采用**：可以逐步将 JavaScript 项目迁移到 TypeScript

## 1. TypeScript 环境配置

### 1.1 安装 TypeScript

```bash
# 全局安装 TypeScript
npm install -g typescript

# 验证安装
tsc --version

# 或者在项目中本地安装
npm install --save-dev typescript
```

### 1.2 初始化 TypeScript 项目

```bash
# 创建项目目录
mkdir typescript-demo
cd typescript-demo

# 初始化 npm 项目
npm init -y

# 创建 TypeScript 配置文件
tsc --init
```

### 1.3 tsconfig.json 基础配置

TypeScript 的配置文件 `tsconfig.json` 控制编译行为：

```json
{
  "compilerOptions": {
    /* 基础选项 */
    "target": "ES2020",                    // 编译目标版本
    "module": "commonjs",                  // 模块系统
    "lib": ["ES2020"],                     // 包含的库文件
    "outDir": "./dist",                    // 输出目录
    "rootDir": "./src",                    // 源代码目录
    
    /* 严格类型检查 */
    "strict": true,                        // 启用所有严格类型检查
    "noImplicitAny": true,                 // 禁止隐式 any 类型
    "strictNullChecks": true,              // 严格的 null 检查
    "strictFunctionTypes": true,           // 严格的函数类型检查
    
    /* 模块解析 */
    "moduleResolution": "node",            // 模块解析策略
    "esModuleInterop": true,               // 允许默认导入
    "resolveJsonModule": true,             // 允许导入 JSON 文件
    
    /* 其他选项 */
    "skipLibCheck": true,                  // 跳过库文件类型检查
    "forceConsistentCasingInFileNames": true  // 强制文件名大小写一致
  },
  "include": ["src/**/*"],                 // 包含的文件
  "exclude": ["node_modules", "dist"]      // 排除的文件
}
```

**配置说明**：

- `target`：指定编译后的 JavaScript 版本
- `module`：指定模块系统（commonjs、ES2015、ESNext 等）
- `strict`：开启所有严格类型检查选项，推荐在新项目中使用
- `outDir`：编译输出目录
- `rootDir`：源代码根目录

### 1.4 编译和运行

```bash
# 编译 TypeScript 文件
tsc

# 编译单个文件
tsc src/index.ts

# 监听模式（自动重新编译）
tsc --watch

# 运行编译后的 JavaScript
node dist/index.js

# 使用 ts-node 直接运行 TypeScript（开发环境）
npx ts-node src/index.ts
```

**日志示例**：
```
[INFO] TypeScript 编译器启动
[INFO] 读取配置文件: tsconfig.json
[INFO] 编译文件: src/index.ts
[SUCCESS] 编译完成，输出: dist/index.js
```

## 2. 类型注解和类型推断

### 2.1 类型注解（Type Annotation）

类型注解是显式地告诉 TypeScript 变量的类型：

```typescript
// 基本类型注解
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;

// 数组类型注解
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// 函数参数和返回值类型注解
function greet(name: string): string {
  console.log(`[LOG] 执行 greet 函数，参数: ${name}`);
  return `Hello, ${name}!`;
}

// 对象类型注解
let user: {
  name: string;
  age: number;
  email?: string;  // 可选属性
} = {
  name: "Alice",
  age: 25
};

console.log(`[DEBUG] 用户对象: ${JSON.stringify(user)}`);
```

### 2.2 类型推断（Type Inference）

> **🕵️ The Metaphor: The Sherlock Holmes**
> TypeScript 编译器就像是 **福尔摩斯**。
> 即使你不显式告诉它“这是一个数字”，它也能通过线索（`let x = 42`）**推断**出真相。
> 它会观察数据流向，分析上下文。
> *   如果你把 `42` 赋值给 `x`，它就断定 `x` 是 `number`。
> *   如果你随后试图把 `"hello"` 赋给 `x`，福尔摩斯就会跳出来大喊：“异议！这不符合逻辑！”
> 
> **最佳实践**: 善用福尔摩斯的智慧。对于显而易见的类型，不要啰嗦地写出来（`let x: number = 42` 是多余的），让代码保持简洁。只在福尔摩斯可能困惑的地方（如函数参数、复杂的对象结构）提供线索。

TypeScript 可以自动推断变量的类型：

```typescript
// TypeScript 自动推断为 string 类型
let message = "Hello, TypeScript!";
// message = 42;  // ❌ 错误：不能将 number 赋值给 string

// 自动推断为 number 类型
let count = 0;

// 自动推断为 number[] 类型
let scores = [85, 90, 95];

// 自动推断函数返回类型
function add(a: number, b: number) {
  // TypeScript 推断返回类型为 number
  return a + b;
}

// 最佳实践：显式声明函数返回类型
function multiply(a: number, b: number): number {
  console.log(`[TRACE] 计算 ${a} * ${b}`);
  return a * b;
}
```

**最佳实践**：
- 对于简单的变量赋值，可以依赖类型推断
- 对于函数返回值，建议显式声明类型，增加代码可读性
- 对于复杂对象，建议使用接口或类型别名

## 3. 基本类型

### 3.1 原始类型

```typescript
// string - 字符串类型
let username: string = "Alice";
let greeting: string = `Hello, ${username}`;

// number - 数字类型（支持十进制、十六进制、二进制、八进制）
let decimal: number = 42;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;

// boolean - 布尔类型
let isCompleted: boolean = false;
let hasPermission: boolean = true;

// null 和 undefined
let nullable: null = null;
let undefinedValue: undefined = undefined;

// 注意：在严格模式下，null 和 undefined 是独立的类型
let maybeString: string | null = null;  // 联合类型
maybeString = "now it's a string";

console.log(`[INFO] 变量初始化完成: username=${username}, decimal=${decimal}`);
```

### 3.2 数组类型

```typescript
// 方式 1：类型 + 方括号
let numbers: number[] = [1, 2, 3, 4, 5];

// 方式 2：泛型数组
let strings: Array<string> = ["a", "b", "c"];

// 只读数组
let readonlyNumbers: ReadonlyArray<number> = [1, 2, 3];
// readonlyNumbers[0] = 10;  // ❌ 错误：不能修改只读数组
// readonlyNumbers.push(4);   // ❌ 错误：只读数组没有 push 方法

// 使用 const 断言创建只读数组
const immutableArray = [1, 2, 3] as const;
// immutableArray[0] = 10;  // ❌ 错误：不能修改

// 多维数组
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

console.log(`[DEBUG] 数组操作 - 长度: ${numbers.length}`);
```

### 3.3 元组类型（Tuple）

元组允许表示一个已知元素数量和类型的数组，各元素类型不必相同：

```typescript
// 基本元组
let person: [string, number] = ["Alice", 25];

// 访问元组元素
console.log(`[INFO] 姓名: ${person[0]}, 年龄: ${person[1]}`);

// ❌ 错误示例：类型不匹配
// let invalidTuple: [string, number] = [25, "Alice"];

// 可选元素
let optionalTuple: [string, number?] = ["Bob"];

// 剩余元素
let restTuple: [string, ...number[]] = ["Alice", 1, 2, 3, 4, 5];

// 只读元组
let readonlyTuple: readonly [string, number] = ["Alice", 25];
// readonlyTuple[0] = "Bob";  // ❌ 错误：不能修改只读元组

// 实际应用：函数返回多个值
function getUserInfo(userId: number): [string, number, boolean] {
  console.log(`[TRACE] 获取用户信息: userId=${userId}`);
  // 模拟数据库查询
  return ["Alice", 25, true];  // [name, age, isActive]
}

const [name, age, isActive] = getUserInfo(1);
console.log(`[INFO] 用户解构: name=${name}, age=${age}, isActive=${isActive}`);
```

**元组 vs 数组**：
- 元组：固定长度，每个位置的类型可以不同
- 数组：可变长度，所有元素类型相同

### 3.4 枚举类型（Enum）

> **🏷️ The Metaphor: The Label Maker**
> 枚举（Enum）就像是给魔法数字（Magic Numbers）贴上**人类可读的标签**。
> 代码里写 `status === 2` 是什么意思？没人知道。
> 写 `status === Status.InProgress` 就一目了然。
> **TypeScript 的特殊性**: Enum 是 TS 中少数几个**既是类型又是值**的特性。它在编译后会生成真实的 JavaScript 对象（反向映射）。如果你想要零运行时开销，请使用 `const enum`。

```typescript
// 数字枚举（默认从 0 开始）
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right    // 3
}

let dir: Direction = Direction.Up;
console.log(`[DEBUG] 方向: ${dir}, 名称: ${Direction[dir]}`);

// 自定义起始值
enum Status {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}

// 字符串枚举（推荐使用）
enum LogLevel {
  Error = "ERROR",
  Warning = "WARNING",
  Info = "INFO",
  Debug = "DEBUG"
}

function log(level: LogLevel, message: string): void {
  console.log(`[${level}] ${message}`);
}

log(LogLevel.Info, "应用程序启动");
log(LogLevel.Error, "发生错误");

// 常量枚举（编译时会被内联，性能更好）
const enum Color {
  Red = "#FF0000",
  Green = "#00FF00",
  Blue = "#0000FF"
}

let favoriteColor: Color = Color.Blue;

// 异构枚举（不推荐，混合字符串和数字）
enum Mixed {
  No = 0,
  Yes = "YES"
}
```

**最佳实践**：
- 优先使用字符串枚举，更易调试
- 使用常量枚举可以提高性能
- 避免使用异构枚举

### 3.5 any 类型

> **🕳️ The Metaphor: The Black Hole**
> `any` 是类型系统中的**黑洞**。
> 任何东西都可以掉进去（赋值给 any），任何东西也可以从里面出来（any 赋值给其他）。
> 当你使用 `any` 时，你实际上是在对 TypeScript 编译器说：“闭嘴，我不在乎。”
> 这在迁移旧代码时很有用，但在新项目中，滥用 `any` 会让 TypeScript 退化成“带注释的 JavaScript”，失去了所有的保护。
> **记住：`noImplicitAny` 是你的朋友，而不是敌人。**

`any` 类型可以绕过类型检查，应该尽量避免使用：

```typescript
// any 类型可以赋值为任何类型
let anyValue: any = 42;
anyValue = "string";
anyValue = true;
anyValue = {};

// any 类型的变量可以访问任何属性和方法（不会类型检查）
anyValue.foo.bar.baz();  // 编译通过，但运行时可能报错

// ⚠️ 不推荐：使用 any 会失去类型安全
function processValue(value: any) {
  return value.toUpperCase();  // 如果 value 不是字符串，运行时会报错
}

// ✅ 推荐：使用 unknown 代替 any
function processValueSafely(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase();  // 类型守卫后才能使用
  }
  console.log("[WARNING] 传入的值不是字符串");
  return "";
}

console.log(`[INFO] 安全处理结果: ${processValueSafely("hello")}`);
```

### 3.6 unknown 类型

`unknown` 是 `any` 的类型安全版本：

```typescript
let unknownValue: unknown = 42;

// ❌ 错误：不能直接使用 unknown 类型的值
// unknownValue.toFixed();

// ✅ 正确：使用类型守卫后才能使用
if (typeof unknownValue === "number") {
  console.log(`[DEBUG] 数值处理: ${unknownValue.toFixed(2)}`);
}

// 实际应用：处理外部输入
function parseJSON(jsonString: string): unknown {
  console.log(`[TRACE] 解析 JSON: ${jsonString}`);
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.log(`[ERROR] JSON 解析失败: ${error}`);
    return null;
  }
}

const result = parseJSON('{"name": "Alice"}');

// 使用类型守卫验证结果
if (result && typeof result === "object" && "name" in result) {
  console.log(`[INFO] 解析成功: ${(result as { name: string }).name}`);
}
```

### 3.7 void 类型

`void` 表示没有返回值的函数：

```typescript
// void 函数
function logMessage(message: string): void {
  console.log(`[INFO] ${message}`);
  // 没有 return 语句，或者 return undefined
}

// void 函数可以返回 undefined
function doSomething(): void {
  console.log("[TRACE] 执行某些操作");
  return undefined;  // 可选
}

// ❌ 错误：void 函数不能返回其他类型的值
// function invalidVoid(): void {
//   return 42;
// }
```

### 3.8 never 类型

> **🕳️ The Metaphor: The Abyss vs The Void**
> *   **`void`**: 像是**空房间**。你进去了，发现里面什么都没有，然后你走了出来（返回 `undefined`）。这是一个**存在**的状态。
> *   **`never`**: 像是**黑洞**。你进去了，就再也出不来了（抛出异常或死循环）。这是一个**不存在**的状态（不可能有返回值）。
> 
> 在类型论中，`never` 是**底类型 (Bottom Type)**，它是所有类型的子类型。这意味着黑洞可以存在于任何地方，但没有任何东西能从黑洞里带出来。

`never` 表示永远不会有返回值的函数：

```typescript
// 抛出异常的函数
function throwError(message: string): never {
  console.log(`[ERROR] ${message}`);
  throw new Error(message);
}

// 无限循环的函数
function infiniteLoop(): never {
  while (true) {
    console.log("[DEBUG] 循环中...");
  }
}

// never 类型的实际应用：详尽性检查
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 10 * 10;
    case "square":
      return 10 * 10;
    case "triangle":
      return 0.5 * 10 * 10;
    default:
      // 如果所有情况都处理了，这里应该是 never 类型
      const exhaustiveCheck: never = shape;
      throw new Error(`未处理的形状: ${exhaustiveCheck}`);
  }
}

console.log(`[INFO] 圆形面积: ${getArea("circle")}`);
```

## 4. 接口（Interface）

> **🧩 The Metaphor: The Shape Matcher**
> 在 Java/C# 中，接口像是一个**身份证明**（ID Card）。如果你的 ID 卡上没写“我是鸭子”，那你就不是鸭子。
> 在 TypeScript 中，接口像是一个**形状模具**。
> 只要你长得像鸭子（有 `quack` 方法），走起路来像鸭子（有 `walk` 方法），那你就能通过鸭子模具的检查。
> 这就是 **Structural Typing (结构化类型)** —— 关注的是**形状**，而不是**名字**。

接口是定义对象结构的强大方式。

> **🎓 CS Master's Bridge: Structural Typing vs Nominal Typing**
>
> 作为一个 C++/Java 开发者，你习惯了 **Nominal Typing (名义类型)**。
> *   在 Java 中，如果 `class Dog` 没有显式 `implements Animal`，那么 Dog 就不是 Animal，即使它们有完全相同的方法。
>
> TypeScript 使用 **Structural Typing (结构化类型 / Duck Typing)**。
> *   **规则**: "If it walks like a duck and quacks like a duck, it's a duck."
> *   **兼容性**: 只要对象 A 包含了接口 B 要求的所有属性（且类型匹配），A 就被认为是 B 的子类型，无论 A 是如何声明的。
>
> **🔧 Under the Hood: Zero Runtime Cost**
> *   TypeScript 的 Interface 在编译成 JavaScript 后会**完全消失 (Type Erasure)**。
> *   它不会生成任何 C++ vtable 或 RTTI (Run-Time Type Information)。
> *   它纯粹是编译时的契约检查。

### 4.1 基本接口

```typescript
// 定义用户接口
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// 使用接口
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  age: 25
};

console.log(`[INFO] 用户创建成功: ${JSON.stringify(user)}`);

// ❌ 错误：缺少必需属性
// const invalidUser: User = {
//   id: 2,
//   name: "Bob"
// };
```

### 4.2 可选属性

```typescript
interface Product {
  id: number;
  name: string;
  description?: string;  // 可选属性
  price: number;
  discount?: number;     // 可选属性
}

const product1: Product = {
  id: 1,
  name: "Laptop",
  price: 999
};

const product2: Product = {
  id: 2,
  name: "Mouse",
  description: "Wireless mouse",
  price: 29,
  discount: 0.1
};

console.log(`[DEBUG] 产品1: ${JSON.stringify(product1)}`);
console.log(`[DEBUG] 产品2: ${JSON.stringify(product2)}`);
```

### 4.3 只读属性

```typescript
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
  retryCount?: number;
}

const config: Config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retryCount: 3
};

// ❌ 错误：不能修改只读属性
// config.apiUrl = "https://new-api.example.com";

console.log(`[INFO] 配置加载: ${JSON.stringify(config)}`);
```

### 4.4 函数类型接口

```typescript
// 定义函数签名
interface MathOperation {
  (a: number, b: number): number;
}

// 实现函数
const add: MathOperation = (a, b) => {
  console.log(`[TRACE] 执行加法: ${a} + ${b}`);
  return a + b;
};

const subtract: MathOperation = (a, b) => {
  console.log(`[TRACE] 执行减法: ${a} - ${b}`);
  return a - b;
};

console.log(`[INFO] 加法结果: ${add(10, 5)}`);
console.log(`[INFO] 减法结果: ${subtract(10, 5)}`);
```

### 4.5 索引签名

```typescript
// 字符串索引签名
interface StringDictionary {
  [key: string]: string;
}

const translations: StringDictionary = {
  hello: "你好",
  goodbye: "再见",
  thanks: "谢谢"
};

console.log(`[DEBUG] 翻译: hello -> ${translations["hello"]}`);

// 数字索引签名
interface NumberArray {
  [index: number]: number;
}

const fibonacci: NumberArray = [1, 1, 2, 3, 5, 8, 13];

// 混合索引签名
interface MixedDictionary {
  [key: string]: string | number;
  length: number;  // 明确定义的属性必须符合索引签名
}

const mixed: MixedDictionary = {
  name: "Alice",
  age: 25,
  length: 2
};
```

### 4.6 接口继承

```typescript
// 基础接口
interface Entity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// 继承接口
interface User extends Entity {
  name: string;
  email: string;
}

interface Product extends Entity {
  name: string;
  price: number;
}

// 多重继承
interface Auditable {
  createdBy: string;
  updatedBy: string;
}

interface AuditableUser extends Entity, Auditable {
  name: string;
  email: string;
}

const auditableUser: AuditableUser = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "admin",
  updatedBy: "admin",
  name: "Alice",
  email: "alice@example.com"
};

console.log(`[INFO] 可审计用户创建: ${JSON.stringify(auditableUser)}`);
```

### 4.7 接口实现类

```typescript
interface Animal {
  name: string;
  makeSound(): void;
}

class Dog implements Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
    console.log(`[INFO] 创建狗对象: ${name}`);
  }

  makeSound(): void {
    console.log(`[SOUND] ${this.name} says: Woof!`);
  }
}

const dog = new Dog("Buddy");
dog.makeSound();
```

## 5. 类型别名（Type Alias）

类型别名使用 `type` 关键字定义类型：

### 5.1 基本类型别名

```typescript
// 基本类型别名
type ID = number | string;
type Point = { x: number; y: number };

let userId: ID = 123;
userId = "user_123";  // ✅ 可以是字符串

const point: Point = { x: 10, y: 20 };
console.log(`[DEBUG] 点坐标: (${point.x}, ${point.y})`);
```

### 5.2 联合类型

```typescript
// 字面量联合类型
type Status = "pending" | "approved" | "rejected";

function updateStatus(status: Status): void {
  console.log(`[INFO] 状态更新为: ${status}`);
}

updateStatus("approved");
// updateStatus("invalid");  // ❌ 错误：不是有效的状态值

// 类型联合
type Result = number | string | boolean;

function processResult(result: Result): void {
  if (typeof result === "number") {
    console.log(`[INFO] 数字结果: ${result.toFixed(2)}`);
  } else if (typeof result === "string") {
    console.log(`[INFO] 字符串结果: ${result.toUpperCase()}`);
  } else {
    console.log(`[INFO] 布尔结果: ${result}`);
  }
}

processResult(42);
processResult("success");
processResult(true);
```

### 5.3 交叉类型

```typescript
// 交叉类型：组合多个类型
type Person = {
  name: string;
  age: number;
};

type Employee = {
  employeeId: string;
  department: string;
};

// 交叉类型：同时具有两个类型的所有属性
type Staff = Person & Employee;

/*
 * 🎓 CS Theory: Algebraic Data Types (ADT)
 * 
 * TypeScript 的类型系统实际上是一个代数数据类型系统。
 * * Union Types (|) 对应 "Sum Types" (和类型)。
 * * Intersection Types (&) 对应 "Product Types" (积类型)。
 * 
 * 这与 Haskell 或 Rust 的类型系统有很深的渊源。
 */

const staff: Staff = {
  name: "Alice",
  age: 30,
  employeeId: "E001",
  department: "Engineering"
};

console.log(`[INFO] 员工信息: ${JSON.stringify(staff)}`);

// 实际应用：扩展类型
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type TimestampedPerson = Person & Timestamped;

const timestampedPerson: TimestampedPerson = {
  name: "Bob",
  age: 25,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### 5.4 函数类型别名

```typescript
// 函数类型别名
type Comparator<T> = (a: T, b: T) => number;

/*
 * 🎓 CS Perspective: Covariance & Contravariance
 * 
 * 在处理函数类型兼容性时，TS 遵循以下规则：
 * * 参数类型是 **逆变 (Contravariant)** 的：函数可以接受比定义更宽泛的参数。
 * * 返回值类型是 **协变 (Covariant)** 的：函数可以返回比定义更具体的类型。
 * 
 * 这保证了类型系统的安全性 (Liskov Substitution Principle)。
 */

const numberComparator: Comparator<number> = (a, b) => {
  console.log(`[TRACE] 比较数字: ${a} vs ${b}`);
  return a - b;
};

const stringComparator: Comparator<string> = (a, b) => {
  console.log(`[TRACE] 比较字符串: ${a} vs ${b}`);
  return a.localeCompare(b);
};

const numbers = [3, 1, 4, 1, 5, 9];
numbers.sort(numberComparator);
console.log(`[INFO] 排序后的数字: ${numbers}`);
```

### 5.5 Interface vs Type

```typescript
// Interface 和 Type 的相似之处
interface IUser {
  name: string;
  email: string;
}

type TUser = {
  name: string;
  email: string;
};

// Interface 和 Type 的主要区别：

// 1. Interface 可以声明合并
interface Window {
  title: string;
}

interface Window {
  size: number;
}

// 合并后 Window 同时有 title 和 size

// 2. Type 可以使用联合类型和交叉类型
type StringOrNumber = string | number;
type Combined = IUser & { age: number };

// 3. Type 可以使用映射类型（后续章节详解）
type ReadonlyUser = {
  readonly [K in keyof TUser]: TUser[K];
};
```

**选择建议**：
- 定义对象形状：Interface 和 Type 都可以，但 Interface 更符合语义
- 需要联合类型或交叉类型：使用 Type
- 需要声明合并：使用 Interface
- 定义库的公共 API：推荐使用 Interface

## 6. 类型断言

类型断言用于告诉编译器"我知道这个值的类型"：

### 6.1 基本类型断言

```typescript
// 方式 1：尖括号语法（在 JSX 中不可用）
let someValue: unknown = "this is a string";
let strLength1: number = (<string>someValue).length;

// 方式 2：as 语法（推荐）
let strLength2: number = (someValue as string).length;

console.log(`[DEBUG] 字符串长度: ${strLength2}`);

// 实际应用：DOM 操作
const inputElement = document.querySelector("#username") as HTMLInputElement;
// inputElement.value = "Alice";  // 现在可以访问 HTMLInputElement 特有的属性

console.log("[INFO] 类型断言成功");
```

### 6.2 双重断言

```typescript
// 有时需要先断言为 unknown，再断言为目标类型
// ⚠️ 应该尽量避免双重断言，通常表示设计有问题

const value: string = "123";
// const num: number = value as number;  // ❌ 错误：string 和 number 之间没有重叠

// 使用双重断言（不推荐）
const num: number = (value as unknown) as number;

console.log("[WARNING] 使用了双重断言，可能存在类型安全问题");
```

### 6.3 常量断言

```typescript
// const 断言：将类型推断为更具体的字面量类型
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} as const;

// config.apiUrl = "new url";  // ❌ 错误：只读属性

// 数组的常量断言
const colors = ["red", "green", "blue"] as const;
// colors.push("yellow");  // ❌ 错误：只读数组
type Color = typeof colors[number];  // "red" | "green" | "blue"

console.log(`[INFO] 配置对象已锁定: ${JSON.stringify(config)}`);
```

### 6.4 非空断言

```typescript
// 非空断言运算符 !
function processValue(value: string | null | undefined) {
  // ⚠️ 使用 ! 告诉 TypeScript 这个值一定不是 null/undefined
  // 如果值实际是 null/undefined，运行时会报错
  const length = value!.length;
  console.log(`[DEBUG] 长度: ${length}`);
}

// ✅ 更安全的方式：使用类型守卫
function processValueSafe(value: string | null | undefined) {
  if (value) {
    const length = value.length;
    console.log(`[DEBUG] 安全获取长度: ${length}`);
  } else {
    console.log("[WARNING] 值为空");
  }
}

processValueSafe("hello");
processValueSafe(null);
```

## 7. 实践练习

### 练习 1：类型定义

定义一个博客文章的接口，包含以下属性：
- id（只读，number）
- title（string）
- content（string）
- author（对象，包含 name 和 email）
- tags（字符串数组）
- publishedAt（可选，Date）
- status（"draft" | "published" | "archived"）

```typescript
// 你的代码：
interface Author {
  name: string;
  email: string;
}

interface BlogPost {
  readonly id: number;
  title: string;
  content: string;
  author: Author;
  tags: string[];
  publishedAt?: Date;
  status: "draft" | "published" | "archived";
}

// 测试代码
const post: BlogPost = {
  id: 1,
  title: "TypeScript 入门",
  content: "这是一篇关于 TypeScript 的文章...",
  author: {
    name: "Alice",
    email: "alice@example.com"
  },
  tags: ["typescript", "programming"],
  status: "published",
  publishedAt: new Date()
};

console.log(`[INFO] 文章创建成功: ${post.title}`);
```

### 练习 2：类型守卫

编写一个函数 `formatValue`，根据输入的类型进行不同的格式化：
- 如果是 number，返回保留 2 位小数的字符串
- 如果是 Date，返回 ISO 格式字符串
- 如果是 string，返回大写字符串
- 其他类型，返回 "Unknown type"

```typescript
// 你的代码：
function formatValue(value: number | Date | string | unknown): string {
  console.log(`[TRACE] 格式化值: ${value}`);
  
  if (typeof value === "number") {
    return value.toFixed(2);
  } else if (value instanceof Date) {
    return value.toISOString();
  } else if (typeof value === "string") {
    return value.toUpperCase();
  } else {
    console.log("[WARNING] 未知类型");
    return "Unknown type";
  }
}

// 测试代码
console.log(formatValue(42.567));        // "42.57"
console.log(formatValue(new Date()));    // ISO 日期字符串
console.log(formatValue("hello"));       // "HELLO"
console.log(formatValue(true));          // "Unknown type"
```

### 练习 3：泛型函数

创建一个泛型函数 `createPair`，接收两个相同类型的参数，返回一个包含这两个值的元组：

```typescript
// 你的代码：
function createPair<T>(first: T, second: T): [T, T] {
  console.log(`[TRACE] 创建配对: ${first}, ${second}`);
  return [first, second];
}

// 测试代码
const numberPair = createPair(1, 2);
console.log(`[INFO] 数字配对: ${numberPair}`);

const stringPair = createPair("hello", "world");
console.log(`[INFO] 字符串配对: ${stringPair}`);
```

## 8. 常见问题解答

**Q: 什么时候使用 interface，什么时候使用 type？**

A: 
- 定义对象形状时，两者都可以，但推荐使用 interface（更符合语义）
- 需要联合类型、交叉类型或映射类型时，使用 type
- 定义库的公共 API 时，推荐使用 interface（可以声明合并）

**Q: any 和 unknown 有什么区别？**

A:
- `any` 会完全绕过类型检查，可以进行任何操作
- `unknown` 是类型安全的 any，使用前必须进行类型检查
- 推荐使用 `unknown` 代替 `any`

**Q: 类型断言会进行类型转换吗？**

A:
- 不会！类型断言只是告诉 TypeScript 编译器"我知道这个值的类型"
- 它不会改变运行时的值，只影响编译时的类型检查
- 如果断言错误，运行时可能会出错

**Q: 只读属性和常量有什么区别？**

A:
- `readonly` 用于对象属性，表示该属性在对象创建后不能被重新赋值
- `const` 用于变量声明，表示变量不能被重新赋值
- `readonly` 对象的属性不能改，但对象本身可以被重新赋值（如果用 let 声明）

## 9. 最佳实践

### 9.1 严格模式

```typescript
// ✅ 推荐：在 tsconfig.json 中启用严格模式
{
  "compilerOptions": {
    "strict": true
  }
}
```

### 9.2 避免使用 any

```typescript
// ❌ 不推荐
function processData(data: any) {
  return data.value;
}

// ✅ 推荐：使用 unknown 或泛型
function processDataSafe<T>(data: T): T {
  console.log(`[TRACE] 处理数据: ${JSON.stringify(data)}`);
  return data;
}
```

### 9.3 显式声明函数返回类型

```typescript
// ❌ 不推荐：依赖类型推断
function calculate(a: number, b: number) {
  return a + b;
}

// ✅ 推荐：显式声明返回类型
function calculateSafe(a: number, b: number): number {
  console.log(`[TRACE] 计算: ${a} + ${b}`);
  return a + b;
}
```

### 9.4 使用 readonly 保护数据

```typescript
// ✅ 推荐：对不应该被修改的数据使用 readonly
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

function initConfig(): Config {
  console.log("[INFO] 初始化配置");
  return {
    apiUrl: "https://api.example.com",
    timeout: 5000
  };
}

const config = initConfig();
// config.apiUrl = "new url";  // ❌ 错误：只读属性
```

### 9.5 使用类型守卫而非类型断言

```typescript
// ❌ 不推荐：使用类型断言
function processValue(value: unknown) {
  return (value as string).toUpperCase();
}

// ✅ 推荐：使用类型守卫
function processValueSafe(value: unknown): string {
  if (typeof value === "string") {
    console.log(`[TRACE] 处理字符串: ${value}`);
    return value.toUpperCase();
  }
  console.log("[WARNING] 值不是字符串");
  return "";
}
```

## 10. 小结

本章我们学习了 TypeScript 的基础知识：

- ✅ TypeScript 环境配置和编译器使用
- ✅ 类型注解和类型推断
- ✅ 基本类型：原始类型、数组、元组、枚举等
- ✅ 接口（Interface）的定义和使用
- ✅ 类型别名（Type Alias）
- ✅ 联合类型和交叉类型
- ✅ 类型断言的使用和注意事项

掌握这些基础知识后，你就可以开始使用 TypeScript 编写类型安全的代码了。在下一章，我们将学习 ES6+ 的现代特性，进一步提升你的 JavaScript/TypeScript 技能。

## 11. 下一步

- 阅读下一章：[ES6+ 现代特性](../02-es6-features/README.md)
- 完成练习题：[TypeScript 基础练习](../exercises/README.md#typescript-基础)
- 参考资源：[TypeScript 官方文档](https://www.typescriptlang.org/docs/)
