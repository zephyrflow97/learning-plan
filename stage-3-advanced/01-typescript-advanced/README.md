# 第 1 章：TypeScript 高级类型

欢迎来到 TypeScript 高级类型的学习！在本章中，你将深入学习 TypeScript 类型系统的高级特性，包括泛型、条件类型、映射类型等强大的类型工具。

## 📚 本章目标

完成本章后，你将能够：

- ✅ 熟练使用泛型编程（函数、类、接口）
- ✅ 理解和创建条件类型
- ✅ 掌握映射类型和类型转换
- ✅ 使用类型守卫和类型谓词
- ✅ 熟练运用 TypeScript 内置工具类型
- ✅ 创建自定义的高级类型工具
- ✅ 理解模板字面量类型

---

## 1. 泛型编程（Generics）

### 1.1 为什么需要泛型？

> **🔌 The Metaphor: The Universal Adapter**
> 想象你有一个**万能插座**（泛型函数）。
> *   如果你把插座的孔设计成圆形的（固定类型），那扁头的插头就插不进去。
> *   如果你把插座设计成巨大的洞（`any`），那插头是能插进去了，但可能会漏电或接触不良（失去类型安全）。
> *   **泛型 (Generics)** 就像是一个**可变形的插座**。当你拿着扁头插头来时，它自动变成扁孔；拿着圆头插头来时，它自动变成圆孔。它既保证了**通用性**，又保证了**严丝合缝**（类型安全）。

泛型允许我们编写可重用的代码组件，这些组件可以处理多种类型而不失去类型安全性。

**问题示例：** 没有泛型的数组操作

```typescript
// ❌ 问题：失去类型安全
function getFirstElement(arr: any[]): any {
  return arr[0];
}

const numbers = [1, 2, 3];
const first = getFirstElement(numbers); // first 的类型是 any，失去了类型信息
```

**泛型解决方案：**

```typescript
// ✅ 使用泛型保持类型安全
function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const numbers = [1, 2, 3];
const first = getFirstElement(numbers); // first 的类型是 number | undefined ✓

const strings = ["a", "b", "c"];
const firstStr = getFirstElement(strings); // firstStr 的类型是 string | undefined ✓
```

**关键点：**
- `<T>` 是类型参数，代表任意类型
- TypeScript 可以自动推断类型参数
- 泛型保持了类型安全，同时提供了代码复用

---

### 1.2 泛型函数

**基础泛型函数：**

```typescript
// 单个类型参数
function identity<T>(value: T): T {
  return value;
}

// 使用：TypeScript 自动推断类型
const num = identity(42);        // num: number
const str = identity("hello");   // str: string

// 也可以显式指定类型
const bool = identity<boolean>(true); // bool: boolean
```

**多个类型参数：**

```typescript
// 交换元组中的元素
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}

const swapped = swap([1, "hello"]); // swapped: [string, number]
```

**泛型约束：**

有时我们需要限制泛型参数的类型。

```typescript
// 约束：T 必须有 length 属性
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): void {
  console.log(`Length: ${item.length}`);
}

// ✅ 正确：字符串有 length 属性
logLength("hello"); // Length: 5

// ✅ 正确：数组有 length 属性
logLength([1, 2, 3]); // Length: 3

// ❌ 错误：数字没有 length 属性
// logLength(42); // 编译错误
```

**使用 keyof 约束：**

```typescript
// 安全地访问对象属性
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: "Alice",
  age: 30
};

const name = getProperty(person, "name");  // name: string
const age = getProperty(person, "age");    // age: number

// ❌ 错误：属性不存在
// const invalid = getProperty(person, "invalid"); // 编译错误
```

---

### 1.3 泛型类

> **📦 The Metaphor: The Magic Box**
> 泛型类就像是一个**魔法盒子**。
> 当你制造这个盒子时，你不规定它只能装苹果。
> 你在盒子上贴个标签 `<T>`。
> *   当你把苹果放进去时，它就变成了“苹果盒”。
> *   当你把书放进去时，它就变成了“书盒”。
> 
> 这样，你只需要设计一种盒子，就能满足全世界所有东西的收纳需求。

