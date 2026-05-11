/**
 * @file 02-module-augmentation.ts
 * @description 演示 TypeScript 的模块增强 (Module Augmentation)、declare global、
 *   declare module、declare namespace 等声明文件编写技术
 * @prerequisites Stage 2 Ch01 TypeScript 基础, examples/01-declaration-files.ts
 * @related examples/03-advanced-type-patterns.ts
 */

console.log('[INFO] === 模块增强 (Module Augmentation) 完整演示 ===\n');

// ============================================================================
// 1. declare global — 扩展全局作用域
// ============================================================================
console.log('[1] declare global — 扩展全局作用域\n');

// 使用 declare global 可以在模块文件中扩展全局类型
// 注意：文件必须有 import/export 才能使用 declare global

export {}; // 使本文件成为 ES Module（必须！）

declare global {
  interface Window {
    __APP_CONFIG__: {
      apiUrl: string;
      version: string;
      features: string[];
    };
  }

  // 扩展全局 Array 接口
  interface Array<T> {
    /** 获取数组的最后一个元素 */
    last(): T | undefined;
    /** 判断数组是否为空 */
    isEmpty(): boolean;
  }

  // 声明全局变量
  var __DEBUG_MODE__: boolean;
}

// 实现 Array 扩展方法
Array.prototype.last = function <T>(this: T[]): T | undefined {
  return this[this.length - 1];
};

Array.prototype.isEmpty = function (): boolean {
  return this.length === 0;
};

// 设置全局变量
(globalThis as any).__DEBUG_MODE__ = true;

// 测试全局扩展
const nums = [1, 2, 3, 4, 5];
console.log('  [1, 2, 3, 4, 5].last():', nums.last());
console.log('  [].isEmpty():', [].isEmpty());
console.log('  [1].isEmpty():', [1].isEmpty());
console.log('');

// ============================================================================
// 2. 接口合并 (Declaration Merging) — TypeScript 的独特能力
// ============================================================================
console.log('[2] 接口合并 — 同名 interface 自动合并\n');

// TypeScript 的 interface 有一个独特的能力：同名 interface 会自动合并
// 这是 Module Augmentation 的基础

interface Config {
  appName: string;
  port: number;
}

// 同一文件中的同名 interface 自动合并
interface Config {
  debug?: boolean;
  logLevel?: 'info' | 'warn' | 'error';
}

// 合并后的 Config 包含所有字段
const config: Config = {
  appName: 'MyApp',
  port: 3000,
  debug: true,
  logLevel: 'info',
};

console.log('  合并后的 Config:', config);
console.log('  appName:', config.appName);
console.log('  debug:', config.debug);
console.log('  logLevel:', config.logLevel);
console.log('');

// 注意：type alias 不能合并！
// type Foo = { a: string };
// type Foo = { b: number }; // ❌ 错误：Duplicate identifier 'Foo'

console.log('  ⚠️  注意: type alias 不能合并，只有 interface 可以');
console.log('  这就是为什么库的公共 API 推荐使用 interface');
console.log('');

// ============================================================================
// 3. 模拟 Express 的 Module Augmentation
// ============================================================================
console.log('[3] 实战：模拟 Express Request 的类型扩展\n');

// 在 Express 项目中，中间件经常向 Request 对象添加自定义属性
// 例如：认证中间件添加 req.user，日志中间件添加 req.requestId

// 模拟 Express 的基础类型
interface Request {
  url: string;
  method: string;
  headers: Record<string, string>;
}

// 模拟认证中间件的类型扩展
// 在实际项目中，这会写在一个单独的 .d.ts 文件里：
// declare module 'express' {
//   interface Request {
//     user?: { id: string; role: 'admin' | 'user' };
//     requestId: string;
//   }
// }

// 因为 interface 可以合并，我们直接扩展
interface Request {
  user?: { id: string; role: 'admin' | 'user' };
  requestId: string;
}

// 模拟一个请求对象
const req: Request = {
  url: '/api/users',
  method: 'GET',
  headers: { 'content-type': 'application/json' },
  requestId: 'req-abc-123',
  user: { id: 'u-001', role: 'admin' },
};

console.log('  req.url:', req.url);
console.log('  req.requestId:', req.requestId);
console.log('  req.user:', req.user);
console.log('  req.user?.role:', req.user?.role);
console.log('');

// ============================================================================
// 4. declare namespace — 命名空间声明
// ============================================================================
console.log('[4] declare namespace — 组织复杂的全局类型\n');

// declare namespace 用于声明全局命名空间中的类型
// 最常见的用例：扩展 NodeJS 的 ProcessEnv

