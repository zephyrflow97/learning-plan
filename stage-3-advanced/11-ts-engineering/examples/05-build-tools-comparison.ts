/**
 * @file 05-build-tools-comparison.ts
 * @description 对比 TypeScript 构建工具 (tsc / esbuild / SWC / tsx) 的特性、
 *   速度差异、适用场景，以及 CJS vs ESM 模块系统的运行时差异
 * @prerequisites Stage 2 Ch01 TypeScript 基础, Stage 2 Ch06 Node.js
 * @related examples/04-project-references/
 */

console.log('[INFO] === TypeScript 构建工具与模块系统完整演示 ===\n');

// ============================================================================
// 1. 构建工具速度对比 — 为什么 esbuild/SWC 比 tsc 快 100 倍
// ============================================================================
console.log('[1] 构建工具速度对比\n');

interface BuildTool {
  name: string;
  language: string;
  speedMultiplier: string;
  typeChecking: boolean;
  declarationEmit: boolean;
  useCases: string[];
}

const tools: BuildTool[] = [
  {
    name: 'tsc',
    language: 'TypeScript (JS runtime)',
    speedMultiplier: '1x (基准)',
    typeChecking: true,
    declarationEmit: true,
    useCases: ['类型检查', '生成 .d.ts', 'CI 验证', '库开发'],
  },
  {
    name: 'esbuild',
    language: 'Go (原生编译)',
    speedMultiplier: '~100x',
    typeChecking: false,
    declarationEmit: false,
    useCases: ['应用打包', '开发服务器', 'Vite 的底层引擎'],
  },
  {
    name: 'SWC',
    language: 'Rust (原生编译)',
    speedMultiplier: '~70x',
    typeChecking: false,
    declarationEmit: false,
    useCases: ['Next.js 默认编译器', 'Jest 转译', '框架集成'],
  },
  {
    name: 'tsx',
    language: 'JS (esbuild wrapper)',
    speedMultiplier: '~100x',
    typeChecking: false,
    declarationEmit: false,
    useCases: ['直接运行 .ts 文件', 'ts-node 的现代替代', '脚本执行'],
  },
];

tools.forEach(tool => {
  console.log(`  📦 ${tool.name}`);
  console.log(`     语言: ${tool.language}`);
  console.log(`     速度: ${tool.speedMultiplier}`);
  console.log(`     类型检查: ${tool.typeChecking ? '✅' : '❌'}`);
  console.log(`     生成 .d.ts: ${tool.declarationEmit ? '✅' : '❌'}`);
  console.log(`     适用: ${tool.useCases.join(', ')}`);
  console.log('');
});

// ============================================================================
// 2. 为什么 tsc 慢 — 类型检查的代价
// ============================================================================
console.log('[2] tsc 慢的根因 — 类型检查是 NP-hard 问题\n');

console.log('  tsc 做了 4 件事:');
console.log('    1. 解析 (Parse)       — 将源码转为 AST');
console.log('    2. 类型检查 (Check)   — 验证类型安全 ← 这一步占 90% 时间');
console.log('    3. 转译 (Transpile)   — 剥掉类型，输出 JS');
console.log('    4. 声明 (Emit .d.ts)  — 生成类型声明文件');
console.log('');
console.log('  esbuild/SWC 只做 2 件事:');
console.log('    1. 解析 (Parse)       — 将源码转为 AST');
console.log('    2. 转译 (Transpile)   — 剥掉类型，输出 JS');
console.log('    (跳过类型检查！只是把 TypeScript "当作带类型注解的 JS" 来处理)');
console.log('');

// 演示：类型复杂度对编译时间的影响
type DeepNested<T, Depth extends any[] = []> = Depth['length'] extends 10
  ? T
  : { value: T; child: DeepNested<T, [...Depth, any]> };

// 这种递归类型在 tsc 中可能需要几秒来解析
// 在 esbuild 中直接被剥掉，零开销
type DeepConfig = DeepNested<string>;

console.log('  类型检查为什么是 NP-hard:');
console.log('    - 复杂的泛型嵌套可能导致指数级类型展开');
console.log('    - 需要构建完整的类型依赖图（跨文件分析）');
console.log('    - tsc 是单线程的 JavaScript 程序');
console.log('');

// ============================================================================
// 3. 推荐工作流 — 分工协作
// ============================================================================
console.log('[3] 推荐工作流 — 转译与类型检查分离\n');

const workflows = {
  development: {
    transpile: 'esbuild / SWC / tsx',
    typeCheck: 'IDE (VS Code / Cursor 内置 TS Server)',
    command: 'tsx watch src/index.ts',
  },
  ci: {
    transpile: 'esbuild / SWC',
    typeCheck: 'tsc --noEmit (并行运行)',
    command: 'tsc --noEmit & esbuild src/index.ts --bundle --outdir=dist',
  },
  library: {
    transpile: 'tsc (需要 .d.ts) 或 esbuild + tsc --emitDeclarationOnly',
    typeCheck: 'tsc --noEmit',
    command: 'tsc --emitDeclarationOnly && esbuild src/index.ts --format=esm',
  },
};

Object.entries(workflows).forEach(([env, wf]) => {
  console.log(`  🔧 ${env.toUpperCase()}:`);
  console.log(`     转译: ${wf.transpile}`);
  console.log(`     类型检查: ${wf.typeCheck}`);
  console.log(`     命令: ${wf.command}`);
  console.log('');
});

// ============================================================================
// 4. CJS vs ESM — 运行时差异
// ============================================================================
console.log('[4] CJS vs ESM — 运行时的关键差异\n');

interface ModuleComparison {
  feature: string;
  cjs: string;
  esm: string;
}