**基础泛型类：**

```typescript
// 泛型数据容器类
class Box<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }

  setValue(value: T): void {
    this.value = value;
  }
}

// 使用泛型类
const numberBox = new Box(42);
console.log(numberBox.getValue()); // 42
numberBox.setValue(100);

const stringBox = new Box("hello");
console.log(stringBox.getValue()); // "hello"
```

**泛型类的实际应用：数据仓库模式**

```typescript
// 泛型仓库接口
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// 用户实体
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// 实现用户仓库
class UserRepository implements Repository<User> {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async create(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    this.users[index] = { ...this.users[index], ...userData };
    return this.users[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

// 使用示例
async function example() {
  const userRepo = new UserRepository();
  
  // 创建用户
  const user = await userRepo.create({
    name: "Alice",
    email: "alice@example.com",
    age: 30
  });
  console.log('创建的用户:', user);
  
  // 查询用户
  const foundUser = await userRepo.findById(user.id);
  console.log('找到的用户:', foundUser);
  
  // 更新用户
  const updatedUser = await userRepo.update(user.id, { age: 31 });
  console.log('更新后的用户:', updatedUser);
}
```

---

### 1.4 泛型接口

```typescript
// 泛型接口：API 响应格式
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

// 使用泛型接口
interface UserData {
  id: string;
  username: string;
}

const response: ApiResponse<UserData> = {
  success: true,
  data: {
    id: "123",
    username: "alice"
  },
  timestamp: Date.now()
};

// 泛型接口：分页数据
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const userListResponse: PaginatedResponse<UserData> = {
  items: [
    { id: "1", username: "alice" },
    { id: "2", username: "bob" }
  ],
  total: 100,
  page: 1,
  pageSize: 10,
  totalPages: 10
};
```

---

## 2. 条件类型（Conditional Types）

> **⚖️ The Metaphor: The Logic Gate**
> 条件类型是 TypeScript 类型系统中的**逻辑门**。
> 它是类型层面的 `if-else` 语句。
> *   `T extends U ? X : Y`
> *   翻译：如果类型 `T` 能赋值给类型 `U`，那么结果是类型 `X`，否则是类型 `Y`。
> 
> 这赋予了类型系统**图灵完备**的能力。你可以用它编写能够“思考”和“计算”的类型，而不仅仅是静态的描述。

条件类型允许我们根据类型之间的关系来选择类型，类似于三元运算符。

### 2.1 基础条件类型

**语法：** `T extends U ? X : Y`

```typescript
// 基础示例：检查类型是否为字符串
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // type A = true
type B = IsString<number>;  // type B = false
type C = IsString<"hello">; // type C = true
```

**实用示例：提取函数返回类型**

```typescript
// 如果 T 是函数类型，提取其返回类型；否则返回 never
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(): string {
  return "Hello";
}

function add(a: number, b: number): number {
  return a + b;
}

type GreetReturn = ReturnTypeOf<typeof greet>; // type GreetReturn = string
type AddReturn = ReturnTypeOf<typeof add>;     // type AddReturn = number
type NotAFunction = ReturnTypeOf<number>;      // type NotAFunction = never
```

---

### 2.2 分布式条件类型

当条件类型应用于联合类型时，它会分布到联合的每个成员上。

```typescript
// 从联合类型中排除某些类型
type Exclude<T, U> = T extends U ? never : T;

type A = Exclude<'a' | 'b' | 'c', 'a'>;  // type A = 'b' | 'c'
type B = Exclude<string | number | boolean, string>; // type B = number | boolean

// 从联合类型中提取某些类型
type Extract<T, U> = T extends U ? T : never;

type C = Extract<'a' | 'b' | 'c', 'a' | 'b'>; // type C = 'a' | 'b'
type D = Extract<string | number | boolean, string | number>; // type D = string | number
```

