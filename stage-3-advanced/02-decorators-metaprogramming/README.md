# 第 2 章：装饰器和元编程

欢迎来到装饰器和元编程的学习！装饰器是 TypeScript 的一个强大特性，允许你在不修改原始代码的情况下，为类、方法、属性和参数添加额外的功能。

## 📚 本章目标

完成本章后，你将能够：

- ✅ 理解装饰器的工作原理和应用场景
- ✅ 配置 TypeScript 以支持装饰器
- ✅ 创建和使用类装饰器
- ✅ 创建和使用方法装饰器
- ✅ 创建和使用属性装饰器和参数装饰器
- ✅ 理解装饰器工厂和装饰器组合
- ✅ 在实际项目中应用装饰器模式

---

## 1. 装饰器简介

### 1.1 什么是装饰器？

> **✨ The Metaphor: The Magic Spell**
> 装饰器就像是给代码施加的**魔法咒语**。
> 你写了一个普通的类 `User`，然后你在它头上贴了一张符咒 `@Component`。
> 瞬间，这个普通的类就获得了超能力（被注册到依赖注入容器、获得了路由能力等）。
> 装饰器本质上是**元编程 (Metaprogramming)** —— 编写“用来编写代码”的代码。它允许你在代码运行时修改代码本身的行为。

装饰器是一种特殊类型的声明，可以附加到类、方法、访问器、属性或参数上。装饰器使用 `@expression` 的形式，其中 `expression` 是一个函数，在运行时被调用。

**核心概念：**
- 装饰器本质上是一个函数
- 装饰器在类定义时执行（不是实例化时）
- 装饰器可以修改被装饰的目标
- 多个装饰器可以组合使用

---

### 1.2 启用装饰器支持

在 `tsconfig.json` 中启用装饰器：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**配置说明：**
- `experimentalDecorators`: 启用装饰器语法
- `emitDecoratorMetadata`: 启用装饰器元数据（用于依赖注入等高级特性）

---

## 2. 类装饰器（Class Decorators）

类装饰器应用于类的构造函数，可以用来监视、修改或替换类定义。

### 2.1 基础类装饰器

```typescript
// 简单的类装饰器
function sealed(constructor: Function) {
  console.log('Sealing the constructor:', constructor.name);
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  greet() {
    return `Hello, ${this.greeting}`;
  }
}

// 使用
const greeter = new Greeter("world");
console.log(greeter.greet()); // Hello, world
```

**说明：**
- `@sealed` 装饰器在类定义时执行
- 它接收类的构造函数作为参数
- 可以修改或替换构造函数

---

### 2.2 装饰器工厂

> **🏭 The Metaphor: The Custom Suit**
> 普通装饰器就像是**成衣**，买来什么样就是什么样。
> 装饰器工厂就像是**裁缝店**。
> 你告诉裁缝：“我要一件红色的、带三个口袋的西装。”（传递参数）
> 裁缝会根据你的要求，现场制作出一件独一无二的装饰器给你穿上。
> 这让你能够**配置**你的魔法，而不是只能使用死板的魔法。

装饰器工厂是一个返回装饰器函数的函数，允许你传递参数给装饰器。

```typescript
// 装饰器工厂：接收参数
function logger(prefix: string) {
  // 返回实际的装饰器函数
  return function(constructor: Function) {
    console.log(`${prefix}: ${constructor.name}`);
  };
}

@logger('Register')
class User {
  constructor(public name: string) {}
}

// 输出: Register: User
```

---

### 2.3 修改类的装饰器

装饰器可以返回一个新的构造函数来替换原始类。

```typescript
// 添加时间戳属性的装饰器
function timestamped<T extends { new(...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    createdAt = new Date();
    
    constructor(...args: any[]) {
      super(...args);
      console.log(`实例创建于: ${this.createdAt.toISOString()}`);
    }
  };
}

@timestamped
class Document {
  constructor(public title: string) {}
}

const doc = new Document("README");
// 输出: 实例创建于: 2024-01-01T00:00:00.000Z
console.log((doc as any).createdAt); // Date 对象
```

