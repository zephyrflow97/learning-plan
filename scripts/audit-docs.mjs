import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ignoredDirs = new Set(['.git', 'node_modules', '.vitepress', 'dist', '__pycache__'])
const reportPattern = /(REPORT|SUMMARY|PROGRESS|QUALITY|EXTRACTION|COMPLETION|PLAN|TASK_COMPLETION|FILES_CREATED|CODE_EXAMPLES|EXAMPLES_INDEX)/i
const resourcePattern = /(^resources|\/resources\/|teaching-support\/|TEMPLATE\.md$)/i
const exercisePattern = /(^|\/)(exercises|solutions)(\/|$)/i
const projectPattern = /(^|\/)projects\//i

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    if (ignoredDirs.has(entry.name)) return []
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(absolute)
    if (entry.isFile() && entry.name.endsWith('.md')) return [path.relative(root, absolute).replace(/\\/g, '/')]
    return []
  })
}

function classify(file) {
  if (reportPattern.test(file)) return '报告类文档'
  if (exercisePattern.test(file)) return '练习题/答案'
  if (projectPattern.test(file)) return '项目文档'
  if (resourcePattern.test(file)) return '资源/教学支持'
  if (file.startsWith('python/')) return 'Python 正式教材'
  if (file.startsWith('stage-modern-frontend/')) return '现代前端正式教材'
  if (/^stage-\d-/.test(file)) return 'JavaScript/TypeScript 正式教材'
  if (['README.md', 'getting-started.md', 'learning-guide.md'].includes(file)) return '入口/学习指南'
  return '其他 Markdown'
}

function extractLinks(content) {
  const links = []
  const markdownOnly = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '')
  const markdownLink = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  let match
  while ((match = markdownLink.exec(markdownOnly))) {
    const target = match[1]
    if (!target || /^(https?:|mailto:|tel:|#)/.test(target)) continue
    links.push(target)
  }
  return links
}

function targetExists(fromFile, target) {
  const cleanTarget = decodeURIComponent(target.split('#')[0].split('?')[0])
  if (!cleanTarget) return true
  const baseDir = path.dirname(path.join(root, fromFile))
  const absolute = path.resolve(baseDir, cleanTarget)
  if (fs.existsSync(absolute)) return true
  if (fs.existsSync(`${absolute}.md`)) return true
  if (fs.existsSync(path.join(absolute, 'README.md'))) return true
  if (fs.existsSync(path.join(absolute, 'index.md'))) return true
  return false
}

const files = walk(root).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { numeric: true }))
const categoryCounts = new Map()
const mermaidFiles = []
const brokenLinks = []

for (const file of files) {
  const category = classify(file)
  categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)

  const content = fs.readFileSync(path.join(root, file), 'utf8')
  if (/```mermaid|graph TD|flowchart|sequenceDiagram|classDiagram/.test(content)) {
    mermaidFiles.push(file)
  }

  for (const link of extractLinks(content)) {
    if (!targetExists(file, link)) {
      brokenLinks.push({ file, link })
    }
  }
}

console.log(`Markdown 文件总数: ${files.length}`)
console.log('分类统计:')
for (const [category, count] of [...categoryCounts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN'))) {
  console.log(`- ${category}: ${count}`)
}

console.log(`Mermaid 相关文档: ${mermaidFiles.length}`)
for (const file of mermaidFiles) {
  console.log(`- ${file}`)
}

console.log(`疑似坏链: ${brokenLinks.length}`)
for (const item of brokenLinks.slice(0, 80)) {
  console.log(`- ${item.file} -> ${item.link}`)
}
if (brokenLinks.length > 80) {
  console.log(`... 其余 ${brokenLinks.length - 80} 条已省略`)
}