---

### 2.3 infer 关键字

`infer` 关键字允许我们在条件类型中推断类型变量。

```typescript
// 推断数组元素类型
type ArrayElementType<T> = T extends (infer E)[] ? E : never;

type E1 = ArrayElementType<number[]>;     // type E1 = number
type E2 = ArrayElementType<string[]>;     // type E2 = string
type E3 = ArrayElementType<[1, 2, 3]>;    // type E3 = 1 | 2 | 3

// 推断 Promise 的值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type P1 = UnwrapPromise<Promise<string>>;  // type P1 = string
type P2 = UnwrapPromise<Promise<number>>;  // type P2 = number
type P3 = UnwrapPromise<string>;           // type P3 = string (不是 Promise)

// 推断函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function myFunc(a: string, b: number, c: boolean): void {}

type MyFuncParams = Parameters<typeof myFunc>; 
// type MyFuncParams = [a: string, b: number, c: boolean]
```

**实战示例：深度提取嵌套类型**

```typescript
// 深度提取 Promise 链的最终类型
type DeepUnwrap<T> = 
  T extends Promise<infer U> 
    ? DeepUnwrap<U>  // 递归展开
    : T;

type Nested = Promise<Promise<Promise<string>>>;
type Unwrapped = DeepUnwrap<Nested>; // type Unwrapped = string
```

---

## 3. 映射类型（Mapped Types）

> **🏭 The Metaphor: The Mass Production**
> 映射类型是类型工厂的**流水线**。
> 你给它一个旧的类型（原料），它遍历旧类型的每个属性，进行统一的加工（变只读、变可选、重命名），然后生产出一个全新的类型。
> *   `[P in keyof T]`：遍历 `T` 的所有属性键。
> *   `T[P]`：获取属性值类型。
> *   `readonly` / `?`：添加修饰符。
> 
> 这就像是给整个对象的所有房间**一键装修**。

映射类型允许我们基于现有类型创建新类型，通过遍历属性来转换类型。

### 3.1 基础映射类型

```typescript
// 将所有属性设为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  name: string;
  age: number;
}

type ReadonlyUser = Readonly<User>;
// type ReadonlyUser = {
//   readonly name: string;
//   readonly age: number;
// }

// 将所有属性设为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type PartialUser = Partial<User>;
// type PartialUser = {
//   name?: string;
//   age?: number;
// }
```

---

### 3.2 高级映射类型

**添加或移除修饰符：**

```typescript
// 移除只读修饰符
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface ReadonlyUser {
  readonly name: string;
  readonly age: number;
}

type MutableUser = Mutable<ReadonlyUser>;
// type MutableUser = {
//   name: string;
//   age: number;
// }

// 移除可选修饰符（设为必需）
type Required<T> = {
  [P in keyof T]-?: T[P];
};

interface PartialUser {
  name?: string;
  age?: number;
}

type RequiredUser = Required<PartialUser>;
// type RequiredUser = {
//   name: string;
//   age: number;
// }
```

**键重映射（Key Remapping）：**

```typescript
// TypeScript 4.1+ 支持键重映射
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// type PersonGetters = {
//   getName: () => string;
//   getAge: () => number;
// }
```

---

## 4. 类型守卫和类型谓词

类型守卫用于在运行时缩小类型范围，使 TypeScript 能够推断更精确的类型。

### 4.1 typeof 类型守卫

```typescript
function processValue(value: string | number) {
  if (typeof value === "string") {
    // 在这个块中，TypeScript 知道 value 是 string
    console.log(value.toUpperCase());
  } else {
    // 在这个块中，TypeScript 知道 value 是 number
    console.log(value.toFixed(2));
  }
}
```

---

### 4.2 instanceof 类型守卫