// declare namespace NodeJS {
//   interface ProcessEnv {
//     NODE_ENV: 'development' | 'production' | 'test';
//     DATABASE_URL: string;
//     API_KEY: string;
//     PORT?: string;
//   }
// }

// 模拟一个命名空间声明
namespace AppTypes {
  export interface User {
    id: string;
    name: string;
    email: string;
  }

  export interface Post {
    id: string;
    title: string;
    authorId: string;
  }

  export type Role = 'admin' | 'editor' | 'viewer';
}

const user: AppTypes.User = { id: '1', name: 'Alice', email: 'alice@example.com' };
const role: AppTypes.Role = 'editor';

console.log('  AppTypes.User:', user);
console.log('  AppTypes.Role:', role);
console.log('');

// ============================================================================
// 5. 枚举合并与命名空间合并
// ============================================================================
console.log('[5] 枚举与命名空间的合并 — 向枚举添加静态方法\n');

// enum 可以和 namespace 合并，为枚举添加静态方法
enum Color {
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE',
}

// 用 namespace 给 Color 枚举添加工具方法
namespace Color {
  export function fromHex(hex: string): Color | undefined {
    const map: Record<string, Color> = {
      '#FF0000': Color.Red,
      '#00FF00': Color.Green,
      '#0000FF': Color.Blue,
    };
    return map[hex.toUpperCase()];
  }

  export function toHex(color: Color): string {
    const map: Record<Color, string> = {
      [Color.Red]: '#FF0000',
      [Color.Green]: '#00FF00',
      [Color.Blue]: '#0000FF',
    };
    return map[color];
  }
}

console.log('  Color.Red:', Color.Red);
console.log('  Color.toHex(Color.Red):', Color.toHex(Color.Red));
console.log('  Color.fromHex("#00FF00"):', Color.fromHex('#00FF00'));
console.log('');

// ============================================================================
// 6. 函数与命名空间合并 — 给函数添加属性
// ============================================================================
console.log('[6] 函数与命名空间合并 — 给函数添加静态属性\n');

// 函数也可以和命名空间合并（常见于 jQuery 风格的 API）

function validator(value: unknown): boolean {
  return value !== null && value !== undefined;
}

namespace validator {
  export function isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  export function isEmail(value: unknown): boolean {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  export const VERSION = '1.0.0';
}

console.log('  validator(null):', validator(null));
console.log('  validator("hello"):', validator('hello'));
console.log('  validator.isString("hello"):', validator.isString('hello'));
console.log('  validator.isNumber(42):', validator.isNumber(42));
console.log('  validator.isEmail("a@b.com"):', validator.isEmail('a@b.com'));
console.log('  validator.VERSION:', validator.VERSION);
console.log('');

// ============================================================================
// 7. export = 与 import = 的声明 (CJS 兼容)
// ============================================================================
console.log('[7] CJS 风格导出的声明文件写法\n');

// 当第三方库使用 module.exports = xxx 时，声明文件需要用 export =
//
// declare module 'cjs-lib' {
//   function cjsLib(input: string): number;
//
//   namespace cjsLib {
//     interface Options { verbose?: boolean; }
//     function configure(opts: Options): void;
//   }
//
//   export = cjsLib;  // CJS 风格的默认导出
// }
//
// 使用时：
// import cjsLib = require('cjs-lib');  // CJS 导入
// 或（开启 esModuleInterop 后）：
// import cjsLib from 'cjs-lib';       // ESM 风格导入

console.log('  CJS 导出: module.exports = fn');
console.log('  声明写法: export = fn');
console.log('  导入写法: import fn = require("lib") 或 import fn from "lib"');
console.log('  需要: esModuleInterop: true（推荐开启）');
console.log('');

// ============================================================================
// 8. 最佳实践总结
// ============================================================================
console.log('[8] 模块增强最佳实践总结\n');

const bestPractices = [
  '1. 使用 interface (而非 type) 定义公共 API — interface 可以被消费者增强',
  '2. declare global 的文件必须有 export {} — 否则 declare global 不生效',
  '3. 模块增强只能添加新成员，不能修改已有成员的类型',
  '4. 将所有自定义声明文件放在 types/ 目录，并在 tsconfig include 中引用',
  '5. @types 的版本应与库的主版本一致 — 例如 express@4 → @types/express@4',
  '6. 优先检查库是否已内建类型 → 再检查 @types → 最后才自己写',
];

bestPractices.forEach(tip => console.log(`  ${tip}`));

console.log('\n[INFO] === 模块增强演示结束 ===');
