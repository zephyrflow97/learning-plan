/**
 * @file 02-groups-and-lookaround.ts
 * @description 演示捕获组、命名捕获组、非捕获组、反向引用、四种断言(Lookaround)
 * @prerequisites Stage 2 Ch09 正则基础 (01-regexp-basics.ts)
 * @related Stage 2 Ch09 实战模式 (03-common-patterns.ts)
 */

console.log('=== 捕获组与断言 (Lookaround) ===\n');

// ============================================
// 1. 基础捕获组 ()
// ============================================
console.log('[INFO] 1. 基础捕获组\n');

const dateStr = '今天是 2026-02-09，明天是 2026-02-10';
const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);

if (dateMatch) {
  console.log('[TRACE] 完整匹配 match[0]:', dateMatch[0]); // '2026-02-09'
  console.log('[TRACE] 捕获组1 match[1]:', dateMatch[1]);   // '2026'
  console.log('[TRACE] 捕获组2 match[2]:', dateMatch[2]);   // '02'
  console.log('[TRACE] 捕获组3 match[3]:', dateMatch[3]);   // '09'
  console.log('[TRACE] 匹配位置 index:', dateMatch.index);  // 4
}
console.log();

// ============================================
// 2. 命名捕获组 (?<name>) — ES2018
// ============================================
console.log('[INFO] 2. 命名捕获组 — 给匹配结果贴标签\n');

const namedMatch = '2026-02-09'.match(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
);

if (namedMatch?.groups) {
  console.log('[TRACE] groups.year:', namedMatch.groups.year);   // '2026'
  console.log('[TRACE] groups.month:', namedMatch.groups.month); // '02'
  console.log('[TRACE] groups.day:', namedMatch.groups.day);     // '09'

  // 解构赋值
  const { year, month, day } = namedMatch.groups;
  console.log('[VERIFY] 解构:', `${year}年${month}月${day}日`);
}
console.log();

// ============================================
// 3. 非捕获组 (?:) — 分组但不捕获
// ============================================
console.log('[INFO] 3. 非捕获组 — 只分组不捕获\n');