```typescript
class Dog {
  bark() {
    console.log("Woof!");
  }
}

class Cat {
  meow() {
    console.log("Meow!");
  }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // TypeScript 知道这是 Dog
  } else {
    animal.meow(); // TypeScript 知道这是 Cat
  }
}
```

---

### 4.3 自定义类型守卫（类型谓词）

> **👮 The Metaphor: The ID Check**
> 类型守卫 (Type Guard) 就像是俱乐部的**保安**。
> 门口来了一个人（`unknown` 类型）。
> 保安拦住他：“请出示证件。”
> *   `isString(value)`: 保安检查后大喊：“放行！这是一位**字符串**先生！”
> *   在保安身后的区域（`if` 块内），所有人（编译器）都确信这个人是字符串，可以安全地对他使用字符串的方法。
> 
> 如果没有保安，编译器会因为害怕出错而禁止你做任何操作。

使用 `is` 关键字创建自定义类型守卫。

```typescript
// 类型谓词函数
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript 知道 value 是 string
    console.log(value.toUpperCase());
  }
}

// 更复杂的类型守卫
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function isFish(animal: Fish | Bird): animal is Fish {
  return (animal as Fish).swim !== undefined;
}

function move(animal: Fish | Bird) {
  if (isFish(animal)) {
    animal.swim(); // TypeScript 知道这是 Fish
  } else {
    animal.fly();  // TypeScript 知道这是 Bird
  }
}
```

**实战示例：API 响应验证**

```typescript
interface SuccessResponse {
  status: 'success';
  data: any;
}

interface ErrorResponse {
  status: 'error';
  message: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// 类型守卫函数
function isSuccessResponse(response: ApiResponse): response is SuccessResponse {
  return response.status === 'success';
}

function handleResponse(response: ApiResponse) {
  if (isSuccessResponse(response)) {
    console.log('数据:', response.data); // 类型安全访问 data
  } else {
    console.error('错误:', response.message); // 类型安全访问 message
  }
}
```

---

## 5. TypeScript 内置工具类型

TypeScript 提供了许多内置的工具类型，帮助我们进行常见的类型转换。

### 5.1 常用工具类型

**Partial<T>** - 将所有属性设为可选

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// 更新用户时不需要所有字段
function updateUser(id: string, updates: Partial<User>) {
  // updates 可以只包含部分字段
}

updateUser("123", { age: 31 }); // ✓ 正确
updateUser("123", { name: "Alice", email: "alice@new.com" }); // ✓ 正确
```

**Required<T>** - 将所有属性设为必需

```typescript
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// 确保所有配置项都被提供
function validateConfig(config: Required<Config>) {
  // config 的所有属性都是必需的
  console.log(config.host, config.port, config.debug);
}
```

**Readonly<T>** - 将所有属性设为只读

```typescript
interface Point {
  x: number;
  y: number;
}

const point: Readonly<Point> = { x: 10, y: 20 };
// point.x = 5; // ❌ 错误：无法分配到 "x" ，因为它是只读属性
```

**Pick<T, K>** - 从类型中选择部分属性

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  password: string;
}

// 只选择公开字段
type PublicUser = Pick<User, 'id' | 'name' | 'email'>;
// type PublicUser = {
//   id: string;
//   name: string;
//   email: string;
// }

function displayUser(user: PublicUser) {
  console.log(user.name, user.email);
  // console.log(user.password); // ❌ 错误：属性不存在
}
```

**Omit<T, K>** - 从类型中排除部分属性

```typescript
// 排除敏感字段
type UserWithoutPassword = Omit<User, 'password'>;
// type UserWithoutPassword = {
//   id: string;
//   name: string;
//   email: string;
//   age: number;
// }

function shareUser(user: UserWithoutPassword) {
  // 不包含 password 字段
}
```

**Record<K, T>** - 创建对象类型，键为 K，值为 T