---

### 2.4 实用示例：单例模式装饰器

```typescript
// 单例装饰器
function Singleton<T extends { new(...args: any[]): {} }>(constructor: T) {
  let instance: any = null;
  
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this;
      return instance;
    }
  };
}

@Singleton
class Database {
  private connections: number = 0;
  
  connect() {
    this.connections++;
    console.log(`连接数: ${this.connections}`);
  }
}

// 测试单例
const db1 = new Database();
const db2 = new Database();

db1.connect(); // 连接数: 1
db2.connect(); // 连接数: 2

console.log(db1 === db2); // true - 同一个实例
```

---

## 3. 方法装饰器（Method Decorators）

> **🕵️ The Metaphor: The Interceptor**
> 方法装饰器是**拦截器**。
> 当你调用 `user.save()` 时，实际上并没有直接执行 `save` 方法。
> 你先进入了装饰器布置的**陷阱**。
> 装饰器可以：
> 1.  **偷梁换柱**：在执行原方法前，偷看或修改参数。
> 2.  **记录在案**：记录日志、计时。
> 3.  **狸猫换太子**：完全替换原方法的实现，甚至阻止原方法执行（例如权限检查失败）。
> 4.  **事后诸葛亮**：在原方法返回后，修改返回值。

方法装饰器应用于方法的属性描述符，可以用来监视、修改或替换方法定义。

### 3.1 基础方法装饰器

```typescript
// 方法装饰器签名
function log(
  target: any,                    // 类的原型对象
  propertyKey: string,           // 方法名称
  descriptor: PropertyDescriptor // 属性描述符
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`调用方法: ${propertyKey}`);
    console.log(`参数:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`返回值:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
  
  @log
  multiply(a: number, b: number): number {
    return a * b;
  }
}

const calc = new Calculator();
calc.add(5, 3);
// 输出:
// 调用方法: add
// 参数: [5, 3]
// 返回值: 8
```

---

### 3.2 实用示例：性能测量装饰器

```typescript
// 性能测量装饰器
function measureTime(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    const start = performance.now();
    
    try {
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      console.log(`${propertyKey} 执行时间: ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.log(`${propertyKey} 失败，耗时: ${(end - start).toFixed(2)}ms`);
      throw error;
    }
  };
  
  return descriptor;
}

class DataService {
  @measureTime
  async fetchUsers(): Promise<any[]> {
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 100));
    return [{ id: 1, name: 'Alice' }];
  }
  
  @measureTime
  async processData(data: any[]): Promise<void> {
    // 模拟数据处理
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

// 使用
async function example() {
  const service = new DataService();
  const users = await service.fetchUsers();
  // 输出: fetchUsers 执行时间: 100.xx ms
  
  await service.processData(users);
  // 输出: processData 执行时间: 50.xx ms
}
```

---

### 3.3 实用示例：错误处理装饰器

```typescript
// 错误处理装饰器
function catchError(errorMessage: string) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        console.error(`${errorMessage}:`, error);
        // 可以在这里进行错误上报、日志记录等
        throw error; // 重新抛出错误或返回默认值
      }
    };
    
    return descriptor;
  };
}

class ApiService {
  @catchError('获取用户数据失败')
  async getUser(id: string) {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error('User not found');
    }
    return response.json();
  }
  
  @catchError('创建用户失败')
  async createUser(data: any) {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  }
}
```

---

### 3.4 实用示例：缓存装饰器

```typescript
// 缓存装饰器
function memoize(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const cache = new Map<string, any>();
  
  descriptor.value = function(...args: any[]) {
    // 创建缓存键
    const key = JSON.stringify(args);
    
    // 检查缓存
    if (cache.has(key)) {
      console.log(`从缓存返回: ${propertyKey}(${key})`);
      return cache.get(key);
    }
    
    // 执行方法并缓存结果
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    console.log(`执行并缓存: ${propertyKey}(${key})`);
    
    return result;
  };
  
  return descriptor;
}

