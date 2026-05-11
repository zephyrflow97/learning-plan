# 第 11 章：TypeScript 工程化进阶 — 驯服 TypeScript 的工具链

> *"A language that doesn't affect the way you think about programming is not worth knowing."*
> — Alan Perlis, *Epigrams on Programming*
>
> 你已经会写 TypeScript 了。但你能为一个没有类型定义的第三方库补上 `.d.ts` 吗？你知道 `strict` 模式下每个子选项的含义和取舍吗？你能在 Monorepo 中正确配置 Project References 吗？TypeScript 的学习有两个阶段：第一阶段是"用 TypeScript 写代码"，第二阶段是"**驯服 TypeScript 的工具链**"。本章是第二阶段的入口。

## 📖 本章内容

1. [声明文件 (.d.ts)](#1-声明文件-dts) — 给沉默的代码一张嘴
2. [编写声明文件](#2-编写声明文件) — `declare module`、`declare global`、模块增强
3. [TypeScript 高级类型模式](#3-typescript-高级类型模式) — 品牌类型、协变逆变、递归类型、`infer`
4. [tsconfig 深入](#4-tsconfig-深入) — `strict` 各子选项、`paths`、`extends` 配置继承
5. [Project References](#5-project-references) — 多包项目 / Monorepo 的 TypeScript 配置
6. [构建工具选型](#6-构建工具选型) — `tsc` vs `esbuild` vs `SWC` vs `tsx`
7. [模块系统深入](#7-模块系统深入) — CJS vs ESM、`package.json` 的 `type`/`exports`/`main`
8. [🧘 Zen of Code：工程化的边界](#8--zen-of-code工程化的边界)
9. [最佳实践与常见陷阱](#9-最佳实践与常见陷阱)
10. [本章总结](#10-本章总结)
11. [章节练习](#11-章节练习)

---

## 1. 声明文件 (.d.ts)

> 🎭 **The Drama：给沉默的代码一张嘴**
>
> 想象你引入了一个纯 JS 的 npm 包。TypeScript 看着它就像看着一个**哑巴**——知道它存在，但不知道它会说什么（返回什么类型）、听什么（接受什么参数）。`.d.ts` 声明文件就是给这个哑巴**写了一本对话手册**。有了手册，TypeScript 就能帮你检查你和它的对话是否合理。`@types/node`、`@types/react` 就是社区为 Node.js 和 React 写的对话手册。
>
> 这张"嘴"不存在于运行时——`.d.ts` 在编译后会被完全丢弃，不产生任何 JavaScript 输出。它**只存在于开发时**，为编译器和 IDE 提供类型信息。

### 1.1 什么是声明文件

声明文件（`.d.ts`）只包含**类型信息**，没有任何运行时实现。它是 TypeScript 的"契约文档"——告诉编译器某个模块、函数或变量的类型形状。

```typescript
// 这不是代码实现，这是一张"产品说明书"
declare function greet(name: string): string;
declare const VERSION: string;
// ... 完整示例见 examples/01-declaration-files.ts
```

### 1.2 何时需要声明文件

| 场景 | 你需要做什么 | 示例 |
|------|-------------|------|
| npm 包有内建类型 | 什么都不用做 | `zod`、`prisma` |
| npm 包无类型，但有 `@types` | `npm i -D @types/xxx` | `@types/lodash`、`@types/express` |
| npm 包无类型，也无 `@types` | 自己写 `.d.ts` | 一些小众库 |
| 引入非 JS 资源 | 声明模块类型 | `.css`、`.svg`、`.json` |
| 全局变量 | `declare global` | `window.__CONFIG__` |

### 1.3 DefinitelyTyped：世界上最大的类型仓库

> 🌌 **The Big Picture：一个残酷的事实与社区的回答**
>
> DefinitelyTyped 是世界上最大的类型声明仓库（8000+ 包），由社区志愿者维护。它的存在说明了一个残酷的事实——JavaScript 生态中大量高质量的库没有内建类型定义。`@types` 是社区为弥补这个缺口而建立的**桥梁**，但它也是一个脆弱的桥梁：类型版本和库版本不同步是常态。

**类型查找的优先级链**：

```
1. 包自身的 types/typings 字段 (package.json)
2. 包内的 index.d.ts
3. node_modules/@types/xxx
4. tsconfig.json 的 typeRoots
5. 项目中的自定义 .d.ts 文件
```

### 1.4 声明文件的三种形态

**1. 全局声明（Ambient Declaration）**

```typescript
// global.d.ts — 不导入不导出，影响全局
declare const API_URL: string;
declare function gtag(...args: unknown[]): void;
```

**2. 模块声明（Module Declaration）**

```typescript
// types/some-lib.d.ts
declare module 'some-untyped-lib' {
  export function doStuff(input: string): number;
}
```

**3. 资源模块声明**

```typescript
// types/assets.d.ts
declare module '*.css' { const classes: Record<string, string>; export default classes; }
declare module '*.svg' { const src: string; export default src; }
```

> 完整的声明文件演示见 [`examples/01-declaration-files.ts`](./examples/01-declaration-files.ts)

---

## 2. 编写声明文件

> ⚛️ **Science：模块增强 — 给别人的代码打补丁**
>
> TypeScript 的 Module Augmentation 允许你**在不修改源代码的情况下**扩展已有模块的类型。这不是 Monkey Patching——你不是在运行时修改对象，而是在编译时告诉 TypeScript"这个模块现在多了一些成员"。它的合法用途包括：扩展 Express 的 Request 类型、给第三方库添加缺失的方法签名、声明全局变量。

### 2.1 `declare module`：模块级声明

当你需要为整个第三方模块提供类型时：

```typescript
// types/legacy-utils.d.ts
declare module 'legacy-utils' {
  export function formatDate(d: Date, fmt: string): string;
  export function parseCSV(raw: string): string[][];
  // ... 完整实现见 examples/01-declaration-files.ts
}
```

**关键规则**：
- 模块名必须与 `import` 语句中使用的名称完全匹配
- 如果包含 `import/export`，文件变成模块作用域（不会污染全局）
- 如果没有 `import/export`，整个文件是全局声明

### 2.2 `declare global`：扩展全局作用域

当你需要声明运行时注入的全局变量时：

```typescript
// types/env.d.ts
export {}; // 使文件成为模块（必须）

declare global {
  interface Window {
    __APP_CONFIG__: { apiUrl: string; version: string };
  }
  var __IS_DEV__: boolean; // var 声明全局变量
}
```

> ❌ **常见错误**：忘记 `export {}` 导致 `declare global` 不生效
>
> 在一个没有任何 `import/export` 的文件中写 `declare global` 是无效的。TypeScript 会将整个文件视为全局脚本，`declare global` 就成了多余的包装。**解法**：在文件顶部加一个空的 `export {}`，将文件变成 ES Module。

### 2.3 Module Augmentation：扩展已有模块

```typescript
// 扩展 Express 的 Request 类型
import 'express';

declare module 'express' {
  interface Request {
    user?: { id: string; role: string };
    requestId: string;
  }
}
```

### 2.4 `declare namespace`：命名空间声明

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    DATABASE_URL: string;
    API_KEY: string;
  }
}
```

### 2.5 编写声明文件的最佳实践

| 规则 | 说明 |
|------|------|
| **从宽到严** | 初始版本用 `any`，逐步替换为精确类型 |
| **优先用 `interface`** | `interface` 可以被消费者增强（Module Augmentation），`type` 不行 |
| **导出默认类型** | 如果原库用 `module.exports = fn`，声明用 `export default` 或 `export =` |
| **用 `@types` 前先查版本** | `@types/xxx` 的版本应和 `xxx` 的主版本一致 |
| **为你的库内建类型** | 如果你是库作者，在 `package.json` 中设置 `types` 字段 |

> 完整的模块增强演示见 [`examples/02-module-augmentation.ts`](./examples/02-module-augmentation.ts)

---

## 3. TypeScript 高级类型模式

> 🧠 **CS Master's Bridge：类型系统的"方向性" — 协变与逆变**
>
> `Dog extends Animal`。一个接受 `Animal[]` 的函数能接受 `Dog[]` 吗？（**协变**，答案：是，因为 Dog 是 Animal 的子类型，数组的类型参数与子类型关系同方向变化）。一个接受 `(dog: Dog) => void` 的地方能传 `(animal: Animal) => void` 吗？（**逆变**，答案：也是，因为 Animal handler 能处理所有 Animal，自然也能处理 Dog，函数参数的类型与子类型关系**反方向**变化）。
>
> 这两个"方向性"规则是类型系统安全性的数学基础。TypeScript 默认对函数参数做逆变检查（`strictFunctionTypes: true`），这防止了一类微妙的运行时错误。

### 3.1 品牌类型 (Branded Types)

> ⚛️ **Science：品牌类型 — 给相同结构贴不同标签**
>
> `userId: string` 和 `orderId: string` 在结构上完全相同，但它们在业务上完全不同。品牌类型让 TypeScript 区分它们——你不能把 `UserId` 传给需要 `OrderId` 的函数。这是**名义类型系统 (Nominal Typing)** 在结构化类型系统中的模拟。

```typescript
// 品牌类型的核心模式
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

function getUser(id: UserId) { /* ... */ }
const userId = 'u-123' as UserId;
const orderId = 'o-456' as OrderId;

getUser(userId);  // ✅
getUser(orderId); // ❌ 编译错误！
```

### 3.2 协变与逆变

TypeScript 的类型系统中，类型参数的"方向性"决定了子类型关系如何传递：

| 术语 | 方向 | 示例 | TypeScript 行为 |
|------|------|------|----------------|
| **协变** (Covariant) | 同方向 | `Array<Dog>` → `Array<Animal>` | 数组、Promise、返回值 |
| **逆变** (Contravariant) | 反方向 | `(a: Animal) => void` → `(d: Dog) => void` | 函数参数 (strict 模式) |
| **不变** (Invariant) | 不传递 | 同时读写的位置 | `Set<Dog>` ≠ `Set<Animal>` |
| **双变** (Bivariant) | 双方向 | 方法参数 (非 strict) | TS 的历史兼容行为 |

```typescript
// 协变 — 返回值位置
type Producer<T> = () => T;
declare let dogProducer: Producer<Dog>;
declare let animalProducer: Producer<Animal>;
animalProducer = dogProducer; // ✅ Dog 是 Animal 的子类

// 逆变 — 参数位置 (strictFunctionTypes: true)
type Consumer<T> = (item: T) => void;
declare let dogConsumer: Consumer<Dog>;
declare let animalConsumer: Consumer<Animal>;
dogConsumer = animalConsumer; // ✅ Animal handler 能处理 Dog
// animalConsumer = dogConsumer; // ❌ Dog handler 不一定能处理 Cat
```

> 完整的协变逆变演示见 [`examples/03-advanced-type-patterns.ts`](./examples/03-advanced-type-patterns.ts)

### 3.3 递归类型

递归类型是类型系统中的"自引用"——类型的定义中使用了自身：

```typescript
// 深度只读 — 递归地将所有嵌套属性变为 readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};
```

```typescript
// JSON 类型 — 递归定义合法的 JSON 值
type JSONValue =
  | string | number | boolean | null
  | JSONValue[]
  | { [key: string]: JSONValue };
```

### 3.4 `infer` 的模式匹配

`infer` 是 TypeScript 类型系统中的"正则捕获组"——它在条件类型中声明一个待推断的类型变量：

```typescript
// 提取函数的返回类型（内建 ReturnType 的实现）
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取 Promise 的解包类型
type Unpacked<T> = T extends Promise<infer U> ? U : T;

// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;
```

**`infer` 的高级用法**：

```typescript
// 提取函数的第一个参数类型
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

// 提取元组的最后一个元素
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
```

### 3.5 模板字面量类型 (Template Literal Types)

```typescript
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

// 配合 infer 解析字符串模式
type ParseRoute<T> = T extends `${string}/:${infer Param}/${infer Rest}`
  ? Param | ParseRoute<`/${Rest}`>
  : T extends `${string}/:${infer Param}`
    ? Param
    : never;

type Params = ParseRoute<'/api/users/:userId/posts/:postId'>;
// 'userId' | 'postId'
```

> 完整的高级类型模式演示见 [`examples/03-advanced-type-patterns.ts`](./examples/03-advanced-type-patterns.ts)

---

## 4. tsconfig 深入

> 🧰 **Toolbox：tsconfig.json — 你的 TypeScript 控制台**
>
> `tsconfig.json` 有 100+ 个选项。大多数时候你只需要关心 10 个。但当你遇到"为什么我的代码在这个项目能编译、在那个项目报错"时，你需要理解剩下的 90 个中的关键几个。本节不会逐一列举每个选项——那是文档的工作。我们聚焦于**最容易误解和最容易踩坑的选项**。

### 4.1 `strict` 的七把锁

`"strict": true` 不是一个选项——它是**七个选项的集合**。理解每一把锁，你就知道什么时候该解开它（几乎永远不应该）：

| 选项 | 默认 | 作用 | 为什么重要 |
|------|------|------|-----------|
| `strictNullChecks` | ✅ | `null`/`undefined` 不可赋给其他类型 | 消灭 "Cannot read property of undefined" |
| `strictFunctionTypes` | ✅ | 函数参数逆变检查 | 防止 `Dog[]` 被错误操作成 `Animal[]` |
| `strictBindCallApply` | ✅ | `bind/call/apply` 的参数类型检查 | 防止 `fn.call(null, wrongArg)` |
| `strictPropertyInitialization` | ✅ | 类属性必须在构造函数中初始化 | 消灭 `this.name` 为 `undefined` 的 bug |
| `noImplicitAny` | ✅ | 禁止隐式 `any` | 强迫你写出类型注解 |
| `noImplicitThis` | ✅ | 禁止 `this` 类型为 `any` | 防止事件回调中 `this` 丢失 |
| `alwaysStrict` | ✅ | 每个文件加上 `"use strict"` | 启用严格模式语义 |

```typescript
// strictNullChecks 的效果
function getLength(s: string | null): number {
  // return s.length;          // ❌ 's' is possibly null
  return s?.length ?? 0;       // ✅ 安全的空值检查
}
```

> ❌ **不要为了"方便"关闭 strict 的子选项**
>
> 每关闭一个选项，你就向代码中打开了一扇"bug 的大门"。如果你在迁移旧项目，可以暂时关闭某些选项并添加 `// TODO: re-enable strictXxx` 注释，但新项目**永远**应该 `"strict": true`。

### 4.2 `paths` 与 `baseUrl`：路径别名

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

**关键注意事项**：

| 误解 | 真相 |
|------|------|
| `paths` 会自动解析运行时路径 | ❌ `paths` 只影响 TypeScript 编译器，你还需要 bundler/Node.js loader 的配合 |
| `baseUrl` 必须和 `paths` 一起用 | ✅ `paths` 需要 `baseUrl` 作为解析基准 |
| 修改 `paths` 后立即生效 | 通常需要重启 TS Server (`Ctrl+Shift+P` → "Restart TS Server") |

### 4.3 `extends`：配置继承

```json
// tsconfig.base.json — 共享基础配置
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

```json
// tsconfig.json — 具体项目配置
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 4.4 `moduleResolution` 策略对比

| 策略 | 何时使用 | 行为 |
|------|---------|------|
| `node` | Node.js (CJS) | 模拟 Node.js 的 `require` 解析 |
| `node16` / `nodenext` | Node.js (ESM) | 支持 `package.json` 的 `exports` 字段 |
| `bundler` | Webpack/Vite/esbuild | 混合模式：支持 ESM 语法 + Node.js 解析规则 |
| `classic` | ❌ 别用 | TypeScript 1.x 的遗产 |

```json
// 2024+ 推荐配置
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"  // 适用于 Vite/Next.js/Webpack 5+
  }
}
```

### 4.5 常用配置速查表

```json
{
  "compilerOptions": {
    // === 类型安全 ===
    "strict": true,                          // 七把锁全开
    "noUncheckedIndexedAccess": true,         // 索引访问可能 undefined
    "exactOptionalPropertyTypes": true,       // 区分 undefined 和 missing

    // === 模块 ===
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,                 // 允许 import x from 'cjs-lib'
    "isolatedModules": true,                 // 兼容 esbuild/SWC 的单文件编译

    // === 输出 ===
    "target": "ES2022",                      // 现代浏览器/Node 18+
    "declaration": true,                     // 生成 .d.ts
    "declarationMap": true,                  // .d.ts 的 source map
    "sourceMap": true,                       // .js 的 source map

    // === 代码质量 ===
    "noUnusedLocals": true,                  // 报告未使用的局部变量
    "noUnusedParameters": true,              // 报告未使用的参数
    "noFallthroughCasesInSwitch": true       // switch 必须 break/return
  }
}
```

---

## 5. Project References

> 🌌 **The Big Picture：Monorepo 中的 TypeScript — 让编译器只做必要的事**
>
> 想象你有一个 Monorepo，包含 `packages/shared`、`packages/api`、`packages/web`。没有 Project References 时，`tsc` 会一次性编译所有文件——即使你只改了 `shared/` 中的一行代码。Project References 把项目拆成多个"编译单元"。TypeScript 为每个单元缓存编译结果（`.tsbuildinfo`）。下次只重新编译**有变化的单元**，就像增量构建。

### 5.1 基本概念

Project References 的核心想法是：**让大型 TypeScript 项目的编译变成增量的**。

```
monorepo/
  packages/
    shared/       ← 被 api 和 web 依赖
      tsconfig.json
      src/
    api/          ← 依赖 shared
      tsconfig.json
      src/
    web/          ← 依赖 shared
      tsconfig.json
      src/
  tsconfig.json   ← 根配置，定义 references
```

### 5.2 配置步骤

**步骤 1：每个子项目设置 `composite: true`**

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

`composite: true` 的含义：
- 强制 `declaration: true`（必须生成 .d.ts）
- 强制 `declarationMap: true`（方便跳转到源码）
- 生成 `.tsbuildinfo` 文件（增量编译缓存）

**步骤 2：依赖方用 `references` 指向依赖**

```json
// packages/api/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../shared" }
  ],
  "include": ["src/**/*"]
}
```

**步骤 3：根配置聚合所有子项目**

```json
// tsconfig.json (根目录)
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ]
}
```

**步骤 4：使用 `tsc --build` 编译**

```bash
tsc --build                   # 编译所有（增量）
tsc --build --watch           # 监听模式
tsc --build --clean           # 清理构建产物
tsc --build --force           # 忽略缓存，全量编译
```

### 5.3 `--build` vs 普通 `tsc`

| 特性 | `tsc` | `tsc --build` |
|------|-------|---------------|
| 编译范围 | 当前 tsconfig 的所有文件 | 按 references 拓扑排序编译 |
| 增量编译 | 需要手动配置 `incremental` | 自动增量 |
| 依赖顺序 | 不管 | 自动先编译依赖项 |
| 跳过已编译 | 不会 | 自动跳过未变化的项目 |

> 完整的 Project References 配置示例见 [`examples/04-project-references/`](./examples/04-project-references/)

---

## 6. 构建工具选型

> 🧰 **Toolbox：TypeScript 构建工具的寒武纪大爆发**
>
> TypeScript 构建工具的涌现反映了一个核心矛盾：**TypeScript 的编译太慢了**。社区的解法是"分工"——用 `esbuild`/`SWC` 做转译（快），用 `tsc` 只做类型检查（可并行/后台运行）。理解这个"关注点分离"是选型的关键。

### 6.1 工具对比

| 工具 | 语言 | 速度 | 类型检查 | 生态 | 适用场景 |
|------|------|------|---------|------|---------|
| **tsc** | TypeScript | 🐢 慢 | ✅ 完整 | 官方 | 库开发、CI 类型检查 |
| **esbuild** | Go | 🚀 极快 (100x) | ❌ 无 | 独立 | 应用打包、开发服务器 |
| **SWC** | Rust | 🚀 极快 (70x) | ❌ 无 | Next.js 默认 | 框架集成 |
| **tsx** | JS (esbuild) | 🚀 快 | ❌ 无 | ts-node 替代 | 直接运行 .ts 文件 |
| **Vite** | JS (esbuild) | 🚀 快 | ❌ 无 (开发时) | 前端主流 | 前端开发 |

### 6.2 速度差异的根因

```
                  tsc 的工作
    ┌───────────────────────────────────┐
    │  1. 解析 (Parse)                   │
    │  2. 类型检查 (Type Check)  ← 慢！  │
    │  3. 转译 (Transpile)               │
    │  4. 生成声明 (Emit .d.ts)          │
    └───────────────────────────────────┘

                esbuild/SWC 的工作
    ┌───────────────────────────────────┐
    │  1. 解析 (Parse)                   │
    │  2. 转译 (Transpile)               │
    │  （跳过类型检查 — 只是"剥掉类型"）   │
    └───────────────────────────────────┘
```

**类型检查为什么慢？**
- 类型推断是 NP-hard 问题（复杂的泛型嵌套可以指数级爆炸）
- 需要构建完整的类型依赖图（跨文件分析）
- `tsc` 是单线程的 JavaScript 程序

### 6.3 推荐工作流

```
 开发时                           CI/CD 时
┌─────────────────────┐         ┌──────────────────────┐
│ esbuild/SWC 做转译    │         │ tsc --noEmit 做类型检查│
│ (毫秒级 HMR)          │         │ esbuild/SWC 做打包     │
│ IDE 做即时类型提示     │         │ 两步并行运行           │
└─────────────────────┘         └──────────────────────┘
```

**package.json 示例**：

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc --noEmit && esbuild src/index.ts --bundle --outdir=dist",
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch"
  }
}
```

### 6.4 各场景推荐选型

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| **Node.js 后端开发** | `tsx` (开发) + `esbuild` (构建) | 快速启动，零配置 |
| **前端 SPA/SSR** | `Vite` (esbuild 驱动) | 开箱即用的 HMR |
| **Next.js 项目** | `SWC` (内置) | 框架已集成 |
| **npm 库开发** | `tsc` (声明文件) + `esbuild` (打包) | 需要完整的 .d.ts |
| **Monorepo** | `turbo` + `tsc --build` + `esbuild` | 增量构建 + 缓存 |
| **CI 类型检查** | `tsc --noEmit` | 唯一能做完整类型检查的工具 |

> 完整的构建工具对比示例见 [`examples/05-build-tools-comparison.ts`](./examples/05-build-tools-comparison.ts)

---

## 7. 模块系统深入

> 🎭 **The Drama：CJS vs ESM — JavaScript 模块系统的世代战争**
>
> JavaScript 的模块系统经历了一场长达十年的分裂。Node.js 在 2009 年选择了 CommonJS (`require/module.exports`)，浏览器在 2015 年选择了 ES Modules (`import/export`)。两者不兼容。到了 2024 年，Node.js 同时支持两者，但"双模式"带来了新的复杂性：你的库应该发布 CJS、ESM 还是两者？`package.json` 的 `type` 字段是什么？`exports` 字段如何配置条件导出？

### 7.1 CJS vs ESM 的运行时差异

| 特性 | CommonJS (CJS) | ES Modules (ESM) |
|------|---------------|-------------------|
| **语法** | `require()` / `module.exports` | `import` / `export` |
| **加载时机** | 运行时（动态） | 编译时（静态） + 运行时（`import()`） |
| **绑定方式** | 值拷贝 | 活绑定 (Live Binding) |
| **循环依赖** | 返回部分导出 | TDZ 错误（如果未初始化） |
| **`this` 值** | `module.exports` | `undefined` |
| **文件扩展名** | `.js` / `.cjs` | `.mjs` 或 `.js`（`type: "module"` 时） |
| **Tree Shaking** | ❌ 困难 | ✅ 原生支持 |

```typescript
// CJS — 值拷贝
// counter.cjs
let count = 0;
module.exports = { count, increment() { count++; } };

// main.cjs
const mod = require('./counter.cjs');
mod.increment();
console.log(mod.count);  // 0 — 拿到的是拷贝时的值！
```

```typescript
// ESM — 活绑定
// counter.mjs
export let count = 0;
export function increment() { count++; }

// main.mjs
import { count, increment } from './counter.mjs';
increment();
console.log(count);  // 1 — 活绑定！始终反映最新值
```

### 7.2 `package.json` 的模块配置字段

```json
{
  "name": "my-lib",
  "version": "1.0.0",

  "type": "module",           // 声明 .js 文件默认为 ESM

  "main": "./dist/index.cjs", // CJS 入口（旧版 Node.js / bundler 回退）
  "module": "./dist/index.mjs", // ESM 入口（bundler 专用，非标准）
  "types": "./dist/index.d.ts", // TypeScript 类型入口

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",  // ⚠️ types 必须放第一个！
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.mjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
```

### 7.3 `exports` 字段详解

`exports` 字段是 Node.js 12.11+ 引入的"条件导出"机制，它比 `main` 更强大：

| 功能 | `main` | `exports` |
|------|--------|-----------|
| 多入口 | ❌ 只有一个 | ✅ 任意多个 |
| 条件导出 | ❌ | ✅ import/require/browser/node |
| 封装内部文件 | ❌ 任何路径都可 import | ✅ 只有声明的路径可 import |
| TypeScript types | 需要 `types` 顶层字段 | 可以每个入口单独指定 |

### 7.4 双模式发布策略

如果你发布一个 npm 库，需要同时支持 CJS 和 ESM 消费者：

```
src/                     →  dist/
  index.ts                    index.mjs   (ESM)
  utils.ts                    index.cjs   (CJS)
                              index.d.ts  (类型)
                              utils.mjs
                              utils.cjs
                              utils.d.ts
```

**推荐的构建配置**：

```json
{
  "scripts": {
    "build:esm": "esbuild src/index.ts --format=esm --outfile=dist/index.mjs",
    "build:cjs": "esbuild src/index.ts --format=cjs --outfile=dist/index.cjs",
    "build:types": "tsc --emitDeclarationOnly --declaration --outDir dist",
    "build": "npm run build:esm && npm run build:cjs && npm run build:types"
  }
}
```

### 7.5 `isolatedModules`：单文件编译的安全网

```json
{ "compilerOptions": { "isolatedModules": true } }
```

`esbuild`/`SWC` 等工具是**单文件编译**的——它们一次只看一个文件，不做跨文件分析。这意味着某些 TypeScript 特性（依赖跨文件信息的）在这些工具中不可用：

```typescript
// ❌ const enum 在单文件编译中不可用（需要跨文件内联）
const enum Direction { Up, Down }
console.log(Direction.Up); // tsc 内联为 0，但 esbuild 不会

// ✅ 改用普通 enum 或字面量联合
enum Direction { Up, Down }
// 或
type Direction = 'Up' | 'Down';
```

```typescript
// ❌ export = 和 import = 在 ESM 中不可用
export = myFunction;      // CJS 专用语法
import x = require('x');  // CJS 专用语法

// ✅ 使用标准 ESM 语法
export default myFunction;
import x from 'x';
```

---

## 8. 🧘 Zen of Code：工程化的边界

> 🧘 **Zen of Code：工具是仆人，不是主人**
>
> TypeScript 的工具链配置可以变得异常复杂。`tsconfig.json` 有 100+ 个选项，`package.json` 的 `exports` 字段有 5 种条件键，Project References 需要多层 tsconfig 继承。当你发现自己花了更多时间在**配置工具**上而不是**写业务代码**时，请停下来问自己：
>
> *"我是在解决用户的问题，还是在解决工具的问题？"*
>
> 最好的 TypeScript 工程化配置是**你不需要经常回来修改的配置**。花一天时间做一个坚实的初始设置，然后忘记它。如果你每周都在改 tsconfig，说明你的配置太复杂了。
>
> ```
> 过度配置的信号：
> ✗ tsconfig 文件数量 > 团队成员数量
> ✗ 每次升级依赖都要改构建配置
> ✗ 新成员需要一天来"配环境"
> ✗ 只有一个人懂构建流程
>
> 健康配置的信号：
> ✓ git clone → npm install → npm run dev，三步启动
> ✓ 新成员第一天就能提交代码
> ✓ CI 配置和本地开发配置共享同一个 tsconfig
> ✓ 构建配置有注释解释"为什么"
> ```

---

## 9. 最佳实践与常见陷阱

### ✅ 最佳实践

**1. 永远开启 `strict: true`**

```json
// ✅ 新项目的 tsconfig.json 第一行
{ "compilerOptions": { "strict": true } }
```

**2. 使用 `satisfies` 替代 `as`**

```typescript
// ❌ as 断言 — 丢失类型安全
const config = { port: 3000, host: 'localhost' } as Config;
config.prot; // 不会报错（拼写错误被忽略）

// ✅ satisfies — 保留推断类型 + 类型检查
const config = { port: 3000, host: 'localhost' } satisfies Config;
config.prot; // ❌ 编译错误！
config.port; // number（保留字面量类型推断）
```

**3. 为库提供内建类型**

```json
// package.json
{
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs"
    }
  }
}
```

**4. 使用 `noUncheckedIndexedAccess`**

```typescript
// tsconfig: "noUncheckedIndexedAccess": true
const arr = [1, 2, 3];
const x = arr[0];  // number | undefined（更安全）
if (x !== undefined) {
  console.log(x.toFixed()); // ✅ 类型已收窄
}
```

**5. 品牌类型用于关键 ID**

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function createUserId(raw: string): UserId {
  // 可以在这里添加验证
  return raw as UserId;
}
```

### ❌ 常见陷阱

**1. `any` 的传染性**

```typescript
// ❌ any 像病毒一样传播
function parse(input: any) {
  return input.data.items[0].name; // 整条链都是 any，没有任何保护
}

// ✅ 用 unknown + 类型收窄
function parse(input: unknown) {
  if (typeof input === 'object' && input !== null && 'data' in input) {
    // 安全地逐步收窄
  }
}
```

**2. `skipLibCheck` 的代价**

```json
// skipLibCheck: true — 跳过 node_modules 中 .d.ts 的类型检查
// 优点：编译更快
// 缺点：可能隐藏 @types 版本不匹配的问题
```

**3. 混淆 `paths` 和运行时别名**

```typescript
// tsconfig.json 配了 "@/*": ["src/*"]
import { utils } from '@/utils'; // TS 编译器知道这是 src/utils

// 但运行时（Node.js）不认识 @/ — 你需要：
// - Webpack: resolve.alias
// - Vite: resolve.alias
// - Node.js: --loader 或 tsconfig-paths
```

**4. `const enum` 与 `isolatedModules` 的冲突**

```typescript
// ❌ const enum + isolatedModules = 编译错误
const enum Color { Red, Green, Blue }

// ✅ 替代方案 1：普通 enum
enum Color { Red, Green, Blue }

// ✅ 替代方案 2：对象 + as const
const Color = { Red: 0, Green: 1, Blue: 2 } as const;
type Color = (typeof Color)[keyof typeof Color];
```

---

## 10. 本章总结

| 核心概念 | 关键要点 |
|---------|---------|
| **声明文件 (.d.ts)** | 给无类型的代码"一张嘴"；全局声明 vs 模块声明 vs 资源声明 |
| **模块增强** | `declare module` 扩展第三方库；`declare global` 声明全局变量；`export {}` 别忘 |
| **品牌类型** | `string & { __brand: 'X' }` 实现名义类型；防止语义不同但结构相同的值混用 |
| **协变/逆变** | 返回值协变、参数逆变；`strictFunctionTypes` 是安全保障 |
| **tsconfig** | `strict: true` 永远开启；`paths` 需要配合构建工具；`moduleResolution: bundler` 是新标准 |
| **Project References** | `composite: true` + `references` + `tsc --build` 实现增量编译 |
| **构建工具** | `tsc` 做类型检查，`esbuild`/`SWC` 做转译——分工协作 |
| **模块系统** | ESM 是未来；`exports` 字段是双模式发布的关键；`isolatedModules` 是安全网 |

**下一步**：
- 尝试为一个无类型的 npm 包编写完整的 `.d.ts` 声明文件
- 在一个 Monorepo 中配置 Project References
- 用 `tsc --noEmit` + `esbuild` 搭建一个开发/构建工作流
- 将你的库配置为双模式 (CJS + ESM) 发布

**相关章节**：
- [Stage 2 Ch01：TypeScript 基础](../../stage-2-intermediate/01-typescript-basics/) — tsconfig 基础配置
- [Stage 3 Ch01：TypeScript 高级类型](../01-typescript-advanced/) — 泛型、条件类型是声明文件和高级模式的基础
- [Stage 4 Ch01：微服务](../../stage-4-expert/01-microservices/) — 多包项目的 TS 配置实战

---

## 11. 章节练习

### 练习 1：为无类型库编写声明文件

**难度**：⭐⭐
**涉及知识点**：声明文件、`declare module`、函数重载

**题目描述**：假设有一个无类型的库 `string-utils`，它导出以下函数（纯 JavaScript）：

```javascript
// string-utils (无类型)
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function truncate(str, maxLen, suffix) { /* ... */ }
function repeat(str, times) { /* ... */ }
module.exports = { capitalize, truncate, repeat };
```

**要求**：
1. 创建 `string-utils.d.ts` 声明文件
2. `truncate` 的 `suffix` 参数可选，默认 `'...'`
3. 为 `capitalize` 添加泛型约束，使返回类型保留字面量信息

<details>
<summary>💡 参考答案</summary>

```typescript
declare module 'string-utils' {
  export function capitalize<T extends string>(str: T): Capitalize<T>;
  export function truncate(str: string, maxLen: number, suffix?: string): string;
  export function repeat(str: string, times: number): string;
}
```

</details>

### 练习 2：品牌类型实战

**难度**：⭐⭐
**涉及知识点**：品牌类型、类型守卫、运行时验证

**题目描述**：创建一个类型安全的 ID 系统，包含 `UserId`、`PostId`、`CommentId`，确保它们不可混用。

**要求**：
1. 定义通用的 `Brand<T, B>` 类型
2. 为每种 ID 创建工厂函数（带验证：必须以特定前缀开头）
3. 创建一个类型守卫函数 `isUserId`

```typescript
const userId = createUserId('user_abc123');  // ✅
const postId = createPostId('post_xyz789');  // ✅
getUser(userId);   // ✅
getUser(postId);   // ❌ 编译错误
createUserId('invalid');  // ❌ 运行时错误（没有 user_ 前缀）
```

<details>
<summary>💡 参考答案</summary>

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;
type CommentId = Brand<string, 'CommentId'>;

function createUserId(raw: string): UserId {
  if (!raw.startsWith('user_')) throw new Error('UserId must start with "user_"');
  return raw as UserId;
}

function createPostId(raw: string): PostId {
  if (!raw.startsWith('post_')) throw new Error('PostId must start with "post_"');
  return raw as PostId;
}

function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.startsWith('user_');
}
```

</details>

### 练习 3：tsconfig 诊断

**难度**：⭐⭐⭐
**涉及知识点**：tsconfig 选项理解、编译错误诊断

**题目描述**：以下代码在某些 tsconfig 配置下会报错，在另一些配置下不会。请指出每段代码需要哪个 `strict` 子选项才会报错，并解释为什么。

```typescript
// 片段 A
function greet(name: string, greeting) {
  return `${greeting} ${name}`;
}

// 片段 B
const arr: string[] = [];
const first = arr[0];
console.log(first.toUpperCase());

// 片段 C
class User {
  name: string;
  constructor(public id: number) {}
}

// 片段 D
function handler() {
  console.log(this.value);
}
```

<details>
<summary>💡 参考答案</summary>

- **片段 A**：`noImplicitAny` — `greeting` 参数没有类型注解，隐式为 `any`
- **片段 B**：`noUncheckedIndexedAccess` — `arr[0]` 可能是 `undefined`，但被当作 `string` 使用
- **片段 C**：`strictPropertyInitialization` — `name` 属性未在构造函数中初始化
- **片段 D**：`noImplicitThis` — `this` 的类型为隐式 `any`

</details>

### 练习 4：Project References 配置

**难度**：⭐⭐⭐
**涉及知识点**：Project References、`composite`、增量编译

**题目描述**：你有一个 Monorepo 结构如下，请配置完整的 Project References：

```
my-monorepo/
  packages/
    types/       ← 共享类型定义（被所有包依赖）
    utils/       ← 工具函数（依赖 types）
    api/         ← 后端服务（依赖 types + utils）
    web/         ← 前端应用（依赖 types + utils）
  tsconfig.json  ← 根配置
```

**要求**：
1. 为每个子包创建 `tsconfig.json`
2. 正确设置 `composite`、`references`、`outDir`
3. 根配置聚合所有子项目
4. 写出构建命令（全量编译、增量编译、清理）

<details>
<summary>💡 参考答案</summary>

```json
// packages/types/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

// packages/utils/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [{ "path": "../types" }],
  "include": ["src/**/*"]
}

// packages/api/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../types" },
    { "path": "../utils" }
  ],
  "include": ["src/**/*"]
}

// tsconfig.json (根)
{
  "files": [],
  "references": [
    { "path": "./packages/types" },
    { "path": "./packages/utils" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ]
}
```

构建命令：
```bash
tsc --build                  # 增量编译
tsc --build --force          # 全量编译
tsc --build --clean          # 清理
```

</details>

---

> *"The tools we use have a profound and devious influence on our thinking habits, and therefore on our thinking abilities."*
> — Edsger W. Dijkstra
>
> TypeScript 的工具链不只是"编译器配置"——它塑造了你写代码的方式。当 `strict: true` 时，你被迫思考每个变量的可空性。当 `isolatedModules` 开启时，你被迫放弃 `const enum`。当 `exports` 字段配置正确时，你的库可以同时服务 CJS 和 ESM 的消费者。**掌握工具链，就是掌握在不同约束下做出最优决策的能力。**
