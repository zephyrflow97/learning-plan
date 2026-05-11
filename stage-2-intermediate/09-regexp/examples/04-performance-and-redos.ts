/**
 * @file 04-performance-and-redos.ts
 * @description 演示正则性能问题 — 回溯灾难、ReDoS 攻击原理、安全正则实践
 * @prerequisites Stage 2 Ch09 基础语法 (01-regexp-basics.ts)
 * @related Stage 2 Ch08 错误处理 (安全编程的一部分)
 */

console.log('=== 正则性能与安全 (ReDoS) ===\n');

// ============================================
// 1. 正常回溯 vs 灾难回溯
// ============================================
console.log('[INFO] 1. 正常回溯 vs 灾难回溯\n');

// 安全正则: 线性回溯 O(n)
const safeRe = /^a+$/;
const safeInput = 'a'.repeat(30) + 'b';

let start = performance.now();
safeRe.test(safeInput);
let elapsed = performance.now() - start;
console.log(`[TRACE] 安全正则 /^a+$/ 对 "a×30+b": ${elapsed.toFixed(3)}ms`);

// 危险正则: 指数级回溯 O(2^n)
// ⚠️ 警告: 以下演示使用较短输入以避免卡死
const dangerRe = /^(a+)+$/;
const shortDangerInput = 'a'.repeat(22) + 'b'; // 22 个 a + b

start = performance.now();
dangerRe.test(shortDangerInput);
elapsed = performance.now() - start;
console.log(`[TRACE] 危险正则 /^(a+)+$/ 对 "a×22+b": ${elapsed.toFixed(3)}ms`);

console.log('[VERIFY] 两个正则匹配相同含义（一个或多个a），但危险版本慢数个数量级');
console.log('[VERIFY] 原因: (a+)+ 嵌套量词导致每个 a 有"属于内层还是外层"两种选择');
console.log();

// ============================================
// 2. 回溯原理图解
// ============================================
console.log('[INFO] 2. 回溯原理图解\n');

console.log('[TRACE] 正则 /^(a+)+$/ 匹配 "aaab" 的回溯过程:');
console.log('[TRACE] ┌─ 尝试1: (aaa) — $ 期望结束但遇到 b → 回溯');
console.log('[TRACE] ├─ 尝试2: (aa)(a) — $ 失败 → 回溯');
console.log('[TRACE] ├─ 尝试3: (a)(aa) — $ 失败 → 回溯');
console.log('[TRACE] ├─ 尝试4: (a)(a)(a) — $ 失败 → 回溯');
console.log('[TRACE] └─ 全部路径耗尽 → 匹配失败');
console.log('[TRACE] 3个a有4条路径, 22个a有 2^22 ≈ 400万条路径!');
console.log();

// ============================================
// 3. 性能对比: 不同输入长度
// ============================================
console.log('[INFO] 3. 危险正则随输入长度增长的耗时变化\n');

const dangerReTest = /^(a+)+$/;

// 逐步增加长度，观察指数增长
const lengths = [10, 15, 18, 20, 22, 24];
lengths.forEach(len => {
  const input = 'a'.repeat(len) + 'b';
  const t0 = performance.now();
  dangerReTest.test(input);
  const t1 = performance.now();
  const time = t1 - t0;
  const bar = '█'.repeat(Math.min(50, Math.ceil(time / 2)));
  console.log(`[TRACE] n=${String(len).padStart(2)}: ${time.toFixed(2).padStart(10)}ms ${bar}`);
});

console.log('[VERIFY] 注意时间增长趋势: 每增加1-2个字符, 耗时约翻倍 (指数级)');
console.log();

// ============================================
// 4. 常见危险模式识别
// ============================================
console.log('[INFO] 4. 常见危险模式\n');

interface DangerousPattern {
  name: string;
  dangerous: string;
  safe: string;
  reason: string;
}

const dangerousPatterns: DangerousPattern[] = [
  {
    name: '嵌套量词',
    dangerous: '(a+)+',
    safe: 'a+',
    reason: '内外量词各自分配字符导致指数路径',
  },
  {
    name: '交替重叠',
    dangerous: '(a|a)+',
    safe: 'a+',
    reason: '两个分支匹配相同字符, 每个位置都有两条路径',
  },
  {
    name: '通配重复',
    dangerous: '(.*a){5}',
    safe: '(?:[^a]*a){5}',
    reason: '.* 的贪婪回溯与 a 的匹配互相竞争',
  },
  {
    name: '可选重复交叉',
    dangerous: '(a+b?)+',
    safe: 'a+(?:ba+)*b?',
    reason: 'b? 可选导致 a+ 之间边界不确定',
  },
];

dangerousPatterns.forEach(({ name, dangerous, safe, reason }) => {
  console.log(`[TRACE] 【${name}】`);
  console.log(`  ❌ 危险: /${dangerous}/`);
  console.log(`  ✅ 安全: /${safe}/`);
  console.log(`  原因: ${reason}`);
});
console.log();

// ============================================
// 5. ReDoS 攻击场景
// ============================================
console.log('[INFO] 5. ReDoS 攻击场景\n');

