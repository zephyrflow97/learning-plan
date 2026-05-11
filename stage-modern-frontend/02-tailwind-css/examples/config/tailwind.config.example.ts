// Tailwind CSS 自定义配置示例
// 文件路径: tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  // ==========================================
  // 1. 内容路径配置
  // ==========================================
  // Tailwind 会扫描这些文件提取类名
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],

  // ==========================================
  // 2. 暗黑模式策略
  // ==========================================
  darkMode: 'class', // 'class' | 'media' | ['class', '[data-theme="dark"]']
  // 'class': 通过 .dark 类名切换 (推荐,可控性强)
  // 'media': 自动跟随系统的 prefers-color-scheme
  // ['class', '[data-theme="dark"]']: 自定义选择器

  // ==========================================
  // 3. 主题配置
  // ==========================================
  theme: {
    // --- 3.1 完全覆盖默认值 (慎用) ---
    // screens: {
    //   'mobile': '375px',
    //   'tablet': '768px',
    //   'desktop': '1024px',
    // },

    // --- 3.2 扩展默认值 (推荐) ---
    extend: {
      // 颜色系统
      colors: {
        // 方式一:简单颜色
        'brand-blue': '#3B82F6',

        // 方式二:完整色板 (推荐)
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

        // 方式三:使用 CSS 变量 (配合暗黑模式)
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        
        // 语义化颜色
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
      },

      // 间距系统
      spacing: {
        '128': '32rem', // 512px
        '144': '36rem', // 576px
        // 保留所有默认值 (0-96),只添加新的
      },

      // 字体系统
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },

      // 字体大小
      fontSize: {
        '2xs': '0.625rem', // 10px
        '3xs': '0.5rem',   // 8px
      },

      // 字重
      fontWeight: {
        'extra-light': '200',
        'extra-bold': '800',
      },

      // 圆角
      borderRadius: {
        '4xl': '2rem',   // 32px
        '5xl': '2.5rem', // 40px
      },

      // 阴影
      boxShadow: {
        'neon': '0 0 20px rgba(168, 85, 247, 0.6)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },

      // 动画关键帧
      keyframes: {
        // 淡入
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // 滑入
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        // 摇摆
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        // 脉冲缩放
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },

      // 动画定义
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        wiggle: 'wiggle 1s ease-in-out infinite',
        pulseScale: 'pulseScale 2s ease-in-out infinite',
      },

      // 过渡时长
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },

      // 过渡缓动函数
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // 断点 (响应式)
      screens: {
        '3xl': '1920px', // 大屏幕
        '4xl': '2560px', // 超大屏幕
      },

      // 宽高比
      aspectRatio: {
        '4/3': '4 / 3',
        '21/9': '21 / 9',
      },

      // 背景图
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },

  // ==========================================
  // 4. 插件
  // ==========================================
  plugins: [
    // 表单样式重置
    require('@tailwindcss/forms'),
    
    // Typography (prose 类,用于博客文章)
    require('@tailwindcss/typography'),
    
    // Aspect Ratio (已内置在 Tailwind 3.0+,可移除)
    // require('@tailwindcss/aspect-ratio'),

    // 自定义插件:添加工具类
    function ({ addUtilities }) {
      addUtilities({
        // 隐藏滚动条
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // 文字阴影
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          'text-shadow': '4px 4px 8px rgba(0, 0, 0, 0.2)',
        },
      })
    },

    // 自定义插件:添加组件类
    function ({ addComponents }) {
      addComponents({
        // 自定义容器
        '.container-custom': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '640px',
          },
          '@screen md': {
            maxWidth: '768px',
          },
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1280px',
          },
        },
        // 卡片基础样式
        '.card-base': {
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      })
    },

    // 自定义插件:添加变体
    function ({ addVariant }) {
      // 添加 .is-active 状态变体
      addVariant('active-state', '&.is-active')
      // 添加 data-loading 属性变体
      addVariant('loading', '&[data-loading="true"]')
    },
  ],

  // ==========================================
  // 5. 生产环境优化
  // ==========================================
  // 强制包含的类 (即使代码里没用到)
  safelist: [
    // 动态生成的类名 (需要显式声明)
    // 'bg-red-500',
    // 'bg-blue-500',
    // 或使用正则
    // {
    //   pattern: /bg-(red|blue|green)-(500|600)/,
    //   variants: ['hover', 'focus'],
    // },
  ],

  // 排除的文件 (不扫描)
  // content: {
  //   files: ['./app/**/*.{ts,tsx}'],
  //   exclude: ['./node_modules/**', './.next/**'],
  // },
}

export default config

// ==========================================
// 💡 配置使用说明
// ==========================================

console.log('⚙️ Tailwind 配置指南:')
console.log('')
console.log('1. 颜色配置:')
console.log('   - 简单项目: 直接用 Tailwind 默认色')
console.log('   - 有品牌色: 在 extend.colors 添加品牌色板')
console.log('   - 需要暗黑模式: 用 CSS 变量 + hsl() 格式')
console.log('')
console.log('2. 间距配置:')
console.log('   - 默认值够用: 不需要配置')
console.log('   - 需要特殊尺寸: 在 extend.spacing 添加')
console.log('')
console.log('3. 动画配置:')
console.log('   - 内置动画: spin, pulse, bounce, ping')
console.log('   - 自定义: 在 extend.keyframes 定义,extend.animation 引用')
console.log('')
console.log('4. 插件:')
console.log('   - @tailwindcss/forms: 美化表单元素')
console.log('   - @tailwindcss/typography: 博客文章排版')
console.log('   - 自定义插件: addUtilities, addComponents, addVariant')
console.log('')
console.log('5. 性能优化:')
console.log('   - content 路径尽量精确 (避免扫描 node_modules)')
console.log('   - safelist 只在必要时使用 (会增加 CSS 体积)')
console.log('   - 避免动态字符串拼接类名 (用完整类名或 safelist)')
