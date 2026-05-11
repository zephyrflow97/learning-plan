# 第 9 章:正则表达式 — 手术刀般的字符串模式匹配

> *"Some people, when confronted with a problem, think 'I know, I'll use regular expressions.' Now they have two problems."*
> — Jamie Zawinski, 1997
>
> 这句名言至今仍在流传。正则表达式是编程界最两极分化的工具——有人视之为神器，有人避之如蛇蝎。真相介于两者之间：正则是一把手术刀，用对了它精准无比，用错了它伤人于无形。本章的目标不是让你成为正则大师，而是让你**知道什么时候该用、什么时候不该用**。

## 📖 本章内容

1. [正则表达式的本质](#1-正则表达式的本质)
2. [基础语法](#2-基础语法)
3. [捕获组与反向引用](#3-捕获组与反向引用)
4. [断言（Lookaround）](#4-断言lookaround)
5. [JavaScript 中的 RegExp API](#5-javascript-中的-regexp-api)
6. [常见实战模式](#6-常见实战模式)
7. [性能与安全](#7-性能与安全)
8. [🧘 Zen of Code: 正则的边界](#8--zen-of-code-正则的边界)
9. [最佳实践与常见陷阱](#9-最佳实践与常见陷阱)
10. [章节练习](#10-章节练习)

---

## 1. 正则表达式的本质

> 🎭 **The Drama: 正则的读写不对称性**
>
> 写一个正则表达式需要 5 分钟。三个月后读懂同一个正则表达式需要 50 分钟。正则是**只写语言**（write-only language）——它牺牲了可读性，换来了简洁性。这就是为什么所有超过 30 个字符的正则表达式都应该加注释，或者拆分成多步处理。
>
> 你看到 `/^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/` 能立刻说出它匹配什么吗？它匹配 IPv4 地址。但你需要盯着它看至少 2 分钟才能确认。这就是**读写不对称性**。

### 1.1 什么是正则表达式？

正则表达式（Regular Expression, RegExp）是一种**声明式的字符串模式匹配语言**。

- **声明式**：你描述"要找什么"，而不是"怎么找"
- **模式匹配**：用一个模式匹配一组字符串（而非一个固定字符串）
- **语言**：正则有自己的语法、语义和执行模型，嵌入在宿主语言中

```typescript
// 命令式: 手动查找所有数字
const digits: string[] = [];
for (const char of str) {
  if (char >= '0' && char <= '9') digits.push(char);
}

// 声明式: 正则表达式一行搞定
const digits = str.match(/\d/g);
// ... 完整演示见 examples/01-regexp-basics.ts
```

### 1.2 两种创建方式

```typescript
// 字面量 — 编译期确定，推荐
const re1 = /hello/i;

// 构造函数 — 运行时动态构建
const keyword = getUserInput();
const re2 = new RegExp(keyword, 'i');
```

字面量语法在**编译期解析**，性能更好，且不需要双重转义。构造函数的优势是模式可以**动态拼接**，但要警惕用户输入注入。

| 特性 | 字面量 `/pattern/` | 构造函数 `new RegExp()` |
|------|-------------------|----------------------|
| 解析时机 | 编译期 | 运行时 |
| 转义 | 单重转义 `\d` | 双重转义 `\\d` |
| 动态模式 | 不支持 | 支持 |
| 性能 | 更快（引擎可优化） | 略慢（每次创建新对象） |
| 适用场景 | 固定模式 | 用户输入、动态拼接 |

> 🧰 **Toolbox**: 当正则模式中包含用户输入时，必须先**转义特殊字符**，否则用户可以注入恶意正则导致 ReDoS（第 7 节详述）。

### 1.3 正则的 CS 根基

> 🧠 **CS Master's Bridge: 正则表达式 = 有限状态自动机 (FSA)**
>
> 每个正则表达式在编译后都会变成一个有限状态自动机（NFA 或 DFA）。`/ab*c/` 变成：
>
> ```
> q0 ──a──> q1 ──b──> q1 ──c──> q2(accept)
>                     └────────────┘
> ```
>
> 输入字符串从 `q0` 出发，逐字符消费。到达 `q2`（接受状态）就匹配成功。这不是"魔法"——是 Stephen Kleene 在 1956 年证明的**正则语言理论**在代码中的直接实现。

### 1.4 历史一分钟

正则表达式的演化弧：

- **1956** — Stephen Kleene 发表正则语言理论，提出 Kleene Star（`*`）
- **1968** — Ken Thompson 在 Unix `ed` 编辑器中实现第一个正则引擎
- **1987** — Larry Wall 在 Perl 中将正则发扬光大，奠定 PCRE 风格
- **1997** — JavaScript (ES3) 引入 `RegExp` 对象，照搬 Perl 语法
- **2018** — ES2018 大幅增强正则：命名捕获组、后顾断言、dotAll 模式、`matchAll`

正则是少数几个从**纯数学理论**直接走进实际编程的工具。JavaScript 用了 20 年才追上 Perl 的正则表达式能力。

---

## 2. 基础语法

> ⚛️ **The Science: 正则语法的四块基石**
>
> 所有正则表达式，无论多复杂，都由四类元素组成：**字符类**（匹配什么）、**量词**（匹配几次）、**锚点**（在哪里匹配）、**转义**（匹配特殊字符本身）。掌握这四类，你就掌握了正则 80% 的能力。

### 2.1 字符类（Character Classes）

| 语法 | 含义 | 等价 |
|------|------|------|
| `.` | 任意字符（默认不含换行） | `[^\n\r]` |
| `\d` | 数字 | `[0-9]` |
| `\D` | 非数字 | `[^0-9]` |
| `\w` | 单词字符 | `[a-zA-Z0-9_]` |
| `\W` | 非单词字符 | `[^a-zA-Z0-9_]` |
| `\s` | 空白字符 | `[ \t\n\r\f\v]` |
| `\S` | 非空白字符 | `[^ \t\n\r\f\v]` |
| `[abc]` | a、b 或 c 中的任意一个 | — |
| `[^abc]` | 非 a、b、c 的任意字符 | — |
| `[a-z]` | a 到 z 的任意小写字母 | — |

```typescript
// \d 匹配数字，\w 匹配单词字符
'abc123'.match(/\d+/);    // ['123']
'hello world'.match(/\w+/g); // ['hello', 'world']
```

### 2.2 量词（Quantifiers）

| 语法 | 含义 | 例子 |
|------|------|------|
| `*` | 0 次或更多 | `a*` 匹配 `""`, `"a"`, `"aaa"` |
| `+` | 1 次或更多 | `a+` 匹配 `"a"`, `"aaa"`，不匹配 `""` |
| `?` | 0 次或 1 次 | `a?` 匹配 `""` 或 `"a"` |
| `{n}` | 恰好 n 次 | `a{3}` 匹配 `"aaa"` |
| `{n,}` | 至少 n 次 | `a{2,}` 匹配 `"aa"`, `"aaa"`, ... |
| `{n,m}` | n 到 m 次 | `a{2,4}` 匹配 `"aa"`, `"aaa"`, `"aaaa"` |

**贪婪 vs 懒惰**：

默认情况下，量词是**贪婪**的——它们尽可能多地匹配字符。在量词后加 `?` 使其变为**懒惰**——尽可能少地匹配。

```typescript
// 贪婪（默认）：尽可能多地匹配
'<div>hello</div>'.match(/<.+>/);    // ['<div>hello</div>']

// 懒惰（加 ?）：尽可能少地匹配
'<div>hello</div>'.match(/<.+?>/);   // ['<div>']
// ... 完整演示见 examples/01-regexp-basics.ts
```

> 🎭 **The Drama**: 贪婪模式像一个贪心的食客，先把整盘菜拿走，然后不得不一口口吐回来（回溯）直到满足约束。懒惰模式像一个矜持的食客，先只拿一口，不够了再多拿一口。两者都能到达正确结果，但效率可能天差地别。

| 贪婪量词 | 懒惰量词 | 行为差异 |
|---------|---------|---------|
| `*` | `*?` | 匹配 0 次起步 vs 0 次起步 |
| `+` | `+?` | 匹配尽可能多 vs 匹配尽可能少 |
| `?` | `??` | 优先匹配 1 次 vs 优先匹配 0 次 |
| `{n,m}` | `{n,m}?` | 优先匹配 m 次 vs 优先匹配 n 次 |

什么时候用懒惰模式？当你想匹配**最短的**符合条件的子串时。典型场景：提取 HTML 标签、匹配引号内容（`".*?"` 匹配单个引号字符串）。

### 2.3 锚点（Anchors）

锚点不匹配字符，它们匹配**位置**：

| 语法 | 含义 |
|------|------|
| `^` | 字符串开头（多行模式下：行开头） |
| `$` | 字符串结尾（多行模式下：行结尾） |
| `\b` | 单词边界 |
| `\B` | 非单词边界 |

```typescript
// ^ 和 $ 限定整个字符串
/^\d+$/.test('12345');    // true — 整个字符串都是数字
/^\d+$/.test('123abc');   // false — 包含非数字

// \b 匹配单词边界
'cat concatenate'.match(/\bcat\b/g);  // ['cat'] — 不匹配 concatenate 中的 cat
```

### 2.4 转义（Escaping）

正则中 `. * + ? ^ $ { } [ ] ( ) | \` 是特殊字符。要匹配它们本身，需用 `\` 转义：

```typescript
// 匹配 IP 地址中的点
'192.168.1.1'.match(/\d+\.\d+\.\d+\.\d+/);
// 不转义的 . 会匹配任意字符，导致误匹配
```

### 2.5 标志（Flags）

| 标志 | 含义 | 说明 |
|------|------|------|
| `g` | global | 全局搜索，不在第一个匹配后停止 |
| `i` | ignoreCase | 忽略大小写 |
| `m` | multiline | `^` 和 `$` 匹配每一行 |
| `s` | dotAll (ES2018) | `.` 匹配包括换行在内的所有字符 |
| `u` | unicode | 启用 Unicode 模式 |
| `v` | unicodeSets (ES2024) | 扩展 Unicode 属性 |
| `d` | hasIndices (ES2022) | 返回匹配的起止索引 |

```typescript
// g: 全局匹配所有结果
'aAbBcC'.match(/[a-z]/g);   // ['a', 'b', 'c']
// i: 忽略大小写
'Hello'.match(/hello/i);     // ['Hello']
// s: 让 . 匹配换行符
'line1\nline2'.match(/line1.line2/s);  // 匹配成功
```

> 完整的基础语法演示见 [`examples/01-regexp-basics.ts`](./examples/01-regexp-basics.ts)

---

## 3. 捕获组与反向引用

> ⚛️ **命名捕获组 — 给魔法贴标签**
>
> `/(\d{4})-(\d{2})-(\d{2})/` 匹配日期，但 `match[1]` 是年还是月？谁也记不住。`/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/` 让你用 `match.groups.year` 访问。**给正则的捕获组命名，就像给函数的参数命名——它把"位置依赖"变成了"语义依赖"**。

### 3.1 基础捕获组 `()`

圆括号 `()` 有两个功能：**分组**和**捕获**。

```typescript
const dateStr = '2026-02-09';
const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);

console.log(match[0]); // '2026-02-09' (完整匹配)
console.log(match[1]); // '2026' (第一个捕获组)
console.log(match[2]); // '02'
console.log(match[3]); // '09'
// ... 完整演示见 examples/02-groups-and-lookaround.ts
```

### 3.2 命名捕获组 `(?<name>)` (ES2018)

```typescript
const match = '2026-02-09'.match(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
);

console.log(match.groups.year);   // '2026'
console.log(match.groups.month);  // '02'
console.log(match.groups.day);    // '09'
```

命名捕获组的价值不在于"更方便"，而在于**自文档化**。三个月后，`groups.year` 比 `match[1]` 的可读性高一个数量级。

### 3.3 非捕获组 `(?:)`

当你只需要分组（改变运算优先级）但不需要捕获结果时，用非捕获组避免不必要的内存开销：

```typescript
// 捕获组：result 中会包含分组内容
'http https'.match(/(https?):\/\//);   // ['http://', 'http']

// 非捕获组：只分组不捕获，更轻量
'http://example.com'.match(/(?:https?):\/\//);  // ['http://']
```

**何时用非捕获组？**

- 当你需要 `(a|b)` 的分组功能但不关心捕获的内容
- 当你需要对一组字符应用量词 `(?:abc)+`
- 当捕获组过多导致 `match[1]`, `match[2]` ... 索引混乱时，用非捕获组减少噪音

### 3.4 反向引用 `\1`, `\k<name>`

反向引用让你在正则**内部**引用之前捕获的内容：

```typescript
// \1 引用第一个捕获组捕获的内容
// 匹配成对的 HTML 标签
const html = '<div>hello</div>';
html.match(/<(\w+)>.*?<\/\1>/);  // 匹配成功，\1 等于 'div'

// 命名反向引用
html.match(/<(?<tag>\w+)>.*?<\/\k<tag>>/);
```

### 3.5 在 replace 中使用捕获组

```typescript
// 日期格式转换: YYYY-MM-DD → DD/MM/YYYY
'2026-02-09'.replace(
  /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/,
  '$<d>/$<m>/$<y>'
);
// → '09/02/2026'

// 数字版本: $1, $2, $3
'2026-02-09'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');
```

> 完整的捕获组演示见 [`examples/02-groups-and-lookaround.ts`](./examples/02-groups-and-lookaround.ts)

---

## 4. 断言（Lookaround）

> 🌌 **The Big Picture: 断言 — 不消费字符的"条件检查"**
>
> 普通的正则元素在匹配时会**消费**字符（移动匹配指针）。断言不消费字符——它们只是"看一眼"前面或后面是否满足条件，然后继续。就像你过马路时左右看看（断言），但不走到旁边的车道（不消费位置）。

### 4.1 四种断言

| 语法 | 名称 | 含义 |
|------|------|------|
| `(?=...)` | 正向前瞻 (Positive Lookahead) | 后面**是** `...` |
| `(?!...)` | 负向前瞻 (Negative Lookahead) | 后面**不是** `...` |
| `(?<=...)` | 正向后顾 (Positive Lookbehind) | 前面**是** `...` (ES2018) |
| `(?<!...)` | 负向后顾 (Negative Lookbehind) | 前面**不是** `...` (ES2018) |

### 4.2 前瞻断言

```typescript
// 正向前瞻: 匹配后面跟着 'px' 的数字
'12px 3em 5px'.match(/\d+(?=px)/g);  // ['12', '5']

// 负向前瞻: 匹配后面不跟 'px' 的数字
'12px 3em 5px'.match(/\d+(?!px)/g);  // ['3']
```

### 4.3 后顾断言 (ES2018)

```typescript
// 正向后顾: 匹配前面是 '$' 的数字
'$100 €200 $300'.match(/(?<=\$)\d+/g);  // ['100', '300']

// 负向后顾: 匹配前面不是 '$' 的数字
'$100 €200 $300'.match(/(?<!\$)\d+/g);  // ['200']
```

### 4.4 组合断言：密码强度验证

断言的威力在于**组合**——同一个位置可以同时检查多个条件：

```typescript
// 密码必须包含: 大写、小写、数字，且长度 ≥ 8
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

strongPassword.test('Abc12345');  // true
strongPassword.test('abcdefgh');  // false (缺少大写和数字)
strongPassword.test('ABC123');    // false (缺少小写，长度不足)
// ... 完整演示见 examples/02-groups-and-lookaround.ts
```

每个 `(?=...)` 都从字符串开头"向前看"，检查是否包含指定类型的字符。它们互不干扰，因为**断言不消费字符**。

---

## 5. JavaScript 中的 RegExp API

> 🎭 **The Drama: 方法归属的混乱**
>
> JavaScript 的正则 API 分散在两个对象上：`RegExp.prototype` 和 `String.prototype`。哪些方法属于正则对象，哪些属于字符串？这是初学者最困惑的地方。记住一个规则：**正则对象只有 `test` 和 `exec` 两个核心方法**，其余都在字符串上。

### 5.1 RegExp 方法

#### `test()` — 返回布尔值

最简单的使用方式：只判断是否匹配。

```typescript
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
emailRe.test('user@example.com');  // true
emailRe.test('invalid-email');     // false
```

#### `exec()` — 返回详细匹配信息

```typescript
const re = /(\d{4})-(\d{2})/g;
let match;
while ((match = re.exec('2025-01 and 2026-02')) !== null) {
  console.log(`完整匹配: ${match[0]}, 年: ${match[1]}, 月: ${match[2]}`);
  console.log(`位置: ${match.index}`);
}
```

> ⚠️ **陷阱**: 带 `g` 标志的正则对象有**状态**（`lastIndex` 属性）。`exec()` 每次调用从 `lastIndex` 开始搜索。如果你复用正则对象，记得重置 `lastIndex = 0`。

### 5.2 String 方法

#### `match()` — 返回匹配结果

```typescript
// 不带 g: 返回第一个匹配 + 捕获组
'2026-02-09'.match(/(\d{4})-(\d{2})-(\d{2})/);
// ['2026-02-09', '2026', '02', '09', index: 0, groups: undefined]

// 带 g: 返回所有匹配(无捕获组信息)
'cat bat sat'.match(/[bcs]at/g);
// ['cat', 'bat', 'sat']
```

#### `matchAll()` — 带 `g` 的完整匹配迭代器 (ES2020)

```typescript
const text = 'price: $10, tax: $2, total: $12';
for (const m of text.matchAll(/\$(\d+)/g)) {
  console.log(`金额: ${m[1]}, 位置: ${m.index}`);
}
// 金额: 10, 位置: 7
// 金额: 2, 位置: 17
// 金额: 12, 位置: 28
```

`matchAll` 解决了 `match(g)` 丢失捕获组信息和 `exec` 需要循环的痛点。**推荐在需要全局匹配 + 捕获组时使用**。

#### `replace()` / `replaceAll()` — 替换

```typescript
// 简单替换
'hello world'.replace(/world/, 'TypeScript');

// 全局替换
'aaa'.replace(/a/g, 'b'); // 'bbb'
'aaa'.replaceAll('a', 'b'); // 'bbb' (ES2021)

// 用回调函数做复杂替换
'border-top-color'.replace(/-(\w)/g, (_, c) => c.toUpperCase());
// → 'borderTopColor' (kebab-case → camelCase)
```

#### `split()` — 按模式分割

```typescript
// 按多种分隔符分割
'apple, banana;cherry  grape'.split(/[,;\s]+/);
// ['apple', 'banana', 'cherry', 'grape']
```

#### `search()` — 返回首次匹配的索引

```typescript
'hello world 123'.search(/\d+/);  // 12
'no digits here'.search(/\d+/);   // -1
```

> 🧰 **Toolbox**: `search()` 类似 `indexOf()`，但支持正则。注意 `search()` **总是从头搜索**，不支持 `g` 标志，也不接受起始位置参数。

### 5.3 `exec` vs `matchAll` 对比

| 特性 | `exec()` + 循环 | `matchAll()` |
|------|----------------|-------------|
| 返回类型 | 单次匹配结果 | 迭代器 |
| 捕获组 | ✅ 保留 | ✅ 保留 |
| 有状态 | ✅ 修改 `lastIndex` | ❌ 无副作用 |
| 必须带 `g` | 是（否则无限循环） | 是（否则报错） |
| 推荐度 | 旧代码常见 | ES2020+ 推荐 |

`matchAll` 是 `exec` 循环的现代替代。它没有有状态的副作用，不会因为忘记 `g` 标志导致无限循环，代码也更简洁。**新代码应优先使用 `matchAll`**。

### 5.4 API 选择速查

```
需要做什么?
    │
    ├─ 只判断是否匹配?    →  re.test(str)
    │
    ├─ 找第一个匹配?      →  str.match(re)  (不带 g)
    │
    ├─ 找所有匹配(无需捕获组)?  →  str.match(re)  (带 g)
    │
    ├─ 找所有匹配(需要捕获组)?  →  str.matchAll(re)  (带 g)
    │
    ├─ 替换?             →  str.replace(re, replacement)
    │
    └─ 分割?             →  str.split(re)
```

> 完整的 API 演示见 [`examples/01-regexp-basics.ts`](./examples/01-regexp-basics.ts)

---

## 6. 常见实战模式

> 🧰 **Toolbox: 不要重新发明轮子，但要理解轮子**
>
> 以下模式覆盖了日常开发中 90% 的正则需求。但请记住：**生产环境中的复杂验证（邮箱、URL）应该使用成熟的库**（Zod、validator.js），而不是手写正则。手写正则适合简单场景和学习理解。

### 6.1 邮箱验证（简化版）

```typescript
// 简化版 — 覆盖常见场景，非 RFC 5322 完整规范
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// ... 完整实现见 examples/03-common-patterns.ts
```

> ⚠️ **警告**: 完整的 RFC 5322 邮箱正则有**数千字符**。不要试图用一个正则完美验证邮箱。实际项目中，简单正则 + 发送验证邮件才是正确方案。

### 6.2 URL 验证

```typescript
const urlRe = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
```

### 6.3 手机号验证（中国大陆）

```typescript
const phoneRe = /^1[3-9]\d{9}$/;
```

### 6.4 密码强度

```typescript
// 弱: 仅长度检查
const weakRe = /^.{6,}$/;

// 中: 字母 + 数字
const mediumRe = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

// 强: 大写 + 小写 + 数字 + 特殊字符
const strongRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,}$/;
```

### 6.5 数字千分位格式化

```typescript
// 1234567890 → 1,234,567,890
'1234567890'.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
```

这个正则的工作原理：
- `\B` — 非单词边界（不在字符串开头插入逗号）
- `(?=(\d{3})+(?!\d))` — 正向前瞻：后面的数字个数是 3 的倍数
- 结果：在每个"后面恰好是 3n 个数字"的位置插入逗号

### 6.6 提取与替换实例

```typescript
// 提取 Markdown 链接: [text](url)
const mdLinks = text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);

// 驼峰转换
'backgroundColor'.replace(/([A-Z])/g, '-$1').toLowerCase();
// → 'background-color'
```

### 6.7 何时不用正则？

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 简单的字符串包含检查 | `str.includes()` | 更快、更可读 |
| 判断前缀/后缀 | `startsWith()` / `endsWith()` | 语义明确 |
| HTML 解析 | DOM Parser | 正则无法处理嵌套结构 |
| JSON/XML 解析 | `JSON.parse()` / XML Parser | 结构化数据用结构化工具 |
| 复杂表单验证 | Zod / Yup / validator.js | 可维护性、错误提示 |

> 完整的实战模式见 [`examples/03-common-patterns.ts`](./examples/03-common-patterns.ts)

---

## 7. 性能与安全

> 🧠 **CS Master's Bridge: NFA 的回溯噩梦**
>
> JavaScript 的正则引擎使用 NFA（非确定有限自动机）。NFA 的特点是遇到多个可能的路径时，会**逐条尝试**——如果当前路径失败，回退（回溯）到上一个分叉点，尝试另一条路。
>
> 大多数正则的回溯量是线性的（O(n)）。但某些恶意构造的正则会导致**指数级回溯**（O(2^n)）——这就是 **Catastrophic Backtracking**，也是 **ReDoS（Regular Expression Denial of Service）** 攻击的原理。

### 7.1 回溯灾难案例

```typescript
// 这个正则看起来人畜无害
const evilRe = /^(a+)+$/;

// 对 'aaaaaaaaaaab' 的匹配过程:
// a+ 匹配所有 a, 但 $ 期望字符串结束,遇到 b 失败
// 引擎回溯: a+ 少匹配一个 a, 外层 (a+)+ 再匹配一个 a...
// 每个 a 都有"属于内层 a+ 还是外层重复"两种选择
// n 个 a → 2^n 条路径 → 浏览器卡死
// ... 完整演示见 examples/04-performance-and-redos.ts
```

### 7.2 危险模式识别

以下模式容易触发指数回溯：

| 模式 | 问题 | 安全替代 |
|------|------|---------|
| `(a+)+` | 嵌套量词 | `a+` |
| `(a\|b)*` + 重叠 | 交替与重复 | 精确字符类 `[ab]*` |
| `(.*a){n}` | 贪婪 + 回溯 | 原子组或具体化 |

**识别规则**：当正则中存在**嵌套量词**（量词作用于含量词的组），且匹配失败时，就可能触发指数回溯。

### 7.3 防御措施

```typescript
// 1. 避免嵌套量词
❌ /^(a+)+$/
✅ /^a+$/

// 2. 使用原子化的字符类代替交替
❌ /^(0|1|2|3|4|5|6|7|8|9)+$/
✅ /^\d+$/

// 3. 限制输入长度（在正则之前）
if (input.length > 1000) throw new Error('Input too long');

// 4. 设置超时 (Node.js 中可用 vm 模块)
```

### 7.4 ReDoS 攻击

> 🌌 **The Big Picture: 从 Regex Bug 到安全漏洞**
>
> 2016 年，Stack Overflow 因为一个正则表达式导致服务中断 34 分钟。2019 年，Cloudflare 的 WAF 规则中一个恶意正则导致全球性宕机。这不是学术问题——**ReDoS 是真实的安全威胁**。
>
> 防御 ReDoS 的核心原则：**永远不要将用户输入直接拼接到正则表达式中**，或者在拼接前进行**特殊字符转义**。

```typescript
// 转义用户输入中的正则特殊字符
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const userInput = 'price: $10.00';
const safeRe = new RegExp(escapeRegExp(userInput));
```

### 7.5 安全正则检查清单

在代码审查中，遇到正则表达式时，逐项检查以下问题：

1. **是否存在嵌套量词？** — `(a+)+`, `(a*)*` → 展平为 `a+` 或 `a*`
2. **交替分支是否有重叠？** — `(a|ab)` → 合并为 `ab?`
3. **输入长度是否有限制？** — 在正则匹配之前先检查 `input.length`
4. **用户输入是否经过转义？** — 使用 `escapeRegExp()` 处理
5. **正则是否处理不受信任的输入？** — 如果是，考虑使用成熟的验证库代替手写正则

> 完整的性能与安全演示见 [`examples/04-performance-and-redos.ts`](./examples/04-performance-and-redos.ts)

---

## 8. 🧘 Zen of Code: 正则的边界

> **"正则表达式能解决的问题只是所有字符串问题的一个子集。知道这条边界在哪里，比掌握任何正则技巧都重要。"**
>
> 正则适合：模式简单、结构扁平的文本匹配。正则不适合：嵌套结构（HTML、JSON）、上下文敏感的语法、复杂的业务验证。
>
> 当你发现自己写了一个超过 80 个字符的正则，停下来问自己：**"是否应该换成解析器或分步处理？"** 正则的最大陷阱不是写不出来，而是**写出来了但没人维护得了**。
>
> 一个可维护的 3 行 `split` + `map` + `filter` 链，永远优于一个"聪明"但不可读的正则一行流。
>
> **正则三问**——在写正则前问自己：
> 1. 字符串方法（`includes`, `startsWith`, `split`）能解决吗？能就不用正则。
> 2. 这个正则六个月后我还能看懂吗？看不懂就拆分或加注释。
> 3. 这个正则会处理用户输入吗？会就检查 ReDoS 风险。

---

## 9. 最佳实践与常见陷阱

### ✅ 最佳实践

#### 1. 使用命名捕获组

```typescript
// ❌ 位置依赖，难以维护
const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
const year = match[1]; // 1 是年？还是月？

// ✅ 语义明确，自文档化
const match = dateStr.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
const { year, month, day } = match.groups;
```

#### 2. 复杂正则加注释

```typescript
// ✅ 用变量拆分 + 注释解释
const year = '\\d{4}';
const month = '(?:0[1-9]|1[0-2])';
const day = '(?:0[1-9]|[12]\\d|3[01])';
const dateRe = new RegExp(`^${year}-${month}-${day}$`);
```

#### 3. 用 `matchAll` 代替 `exec` 循环

```typescript
// ❌ 手动循环 exec，容易忘记 g 标志导致无限循环
let m;
while ((m = re.exec(str)) !== null) { /* ... */ }

// ✅ matchAll 更简洁安全
for (const m of str.matchAll(re)) { /* ... */ }
```

#### 4. 验证前先检查输入长度

```typescript
// ✅ 防止 ReDoS
function validateInput(input: string): boolean {
  if (input.length > 500) return false; // 快速拒绝
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input);
}
```

#### 5. 简单场景优先用字符串方法

```typescript
// ❌ 杀鸡用牛刀
if (/^https:/.test(url)) { /* ... */ }

// ✅ 字符串方法更快更清晰
if (url.startsWith('https:')) { /* ... */ }
```

### ❌ 常见陷阱

#### 陷阱 1: 忘记转义特殊字符

```typescript
// ❌ . 匹配任意字符，不只是点
'192.168.1.1'.match(/\d+.\d+.\d+.\d+/);
// 也会匹配 '192x168y1z1'！

// ✅ 转义点号
'192.168.1.1'.match(/\d+\.\d+\.\d+\.\d+/);
```

#### 陷阱 2: `g` 标志的有状态问题

```typescript
// ❌ 复用带 g 标志的正则对象
const re = /\d+/g;
re.test('abc123');  // true (lastIndex = 6)
re.test('abc123');  // false! (从 index 6 开始搜索)
re.test('abc123');  // true  (重新从 0 开始)

// ✅ 每次创建新正则，或重置 lastIndex
re.lastIndex = 0;
```

#### 陷阱 3: `match(g)` 丢失捕获组

```typescript
// ❌ 带 g 的 match 不返回捕获组
'2025-01 2026-02'.match(/(\d{4})-(\d{2})/g);
// ['2025-01', '2026-02'] — 捕获组信息丢了！

// ✅ 用 matchAll 保留捕获组
[...'2025-01 2026-02'.matchAll(/(\d{4})-(\d{2})/g)];
```

#### 陷阱 4: 用正则解析 HTML

```typescript
// ❌ 正则无法正确处理嵌套的 HTML
'<div><div>inner</div></div>'.match(/<div>(.*)<\/div>/);
// 贪婪匹配会跨越嵌套边界

// ✅ 用 DOM Parser
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
```

> 🧠 **CS Master's Bridge**: 从计算理论的角度，正则语言（Type-3 Grammar）无法匹配**嵌套结构**。HTML 是上下文无关语言（Type-2 Grammar），需要栈式解析器（如 DOM Parser）才能正确处理。这不是正则"不够强"——是**数学上已证明不可能**。

#### 陷阱 5: 构造函数中忘记双重转义

```typescript
// ❌ \d 在字符串中被解释为普通 d
new RegExp('\d+'); // 等价于 /d+/，匹配字母 d

// ✅ 双重转义
new RegExp('\\d+'); // 等价于 /\d+/，匹配数字
```

---

## 10. 章节练习

### 练习 1: 日期格式提取与转换

**难度**: ⭐⭐
**涉及知识点**: 命名捕获组、replace、matchAll

**题目描述**:
从一段文本中提取所有日期（`YYYY-MM-DD` 格式），并转换为 `DD/MM/YYYY` 格式。

**要求**:
1. 使用命名捕获组提取年、月、日
2. 使用 `matchAll` 找到所有日期
3. 使用 `replace` 进行格式转换
4. 验证月份在 01-12 范围内，日期在 01-31 范围内

**提示**: 月份验证可以用 `(?:0[1-9]|1[0-2])`，日期可以用 `(?:0[1-9]|[12]\d|3[01])`。

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `examples/02-groups-and-lookaround.ts`

核心思路：用 `/(?<year>\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\d|3[01])/g` 匹配并提取，`replace` 中用 `$<day>/$<month>/$<year>` 重排格式。

</details>

### 练习 2: Markdown 链接提取器

**难度**: ⭐⭐⭐
**涉及知识点**: 捕获组、matchAll、字符类

**题目描述**:
编写函数提取 Markdown 文本中的所有链接，返回 `{ text: string, url: string }[]`。

**要求**:
1. 匹配 `[link text](url)` 格式
2. 正确处理链接文本中的空格和标点
3. 正确处理 URL 中的查询参数（`?` 和 `&`）
4. 忽略图片链接（`![alt](src)` 格式）

**提示**: 用否定后顾 `(?<!!)`（前面不是 `!`）排除图片链接。

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `examples/03-common-patterns.ts`

核心思路：`/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g` — 否定后顾确保 `[` 前面不是 `!`，`[^\]]+` 匹配链接文本，`[^)]+` 匹配 URL。

</details>

### 练习 3: 安全正则验证器

**难度**: ⭐⭐⭐
**涉及知识点**: ReDoS、正则安全、性能

**题目描述**:
实现一个 `safeRegexTest` 函数，在执行正则匹配前检查潜在的 ReDoS 风险。

**要求**:
1. 检查输入长度上限（拒绝过长输入）
2. 实现 `escapeRegExp` 函数转义用户输入
3. 使用计时器检测正则匹配是否超时
4. 对比安全正则和不安全正则在恶意输入下的性能差异

**提示**: `performance.now()` 可以精确计时。对于 `(a+)+$`，输入 `'a'.repeat(25) + 'b'` 就能观察到显著延迟。

<details>
<summary>💡 参考答案</summary>

> 完整代码见 `examples/04-performance-and-redos.ts`

核心思路：先验证输入长度，转义用户输入中的特殊字符，用 `performance.now()` 记录匹配耗时，超过阈值则中断并警告。避免在生产环境中使用嵌套量词模式。

</details>

---

## 章节间连接

| 向前连接 | 向后连接 |
|---------|---------|
| Stage 1 Ch01 基础语法（字符串方法 `includes`/`indexOf` 的局限性） | Stage Modern Frontend Ch06 表单验证（Zod schema 中的 `.regex()` 验证） |
| Stage 2 Ch01 TS 基础（模板字面量类型中的模式匹配概念） | Stage 3 Ch07 重构（用正则进行批量代码重构） |

---

> **下一章**: [10-JS 执行机制深入](../10-js-execution-model/) — 当你想知道"为什么"时
>
> **上一章**: [08-错误处理体系](../08-error-handling/) — 与混乱世界的和解协议