class MathService {
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
  
  @memoize
  factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }
}

// 使用
const math = new MathService();
console.log(math.fibonacci(10)); // 执行并缓存
console.log(math.fibonacci(10)); // 从缓存返回
```

---

## 4. 属性装饰器（Property Decorators）

属性装饰器应用于类的属性，可以用来监视或修改属性定义。

### 4.1 基础属性装饰器

```typescript
// 属性装饰器签名
function readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false,
    configurable: false
  });
}

class Person {
  @readonly
  name: string = "Alice";
}

const person = new Person();
console.log(person.name); // Alice
// person.name = "Bob"; // 错误：无法分配到只读属性
```

---

### 4.2 实用示例：默认值装饰器

```typescript
// 默认值装饰器
function defaultValue(value: any) {
  return function(target: any, propertyKey: string) {
    let val = value;
    
    const getter = function() {
      return val;
    };
    
    const setter = function(newVal: any) {
      val = newVal !== undefined && newVal !== null ? newVal : value;
    };
    
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class Config {
  @defaultValue('localhost')
  host: string;
  
  @defaultValue(3000)
  port: number;
  
  @defaultValue(true)
  debug: boolean;
}

const config = new Config();
console.log(config.host);  // localhost
console.log(config.port);  // 3000

config.host = 'example.com';
console.log(config.host);  // example.com

config.host = null as any;
console.log(config.host);  // localhost (恢复默认值)
```

---

### 4.3 实用示例：验证装饰器

```typescript
// 验证装饰器
function validate(validationFn: (value: any) => boolean, errorMessage: string) {
  return function(target: any, propertyKey: string) {
    let value: any;
    
    const getter = function() {
      return value;
    };
    
    const setter = function(newVal: any) {
      if (!validationFn(newVal)) {
        throw new Error(`验证失败: ${propertyKey} - ${errorMessage}`);
      }
      value = newVal;
    };
    
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

// 验证函数
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPositive = (value: number) => value > 0;
const isNotEmpty = (value: string) => value.length > 0;

class UserForm {
  @validate(isNotEmpty, '用户名不能为空')
  username: string;
  
  @validate(isEmail, '邮箱格式不正确')
  email: string;
  
  @validate(isPositive, '年龄必须大于 0')
  age: number;
}

// 使用
const form = new UserForm();

try {
  form.username = ''; // 抛出错误：用户名不能为空
} catch (error) {
  console.error(error);
}

try {
  form.email = 'invalid-email'; // 抛出错误：邮箱格式不正确
} catch (error) {
  console.error(error);
}

form.username = 'alice';
form.email = 'alice@example.com';
form.age = 30;
console.log('验证通过!');
```

---

## 5. 参数装饰器（Parameter Decorators）

参数装饰器应用于函数参数，可以用来监视参数传递。

### 5.1 基础参数装饰器

```typescript
// 参数装饰器签名
function logParameter(target: any, propertyKey: string, parameterIndex: number) {
  const existingParameters = Reflect.getMetadata('log_parameters', target, propertyKey) || [];
  existingParameters.push(parameterIndex);
  Reflect.defineMetadata('log_parameters', existingParameters, target, propertyKey);
  
  console.log(`参数装饰器: 类=${target.constructor.name}, 方法=${propertyKey}, 参数索引=${parameterIndex}`);
}

class UserService {
  getUser(@logParameter id: string) {
    return { id, name: 'Alice' };
  }
  
  updateUser(
    @logParameter id: string,
    @logParameter data: any
  ) {
    return { id, ...data };
  }
}
```

---

### 5.2 实用示例：参数验证装饰器

```typescript
// 参数验证装饰器
function required(target: any, propertyKey: string, parameterIndex: number) {
  const existingRequiredParameters: number[] = 
    Reflect.getMetadata('required_parameters', target, propertyKey) || [];
  
  existingRequiredParameters.push(parameterIndex);
  
  Reflect.defineMetadata(
    'required_parameters',
    existingRequiredParameters,
    target,
    propertyKey
  );
}

// 方法装饰器：验证必需参数
function validateRequired(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const requiredParameters: number[] = 
      Reflect.getMetadata('required_parameters', target, propertyKey) || [];
    
    for (const parameterIndex of requiredParameters) {
      if (args[parameterIndex] === undefined || args[parameterIndex] === null) {
        throw new Error(
          `参数 ${parameterIndex} 是必需的 (方法: ${propertyKey})`
        );
      }
    }
    
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

class ProductService {
  @validateRequired
  createProduct(
    @required name: string,
    @required price: number,
    description?: string
  ) {
    return { name, price, description };
  }
}

// 使用
const productService = new ProductService();

try {
  productService.createProduct('Book', null as any); // 错误：参数 1 是必需的
} catch (error) {
  console.error(error);
}

const product = productService.createProduct('Book', 29.99); // ✓ 正确
console.log(product);
```

---

## 6. 装饰器组合

多个装饰器可以应用于同一个声明，它们的执行顺序是：
1. 参数装饰器 → 方法装饰器 → 访问器装饰器 → 属性装饰器 → 类装饰器（从上到下）
2. 同一类型的多个装饰器：从下到上执行

### 6.1 装饰器执行顺序

```typescript
function first() {
  console.log('first(): 工厂函数执行');
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('first(): 装饰器执行');
  };
}

function second() {
  console.log('second(): 工厂函数执行');
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('second(): 装饰器执行');
  };
}

class Example {
  @first()
  @second()
  method() {}
}

// 输出顺序:
// first(): 工厂函数执行
// second(): 工厂函数执行
// second(): 装饰器执行
// first(): 装饰器执行
```

---

### 6.2 实用示例：组合多个装饰器

```typescript
// 组合使用多个装饰器
class OrderService {
  @measureTime        // 测量执行时间
  @catchError('处理订单失败')  // 捕获错误
  @memoize           // 缓存结果
  async processOrder(orderId: string) {
    // 模拟订单处理
    await new Promise(resolve => setTimeout(resolve, 100));
    return { orderId, status: 'processed' };
  }
}
```

---

## 7. 实战项目：API 装饰器系统

创建一个完整的 API 装饰器系统，用于 Express 路由。

```typescript
import 'reflect-metadata';

// 存储路由元数据的键
const ROUTES_KEY = Symbol('routes');
const MIDDLEWARE_KEY = Symbol('middleware');

// HTTP 方法枚举
enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch'
}

// 路由元数据接口
interface RouteMetadata {
  method: HttpMethod;
  path: string;
  handlerName: string;
}

// HTTP 方法装饰器
function createMethodDecorator(method: HttpMethod) {
  return function(path: string) {
    return function(
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const routes: RouteMetadata[] = 
        Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];
      
      routes.push({
        method,
        path,
        handlerName: propertyKey
      });
      
      Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
    };
  };
}

// 导出 HTTP 方法装饰器
const Get = createMethodDecorator(HttpMethod.GET);
const Post = createMethodDecorator(HttpMethod.POST);
const Put = createMethodDecorator(HttpMethod.PUT);
const Delete = createMethodDecorator(HttpMethod.DELETE);
const Patch = createMethodDecorator(HttpMethod.PATCH);

// 控制器装饰器
function Controller(basePath: string = '') {
  return function<T extends { new(...args: any[]): {} }>(constructor: T) {
    // 存储基础路径
    Reflect.defineMetadata('basePath', basePath, constructor);
    
    return constructor;
  };
}

// 中间件装饰器
function UseMiddleware(...middlewares: Function[]) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(
      MIDDLEWARE_KEY,
      middlewares,
      target.constructor,
      propertyKey
    );
  };
}

