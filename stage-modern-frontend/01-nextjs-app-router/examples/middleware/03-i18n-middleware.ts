/**
 * 国际化(i18n)中间件示例
 * 
 * 这个文件展示了如何在中间件中实现国际化路由:
 * - 自动语言检测(Accept-Language Header)
 * - Cookie 偏好记忆
 * - URL 重定向到正确的语言版本
 * - 支持多种语言
 * 
 * URL 结构:
 * - /en/about → 英文版
 * - /zh/about → 中文版
 * - /ja/about → 日文版
 * - /about → 自动检测并重定向
 * 
 * 使用位置: middleware.ts (项目根目录)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==================== 配置 ====================

/**
 * 支持的语言列表
 */
export const locales = ['en', 'zh', 'ja', 'es', 'fr'] as const;
export type Locale = (typeof locales)[number];

/**
 * 默认语言
 */
export const defaultLocale: Locale = 'en';

/**
 * 语言名称映射(用于显示)
 */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  es: 'Español',
  fr: 'Français',
};

/**
 * Cookie 名称
 */
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Cookie 过期时间(365 天)
 */
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// ==================== 辅助函数 ====================

/**
 * 从路径中提取语言代码
 * 
 * @param pathname - URL 路径
 * @returns 语言代码或 null
 * 
 * 例如:
 * - /en/about → 'en'
 * - /zh/blog/post → 'zh'
 * - /about → null
 */
function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const firstSegment = segments[1];

  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return null;
}

/**
 * 移除路径中的语言前缀
 * 
 * @param pathname - URL 路径
 * @returns 无语言前缀的路径
 * 
 * 例如:
 * - /en/about → /about
 * - /zh/blog/post → /blog/post
 */
function removeLocaleFromPathname(pathname: string, locale: Locale): string {
  return pathname.replace(`/${locale}`, '') || '/';
}

/**
 * 从 Accept-Language Header 中提取首选语言
 * 
 * @param acceptLanguage - Accept-Language Header 值
 * @returns 语言代码
 * 
 * Accept-Language 格式:
 * - "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7"
 * - "zh-CN,zh;q=0.9"
 * 
 * 解析优先级(q 值越大优先级越高)
 */
function parseAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    console.log('🟡 [i18n] 未找到 Accept-Language,使用默认:', defaultLocale);
    return defaultLocale;
  }

  console.log('🟡 [i18n] Accept-Language:', acceptLanguage);

  // 解析 Accept-Language Header
  // 例如: "zh-CN,zh;q=0.9,en;q=0.8" → [{lang: 'zh-CN', q: 1}, {lang: 'zh', q: 0.9}, ...]
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [language, qValue] = lang.trim().split(';q=');
      return {
        language: language.split('-')[0].toLowerCase(), // zh-CN → zh
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q); // 按优先级排序

  console.log('🟡 [i18n] 解析后的语言列表:', languages);

  // 找到第一个支持的语言
  for (const { language } of languages) {
    if (locales.includes(language as Locale)) {
      console.log('🟡 [i18n] 检测到支持的语言:', language);
      return language as Locale;
    }
  }

  console.log('🟡 [i18n] 未找到支持的语言,使用默认:', defaultLocale);
  return defaultLocale;
}

/**
 * 获取用户首选语言
 * 
 * 优先级:
 * 1. Cookie 中的偏好设置
 * 2. Accept-Language Header
 * 3. 默认语言
 */
function getPreferredLocale(request: NextRequest): Locale {
  // 1. 从 Cookie 读取
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    console.log('🟡 [i18n] 从 Cookie 读取语言:', cookieLocale);
    return cookieLocale as Locale;
  }

  // 2. 从 Accept-Language Header 读取
  const acceptLanguage = request.headers.get('accept-language');
  return parseAcceptLanguage(acceptLanguage);
}

