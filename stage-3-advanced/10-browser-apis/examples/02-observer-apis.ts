/**
 * @file 02-observer-apis.ts
 * @description 演示 Observer 三剑客：IntersectionObserver、MutationObserver、ResizeObserver
 * @prerequisites Stage 1 Ch05 DOM 基础, Stage 2 Ch04 异步进阶
 * @related examples/01-web-workers.ts (Observer 回调中的性能考量)
 */

console.log('[INFO] === Observer 三剑客演示 ===\n');

// ============================================================================
// 1. IntersectionObserver — 元素可见性监听
// ============================================================================
console.log('[1] IntersectionObserver — 懒加载与可见性检测');

/**
 * @description 模拟 IntersectionObserver 的核心概念
 * IntersectionObserver 在浏览器 C++ 层异步执行，不阻塞主线程
 */

// 模拟 IntersectionObserver Entry 结构
interface MockIntersectionEntry {
  target: string;           // 被观察的元素标识
  isIntersecting: boolean;  // 是否在视口内
  intersectionRatio: number; // 交叉比例 0.0 ~ 1.0
  boundingClientRect: { top: number; height: number };
  rootBounds: { top: number; height: number }; // 视口边界
}

/**
 * @description 模拟 IntersectionObserver 的回调处理
 * 真实场景中由浏览器引擎自动触发
 */
function simulateIntersectionCallback(entries: MockIntersectionEntry[]): void {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log(`  [VISIBLE] "${entry.target}" 进入视口 (交叉比: ${(entry.intersectionRatio * 100).toFixed(0)}%)`);
    } else {
      console.log(`  [HIDDEN]  "${entry.target}" 离开视口`);
    }
  });
}

// 模拟滚动过程中元素进入/离开视口
console.log('  --- 模拟用户滚动 ---');

simulateIntersectionCallback([
  {
    target: 'img#hero',
    isIntersecting: true,
    intersectionRatio: 1.0,
    boundingClientRect: { top: 100, height: 300 },
    rootBounds: { top: 0, height: 800 }
  }
]);

simulateIntersectionCallback([
  {
    target: 'img#product-1',
    isIntersecting: true,
    intersectionRatio: 0.3,
    boundingClientRect: { top: 650, height: 200 },
    rootBounds: { top: 0, height: 800 }
  }
]);

simulateIntersectionCallback([
  {
    target: 'img#hero',
    isIntersecting: false,
    intersectionRatio: 0,
    boundingClientRect: { top: -300, height: 300 },
    rootBounds: { top: 0, height: 800 }
  }
]);

// 图片懒加载实现模式
console.log('\n  --- 图片懒加载模式 ---');

/**
 * @description 图片懒加载的核心逻辑
 * 使用 data-src 存储真实图片地址，进入视口时替换 src
 */
function createLazyLoadObserver() {
  // 真实代码：
  // const observer = new IntersectionObserver((entries, observer) => {
  //   entries.forEach(entry => {
  //     if (entry.isIntersecting) {
  //       const img = entry.target as HTMLImageElement;
  //       img.src = img.dataset.src!;
  //       img.removeAttribute('data-src');
  //       observer.unobserve(img);
  //     }
  //   });
  // }, {
  //   rootMargin: '200px',  // 提前 200px 开始加载
  //   threshold: 0.1        // 10% 可见时触发
  // });

  const config = {
    rootMargin: '200px',
    threshold: 0.1
  };

  console.log(`  [CONFIG] rootMargin: ${config.rootMargin} (预加载距离)`);
  console.log(`  [CONFIG] threshold: ${config.threshold} (触发阈值)`);

  // 模拟 3 张图片的懒加载
  const images = ['hero.jpg', 'product-1.jpg', 'product-2.jpg'];
  images.forEach((img, i) => {
    const delay = i * 500; // 模拟滚动间隔
    setTimeout(() => {
      console.log(`  [LAZY] 加载图片: ${img}`);
    }, delay);
  });
}

createLazyLoadObserver();
console.log('');

// ============================================================================
// 2. MutationObserver — DOM 变化监听
// ============================================================================
console.log('[2] MutationObserver — DOM 结构与属性变化监听');

