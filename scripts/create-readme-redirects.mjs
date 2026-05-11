import fs from 'node:fs'
import path from 'node:path'

const dist = path.join(process.cwd(), '.vitepress/dist')

function walkDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return [
    dir,
    ...entries.flatMap((entry) => {
      if (!entry.isDirectory()) return []
      return walkDirs(path.join(dir, entry.name))
    })
  ]
}

function redirectHtml(relativeTarget) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${relativeTarget}">
  <script>location.replace(${JSON.stringify(relativeTarget)})</script>
  <title>Redirecting...</title>
</head>
<body>
  <p>正在跳转到 <a href="${relativeTarget}">${relativeTarget}</a></p>
</body>
</html>
`
}

let created = 0

for (const dir of walkDirs(dist)) {
  if (dir === dist) continue

  const indexFile = path.join(dir, 'index.html')
  const readmeFile = path.join(dir, 'README.html')

  if (!fs.existsSync(indexFile) || fs.existsSync(readmeFile)) continue

  fs.writeFileSync(readmeFile, redirectHtml('./'), 'utf8')
  created += 1
}

console.log(`README 兼容跳转页: ${created}`)