// ==================== 主中间件函数 ====================

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  console.log('🟡 [i18n Middleware] 请求:', pathname);

  // ==================== 1. 跳过特殊路径 ====================

  // 跳过 API 路由和静态资源(已经在 matcher 中排除,这里作为双重保险)
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    console.log('🟡 [i18n] 跳过特殊路径');
    return NextResponse.next();
  }

  // ==================== 2. 检查 URL 是否已包含语言代码 ====================

  const localeInPath = getLocaleFromPathname(pathname);

  if (localeInPath) {
    console.log('🟡 [i18n] URL 已包含语言代码:', localeInPath);
    
    // URL 已经包含语言代码,更新 Cookie 并继续
    const response = NextResponse.next();
    
    // 更新 Cookie(记住用户选择的语言)
    response.cookies.set(LOCALE_COOKIE_NAME, localeInPath, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    // 添加 Header(传递给 Server Component)
    response.headers.set('X-User-Locale', localeInPath);

    return response;
  }

  // ==================== 3. URL 不包含语言代码,自动检测并重定向 ====================

  console.log('🟡 [i18n] URL 不包含语言代码,开始自动检测');

  const preferredLocale = getPreferredLocale(request);

  console.log('🟡 [i18n] 检测到首选语言:', preferredLocale);

  // 构建新的 URL(添加语言前缀)
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${preferredLocale}${pathname}`;

  console.log('🟡 [i18n] 重定向到:', newUrl.pathname);

  // 重定向到带语言前缀的 URL
  const response = NextResponse.redirect(newUrl);

  // 设置 Cookie(记住用户偏好)
  response.cookies.set(LOCALE_COOKIE_NAME, preferredLocale, {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}

// ==================== Matcher 配置 ====================

export const config = {
  matcher: [
    /*
     * 匹配所有路径,除了:
     * - API 路由 (/api/*)
     * - Next.js 静态资源 (_next/static, _next/image)
     * - 静态文件(包含 . 的路径,如 favicon.ico, robots.txt)
     */
    '/((?!api|_next/static|_next/image|.*\\.).*)',
  ],
};

// ==================== 使用说明 ====================

/**
 * 1. 文件结构:
 * 
 * app/
 *   [locale]/
 *     layout.tsx       ← 根布局(包含语言切换器)
 *     page.tsx         ← 首页
 *     about/
 *       page.tsx       ← 关于页面
 *     blog/
 *       [slug]/
 *         page.tsx     ← 博客文章
 * 
 * 
 * 2. 根布局(app/[locale]/layout.tsx):
 * 
 * import { notFound } from 'next/navigation';
 * import { locales, type Locale } from '@/middleware';
 * 
 * export async function generateStaticParams() {
 *   return locales.map(locale => ({ locale }));
 * }
 * 
 * export default function LocaleLayout({
 *   children,
 *   params,
 * }: {
 *   children: React.ReactNode;
 *   params: { locale: Locale };
 * }) {
 *   // 验证语言代码
 *   if (!locales.includes(params.locale)) {
 *     notFound();
 *   }
 * 
 *   return (
 *     <html lang={params.locale}>
 *       <body>
 *         <header>
 *           <LanguageSwitcher currentLocale={params.locale} />
 *         </header>
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * 
 * 
 * 3. 语言切换器组件:
 * 
 * 'use client';
 * 
 * import Link from 'next/link';
 * import { usePathname } from 'next/navigation';
 * import { locales, localeNames, type Locale } from '@/middleware';
 * 
 * export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
 *   const pathname = usePathname();
 * 
 *   // 移除当前语言前缀
 *   const pathnameWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
 * 
 *   return (
 *     <div>
 *       {locales.map(locale => (
 *         <Link
 *           key={locale}
 *           href={`/${locale}${pathnameWithoutLocale}`}
 *           className={locale === currentLocale ? 'active' : ''}
 *         >
 *           {localeNames[locale]}
 *         </Link>
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * 
 * 4. 获取翻译文本:
 * 
 * // lib/i18n.ts
 * import en from '@/locales/en.json';
 * import zh from '@/locales/zh.json';
 * 
 * const dictionaries = { en, zh };
 * 
 * export function getDictionary(locale: Locale) {
 *   return dictionaries[locale];
 * }
 * 
 * // app/[locale]/page.tsx
 * import { getDictionary } from '@/lib/i18n';
 * 
 * export default async function HomePage({ params }: { params: { locale: Locale } }) {
 *   const dict = getDictionary(params.locale);
 * 
 *   return (
 *     <div>
 *       <h1>{dict.home.title}</h1>
 *       <p>{dict.home.description}</p>
 *     </div>
 *   );
 * }
 * 
 * 
 * 5. 翻译文件(locales/en.json):
 * 
 * {
 *   "home": {
 *     "title": "Welcome",
 *     "description": "This is the homepage"
 *   },
 *   "about": {
 *     "title": "About Us"
 *   }
 * }
 * 
 * 
 * 6. 翻译文件(locales/zh.json):
 * 
 * {
 *   "home": {
 *     "title": "欢迎",
 *     "description": "这是首页"
 *   },
 *   "about": {
 *     "title": "关于我们"
 *   }
 * }
 */

// ==================== 高级用法 ====================

/**
 * 1. 支持多地区(en-US vs en-GB):
 * 
 * const locales = ['en-US', 'en-GB', 'zh-CN', 'zh-TW'] as const;
 * 
 * 
 * 2. 子路径国际化(不使用语言前缀):
 * 
 * 根据子域名区分语言:
 * - en.example.com → 英文
 * - zh.example.com → 中文
 * 
 * const hostname = request.headers.get('host') || '';
 * const locale = hostname.startsWith('zh.') ? 'zh' : 'en';
 * 
 * 
 * 3. 基于地理位置的默认语言:
 * 
 * const country = request.geo?.country;
 * 
 * const countryToLocale: Record<string, Locale> = {
 *   CN: 'zh',
 *   US: 'en',
 *   JP: 'ja',
 * };
 * 
 * const defaultLocale = countryToLocale[country || ''] || 'en';
 * 
 * 
 * 4. 语言特定的重定向:
 * 
 * // 中国用户访问 /pricing,重定向到 /cn/pricing
 * if (country === 'CN' && pathname === '/pricing') {
 *   newUrl.pathname = '/cn/pricing';
 *   return NextResponse.redirect(newUrl);
 * }
 */

// ==================== 最佳实践 ====================

/**
 * 1. **SEO 优化**:
 *    - 使用 <link rel="alternate" hreflang="..."> 标签
 *    - 在 sitemap.xml 中包含所有语言版本
 * 
 *    <link rel="alternate" hreflang="en" href="https://example.com/en/about" />
 *    <link rel="alternate" hreflang="zh" href="https://example.com/zh/about" />
 * 
 * 2. **性能优化**:
 *    - 使用 generateStaticParams 预渲染所有语言版本
 *    - 翻译文件按需加载(不要全部打包到客户端)
 * 
 * 3. **用户体验**:
 *    - 第一次访问自动检测语言
 *    - 之后记住用户选择(Cookie)
 *    - 提供明显的语言切换器
 * 
 * 4. **内容管理**:
 *    - 使用 JSON 文件管理翻译(简单项目)
 *    - 使用 CMS 或翻译管理平台(复杂项目,如 Crowdin, Lokalise)
 *    - 使用 next-intl 或 react-i18next 库(更强大的功能)
 * 
 * 5. **URL 结构**:
 *    - ✅ 推荐: /en/about, /zh/about (语言前缀)
 *    - ❌ 不推荐: /about?lang=en (查询参数,SEO 不友好)
 */

// ==================== 常见问题 ====================

/**
 * Q: 为什么不使用 next-i18next 或 react-i18next?
 * A: App Router 的 Server Components 不支持这些基于 Context 的库。
 *    推荐使用 next-intl 或自己实现简单的字典系统。
 * 
 * Q: 如何处理右到左(RTL)语言(如阿拉伯语)?
 * A: 在 <html> 标签添加 dir 属性:
 *    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
 * 
 * Q: 如何处理动态内容的翻译(如数据库内容)?
 * A: 1. 数据库存储多语言字段(post_title_en, post_title_zh)
 *    2. 使用独立的翻译表(posts_translations)
 *    3. 使用 CMS 的多语言功能
 * 
 * Q: 如何处理日期、数字、货币的本地化?
 * A: 使用 Intl API:
 *    new Intl.DateTimeFormat(locale).format(date);
 *    new Intl.NumberFormat(locale).format(number);
 *    new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(price);
 */
