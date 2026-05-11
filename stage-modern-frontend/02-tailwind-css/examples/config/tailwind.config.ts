// Tailwind CSS 配置文件示例
// 演示如何扩展 Tailwind 的默认配置

import type { Config } from 'tailwindcss'

const config: Config = {
  // 内容路径 (Tailwind 扫描这些文件提取类名)
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],

  // 暗黑模式策略
  darkMode: 'class', // 'media' | 'class' | ['class', '[data-theme="dark"]']
  // 'class': 需要手动添加 dark 类到 <html>
  // 'media': 自动跟随系统的 prefers-color-scheme

  // 主题配置
  theme: {
    // 扩展默认值 (推荐)
    extend: {
      // 自定义颜色
      colors: {
        // 方式一: 简单颜色
        'brand-blue': '#3B82F6',

        // 方式二: 完整色板 (推荐)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // 主色
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // 方式三: 使用 CSS 变量 (配合暗黑模式)
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
      },

      // 自定义间距
      spacing: {
        '128': '32rem',  // 512px
        '144': '36rem',  // 576px
      },

      // 自定义字体
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // 自定义字体大小
      fontSize: {
        '2xs': '0.625rem',  // 10px
      },

      // 自定义圆角
      borderRadius: {
        '4xl': '2rem',
      },

      // 自定义关键帧动画
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // 自定义动画
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },

      // 自定义阴影
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.7)',
      },

      // 自定义背景图
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },

  // 插件
  plugins: [
    // Tailwind 官方插件
    // require('@tailwindcss/forms'),        // 表单样式重置
    // require('@tailwindcss/typography'),   // prose 类 (博客文章样式)
    // require('@tailwindcss/aspect-ratio'), // 宽高比
    // require('@tailwindcss/container-queries'), // 容器查询

    // 自定义插件
    function ({ addUtilities, addComponents, theme }: any) {
      // 添加自定义工具类
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          'text-shadow': '4px 4px 8px rgba(0, 0, 0, 0.2)',
        },
      })

      // 添加自定义组件类
      addComponents({
        '.btn': {
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.semibold'),
          transition: 'all 0.2s',
        },
        '.btn-primary': {
          backgroundColor: theme('colors.brand.500'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.brand.600'),
          },
        },
      })
    },
  ],
}

export default config

/*
 * 配置文件说明
 * 
 * 1. content: 告诉 Tailwind 扫描哪些文件
 *    - 精确的路径配置可以加快构建速度
 *    - 避免使用过于宽泛的路径 (如 './**\/*.tsx')
 * 
 * 2. theme.extend: 扩展默认配置 (推荐)
 *    - 保留 Tailwind 的默认值
 *    - 添加你的自定义值
 * 
 * 3. theme (不带 extend): 完全覆盖默认配置 (慎用)
 *    - 会丢失 Tailwind 的所有默认值
 *    - 只在你想完全控制时使用
 * 
 * 4. plugins: 扩展功能
 *    - 使用官方插件
 *    - 编写自定义插件
 * 
 * 生成色板的工具:
 * - https://uicolors.app/create (推荐)
 * - https://tailwindshades.com
 * 
 * 日志输出
 */
console.log('⚙️ Tailwind 配置文件已加载')
console.log('🎨 自定义品牌色:', '50-950 共 11 个亮度级别')
console.log('🔧 自定义工具类:', ['scrollbar-hide', 'text-shadow'])
console.log('🎬 自定义动画:', ['fadeIn', 'slideIn', 'shimmer'])
