/**
 * @file 05-module-ecosystem.ts
 * @description 演示 JS 模块化生态：CJS vs ESM 差异、动态 import、Tree Shaking、package.json 配置
 * @prerequisites Stage 2 Ch02 ES6 基础, Stage 2 Ch03 Node.js 基础
 * @related Stage 3 Ch11 TS 工程化进阶 (构建工具与模块系统)
 */

console.log('[INFO] === 模块化生态演示 ===\n');

// ============================================================================
// 1. CommonJS vs ESM — 核心差异
// ============================================================================
console.log('[1] CommonJS vs ESM — 两个世界的碰撞');

/**
 * @description CJS 和 ESM 的本质区别不是语法，而是解析时机：
 * CJS = 运行时加载 → 动态、无法静态分析
 * ESM = 编译时解析 → 静态、支持 Tree Shaking
 */
function demoCjsVsEsm() {
  // CJS 行为模拟
  console.log('  === CommonJS 行为 ===');

  // CJS 返回值的拷贝
  let cjsCounter = 0;
  const cjsModule = {
    get counter() { return cjsCounter; },
    increment() { cjsCounter++; }
  };

  // 模拟 require() — 获得值的拷贝
  const cjsCopy = cjsModule.counter; // 拷贝当前值
  cjsModule.increment();
  console.log(`  [CJS] 导出时 counter: 0`);
  console.log(`  [CJS] increment() 后:`);
  console.log(`    模块内 counter: ${cjsModule.counter}`);  // 1
  console.log(`    require 的拷贝: ${cjsCopy}`);             // 0 ← 不会更新！

  console.log('');

  // ESM 行为模拟
  console.log('  === ESM 行为 (Live Binding) ===');

  // ESM 导出的是引用绑定
  const esmState = { counter: 0 };
  const esmModule = {
    // ESM 的 export 是 live binding — 始终返回最新值
    get counter() { return esmState.counter; },
    increment() { esmState.counter++; }
  };

  console.log(`  [ESM] 导出时 counter: ${esmModule.counter}`);
  esmModule.increment();
  console.log(`  [ESM] increment() 后:`);
  console.log(`    import 的绑定: ${esmModule.counter}`);  // 1 ← 实时更新！

  console.log('\n  关键区别总结:');
  console.log('    CJS: require() 返回值的快照（拷贝）');
  console.log('    ESM: import 建立值的绑定（引用）');
  console.log('    → ESM 的 live binding 是循环依赖能正常工作的关键');
}

demoCjsVsEsm();
console.log('');

// ============================================================================
// 2. 动态 import() — 按需加载
// ============================================================================
console.log('[2] 动态 import() — 代码的按需快递');

/**
 * @description 动态 import() 返回 Promise<Module>
 * 是唯一能在运行时按需加载 ESM 模块的方式
 */
async function demoDynamicImport() {
  // 2.1 路由级代码分割
  console.log('  --- 路由级代码分割 ---');

  type RouteModule = { default: () => string };

  const routeLoaders: Record<string, () => Promise<RouteModule>> = {
    '/dashboard': async () => ({ default: () => 'Dashboard Page' }),
    '/settings':  async () => ({ default: () => 'Settings Page' }),
    '/admin':     async () => ({ default: () => 'Admin Panel' }),
  };

  async function navigate(path: string) {
    const loader = routeLoaders[path];
    if (!loader) {
      console.log(`  [ROUTER] 404: ${path}`);
      return;
    }

    console.log(`  [ROUTER] 导航到 ${path} → 开始加载模块...`);
    const start = performance.now();

    const module = await loader();
    const elapsed = (performance.now() - start).toFixed(2);

    console.log(`  [ROUTER] 模块加载完成 (${elapsed}ms)`);
    console.log(`  [ROUTER] 渲染: ${module.default()}`);
  }

  await navigate('/dashboard');
  await navigate('/settings');
  await navigate('/nonexistent');

  // 2.2 条件导入
  console.log('\n  --- 条件导入 ---');

  const isAdmin = true;
  console.log(`  [CONDITION] isAdmin: ${isAdmin}`);

  if (isAdmin) {
    // 只有管理员才加载管理模块
    // const { AdminPanel } = await import('./admin-panel');
    console.log('  [CONDITION] ✅ 加载管理模块');
  } else {
    console.log('  [CONDITION] ⏭️ 跳过管理模块（非管理员）');
  }

  // 2.3 错误处理
  console.log('\n  --- import() 错误处理 ---');
  console.log('  try {');
  console.log('    const mod = await import("./optional-feature");');
  console.log('  } catch (e) {');
  console.log('    console.warn("功能模块不可用，使用降级方案");');
  console.log('    // graceful degradation');
  console.log('  }');
}

