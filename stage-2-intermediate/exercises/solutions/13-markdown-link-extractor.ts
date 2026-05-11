/**
 * @file 13-markdown-link-extractor.ts
 * @description Markdown 链接提取器
 * @difficulty 基础 ⭐⭐
 */

console.log('=== 练习 13：Markdown 链接提取器 ===\n');

// ===== 类型定义 =====

interface MarkdownLink {
  text: string;
  url: string;
  fullMatch: string;
  position: {
    start: number;
    end: number;
  };
}

// ===== 主要函数 =====

/**
 * 提取 Markdown 文本中的所有链接
 * @param markdown Markdown 文本
 * @returns 链接对象数组
 */
function extractMarkdownLinks(markdown: string): MarkdownLink[] {
  console.log('[提取] 开始分析 Markdown 文本');
  console.log(`[INFO] 文本长度: ${markdown.length} 字符\n`);
  
  // 正则表达式说明:
  // \[       - 匹配左方括号
  // (?<text>[^\]]+) - 捕获链接文本（非右方括号的字符）
  // \]       - 匹配右方括号
  // \(       - 匹配左圆括号
  // (?<url>[^)]+) - 捕获 URL（非右圆括号的字符）
  // \)       - 匹配右圆括号
  const pattern = /\[(?<text>[^\]]+)\]\((?<url>[^)]+)\)/g;
  
  const links: MarkdownLink[] = [];
  let match: RegExpExecArray | null;
  let count = 0;
  
  // 使用 exec() 循环匹配所有链接
  while ((match = pattern.exec(markdown)) !== null) {
    count++;
    
    if (match.groups && match.index !== undefined) {
      const link: MarkdownLink = {
        text: match.groups.text,
        url: match.groups.url,
        fullMatch: match[0],
        position: {
          start: match.index,
          end: match.index + match[0].length
        }
      };
      
      links.push(link);
      
      console.log(`[链接 ${count}]`);
      console.log(`  文本: "${link.text}"`);
      console.log(`  URL: ${link.url}`);
      console.log(`  位置: ${link.position.start}-${link.position.end}`);
      console.log('');
    }
  }
  
  console.log(`[完成] 共找到 ${links.length} 个链接\n`);
  return links;
}

/**
 * 使用 matchAll() 的替代实现
 * @param markdown Markdown 文本
 * @returns 链接对象数组
 */
function extractMarkdownLinksV2(markdown: string): MarkdownLink[] {
  console.log('[提取 V2] 使用 matchAll() 方法\n');
  
  const pattern = /\[(?<text>[^\]]+)\]\((?<url>[^)]+)\)/g;
  const links: MarkdownLink[] = [];
  
  for (const match of markdown.matchAll(pattern)) {
    if (match.groups && match.index !== undefined) {
      links.push({
        text: match.groups.text,
        url: match.groups.url,
        fullMatch: match[0],
        position: {
          start: match.index,
          end: match.index + match[0].length
        }
      });
    }
  }
  
  return links;
}

/**
 * 验证链接是否有效
 * @param link 链接对象
 * @returns 是否有效
 */
function validateLink(link: MarkdownLink): boolean {
  console.log(`[验证] ${link.text}`);
  
  // 检查 URL 格式
  const urlPattern = /^(https?:\/\/|\/|#)/;
  const isValid = urlPattern.test(link.url);
  
  console.log(`  URL: ${link.url}`);
  console.log(`  结果: ${isValid ? '✅ 有效' : '❌ 无效'}\n`);
  
  return isValid;
}

/**
 * 统计链接类型
 * @param links 链接数组
 */
function analyzeLinkTypes(links: MarkdownLink[]): void {
  console.log('[分析] 链接类型统计\n');
  
  const stats = {
    external: 0,  // 外部链接 (http/https)
    internal: 0,  // 内部链接 (/)
    anchor: 0,    // 锚点链接 (#)
    other: 0      // 其他
  };
  
  for (const link of links) {
    if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
      stats.external++;
      console.log(`  🌐 外部: ${link.text} → ${link.url}`);
    } else if (link.url.startsWith('/')) {
      stats.internal++;
      console.log(`  📄 内部: ${link.text} → ${link.url}`);
    } else if (link.url.startsWith('#')) {
      stats.anchor++;
      console.log(`  ⚓ 锚点: ${link.text} → ${link.url}`);
    } else {
      stats.other++;
      console.log(`  ❓ 其他: ${link.text} → ${link.url}`);
    }
  }
  
  console.log('\n统计结果:');
  console.log(`  外部链接: ${stats.external}`);
  console.log(`  内部链接: ${stats.internal}`);
  console.log(`  锚点链接: ${stats.anchor}`);
  console.log(`  其他链接: ${stats.other}`);
  console.log(`  总计: ${links.length}\n`);
}

// ===== 测试 =====

console.log('=== 测试案例 1：基础提取 ===\n');

const markdown1 = `
# 标题

这是一段包含链接的文本。

查看 [MDN](https://developer.mozilla.org) 和 
[TypeScript 官网](https://www.typescriptlang.org) 了解更多信息。

还可以访问 [GitHub](https://github.com) 查看开源项目。
`;

const links1 = extractMarkdownLinks(markdown1);

console.log('=== 测试案例 2：复杂链接 ===\n');

const markdown2 = `
# 文档

- [首页](/)
- [关于我们](/about)
- [联系方式](/contact#form)
- [API 文档](https://api.example.com/docs)
- [GitHub](https://github.com/user/repo)
- [跳转到顶部](#top)
`;

const links2 = extractMarkdownLinks(markdown2);
analyzeLinkTypes(links2);

console.log('=== 测试案例 3：验证链接 ===\n');

for (const link of links2) {
  validateLink(link);
}

console.log('=== 测试案例 4：替换链接 ===\n');

function replaceLinks(markdown: string, replacer: (link: MarkdownLink) => string): string {
  const pattern = /\[(?<text>[^\]]+)\]\((?<url>[^)]+)\)/g;
  
  return markdown.replace(pattern, (match, text, url, offset) => {
    const link: MarkdownLink = {
      text,
      url,
      fullMatch: match,
      position: { start: offset, end: offset + match.length }
    };
    
    return replacer(link);
  });
}

// 将所有外部链接添加 target="_blank"
const html = replaceLinks(markdown2, (link) => {
  if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
    console.log(`[转换] ${link.text} → 外部链接`);
    return `<a href="${link.url}" target="_blank">${link.text}</a>`;
  }
  console.log(`[转换] ${link.text} → 普通链接`);
  return `<a href="${link.url}">${link.text}</a>`;
});

console.log('\n转换后的 HTML:\n');
console.log(html);

console.log('\n=== 练习 13 完成 ===\n');

console.log('💡 关键知识点:');
console.log('1. 命名捕获组 (?<name>...) 提高可读性');
console.log('2. matchAll() 返回迭代器，适合 for...of');
console.log('3. exec() 需要循环调用获取所有匹配');
console.log('4. match.index 获取匹配位置');
console.log('5. 正则表达式的 g 标志启用全局匹配');
console.log('6. [^\\]] 匹配除右方括号外的任意字符');

export { extractMarkdownLinks, extractMarkdownLinksV2, validateLink, analyzeLinkTypes };