const comparisons: ModuleComparison[] = [
  { feature: '语法', cjs: 'require() / module.exports', esm: 'import / export' },
  { feature: '加载时机', cjs: '运行时（动态）', esm: '编译时（静态分析）' },
  { feature: '绑定方式', cjs: '值拷贝', esm: '活绑定 (Live Binding)' },
  { feature: 'this 值', cjs: 'module.exports', esm: 'undefined' },
  { feature: 'Tree Shaking', cjs: '❌ 困难', esm: '✅ 原生支持' },
  { feature: '顶层 await', cjs: '❌ 不支持', esm: '✅ 支持' },
  { feature: '文件扩展名', cjs: '.js / .cjs', esm: '.mjs / .js (type:module)' },
];

console.log('  | 特性 | CJS | ESM |');
console.log('  |------|-----|-----|');
comparisons.forEach(c => {
  console.log(`  | ${c.feature} | ${c.cjs} | ${c.esm} |`);
});
console.log('');

// ============================================================================
// 5. CJS 值拷贝 vs ESM 活绑定演示
// ============================================================================
console.log('[5] 值拷贝 vs 活绑定 — 关键行为差异\n');

// 模拟 CJS 的值拷贝行为
const cjsModule = (() => {
  let count = 0;
  return {
    get count() { return count; },  // 注意：这里用 getter 模拟活绑定
    countSnapshot: count,           // 这是值拷贝
    increment() { count++; },
  };
})();

cjsModule.increment();
cjsModule.increment();

console.log('  CJS 值拷贝行为:');
console.log('    countSnapshot (值拷贝):', cjsModule.countSnapshot, '← 永远是 0');
console.log('    count (getter/活绑定):', cjsModule.count, '← 反映最新值');
console.log('');

console.log('  ESM 活绑定意味着:');
console.log('    导入的变量始终反映导出模块中的最新值');
console.log('    这对于状态管理、热更新 (HMR) 非常重要');
console.log('');

// ============================================================================
// 6. package.json 的 exports 字段
// ============================================================================
console.log('[6] package.json exports — 条件导出配置\n');

const packageJsonExample = {
  name: 'my-lib',
  version: '1.0.0',
  type: 'module',
  main: './dist/index.cjs',
  module: './dist/index.mjs',
  types: './dist/index.d.ts',
  exports: {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.mjs',
      require: './dist/index.cjs',
      default: './dist/index.mjs',
    },
    './utils': {
      types: './dist/utils.d.ts',
      import: './dist/utils.mjs',
      require: './dist/utils.cjs',
    },
  },
};

console.log('  推荐的双模式 package.json:');
console.log(JSON.stringify(packageJsonExample, null, 4).split('\n').map(l => '  ' + l).join('\n'));
console.log('');

console.log('  ⚠️  exports 字段的顺序很重要:');
console.log('    1. "types" 必须放在最前面');
console.log('    2. "import" 用于 ESM 环境');
console.log('    3. "require" 用于 CJS 环境');
console.log('    4. "default" 作为兜底');
console.log('');

// ============================================================================
// 7. isolatedModules — 单文件编译的安全网
// ============================================================================
console.log('[7] isolatedModules — 确保代码兼容单文件编译\n');

// isolatedModules: true 禁止以下 TypeScript 特性
// 因为 esbuild/SWC 无法处理它们

console.log('  ❌ isolatedModules 禁止的写法:');
console.log('');

// 1. const enum (需要跨文件内联)
console.log('  1. const enum — 需要跨文件内联');
console.log('     const enum Color { Red, Green, Blue }');
console.log('     → 替代: enum Color { ... } 或 as const 对象');

// 演示替代方案
const ColorAlt = { Red: 0, Green: 1, Blue: 2 } as const;
type ColorAlt = (typeof ColorAlt)[keyof typeof ColorAlt];
console.log('     as const 替代:', ColorAlt);
console.log('');

// 2. 纯类型的 re-export
console.log('  2. export { SomeType } from "module" — 纯类型 re-export');
console.log('     → 替代: export type { SomeType } from "module"');
console.log('');

// 3. 无导入/导出的文件
console.log('  3. 没有 import/export 的 .ts 文件');
console.log('     → 修复: 添加 export {} 使其成为模块');
console.log('');

// ============================================================================
// 8. 各场景推荐选型速查表
// ============================================================================
console.log('[8] 场景选型速查表\n');

const recommendations = [
  { scenario: 'Node.js 后端开发', tool: 'tsx (开发) + esbuild (构建)' },
  { scenario: '前端 SPA/SSR', tool: 'Vite (esbuild 驱动)' },
  { scenario: 'Next.js 项目', tool: 'SWC (内置，无需配置)' },
  { scenario: 'npm 库开发', tool: 'tsc (声明文件) + esbuild (打包)' },
  { scenario: 'Monorepo', tool: 'turbo + tsc --build + esbuild' },
  { scenario: 'CI 类型检查', tool: 'tsc --noEmit (唯一能做完整检查的)' },
  { scenario: '快速脚本', tool: 'tsx script.ts (零配置直接运行)' },
];

recommendations.forEach(r => {
  console.log(`  ${r.scenario}: ${r.tool}`);
});
console.log('');

console.log('\n[INFO] === 构建工具与模块系统演示结束 ===');
console.log('[INFO] 关键收获:');
console.log('  1. tsc 慢是因为类型检查 — esbuild/SWC 跳过了这一步');
console.log('  2. 推荐分工：esbuild 转译 + tsc --noEmit 类型检查');
console.log('  3. ESM 是未来：活绑定、Tree Shaking、顶层 await');
console.log('  4. 库发布用 exports 字段实现双模式 (CJS + ESM)');
console.log('  5. isolatedModules: true 是使用 esbuild/SWC 的安全网');