// 请求体验证装饰器
function ValidateBody(schema: any) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(req: any, res: any, next: any) {
      try {
        // 这里可以使用 Joi、Yup 等验证库
        const isValid = validateSchema(req.body, schema);
        if (!isValid) {
          return res.status(400).json({ error: '请求体验证失败' });
        }
        return await originalMethod.call(this, req, res, next);
      } catch (error) {
        next(error);
      }
    };
    
    return descriptor;
  };
}

// 认证装饰器
function RequireAuth(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(req: any, res: any, next: any) {
    // 检查认证
    if (!req.headers.authorization) {
      return res.status(401).json({ error: '未授权' });
    }
    
    return await originalMethod.call(this, req, res, next);
  };
  
  return descriptor;
}

// 示例：用户控制器
@Controller('/api/users')
class UserController {
  @Get('/')
  async getUsers(req: any, res: any) {
    const users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    res.json(users);
  }
  
  @Get('/:id')
  async getUser(req: any, res: any) {
    const { id } = req.params;
    res.json({ id, name: 'Alice' });
  }
  
  @Post('/')
  @RequireAuth
  @ValidateBody({
    name: 'string',
    email: 'string'
  })
  async createUser(req: any, res: any) {
    const user = req.body;
    res.status(201).json({ id: Date.now(), ...user });
  }
  