/**
 * @description 模拟 MutationObserver 监听 DOM 变化
 * MutationObserver 回调在微任务队列中执行（类似 Promise.then）
 */

// 模拟 MutationRecord 结构
interface MockMutationRecord {
  type: 'childList' | 'attributes' | 'characterData';
  target: string;
  attributeName?: string;
  oldValue?: string;
  addedNodes?: string[];
  removedNodes?: string[];
}

function simulateMutationCallback(mutations: MockMutationRecord[]): void {
  mutations.forEach(mutation => {
    switch (mutation.type) {
      case 'childList':
        if (mutation.addedNodes?.length) {
          console.log(`  [DOM+] ${mutation.target}: 新增子节点 [${mutation.addedNodes.join(', ')}]`);
        }
        if (mutation.removedNodes?.length) {
          console.log(`  [DOM-] ${mutation.target}: 移除子节点 [${mutation.removedNodes.join(', ')}]`);
        }
        break;
      case 'attributes':
        console.log(`  [ATTR] ${mutation.target}: 属性 "${mutation.attributeName}" 变化 (旧值: "${mutation.oldValue}")`);
        break;
      case 'characterData':
        console.log(`  [TEXT] ${mutation.target}: 文本内容变化`);
        break;
    }
  });
}

// 模拟一系列 DOM 变化
console.log('  --- 模拟 DOM 变化序列 ---');

simulateMutationCallback([
  {
    type: 'childList',
    target: '#todo-list',
    addedNodes: ['<li>学习 MutationObserver</li>']
  },
  {
    type: 'attributes',
    target: '#submit-btn',
    attributeName: 'disabled',
    oldValue: null
  },
  {
    type: 'childList',
    target: '#todo-list',
    removedNodes: ['<li>旧任务</li>']
  },
  {
    type: 'characterData',
    target: '#counter',
    oldValue: '3'
  }
]);

// MutationObserver 配置选项详解
console.log('\n  --- MutationObserver 配置选项 ---');

const observerConfig = {
  childList: true,      // 监听子节点增删
  attributes: true,     // 监听属性变化
  characterData: true,  // 监听文本内容变化
  subtree: true,        // 监听所有后代（不仅是直接子节点）
  attributeOldValue: true, // 记录属性的旧值
  characterDataOldValue: true, // 记录文本的旧值
  attributeFilter: ['class', 'style', 'data-*'] // 只监听特定属性
};

Object.entries(observerConfig).forEach(([key, value]) => {
  console.log(`  [OPT] ${key}: ${JSON.stringify(value)}`);
});

/**
 * @description MutationObserver 的防抖模式
 * 避免高频 DOM 变化导致过多回调
 */
function createDebouncedObserver(delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingMutations: MockMutationRecord[] = [];

  return function handleMutations(mutations: MockMutationRecord[]) {
    pendingMutations.push(...mutations);

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`  [DEBOUNCED] 处理 ${pendingMutations.length} 条积压变化`);
      pendingMutations = [];
      timer = null;
    }, delay);
  };
}

const debouncedHandler = createDebouncedObserver(100);
debouncedHandler([{ type: 'childList', target: '#list', addedNodes: ['item1'] }]);
debouncedHandler([{ type: 'childList', target: '#list', addedNodes: ['item2'] }]);
debouncedHandler([{ type: 'childList', target: '#list', addedNodes: ['item3'] }]);
// 100ms 后只输出一次："处理 3 条积压变化"

console.log('');

// ============================================================================
// 3. ResizeObserver — 元素尺寸变化监听
// ============================================================================
console.log('[3] ResizeObserver — 元素尺寸变化');

/**
 * @description 模拟 ResizeObserver 监听元素尺寸变化
 * 与 window.onresize 不同，ResizeObserver 可以监听任意元素
 */
interface MockResizeEntry {
  target: string;
  contentRect: { width: number; height: number };
  borderBoxSize: { inlineSize: number; blockSize: number };
}