await demoDynamicImport();
console.log('');

// ============================================================================
// 3. Tree Shaking — 摇掉未使用的代码
// ============================================================================
console.log('[3] Tree Shaking — 原理与陷阱');

/**
 * @description Tree Shaking 依赖 ESM 的静态分析能力
 * 构建工具标记未引用的导出，压缩工具删除它们
 */
function demoTreeShaking() {
  // 模拟一个 utils 模块
  const utilsModule = {
    add: '(a, b) => a + b',
    multiply: '(a, b) => a * b',
    divide: '(a, b) => a / b',
    subtract: '(a, b) => a - b',
    power: '(a, b) => Math.pow(a, b)',
  };

  // 只导入 add
  const usedExports = new Set(['add']);

  console.log('  utils.ts 导出了 5 个函数:');
  Object.keys(utilsModule).forEach(name => {
    const used = usedExports.has(name);
    const icon = used ? '✅ 保留' : '🗑️ 摇掉';
    console.log(`    ${icon} export function ${name}${(utilsModule as Record<string, string>)[name]}`);
  });

  const originalSize = Object.keys(utilsModule).length;
  const shakenSize = usedExports.size;
  const reduction = ((1 - shakenSize / originalSize) * 100).toFixed(0);
  console.log(`\n  Tree Shaking 效果: ${originalSize} → ${shakenSize} 函数 (减少 ${reduction}%)`);

  // Tree Shaking 失败案例
  console.log('\n  --- Tree Shaking 失败的场景 ---');

  const failures = [
    {
      pattern: 'import * as utils from "./utils"',
      reason: '命名空间导入 — 构建工具不确定哪些被使用',
      fix: 'import { add } from "./utils"  // 具名导入'
    },
    {
      pattern: 'const fn = utils[dynamicKey]',
      reason: '动态属性访问 — 静态分析无法确定 key',
      fix: '避免动态访问，使用 if/switch 选择'
    },
    {
      pattern: 'import "./polyfill"',
      reason: '副作用导入 — 整个模块都会保留',
      fix: '在 package.json 中标记 "sideEffects: false"'
    },
    {
      pattern: 'export * from "./internal"',
      reason: 'Barrel re-export — 可能拉入整个子模块',
      fix: '避免 barrel files，或确保子模块也是 ESM'
    }
  ];

  failures.forEach((f, i) => {
    console.log(`\n  [失败 ${i + 1}] ${f.pattern}`);
    console.log(`    原因: ${f.reason}`);
    console.log(`    修复: ${f.fix}`);
  });
}

demoTreeShaking();
console.log('');

// ============================================================================
// 4. package.json 模块化字段详解
// ============================================================================
console.log('[4] package.json — 模块化配置字段');

/**
 * @description 现代 npm 包需要配置多个入口点
 * 支持 CJS 和 ESM 的双模发布 (Dual Package)
 */
function demoPackageJson() {
  const packageConfig = {
    name: 'my-awesome-lib',
    version: '2.0.0',
    type: 'module',
    main: './dist/cjs/index.cjs',
    module: './dist/esm/index.mjs',
    types: './dist/types/index.d.ts',
    exports: {
      '.': {
        types: './dist/types/index.d.ts',
        import: './dist/esm/index.mjs',
        require: './dist/cjs/index.cjs',
      },
      './utils': {
        types: './dist/types/utils.d.ts',
        import: './dist/esm/utils.mjs',
        require: './dist/cjs/utils.cjs',
      }
    },
    sideEffects: false,
    files: ['dist/'],
  };

  console.log('  package.json 关键字段解析:');
  console.log('');

  const fields = [
    { key: 'type', value: '"module"', desc: '声明包默认使用 ESM（.js 文件按 ESM 解析）' },
    { key: 'main', value: '"./dist/cjs/..."', desc: 'CJS 入口 — 兼容旧版 Node.js / require()' },
    { key: 'module', value: '"./dist/esm/..."', desc: 'ESM 入口 — 构建工具 (webpack/rollup) 优先使用' },
    { key: 'types', value: '"./dist/types/..."', desc: 'TypeScript 声明文件入口' },
    { key: 'exports', value: '{...}', desc: '条件导出 — Node.js 12.11+ 官方入口点映射' },
    { key: 'sideEffects', value: 'false', desc: '告诉构建工具本包无副作用，可安全 Tree Shake' },
  ];

  fields.forEach(f => {
    console.log(`  📦 ${f.key}: ${f.value}`);
    console.log(`     ${f.desc}`);
    console.log('');
  });

  // exports 字段的优先级
  console.log('  exports 条件解析优先级:');
  console.log('    1. "types"   → TypeScript 编译器');
  console.log('    2. "import"  → ESM 环境 (import 语句 / import())');
  console.log('    3. "require" → CJS 环境 (require() 调用)');
  console.log('    4. "default" → 兜底');
  console.log('');

  // .mjs vs .cjs vs .js
  console.log('  文件扩展名规则:');
  console.log('    .mjs → 始终按 ESM 解析（无论 "type" 设置）');
  console.log('    .cjs → 始终按 CJS 解析（无论 "type" 设置）');
  console.log('    .js  → 取决于最近的 package.json 的 "type" 字段');
  console.log('           "type": "module" → ESM');
  console.log('           "type": "commonjs" 或无 → CJS');
}