  @Put('/:id')
  @RequireAuth
  async updateUser(req: any, res: any) {
    const { id } = req.params;
    const updates = req.body;
    res.json({ id, ...updates });
  }
  
  @Delete('/:id')
  @RequireAuth
  async deleteUser(req: any, res: any) {
    const { id } = req.params;
    res.json({ message: `User ${id} deleted` });
  }
}

// 注册路由的辅助函数
function registerRoutes(app: any, controller: any) {
  const instance = new controller();
  const basePath = Reflect.getMetadata('basePath', controller) || '';
  const routes: RouteMetadata[] = Reflect.getMetadata(ROUTES_KEY, controller) || [];
  
  routes.forEach(route => {
    const fullPath = basePath + route.path;
    const handler = instance[route.handlerName].bind(instance);
    
    console.log(`注册路由: ${route.method.toUpperCase()} ${fullPath}`);
    app[route.method](fullPath, handler);
  });
}

// 辅助函数（示例）
function validateSchema(data: any, schema: any): boolean {
  // 简化的验证逻辑
  return true;
}

// 导出
export {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  UseMiddleware,
  ValidateBody,
  RequireAuth,
  registerRoutes
};
```

---

## 8. 最佳实践

### ✅ DO - 推荐做法

1. **装饰器命名清晰**
   ```typescript
   // ✅ 好：清晰的命名
   @readonly
   @memoize
   @requireAuth
   
   // ❌ 差：模糊的命名
   @dec
   @fn
   @x
   ```

2. **使用装饰器工厂传递参数**
   ```typescript
   // ✅ 好：使用工厂函数
   @timeout(5000)
   @retry(3)
   
   // ❌ 差：硬编码值
   ```

3. **保持装饰器的单一职责**
   ```typescript
   // ✅ 好：单一职责
   @log
   @measureTime
   @catchError('处理失败')
   
   // ❌ 差：一个装饰器做太多事情
   @logAndMeasureAndCatchErrors
   ```

4. **在装饰器中保留 this 上下文**
   ```typescript
   // ✅ 好：使用 apply/call
   descriptor.value = function(...args: any[]) {
     return originalMethod.apply(this, args);
   };
   
   // ❌ 差：丢失 this 上下文
   descriptor.value = (...args: any[]) => {
     return originalMethod(...args);
   };
   ```

---

### ❌ DON'T - 避免做法

1. **不要过度使用装饰器**
   ```typescript
   // ❌ 差：装饰器过多，难以理解
   @log
   @measureTime
   @cache
   @retry
   @timeout
   @validate
   @transform
   @serialize
   method() {}
   ```

2. **不要在装饰器中进行副作用操作**
   ```typescript
   // ❌ 差：修改全局状态
   function badDecorator(target: any) {
     globalState.something = target; // 避免
   }
   ```

3. **不要忽略错误处理**
   ```typescript
   // ❌ 差：没有错误处理
   descriptor.value = async function(...args: any[]) {
     return await originalMethod.apply(this, args);
   };
   
   // ✅ 好：添加错误处理
   descriptor.value = async function(...args: any[]) {
     try {
       return await originalMethod.apply(this, args);
     } catch (error) {
       console.error('Method failed:', error);
       throw error;
     }
   };
   ```

---

## 9. 练习题

### 练习 1：速率限制装饰器

创建一个 `@rateLimit` 装饰器，限制方法在指定时间内的调用次数。

```typescript
// TODO: 实现 rateLimit 装饰器
function rateLimit(maxCalls: number, timeWindow: number) {
  // 你的实现...
}

