/**
 * @file 01-declaration-files.ts
 * @description 演示 TypeScript 声明文件 (.d.ts) 的各种形式：全局声明、模块声明、
 *   资源模块声明、以及如何为无类型的第三方库编写类型定义
 * @prerequisites Stage 2 Ch01 TypeScript 基础, Stage 3 Ch01 TypeScript 高级类型
 * @related examples/02-module-augmentation.ts
 */

console.log('[INFO] === TypeScript 声明文件 (.d.ts) 完整演示 ===\n');

// ============================================================================
// 1. 理解声明文件的本质 — 类型信息 vs 运行时代码
// ============================================================================
console.log('[1] 声明文件的本质 — 只有类型，没有实现\n');

// 声明文件（.d.ts）中只包含类型信息，不包含任何运行时逻辑
// 以下是"模拟"声明文件中的写法（实际应写在 .d.ts 文件中）

// 想象这是一个纯 JS 库：legacy-math-lib
// 它没有 TypeScript 类型定义

// ---- 在 .d.ts 文件中你会写: ----
// declare function add(a: number, b: number): number;
// declare function multiply(a: number, b: number): number;
// declare const PI: number;

// ---- 在 .ts 文件中你可以这样模拟: ----
function add(a: number, b: number): number { return a + b; }
function multiply(a: number, b: number): number { return a * b; }
const PI = 3.14159;

console.log('  add(2, 3) =', add(2, 3));
console.log('  multiply(4, 5) =', multiply(4, 5));
console.log('  PI =', PI);
console.log('');

// ============================================================================
// 2. 全局声明 (Ambient Declaration) — 声明运行时已存在的全局变量
// ============================================================================
console.log('[2] 全局声明 — 为运行时注入的变量提供类型\n');

// 在实际项目中，HTML 中可能通过 <script> 标签注入了全局变量
// 你需要在 .d.ts 文件中声明它们

// 模拟：假设运行时环境已注入以下全局变量
const __APP_VERSION__ = '1.0.0';
const __BUILD_TIME__ = '2026-02-08T10:00:00Z';
const __IS_PRODUCTION__ = false;

// 在 global.d.ts 中你会写：
// declare const __APP_VERSION__: string;
// declare const __BUILD_TIME__: string;
// declare const __IS_PRODUCTION__: boolean;

console.log('  __APP_VERSION__:', __APP_VERSION__);
console.log('  __BUILD_TIME__:', __BUILD_TIME__);
console.log('  __IS_PRODUCTION__:', __IS_PRODUCTION__);
console.log('');

// ============================================================================
// 3. 模块声明 — 为第三方无类型库提供类型
// ============================================================================
console.log('[3] 模块声明 — 为第三方无类型库编写 .d.ts\n');

// 假设有一个无类型的 npm 包 'string-utils'
// 你需要创建 types/string-utils.d.ts：
//
// declare module 'string-utils' {
//   export function capitalize(str: string): string;
//   export function truncate(str: string, maxLen: number, suffix?: string): string;
//   export function slugify(str: string): string;
//   export function camelCase(str: string): string;
//
//   export interface StringUtilsOptions {
//     locale?: string;
//     preserveWhitespace?: boolean;
//   }
// }

// 在这里我们直接实现这些函数来演示类型的效果
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str: string, maxLen: number, suffix: string = '...'): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - suffix.length) + suffix;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

console.log('  capitalize("hello"):', capitalize('hello'));
console.log('  truncate("Hello World", 8):', truncate('Hello World', 8));
console.log('  slugify("Hello World!"):', slugify('Hello World!'));
console.log('');

// ============================================================================
// 4. 资源模块声明 — 让 TypeScript 理解非 JS 导入
// ============================================================================
console.log('[4] 资源模块声明 — .css、.svg、.json 等文件的类型\n');

// 在前端项目中，你会用 bundler 导入 CSS、图片等文件
// TypeScript 默认不认识这些"模块"，需要声明文件告诉它

// types/assets.d.ts 中你会写：
// declare module '*.css' {
//   const classes: { readonly [key: string]: string };
//   export default classes;
// }
//
// declare module '*.svg' {
//   const src: string;
//   export default src;
// }
//
// declare module '*.png' {
//   const src: string;
//   export default src;
// }
//
// declare module '*.json' {
//   const value: unknown;
//   export default value;
// }

// 模拟导入效果
const cssModule = { container: 'styles_container_x1a2b', title: 'styles_title_c3d4e' };
const svgPath = '/assets/logo.svg';