```typescript
// 创建用户映射
type UserMap = Record<string, User>;

const users: UserMap = {
  "alice": { id: "1", name: "Alice", email: "alice@example.com", age: 30, password: "***" },
  "bob": { id: "2", name: "Bob", email: "bob@example.com", age: 25, password: "***" }
};

// 创建状态枚举映射
type Status = 'pending' | 'approved' | 'rejected';
type StatusMessages = Record<Status, string>;

const messages: StatusMessages = {
  pending: '等待审核',
  approved: '已批准',
  rejected: '已拒绝'
};
```

**Exclude<T, U>** - 从联合类型 T 中排除 U

```typescript
type AllStatus = 'pending' | 'approved' | 'rejected' | 'draft';
type ActiveStatus = Exclude<AllStatus, 'draft'>;
// type ActiveStatus = 'pending' | 'approved' | 'rejected'
```

**Extract<T, U>** - 从联合类型 T 中提取 U

```typescript
type AllStatus = 'pending' | 'approved' | 'rejected' | 'draft';
type FinalStatus = Extract<AllStatus, 'approved' | 'rejected'>;
// type FinalStatus = 'approved' | 'rejected'
```

**NonNullable<T>** - 排除 null 和 undefined

```typescript
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// type DefiniteString = string
```

**ReturnType<T>** - 获取函数返回类型

```typescript
function getUser() {
  return {
    id: "123",
    name: "Alice",
    email: "alice@example.com"
  };
}

type User = ReturnType<typeof getUser>;
// type User = {
//   id: string;
//   name: string;
//   email: string;
// }
```

---

### 5.2 组合工具类型

```typescript
// 组合多个工具类型
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// 创建用户输入类型：
// 1. 排除 id, createdAt, updatedAt（系统生成）
// 2. password 设为可选
type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  password?: string;
};

// 更新用户输入类型：
// 1. 所有字段可选
// 2. 排除 id（不允许修改）
type UpdateUserInput = Partial<Omit<User, 'id'>>;
```

---

## 6. 模板字面量类型

TypeScript 4.1+ 引入了模板字面量类型，允许我们使用模板字符串语法创建新的字符串字面量类型。

### 6.1 基础模板字面量类型

```typescript
// 基础示例
type World = "world";
type Greeting = `hello ${World}`; // type Greeting = "hello world"

// 结合联合类型
type Color = "red" | "blue" | "green";
type Shade = "light" | "dark";
type ColorShade = `${Shade}-${Color}`;
// type ColorShade = 
//   | "light-red" | "light-blue" | "light-green"
//   | "dark-red"  | "dark-blue"  | "dark-green"
```

---

### 6.2 实用示例：事件系统

```typescript
// 定义事件名称
type EventName = "click" | "focus" | "blur";
type EventListener<T extends string> = `on${Capitalize<T>}`;

type ClickListener = EventListener<"click">; // type ClickListener = "onClick"

// 创建事件处理器类型
type EventHandlers = {
  [K in EventName as `on${Capitalize<K>}`]: (event: Event) => void;
};
// type EventHandlers = {
//   onClick: (event: Event) => void;
//   onFocus: (event: Event) => void;
//   onBlur: (event: Event) => void;
// }
```

---

### 6.3 实用示例：API 路由

```typescript
// 定义资源类型
type Resource = "user" | "post" | "comment";
type Action = "get" | "create" | "update" | "delete";

// 生成 API 端点类型
type ApiEndpoint = `/${Resource}/${Action}`;
// type ApiEndpoint = 
//   | "/user/get" | "/user/create" | "/user/update" | "/user/delete"
//   | "/post/get" | "/post/create" | "/post/update" | "/post/delete"
//   | "/comment/get" | "/comment/create" | "/comment/update" | "/comment/delete"

// 创建 API 路由配置
type ApiRoutes = {
  [K in ApiEndpoint]: {
    handler: (req: Request) => Response;
    auth: boolean;
  };
};
```

---

## 7. 实战练习

### 练习 1：类型安全的事件发射器