class ApiClient {
  @rateLimit(5, 1000) // 每秒最多 5 次调用
  async makeRequest(url: string) {
    return fetch(url);
  }
}

// 测试
const client = new ApiClient();
for (let i = 0; i < 10; i++) {
  client.makeRequest('/api/data').catch(err => 
    console.error('请求失败:', err.message)
  );
}
```

<details>
<summary>查看参考答案</summary>

```typescript
function rateLimit(maxCalls: number, timeWindow: number) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const calls: number[] = [];
    
    descriptor.value = async function(...args: any[]) {
      const now = Date.now();
      
      // 移除过期的调用记录
      while (calls.length > 0 && calls[0] < now - timeWindow) {
        calls.shift();
      }
      
      // 检查是否超过限制
      if (calls.length >= maxCalls) {
        throw new Error(
          `速率限制: 最多 ${maxCalls} 次调用每 ${timeWindow}ms`
        );
      }
      
      // 记录此次调用
      calls.push(now);
      
      // 执行原始方法
      return await originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}
```

</details>

---

### 练习 2：依赖注入装饰器

实现一个简单的依赖注入系统。

```typescript
// TODO: 实现依赖注入装饰器

class EmailService {
  send(to: string, message: string) {
    console.log(`发送邮件到 ${to}: ${message}`);
  }
}

class UserService {
  @Inject(EmailService)
  private emailService!: EmailService;
  
  createUser(email: string) {
    // 使用注入的 EmailService
    this.emailService.send(email, '欢迎注册!');
  }
}
```

<details>
<summary>查看参考答案</summary>

```typescript
// 简单的依赖注入容器
class Container {
  private static instances = new Map<any, any>();
  
  static resolve<T>(target: new () => T): T {
    if (!this.instances.has(target)) {
      this.instances.set(target, new target());
    }
    return this.instances.get(target);
  }
}

// 注入装饰器
function Inject(serviceClass: any) {
  return function(target: any, propertyKey: string) {
    // 延迟初始化
    Object.defineProperty(target, propertyKey, {
      get() {
        return Container.resolve(serviceClass);
      },
      enumerable: true,
      configurable: true
    });
  };
}
```

</details>

---

## 10. 下一步

恭喜你完成了装饰器和元编程的学习！

**下一章：** [设计模式](../03-design-patterns/)

**复习建议：**
- 实践创建各种类型的装饰器
- 在实际项目中应用装饰器
- 思考装饰器的适用场景
- 避免过度使用装饰器

**推荐资源：**
- [TypeScript 官方文档 - 装饰器](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [装饰器提案](https://github.com/tc39/proposal-decorators)
- [reflect-metadata 库](https://github.com/rbuckton/reflect-metadata)

继续加油！💪