// 捕获组会出现在结果中
const withCapture = 'http https'.match(/(https?):\/\//);
console.log('[TRACE] 捕获组结果:', withCapture);

// 非捕获组不会出现在结果中
const withoutCapture = 'http://example.com'.match(/(?:https?):\/\//);
console.log('[TRACE] 非捕获组结果:', withoutCapture);
console.log('[VERIFY] 非捕获组 (?:) 结果中没有分组内容');
console.log();

// ============================================
// 4. 反向引用 \1 和 \k<name>
// ============================================
console.log('[INFO] 4. 反向引用 — 在正则内部引用已捕获的内容\n');

// 数字反向引用: 匹配成对的 HTML 标签
const htmlStr = '<div>hello</div> <span>world</span> <p>bad</div>';
const tagRe = /<(\w+)>.*?<\/\1>/g;

console.log('[TRACE] 匹配成对标签:');
for (const m of htmlStr.matchAll(tagRe)) {
  console.log(`  匹配: ${m[0]}, 标签: ${m[1]}`);
}

// 命名反向引用
const namedTagRe = /<(?<tag>\w+)>.*?<\/\k<tag>>/g;
console.log('[TRACE] 命名反向引用:');
for (const m of htmlStr.matchAll(namedTagRe)) {
  console.log(`  匹配: ${m[0]}, tag: ${m.groups?.tag}`);
}

// 匹配重复单词
const duplicateRe = /\b(\w+)\s+\1\b/gi;
const textWithDuplicates = 'The the quick brown fox fox jumps';
console.log('[TRACE] 重复单词:', textWithDuplicates.match(duplicateRe));
console.log();

// ============================================
// 5. replace 中使用捕获组
// ============================================
console.log('[INFO] 5. replace 中使用捕获组\n');

// 日期格式转换: YYYY-MM-DD → DD/MM/YYYY
const converted = '2026-02-09'.replace(
  /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/,
  '$<d>/$<m>/$<y>'
);
console.log('[TRACE] YYYY-MM-DD → DD/MM/YYYY:', converted);

// 数字版引用: $1, $2
const convertedNum = '2026-02-09'.replace(
  /(\d{4})-(\d{2})-(\d{2})/,
  '$3/$2/$1'
);
console.log('[TRACE] 数字引用版:', convertedNum);

// 回调函数版
const camelCase = 'border-top-color'.replace(
  /-(\w)/g,
  (_match, char: string) => char.toUpperCase()
);
console.log('[TRACE] kebab → camelCase:', camelCase);
console.log();

// ============================================
// 6. 正向前瞻 (?=...) — 后面"是"
// ============================================
console.log('[INFO] 6. 正向前瞻 (?=...)\n');

// 匹配后面跟着 'px' 的数字
const cssValues = '12px 3em 5px 2rem';
console.log('[TRACE] 匹配 px 值:', cssValues.match(/\d+(?=px)/g));  // ['12', '5']
console.log('[VERIFY] 断言不消费字符: 结果中不包含 "px"');

// 数字千分位格式化: 1234567 → 1,234,567
const formatted = '1234567890'.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
console.log('[TRACE] 千分位格式化:', formatted);
console.log();

// ============================================
// 7. 负向前瞻 (?!...) — 后面"不是"
// ============================================
console.log('[INFO] 7. 负向前瞻 (?!...)\n');

// 匹配后面不跟 'px' 的数字
console.log('[TRACE] 非 px 值:', cssValues.match(/\d+(?!px)\b/g)); // em, rem 值

// 匹配不以 test 开头的文件名
const files = ['app.ts', 'test.ts', 'utils.ts', 'test-helper.ts'];
const nonTestRe = /^(?!test)\w+\.ts$/;
const nonTestFiles = files.filter(f => nonTestRe.test(f));
console.log('[TRACE] 非测试文件:', nonTestFiles);
console.log();

// ============================================
// 8. 正向后顾 (?<=...) — 前面"是" (ES2018)
// ============================================
console.log('[INFO] 8. 正向后顾 (?<=...)\n');

// 匹配美元金额（前面是 $）
const prices = '$100 €200 $300 ¥400';
console.log('[TRACE] 美元金额:', prices.match(/(?<=\$)\d+/g));  // ['100', '300']

// 匹配 = 后面的值
const config = 'host=localhost port=3000 debug=true';
console.log('[TRACE] 配置值:', config.match(/(?<=\w+=)\w+/g));
console.log();

// ============================================
// 9. 负向后顾 (?<!...) — 前面"不是" (ES2018)
// ============================================
console.log('[INFO] 9. 负向后顾 (?<!...)\n');

// 匹配非美元的金额
console.log('[TRACE] 非美元金额:', prices.match(/(?<!\$)\d+/g));

// 匹配不在引号内的单词 (简化演示)
const sentence = 'hello "world" foo "bar"';
// 匹配不紧跟在引号后面的单词
console.log('[TRACE] 非引号后的首个单词:', sentence.match(/(?<!")\b\w+\b/g));
console.log();

// ============================================
// 10. 组合断言: 密码强度验证
// ============================================
console.log('[INFO] 10. 组合断言 — 密码强度验证\n');

const strongPasswordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const passwords = [
  { pwd: 'abc',           expected: false },
  { pwd: 'abcdefgh',      expected: false },
  { pwd: 'Abcdefgh',      expected: false },
  { pwd: 'Abcdefg1',      expected: false },
  { pwd: 'Abcdefg1!',     expected: true  },
  { pwd: 'P@ssw0rd123',   expected: true  },
];

passwords.forEach(({ pwd, expected }) => {
  const result = strongPasswordRe.test(pwd);
  const status = result === expected ? '✓' : '✗';
  console.log(`[TRACE] ${status} "${pwd}" → ${result}`);
});

console.log('[VERIFY] 密码需要: 小写+大写+数字+特殊字符, 长度≥8');

console.log('\n[INFO] === 示例结束 ===');