demoPackageJson();
console.log('');

// ============================================================================
// 5. 模块化最佳实践
// ============================================================================
console.log('[5] 模块化最佳实践');

/**
 * @description 现代 JS/TS 项目的模块化建议
 */
function demoBestPractices() {
  const practices = [
    {
      title: '优先使用 ESM',
      good: 'import { useState } from "react"',
      bad: 'const { useState } = require("react")',
      reason: 'ESM 支持 Tree Shaking、顶层 await、静态分析'
    },
    {
      title: '具名导出优于默认导出',
      good: 'export function createApp() { }',
      bad: 'export default function() { }',
      reason: '具名导出有利于 Tree Shaking 和 IDE 自动导入'
    },
    {
      title: '避免深层 barrel re-exports',
      good: 'import { Button } from "@/components/Button"',
      bad: 'import { Button } from "@/components"  // index.ts re-exports all',
      reason: 'barrel files 会拉入所有子模块，抵消 Tree Shaking'
    },
    {
      title: '大型依赖使用动态 import',
      good: 'const { Chart } = await import("chart.js")',
      bad: 'import { Chart } from "chart.js"  // 150KB 在首屏加载',
      reason: '减少初始 bundle 大小，改善首屏加载速度'
    },
    {
      title: '标记 sideEffects',
      good: '"sideEffects": false  或  "sideEffects": ["*.css"]',
      bad: '不设置 sideEffects（构建工具保守保留所有模块）',
      reason: '让构建工具安全地移除未使用的模块'
    }
  ];

  practices.forEach((p, i) => {
    console.log(`  [${i + 1}] ${p.title}`);
    console.log(`     ✅ ${p.good}`);
    console.log(`     ❌ ${p.bad}`);
    console.log(`     💡 ${p.reason}`);
    console.log('');
  });
}

demoBestPractices();

// ============================================================================
// 6. CJS ↔ ESM 互操作陷阱
// ============================================================================
console.log('[6] CJS ↔ ESM 互操作陷阱');

function demoInteropIssues() {
  const issues = [
    {
      scenario: 'ESM 中 require() CJS 模块',
      problem: 'ESM 文件中不能使用 require()',
      solution: '用 createRequire() 或改用 import'
    },
    {
      scenario: 'CJS 中 import ESM 模块',
      problem: 'require() 不能加载 ESM 模块',
      solution: '使用 await import()（异步导入）'
    },
    {
      scenario: 'default export 的解构差异',
      problem: 'CJS: module.exports = fn → ESM import 时需要 .default',
      solution: '使用 esModuleInterop: true (tsconfig) 自动处理'
    },
    {
      scenario: '__dirname 在 ESM 中不存在',
      problem: 'ESM 没有 __dirname、__filename、require 等 CJS 全局变量',
      solution: 'import.meta.url + fileURLToPath() 获取路径'
    }
  ];

  issues.forEach((issue, i) => {
    console.log(`  [${i + 1}] ${issue.scenario}`);
    console.log(`     问题: ${issue.problem}`);
    console.log(`     方案: ${issue.solution}`);
    console.log('');
  });

  // __dirname 替代方案
  console.log('  ESM 中获取 __dirname:');
  console.log('    import { fileURLToPath } from "url";');
  console.log('    import { dirname } from "path";');
  console.log('    const __filename = fileURLToPath(import.meta.url);');
  console.log('    const __dirname = dirname(__filename);');
}

demoInteropIssues();

console.log('\n[INFO] === 模块化生态演示结束 ===');
