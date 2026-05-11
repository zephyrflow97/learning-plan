/**
 * @file 01-regexp-basics.ts
 * @description 演示正则表达式基础语法 — 字符类、量词、锚点、转义、标志、API 选择
 * @prerequisites Stage 1 Ch01 基础语法（字符串方法）
 * @related Stage 2 Ch09 捕获组 (02-groups-and-lookaround.ts)
 */

console.log('=== 正则表达式基础语法 ===\n');

// ============================================
// 1. 两种创建方式
// ============================================
console.log('[INFO] 1. 两种创建方式\n');

// 字面量 — 编译期解析，推荐
const re1 = /hello/i;
console.log('[TRACE] 字面量创建:', re1);
console.log('[TRACE] re1.test("Hello World"):', re1.test('Hello World')); // true

// 构造函数 — 运行时动态构建
const keyword = 'world';
const re2 = new RegExp(keyword, 'gi');
console.log('[TRACE] 构造函数创建:', re2);
console.log('[TRACE] re2.test("Hello World"):', re2.test('Hello World')); // true

// 构造函数需要双重转义
const reDigit = new RegExp('\\d+'); // 等价于 /\d+/
console.log('[TRACE] 双重转义 \\\\d+ →', reDigit);
console.log('[VERIFY] new RegExp("\\d+") 匹配数字:', reDigit.test('abc123'));
console.log();

// ============================================
// 2. 字符类 (Character Classes)
// ============================================
console.log('[INFO] 2. 字符类\n');

// \d — 数字
console.log('[TRACE] "abc123".match(/\\d+/):', 'abc123'.match(/\d+/));

// \w — 单词字符 [a-zA-Z0-9_]
console.log('[TRACE] "hello world_123".match(/\\w+/g):', 'hello world_123'.match(/\w+/g));

// \s — 空白字符
console.log('[TRACE] "a b\\tc".split(/\\s+/):', 'a b\tc'.split(/\s+/));

// 字符范围 [a-z], [0-9]
console.log('[TRACE] "Hello123".match(/[a-z]+/g):', 'Hello123'.match(/[a-z]+/g));

// 取反 [^abc]
console.log('[TRACE] "abcdef".match(/[^a-c]+/):', 'abcdef'.match(/[^a-c]+/));

// . 匹配任意字符（除换行）
console.log('[TRACE] "a1b2".match(/./g):', 'a1b2'.match(/./g));
console.log();

// ============================================
// 3. 量词 (Quantifiers)
// ============================================
console.log('[INFO] 3. 量词\n');

// * — 0 次或更多
console.log('[TRACE] "goood".match(/go*d/):', 'goood'.match(/go*d/));

// + — 1 次或更多
console.log('[TRACE] "gd".match(/go+d/):', 'gd'.match(/go+d/));   // null
console.log('[TRACE] "god".match(/go+d/):', 'god'.match(/go+d/)); // ['god']

// ? — 0 次或 1 次
console.log('[TRACE] "color colour".match(/colou?r/g):', 'color colour'.match(/colou?r/g));

// {n}, {n,}, {n,m}
console.log('[TRACE] "aaa".match(/a{2}/):', 'aaa'.match(/a{2}/));
console.log('[TRACE] "aaaa".match(/a{2,3}/):', 'aaaa'.match(/a{2,3}/));

// 贪婪 vs 懒惰
const html = '<div>hello</div>';
console.log('[TRACE] 贪婪 /<.+>/:', html.match(/<.+>/)?.[0]);    // '<div>hello</div>'
console.log('[TRACE] 懒惰 /<.+?>/:', html.match(/<.+?>/)?.[0]); // '<div>'
console.log('[VERIFY] 贪婪模式尽可能多匹配，懒惰模式尽可能少匹配');
console.log();

// ============================================
// 4. 锚点 (Anchors)
// ============================================
console.log('[INFO] 4. 锚点\n');

// ^ 和 $ — 字符串开头和结尾
console.log('[TRACE] /^\\d+$/.test("12345"):', /^\d+$/.test('12345'));  // true
console.log('[TRACE] /^\\d+$/.test("123abc"):', /^\d+$/.test('123abc')); // false

// \b — 单词边界
const text = 'cat concatenate category';
console.log('[TRACE] 不带边界 /cat/g:', text.match(/cat/g));     // ['cat', 'cat', 'cat']
console.log('[TRACE] 带边界 /\\bcat\\b/g:', text.match(/\bcat\b/g)); // ['cat']
console.log('[VERIFY] \\b 只匹配独立的单词 "cat"，排除 concatenate 中的 cat');
console.log();