function simulateResizeCallback(entries: MockResizeEntry[]): void {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    const aspect = width / height;

    console.log(`  [RESIZE] "${entry.target}": ${width}x${height} (比例: ${aspect.toFixed(2)})`);

    // 响应式布局逻辑
    if (width < 400) {
      console.log(`    → 切换到紧凑布局 (compact)`);
    } else if (width < 800) {
      console.log(`    → 切换到标准布局 (standard)`);
    } else {
      console.log(`    → 切换到宽屏布局 (wide)`);
    }
  }
}

// 模拟容器尺寸变化
console.log('  --- 模拟容器尺寸变化 ---');

simulateResizeCallback([
  { target: '.card-container', contentRect: { width: 1200, height: 600 }, borderBoxSize: { inlineSize: 1220, blockSize: 620 } }
]);

simulateResizeCallback([
  { target: '.card-container', contentRect: { width: 600, height: 400 }, borderBoxSize: { inlineSize: 620, blockSize: 420 } }
]);

simulateResizeCallback([
  { target: '.card-container', contentRect: { width: 350, height: 500 }, borderBoxSize: { inlineSize: 370, blockSize: 520 } }
]);

console.log('');

// ============================================================================
// 4. Observer 三剑客对比总结
// ============================================================================
console.log('[4] Observer 三剑客对比总结');

const comparison = [
  {
    name: 'IntersectionObserver',
    watches: '元素与视口/祖先的交叉',
    timing: '异步，浏览器空闲时',
    useCases: ['懒加载', '无限滚动', '广告曝光', '动画触发'],
    performance: '极高（浏览器原生层计算）'
  },
  {
    name: 'MutationObserver',
    watches: 'DOM 树结构/属性/文本',
    timing: '微任务（microtask）',
    useCases: ['表单自动保存', '第三方脚本检测', '浏览器扩展'],
    performance: '高（替代已废弃的 Mutation Events）'
  },
  {
    name: 'ResizeObserver',
    watches: '元素 content rect 尺寸',
    timing: 'layout 之后、paint 之前',
    useCases: ['响应式组件', '自适应布局', '图表重绘'],
    performance: '高（替代 window.onresize + getBoundingClientRect）'
  }
];

comparison.forEach(obs => {
  console.log(`\n  📌 ${obs.name}`);
  console.log(`     监听: ${obs.watches}`);
  console.log(`     时机: ${obs.timing}`);
  console.log(`     性能: ${obs.performance}`);
  console.log(`     场景: ${obs.useCases.join('、')}`);
});

// ============================================================================
// 5. Observer 的正确清理模式
// ============================================================================
console.log('\n\n[5] Observer 清理 — 避免内存泄漏');

/**
 * @description Observer 生命周期管理
 * 在 React/Vue 中必须在组件卸载时断开 Observer
 */
function demonstrateCleanup() {
  // React 中的 useEffect 模式
  console.log('  React useEffect 模式:');
  console.log('    useEffect(() => {');
  console.log('      const observer = new IntersectionObserver(callback);');
  console.log('      observer.observe(ref.current);');
  console.log('      return () => observer.disconnect();  // cleanup!');
  console.log('    }, []);');

  // Vue 中的 onUnmounted 模式
  console.log('\n  Vue onUnmounted 模式:');
  console.log('    onMounted(() => {');
  console.log('      observer.observe(el.value);');
  console.log('    });');
  console.log('    onUnmounted(() => {');
  console.log('      observer.disconnect();');
  console.log('    });');

  // 通用清理工具
  console.log('\n  通用 cleanup 注册器:');

  const cleanups: Array<() => void> = [];

  function registerObserver(name: string) {
    console.log(`    [注册] ${name}`);
    cleanups.push(() => {
      console.log(`    [清理] ${name}.disconnect()`);
    });
  }

  registerObserver('IntersectionObserver');
  registerObserver('MutationObserver');
  registerObserver('ResizeObserver');

  // 模拟组件卸载 → 清理所有 Observer
  console.log('\n    --- 组件卸载 ---');
  cleanups.forEach(fn => fn());
}

demonstrateCleanup();

console.log('\n[INFO] === Observer 三剑客演示结束 ===');
