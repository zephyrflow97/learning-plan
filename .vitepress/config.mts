import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const reportNamePattern =
  /(REPORT|SUMMARY|PROGRESS|QUALITY|EXTRACTION|COMPLETION|PLAN|TASK_COMPLETION|FILES_CREATED|CODE_EXAMPLES|EXAMPLES_INDEX)/i

function fileExists(relativePath: string) {
  return fs.existsSync(path.join(root, relativePath))
}

function readTitle(relativePath: string) {
  const absolutePath = path.join(root, relativePath)
  if (!fs.existsSync(absolutePath)) return humanize(path.basename(path.dirname(relativePath)))

  const content = fs.readFileSync(absolutePath, 'utf8')
  const heading = content.split(/\r?\n/).find((line) => /^#\s+/.test(line))
  if (heading) {
    return heading
      .replace(/^#\s+/, '')
      .replace(/[`*_]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return humanize(path.basename(path.dirname(relativePath)))
}

function humanize(name: string) {
  return name
    .replace(/^\d+-/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function linkForReadme(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, '/')
  if (normalized === 'README.md') return '/README'
  if (normalized.endsWith('/README.md')) {
    return `/${normalized.slice(0, -'README.md'.length)}`
  }
  return `/${normalized.replace(/\.md$/, '')}`
}

function listSubdirs(relativeDir: string) {
  const absoluteDir = path.join(root, relativeDir)
  if (!fs.existsSync(absoluteDir)) return []

  return fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.') && name !== 'node_modules' && name !== '__pycache__')
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { numeric: true }))
}

function walkMarkdown(relativeDir = ''): string[] {
  const absoluteDir = path.join(root, relativeDir)
  if (!fs.existsSync(absoluteDir)) return []

  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === '.vitepress' || entry.name === '.git') return []
    const childRelativePath = path.join(relativeDir, entry.name).replace(/\\/g, '/')
    if (entry.isDirectory()) return walkMarkdown(childRelativePath)
    return entry.isFile() && entry.name.endsWith('.md') ? [childRelativePath] : []
  })
}

function readmeRewrites() {
  return Object.fromEntries(
    walkMarkdown()
      .filter((file) => file !== 'README.md' && file.endsWith('/README.md'))
      .filter((file) => {
        const dir = path.dirname(file)
        return !fileExists(`${dir}/index.md`) && !fileExists(`${dir}/INDEX.md`)
      })
      .map((file) => [file, file.replace(/README\.md$/, 'index.md')])
  )
}

function docItem(relativePath: string, fallback?: string) {
  return {
    text: fallback ?? readTitle(relativePath),
    link: linkForReadme(relativePath)
  }
}

function projectItems(projectRoot: string) {
  return listSubdirs(projectRoot)
    .map((name) => `${projectRoot}/${name}/README.md`)
    .filter(fileExists)
    .map((readmePath) => docItem(readmePath))
}

function stageGroup(relativeDir: string, title?: string) {
  const readme = `${relativeDir}/README.md`
  const items = listSubdirs(relativeDir).flatMap((name) => {
    if (name === 'examples') return []
    if (name === 'projects') {
      const projects = projectItems(`${relativeDir}/projects`)
      return projects.length
        ? [
            {
              text: '项目实践',
              collapsed: false,
              items: projects
            }
          ]
        : []
    }

    const childReadme = `${relativeDir}/${name}/README.md`
    if (!fileExists(childReadme)) return []
    return [docItem(childReadme)]
  })

  return {
    text: title ?? readTitle(readme),
    link: linkForReadme(readme),
    collapsed: false,
    items
  }
}

function modernFrontendSidebar() {
  return [
    {
      text: '现代前端',
      collapsed: false,
      items: [
        docItem('stage-modern-frontend/README.md', '阶段总览'),
        ...listSubdirs('stage-modern-frontend')
          .filter((name) => /^\d+-/.test(name))
          .map((name) => docItem(`stage-modern-frontend/${name}/README.md`))
      ]
    },
    {
      text: '练习与项目',
      collapsed: false,
      items: [
        docItem('stage-modern-frontend/exercises/README.md', '综合练习'),
        docItem('stage-modern-frontend/exercises/solutions/README.md', '练习参考答案'),
        docItem('stage-modern-frontend/projects/dashboard-app/README.md', 'TeamPulse 仪表盘')
      ]
    }
  ]
}

function jsTsSidebar() {
  return [
    {
      text: '学习路径',
      collapsed: false,
      items: [
        docItem('README.md', '总览'),
        docItem('getting-started.md', '快速开始'),
        docItem('learning-guide.md', '学习方法'),
        docItem('resources.md', '参考资源')
      ]
    },
    stageGroup('stage-1-beginner', '阶段 1：JavaScript 基础'),
    stageGroup('stage-2-intermediate', '阶段 2：TypeScript 与中级工程'),
    stageGroup('stage-3-advanced', '阶段 3：高级 TypeScript 与架构'),
    stageGroup('stage-4-expert', '阶段 4：生产级应用'),
    stageGroup('stage-5-philosophy', '阶段 5：编程之道')
  ]
}

function pythonSidebar() {
  return [
    {
      text: 'Python 学习路径',
      collapsed: false,
      items: [docItem('python/README.md', '总览')]
    },
    stageGroup('python/stage-1-beginner', '阶段 1：Python 基础'),
    stageGroup('python/stage-2-intermediate', '阶段 2：Python 工程化'),
    stageGroup('python/stage-3-advanced', '阶段 3：深入 Python'),
    stageGroup('python/stage-4-expert', '阶段 4：生产级 Python'),
    stageGroup('python/stage-5-philosophy', '阶段 5：Python 之道')
  ]
}

function reportSidebar() {
  const rootReports = fs
    .readdirSync(root)
    .filter((name) => name.endsWith('.md') && reportNamePattern.test(name))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { numeric: true }))
    .map((name) => docItem(name))

  return [
    {
      text: '项目报告',
      collapsed: false,
      items: [docItem('project-reports.md', '报告索引'), ...rootReports]
    }
  ]
}

const sidebar = {
  '/python/': pythonSidebar(),
  '/stage-modern-frontend/': modernFrontendSidebar(),
  '/stage-1-beginner/': jsTsSidebar(),
  '/stage-2-intermediate/': jsTsSidebar(),
  '/stage-3-advanced/': jsTsSidebar(),
  '/stage-4-expert/': jsTsSidebar(),
  '/stage-5-philosophy/': jsTsSidebar(),
  '/project-reports': reportSidebar(),
  '/': jsTsSidebar()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineConfig({
  title: '学习计划教材站',
  description: 'JavaScript / TypeScript、现代前端与 Python 的本地教材站点',
  lang: 'zh-CN',
  base: process.env.BASE_PATH ?? '/',
  cleanUrls: true,
  rewrites: readmeRewrites(),
  lastUpdated: true,
  ignoreDeadLinks: true,
  markdown: {
    html: false,
    lineNumbers: true,
    codeCopyButtonTitle: '复制代码',
    config(md) {
      const defaultFence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const info = token.info.trim().split(/\s+/)[0]
        if (info === 'mermaid') {
          return `<div class="mermaid">${escapeHtml(token.content)}</div>`
        }

        return defaultFence(tokens, idx, options, env, self)
      }
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: 'JS/TS', link: '/README' },
      { text: '现代前端', link: '/stage-modern-frontend/' },
      { text: 'Python', link: '/python/' },
      { text: '项目报告', link: '/project-reports' }
    ],
    sidebar,
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索教材',
                buttonAriaLabel: '搜索教材'
              },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清空搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有找到相关内容',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'ESC'
                }
              }
            }
          }
        }
      }
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },
    footer: {
      message: '由 VitePress 构建，Markdown 教材原地维护。',
      copyright: '本地学习资料'
    }
  }
})