实现一个类型安全的事件发射器，确保事件名称和处理器参数类型匹配。

```typescript
// 定义事件映射
interface EventMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:update': { id: string; data: any };
}

// TODO: 实现 EventEmitter 类
class EventEmitter<T extends Record<string, any>> {
  // 你的实现...
}

// 使用示例
const emitter = new EventEmitter<EventMap>();

// ✓ 应该通过类型检查
emitter.on('user:login', (payload) => {
  console.log(payload.userId, payload.timestamp);
});

// ❌ 应该报错：参数类型不匹配
// emitter.on('user:login', (payload: { wrong: string }) => {});

// ❌ 应该报错：事件名称不存在
// emitter.on('invalid:event', () => {});
```

<details>
<summary>查看参考答案</summary>

```typescript
class EventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: Array<(payload: T[K]) => void>;
  } = {};

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(payload));
    }
  }

  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}
```

</details>

---

### 练习 2：深度只读类型

实现一个 `DeepReadonly<T>` 类型，递归地将对象的所有嵌套属性设为只读。

```typescript
// TODO: 实现 DeepReadonly 类型
type DeepReadonly<T> = // 你的实现...

// 测试
interface NestedObject {
  a: string;
  b: {
    c: number;
    d: {
      e: boolean;
    };
  };
  f: string[];
}

type ReadonlyNested = DeepReadonly<NestedObject>;
// 应该等同于:
// {
//   readonly a: string;
//   readonly b: {
//     readonly c: number;
//     readonly d: {
//       readonly e: boolean;
//     };
//   };
//   readonly f: readonly string[];
// }
```

<details>
<summary>查看参考答案</summary>

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]  // 函数保持不变
      : DeepReadonly<T[P]>  // 递归处理对象
    : T[P];  // 原始类型保持不变
};

// 改进版本：正确处理数组
type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends Function
  ? T
  : T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;
```

</details>

---

### 练习 3：类型安全的路径访问

实现一个类型，可以安全地访问嵌套对象的属性，使用点号路径字符串。

```typescript
// TODO: 实现 Get 类型
type Get<T, Path extends string> = // 你的实现...

// 测试
interface Data {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: 'light' | 'dark';
    };
  };
}

type UserName = Get<Data, 'user.profile.name'>;  // 应该是 string
type Theme = Get<Data, 'user.settings.theme'>;   // 应该是 'light' | 'dark'
```

<details>
<summary>查看参考答案</summary>

```typescript
type Get<T, Path extends string> = 
  Path extends `${infer First}.${infer Rest}`
    ? First extends keyof T
      ? Get<T[First], Rest>
      : never
    : Path extends keyof T
    ? T[Path]
    : never;
```

</details>

---

## 8. 常见问题

### Q1: 什么时候应该使用泛型？

**A:** 当你需要编写可复用的代码，而这些代码需要处理多种类型时。例如：
- 数据结构（数组、列表、树）
- 工具函数（过滤、映射、排序）
- API 响应包装器
- 仓库模式

**经验法则：** 如果你发现自己为不同类型编写相同逻辑的代码，考虑使用泛型。

---

### Q2: 泛型约束什么时候使用？

**A:** 当你的泛型代码需要访问类型参数的特定属性或方法时。

```typescript
// ❌ 错误：T 可能没有 length 属性
function logLength<T>(item: T) {
  console.log(item.length); // 错误
}

// ✅ 正确：约束 T 必须有 length 属性
function logLength<T extends { length: number }>(item: T) {
  console.log(item.length); // 正确
}
```

---

### Q3: 条件类型和联合类型有什么区别？

**A:**
- **联合类型**：表示"A 或 B"
- **条件类型**：根据条件选择类型，类似于"如果 A 那么 X，否则 Y"

```typescript
// 联合类型
type StringOrNumber = string | number;

