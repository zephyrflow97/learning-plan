// Tailwind CSS 自定义颜色配置
// tailwind.config.ts 示例

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 方式一：简单颜色
        'brand-blue': '#3B82F6',
        
        // 方式二：完整色板(推荐)
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
        
        // 方式三：使用 CSS 变量(配合暗黑模式)
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        
        // 紫色系示例
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
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
      
      // 自定义字号
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
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      
      // 自定义动画
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};

export default config;

// ===== 使用示例 =====

/*
// 使用完整色板
<div className="bg-brand-500 hover:bg-brand-600">
  Brand Color
</div>

// 使用 CSS 变量
<div className="bg-primary text-primary-foreground">
  Primary Button
</div>

// 使用自定义动画
<div className="animate-fadeIn">
  Fade in content
</div>

// 使用自定义间距
<div className="p-128">
  Large padding (512px)
</div>
*/

// ===== CSS 变量定义 (globals.css) =====

/*
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
  }

  .dark {
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
  }
}
*/

console.log('✅ 自定义颜色配置完成');
console.log('🎨 生成色板工具:');
console.log('  - https://uicolors.app/create');
console.log('  - https://tailwindshades.com');
console.log('💡 推荐使用 HSL 格式,方便暗黑模式调整');