console.log('[TRACE] ReDoS (Regular Expression Denial of Service):');
console.log('[TRACE] 攻击者构造恶意输入, 触发正则的指数级回溯, 耗尽服务器 CPU');
console.log();
console.log('[TRACE] 真实案例:');
console.log('[TRACE] - 2016年: Stack Overflow 因正则导致服务中断 34 分钟');
console.log('[TRACE] - 2019年: Cloudflare WAF 规则中的恶意正则导致全球宕机');
console.log('[TRACE] - 2021年: npm 包 ua-parser-js 发现 ReDoS 漏洞');
console.log();

// 模拟场景: 用户输入验证
console.log('[TRACE] 模拟场景: 表单验证中的危险正则');
// 假设你用这个正则验证邮箱 (故意写成有漏洞的版本)
const badEmailRe = /^([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}$/;
const maliciousInput = 'a.'.repeat(15) + '!'; // 攻击者构造的输入

start = performance.now();
badEmailRe.test(maliciousInput);
elapsed = performance.now() - start;
console.log(`[TRACE] 危险邮箱正则对恶意输入: ${elapsed.toFixed(2)}ms`);
console.log('[VERIFY] 嵌套的 ([...]+\\.)+ 是回溯灾难的根源');
console.log();

// ============================================
// 6. 防御措施
// ============================================
console.log('[INFO] 6. ReDoS 防御措施\n');

// 防御1: 限制输入长度
function validateWithLengthCheck(input: string, re: RegExp, maxLen: number): boolean {
  if (input.length > maxLen) {
    console.log(`[TRACE] 输入过长 (${input.length} > ${maxLen}), 直接拒绝`);
    return false;
  }
  return re.test(input);
}

const longInput = 'a'.repeat(10000);
console.log('[TRACE] 防御1 — 输入长度检查:');
validateWithLengthCheck(longInput, /^\w+$/, 500);

// 防御2: 转义用户输入
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

console.log('[TRACE] 防御2 — 转义用户输入:');
const userSearch = '(hello)+';
const safeSearch = escapeRegExp(userSearch);
console.log(`  原始: "${userSearch}" → 转义后: "${safeSearch}"`);
const safeSearchRe = new RegExp(safeSearch);
console.log(`  匹配 "(hello)+":`, safeSearchRe.test('(hello)+'));  // true, 匹配字面量

// 防御3: 使用安全的正则替代
console.log('[TRACE] 防御3 — 安全替代:');
console.log('  ❌ /^(a+)+$/  → ✅ /^a+$/');
console.log('  ❌ /^(\\w+\\.)+\\w+$/  → ✅ /^[\\w.]+$/  (配合后处理验证)');

// 防御4: 计时保护
function timedRegexTest(re: RegExp, input: string, timeoutMs: number): boolean | 'timeout' {
  const t0 = performance.now();
  const result = re.test(input);
  const t1 = performance.now();
  if (t1 - t0 > timeoutMs) {
    console.log(`[WARN] 正则匹配耗时 ${(t1 - t0).toFixed(2)}ms, 超过阈值 ${timeoutMs}ms`);
    return 'timeout';
  }
  return result;
}

console.log('[TRACE] 防御4 — 计时保护:');
const timedResult = timedRegexTest(/^a+$/, 'a'.repeat(100000), 10);
console.log(`  安全正则结果: ${timedResult}`);
console.log();

// ============================================
// 7. 安全正则 vs 不安全正则 对比
// ============================================
console.log('[INFO] 7. 安全 vs 不安全正则 — 实际场景对比\n');

// 场景: 验证域名格式
// 不安全版本
const unsafeDomainRe = /^([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}$/;
// 安全版本: 避免嵌套量词
const safeDomainRe = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

const testDomains = [
  'example.com',
  'sub.domain.org',
  'a.b.c.d.example.com',
];

console.log('[TRACE] 正常域名验证 (两个正则结果一致):');
testDomains.forEach(domain => {
  const unsafe = unsafeDomainRe.test(domain);
  const safe = safeDomainRe.test(domain);
  console.log(`  "${domain}" → 不安全: ${unsafe}, 安全: ${safe}`);
});

// 恶意输入
const maliciousDomain = 'a.'.repeat(20) + '!';
console.log('\n[TRACE] 恶意输入对比:');

start = performance.now();
unsafeDomainRe.test(maliciousDomain);
const unsafeTime = performance.now() - start;

start = performance.now();
safeDomainRe.test(maliciousDomain);
const safeTime = performance.now() - start;

console.log(`  不安全正则: ${unsafeTime.toFixed(2)}ms`);
console.log(`  安全正则:   ${safeTime.toFixed(2)}ms`);
console.log(`  速度差异:   ${(unsafeTime / Math.max(safeTime, 0.001)).toFixed(0)}x`);
console.log();

// ============================================
// 8. 总结: 正则安全检查清单
// ============================================
console.log('[INFO] 8. 正则安全检查清单\n');

console.log('[TRACE] ✅ 1. 是否存在嵌套量词? (a+)+ (a*)*  → 展平为 a+ 或 a*');
console.log('[TRACE] ✅ 2. 交替分支是否有重叠? (a|ab)  → 合并为 ab?');
console.log('[TRACE] ✅ 3. 是否限制了输入长度? → 验证前先检查 input.length');
console.log('[TRACE] ✅ 4. 用户输入是否经过转义? → escapeRegExp()');
console.log('[TRACE] ✅ 5. 是否有超时保护? → performance.now() 计时');
console.log('[TRACE] ✅ 6. 复杂验证是否使用了库? → Zod, validator.js, joi');

console.log('\n[INFO] === 示例结束 ===');
