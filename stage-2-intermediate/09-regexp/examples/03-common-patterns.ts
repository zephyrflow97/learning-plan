/**
 * @file 03-common-patterns.ts
 * @description 演示常见实战正则模式 — 邮箱、URL、手机号、密码强度、Markdown 解析、格式转换
 * @prerequisites Stage 2 Ch09 捕获组与断言 (02-groups-and-lookaround.ts)
 * @related Stage 2 Ch09 性能与安全 (04-performance-and-redos.ts)
 */

console.log('=== 常见实战正则模式 ===\n');

// ============================================
// 1. 邮箱验证
// ============================================
console.log('[INFO] 1. 邮箱验证\n');

// 简化版 — 覆盖 99% 常见邮箱格式
// 注意: RFC 5322 完整规范极其复杂, 不推荐用正则完美匹配
const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const emails = [
  { input: 'user@example.com',     expected: true  },
  { input: 'first.last@sub.domain.org', expected: true },
  { input: 'user+tag@gmail.com',   expected: true  },
  { input: '@example.com',         expected: false },
  { input: 'user@',                expected: false },
  { input: 'user@.com',            expected: false },
  { input: 'user space@mail.com',  expected: false },
];

emails.forEach(({ input, expected }) => {
  const result = emailRe.test(input);
  const status = result === expected ? '✓' : '✗';
  console.log(`[TRACE] ${status} "${input}" → ${result}`);
});
console.log('[VERIFY] 简化版邮箱验证覆盖常见场景，复杂验证应使用 Zod 或 validator.js');
console.log();

// ============================================
// 2. URL 验证
// ============================================
console.log('[INFO] 2. URL 验证\n');

const urlRe = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const urls = [
  { input: 'https://example.com',           expected: true  },
  { input: 'http://sub.domain.org/path',    expected: true  },
  { input: 'https://api.com/v1?key=abc',    expected: true  },
  { input: 'ftp://files.com',               expected: false },
  { input: 'not a url',                     expected: false },
  { input: 'http://',                        expected: false },
];

urls.forEach(({ input, expected }) => {
  const result = urlRe.test(input);
  const status = result === expected ? '✓' : '✗';
  console.log(`[TRACE] ${status} "${input}" → ${result}`);
});
console.log();

// ============================================
// 3. 手机号验证（中国大陆）
// ============================================
console.log('[INFO] 3. 手机号验证（中国大陆）\n');

const phoneRe = /^1[3-9]\d{9}$/;

const phones = [
  { input: '13800138000', expected: true  },
  { input: '19912345678', expected: true  },
  { input: '12345678901', expected: false },  // 12 开头不合法
  { input: '1380013800',  expected: false },  // 少一位
  { input: '0138001380',  expected: false },  // 不以 1 开头
];

phones.forEach(({ input, expected }) => {
  const result = phoneRe.test(input);
  const status = result === expected ? '✓' : '✗';
  console.log(`[TRACE] ${status} "${input}" → ${result}`);
});
console.log();

// ============================================
// 4. 密码强度分级
// ============================================
console.log('[INFO] 4. 密码强度分级验证\n');

function checkPasswordStrength(pwd: string): 'weak' | 'medium' | 'strong' {
  // 强: 大写 + 小写 + 数字 + 特殊字符, 长度 ≥ 10
  const strongRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=]).{10,}$/;
  if (strongRe.test(pwd)) return 'strong';

  // 中: 字母 + 数字, 长度 ≥ 8
  const mediumRe = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  if (mediumRe.test(pwd)) return 'medium';

  // 弱: 其余
  return 'weak';
}

const pwdTests = ['123', 'abcdef', 'abc12345', 'Abc12345', 'P@ssw0rd!!XX'];

pwdTests.forEach(pwd => {
  const strength = checkPasswordStrength(pwd);
  console.log(`[TRACE] "${pwd}" → ${strength}`);
});
console.log();