// 条件类型
type IsString<T> = T extends string ? true : false;
```

---

### Q4: 为什么需要类型守卫？

**A:** TypeScript 的类型系统在编译时工作，但运行时的数据可能来自外部（API、用户输入）。类型守卫帮助我们在运行时验证类型，并让 TypeScript 理解这种验证。

```typescript
function processValue(value: string | number) {
  // TypeScript 不知道运行时 value 是什么类型
  
  if (typeof value === "string") {
    // 现在 TypeScript 知道 value 是 string
    value.toUpperCase(); // ✓ 安全
  }
}
```

---

### Q5: Partial 和 Optional 有什么区别？

**A:**
- **Partial<T>**：工具类型，将类型 T 的所有属性设为可选
- **Optional (?)**：属性修饰符，单独标记某个属性为可选

```typescript
interface User {
  name: string;
  age: number;
}

// 使用 Partial
type PartialUser = Partial<User>;
// { name?: string; age?: number; }

// 使用 optional 修饰符
interface PartialUserManual {
  name?: string;
  age?: number;
}
```

---

## 9. 最佳实践

### ✅ DO - 推荐做法

1. **优先使用类型推断**
   ```typescript
   // ✅ 好：让 TypeScript 推断
   const numbers = [1, 2, 3];
   
   // ❌ 不必要的显式类型
   const numbers: number[] = [1, 2, 3];
   ```

2. **使用泛型约束限制类型**
   ```typescript
   // ✅ 好：明确约束
   function merge<T extends object, U extends object>(a: T, b: U): T & U {
     return { ...a, ...b };
   }
   
   // ❌ 差：过于宽松
   function merge<T, U>(a: T, b: U): any {
     return { ...a, ...b };
   }
   ```

3. **为复杂类型创建类型别名**
   ```typescript
   // ✅ 好：可读性高
   type UserId = string;
   type Timestamp = number;
   type UserData = {
     id: UserId;
     createdAt: Timestamp;
   };
   ```

4. **使用工具类型而不是手动重复定义**
   ```typescript
   // ✅ 好：使用 Pick
   type PublicUser = Pick<User, 'id' | 'name'>;
   
   // ❌ 差：手动定义
   type PublicUser = {
     id: string;
     name: string;
   };
   ```

---

### ❌ DON'T - 避免做法

1. **不要过度使用 any**
   ```typescript
   // ❌ 差：失去类型安全
   function processData(data: any): any {
     return data;
   }
   
   // ✅ 好：使用泛型
   function processData<T>(data: T): T {
     return data;
   }
   ```

2. **不要创建过于复杂的类型**
   ```typescript
   // ❌ 差：难以理解和维护
   type ComplexType<T> = T extends Array<infer U>
     ? U extends { [K in keyof U]: infer V }
       ? V extends Promise<infer W>
         ? W
         : V
       : U
     : T;
   
   // ✅ 好：分步定义，清晰明了
   type UnwrapArray<T> = T extends Array<infer U> ? U : T;
   type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
   type Simplified<T> = UnwrapPromise<UnwrapArray<T>>;
   ```

3. **不要为了用泛型而用泛型**
   ```typescript
   // ❌ 差：不必要的泛型
   function add<T extends number>(a: T, b: T): T {
     return (a + b) as T;
   }
   
   // ✅ 好：直接使用具体类型
   function add(a: number, b: number): number {
     return a + b;
   }
   ```

---

## 10. 下一步

恭喜你完成了 TypeScript 高级类型的学习！

**下一章：** [装饰器和元编程](../02-decorators-metaprogramming/)

**复习建议：**
- 练习编写泛型函数和类
- 尝试创建自己的工具类型
- 在实际项目中应用类型守卫
- 探索 TypeScript 官方文档的高级类型部分

**推荐资源：**
- [TypeScript 官方文档 - 泛型](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript 官方文档 - 条件类型](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Deep Dive - 类型系统](https://basarat.gitbook.io/typescript/type-system)

继续加油！💪