// ============================================
// 5. 转义 (Escaping)
// ============================================
console.log('[INFO] 5. 特殊字符转义\n');

// 匹配文件名中的点
console.log('[TRACE] "file.ts".match(/\\w+\\.ts$/):', 'file.ts'.match(/\w+\.ts$/));

// 匹配美元金额
console.log('[TRACE] "$100".match(/\\$\\d+/):', '$100'.match(/\$\d+/));

// 匹配括号
console.log('[TRACE] "(hello)".match(/\\(\\w+\\)/):', '(hello)'.match(/\(\w+\)/));

// 转义用户输入（防止注入）
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const userInput = 'price is $10.00 (USD)';
const escaped = escapeRegExp(userInput);
console.log('[TRACE] 转义前:', userInput);
console.log('[TRACE] 转义后:', escaped);
console.log('[VERIFY] 特殊字符 $, ., (, ) 都被转义');
console.log();

// ============================================
// 6. 标志 (Flags)
// ============================================
console.log('[INFO] 6. 常用标志\n');

// g — 全局匹配
console.log('[TRACE] 不带 g:', 'aaa'.match(/a/));   // ['a'] (只匹配第一个)
console.log('[TRACE] 带 g:', 'aaa'.match(/a/g));    // ['a', 'a', 'a']

// i — 忽略大小写
console.log('[TRACE] 不带 i:', 'Hello'.match(/hello/));  // null
console.log('[TRACE] 带 i:', 'Hello'.match(/hello/i));   // ['Hello']

// m — 多行模式
const multiline = 'line1\nline2\nline3';
console.log('[TRACE] 不带 m:', multiline.match(/^\w+$/g));  // null
console.log('[TRACE] 带 m:', multiline.match(/^\w+$/gm));   // ['line1', 'line2', 'line3']

// s — dotAll 模式 (ES2018)
console.log('[TRACE] 不带 s:', 'a\nb'.match(/a.b/));  // null (. 不匹配 \n)
console.log('[TRACE] 带 s:', 'a\nb'.match(/a.b/s));   // ['a\nb']
console.log();

// ============================================
// 7. API 对比: test / match / matchAll / replace / split / search
// ============================================
console.log('[INFO] 7. RegExp API 对比\n');

const sample = 'price: $10, tax: $2, total: $12';

// test — 返回 boolean
console.log('[TRACE] test:', /\$\d+/.test(sample)); // true

// search — 返回首次匹配的索引
console.log('[TRACE] search:', sample.search(/\$\d+/)); // 7

// match (无 g) — 返回第一个匹配 + 捕获组
console.log('[TRACE] match (无 g):', sample.match(/\$(\d+)/));

// match (有 g) — 返回所有匹配（无捕获组信息）
console.log('[TRACE] match (有 g):', sample.match(/\$(\d+)/g));

// matchAll — 返回迭代器，保留捕获组信息
console.log('[TRACE] matchAll:');
for (const m of sample.matchAll(/\$(\d+)/g)) {
  console.log(`  金额: ${m[1]}, 位置: ${m.index}`);
}

// replace — 替换
console.log('[TRACE] replace:', sample.replace(/\$(\d+)/g, '¥$1'));

// split — 分割
console.log('[TRACE] split:', 'a, b; c  d'.split(/[,;\s]+/));
console.log();

// ============================================
// 8. g 标志的有状态陷阱
// ============================================
console.log('[INFO] 8. g 标志的有状态陷阱 (lastIndex)\n');

const reGlobal = /\d+/g;
console.log('[TRACE] 第1次 test("abc123"):', reGlobal.test('abc123'), '→ lastIndex:', reGlobal.lastIndex);
console.log('[TRACE] 第2次 test("abc123"):', reGlobal.test('abc123'), '→ lastIndex:', reGlobal.lastIndex);
console.log('[TRACE] 第3次 test("abc123"):', reGlobal.test('abc123'), '→ lastIndex:', reGlobal.lastIndex);

// 修复: 重置 lastIndex
reGlobal.lastIndex = 0;
console.log('[TRACE] 重置后 test("abc123"):', reGlobal.test('abc123'));
console.log('[VERIFY] 带 g 的正则对象有状态！复用时记得重置 lastIndex');

console.log('\n[INFO] === 示例结束 ===');