console.log('  CSS Module classes:', cssModule);
console.log('  SVG import path:', svgPath);
console.log('');

// ============================================================================
// 5. 函数重载在声明文件中的应用
// ============================================================================
console.log('[5] 函数重载 — 精确描述多态 API\n');

// 声明文件中常见的模式：一个函数根据输入类型返回不同的输出类型
// declare module 'parser' {
//   export function parse(input: string): Document;
//   export function parse(input: Buffer): Document;
//   export function parse(input: string, options: { stream: true }): ReadableStream;
// }

// 演示函数重载的类型安全性
function parseValue(input: string): number;
function parseValue(input: number): string;
function parseValue(input: string | number): number | string {
  if (typeof input === 'string') return parseInt(input, 10);
  return String(input);
}

const numResult = parseValue('42');       // 类型推断为 number
const strResult = parseValue(42);         // 类型推断为 string

console.log('  parseValue("42"):', numResult, '(type: number)');
console.log('  parseValue(42):', strResult, '(type: string)');
console.log('');

// ============================================================================
// 6. 类型查找优先级
// ============================================================================
console.log('[6] 类型查找优先级链\n');

const typeLookupOrder = [
  '1. 包自身的 types/typings 字段 (package.json)',
  '2. 包内的 index.d.ts',
  '3. node_modules/@types/xxx',
  '4. tsconfig.json 的 typeRoots 配置',
  '5. 项目中的自定义 .d.ts 文件',
];

typeLookupOrder.forEach(step => console.log(`  ${step}`));
console.log('');

// ============================================================================
// 7. 声明文件的三种文件组织方式
// ============================================================================
console.log('[7] 声明文件的三种组织方式\n');

console.log('  方式 A: 内联在库中 (推荐)');
console.log('    package.json: { "types": "./dist/index.d.ts" }');
console.log('    优点: 类型与库版本同步，无需额外安装');
console.log('');

console.log('  方式 B: DefinitelyTyped (@types/xxx)');
console.log('    npm i -D @types/lodash');
console.log('    优点: 社区维护，覆盖广');
console.log('    缺点: 版本可能与库不同步');
console.log('');

console.log('  方式 C: 项目内自定义 .d.ts');
console.log('    创建 types/ 目录，添加到 tsconfig 的 include');
console.log('    优点: 完全自主控制');
console.log('    缺点: 维护成本由你承担');
console.log('');

// ============================================================================
// 8. 实战：为一个复杂的无类型库编写声明文件
// ============================================================================
console.log('[8] 实战：为复杂无类型库编写完整声明文件\n');

// 假设有一个无类型的 HTTP 客户端库 'simple-http'
// 我们来模拟编写它的声明文件

// 声明文件内容（实际写在 .d.ts 中）:
// declare module 'simple-http' {
//   export interface RequestConfig {
//     url: string;
//     method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
//     headers?: Record<string, string>;
//     body?: unknown;
//     timeout?: number;
//   }
//
//   export interface Response<T = unknown> {
//     status: number;
//     data: T;
//     headers: Record<string, string>;
//   }
//
//   export function request<T = unknown>(config: RequestConfig): Promise<Response<T>>;
//   export function get<T = unknown>(url: string): Promise<Response<T>>;
//   export function post<T = unknown>(url: string, body: unknown): Promise<Response<T>>;
//
//   export class HttpError extends Error {
//     status: number;
//     response: Response;
//     constructor(message: string, status: number, response: Response);
//   }
//
//   export default request;
// }

// 模拟实现来验证类型
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

interface HttpResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

// 模拟请求
function mockRequest<T = unknown>(config: RequestConfig): HttpResponse<T> {
  console.log(`  [TRACE] ${config.method || 'GET'} ${config.url}`);
  return {
    status: 200,
    data: { message: 'OK' } as T,
    headers: { 'content-type': 'application/json' }
  };
}

interface User {
  id: number;
  name: string;
}

const response = mockRequest<User>({
  url: '/api/users/1',
  method: 'GET',
  timeout: 5000
});

console.log('  Response status:', response.status);
console.log('  Response data:', response.data);
console.log('  Response data is typed as User (id, name)');
console.log('');

console.log('\n[INFO] === 声明文件演示结束 ===');
console.log('[INFO] 关键收获:');
console.log('  1. .d.ts 只有类型，没有运行时代码');
console.log('  2. 全局声明用 declare const/function/class');
console.log('  3. 模块声明用 declare module "xxx" { ... }');
console.log('  4. 资源模块声明用 declare module "*.ext" { ... }');
console.log('  5. @types 是社区维护的"类型桥梁"');