// ============================================
// 5. Markdown 链接提取
// ============================================
console.log('[INFO] 5. Markdown 链接提取\n');

const markdown = `
# 学习资源
- 参考 [MDN Web Docs](https://developer.mozilla.org) 获取文档
- 推荐 [TypeScript Handbook](https://www.typescriptlang.org/docs?ref=home)
- 图片: ![logo](https://example.com/logo.png) 不应该被提取
- 另见 [GitHub](https://github.com)
`;

// (?<!!) 否定后顾排除图片链接 ![alt](src)
const mdLinkRe = /(?<!!)\[(?<text>[^\]]+)\]\((?<url>[^)]+)\)/g;

interface MdLink {
  text: string;
  url: string;
}

function extractMarkdownLinks(md: string): MdLink[] {
  const links: MdLink[] = [];
  for (const match of md.matchAll(mdLinkRe)) {
    if (match.groups) {
      links.push({ text: match.groups.text, url: match.groups.url });
    }
  }
  return links;
}

const links = extractMarkdownLinks(markdown);
links.forEach(link => {
  console.log(`[TRACE] 文本: "${link.text}" → URL: ${link.url}`);
});
console.log(`[VERIFY] 提取了 ${links.length} 个链接 (排除了图片链接)`);
console.log();

// ============================================
// 6. 格式转换: camelCase ↔ kebab-case
// ============================================
console.log('[INFO] 6. 格式转换\n');

// camelCase → kebab-case
function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// kebab-case → camelCase
function kebabToCamel(str: string): string {
  return str.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
}

console.log('[TRACE] camelToKebab("backgroundColor"):', camelToKebab('backgroundColor'));
console.log('[TRACE] camelToKebab("fontSize"):', camelToKebab('fontSize'));
console.log('[TRACE] kebabToCamel("border-top-color"):', kebabToCamel('border-top-color'));
console.log('[TRACE] kebabToCamel("margin-left"):', kebabToCamel('margin-left'));
console.log();

// ============================================
// 7. 数字格式化: 千分位分隔
// ============================================
console.log('[INFO] 7. 千分位数字格式化\n');

function formatNumber(num: number): string {
  const [integer, decimal] = num.toString().split('.');
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal ? `${formatted}.${decimal}` : formatted;
}

const numbers = [1234, 1234567, 1234567890, 1234.56, 100];
numbers.forEach(n => {
  console.log(`[TRACE] ${n} → ${formatNumber(n)}`);
});
console.log();

// ============================================
// 8. HTML 标签清理 (简单版)
// ============================================
console.log('[INFO] 8. HTML 标签清理\n');

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

const htmlContent = '<p>Hello <strong>World</strong>!</p><br/><span>Bye</span>';
console.log('[TRACE] 原始 HTML:', htmlContent);
console.log('[TRACE] 清理后:', stripHtmlTags(htmlContent));
console.log('[VERIFY] 注意: 复杂 HTML 清理应使用 DOM Parser, 正则只适合简单场景');
console.log();

// ============================================
// 9. 模板字符串变量提取
// ============================================
console.log('[INFO] 9. 模板字符串变量提取\n');

const template = 'Hello {{name}}, welcome to {{city}}! Your ID is {{id}}.';
const varRe = /\{\{(?<varName>\w+)\}\}/g;

console.log('[TRACE] 模板:', template);
console.log('[TRACE] 提取的变量:');
for (const m of template.matchAll(varRe)) {
  console.log(`  变量: {{${m.groups?.varName}}}, 位置: ${m.index}`);
}

// 模板替换
const data: Record<string, string> = { name: 'Alice', city: 'Shanghai', id: 'A001' };
const result = template.replace(varRe, (_, varName: string) => data[varName] ?? `{{${varName}}}`);
console.log('[TRACE] 替换后:', result);

console.log('\n[INFO] === 示例结束 ===');
