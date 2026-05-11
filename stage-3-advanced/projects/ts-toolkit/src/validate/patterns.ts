/**
 * @file patterns.ts
 * @description 常用正则表达式模式集合 — 覆盖邮箱/手机号/URL/日期/密码等
 * @module validate
 *
 * 设计原则:
 *   - 每个正则都附带 JSDoc 说明其匹配规则
 *   - 提供 Validators 函数工厂以便直接调用
 *   - 用 as const 保证模式对象不可变
 */

// ============================================================
// 1. 正则模式常量
// ============================================================

export const Patterns = {
  /** 邮箱地址 */
  email: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,

  /** 中国大陆手机号 (1 开头 11 位) */
  phoneChina: /^1[3-9]\d{9}$/,

  /** HTTP/HTTPS URL */
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,

  /** IPv4 地址 */
  ipv4: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,

  /** ISO 日期 YYYY-MM-DD */
  dateISO: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

  /** 24 小时制时间 HH:MM:SS */
  time24: /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,

  /** 信用卡号 (Visa/MC/Amex) */
  creditCard: /^(?:4\d{12}(?:\d{3})?|5[1-5]\d{14}|3[47]\d{13})$/,

  /** 16 进制颜色 #RGB / #RRGGBB */
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

  /** 用户名 3-16 位字母数字下划线 */
  username: /^[a-zA-Z0-9_]{3,16}$/,

  /** 强密码 ≥8 位, 含大小写+数字 */
  passwordStrong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,

  /** 纯中文 */
  chinese: /^[\u4e00-\u9fa5]+$/,

  /** 中国身份证号 18 位 */
  idCardChina: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,

  /** 中国邮政编码 6 位 */
  postalCodeChina: /^\d{6}$/,

  /** Markdown 链接 [text](url) */
  markdownLink: /\[([^\]]+)\]\(([^)]+)\)/g,

  /** HTML 标签 */
  htmlTag: /<\/?[\w\s="/.':;#-/]+>/gi,

  /** 整数 (含负数) */
  integer: /^-?\d+$/,

  /** 正整数 */
  positiveInteger: /^\d+$/,

  /** Base64 */
  base64: /^[A-Za-z0-9+/]*={0,2}$/,
} as const;

// ============================================================
// 2. 验证函数工厂
// ============================================================

export const Validators = {
  isEmail: (v: string) => Patterns.email.test(v),
  isPhoneChina: (v: string) => Patterns.phoneChina.test(v),
  isUrl: (v: string) => Patterns.url.test(v),
  isIPv4: (v: string) => Patterns.ipv4.test(v),
  isDateISO: (v: string) => Patterns.dateISO.test(v),
  isUsername: (v: string) => Patterns.username.test(v),
  isPasswordStrong: (v: string) => Patterns.passwordStrong.test(v),
  isIdCardChina: (v: string) => Patterns.idCardChina.test(v),
  isHexColor: (v: string) => Patterns.hexColor.test(v),
  isLengthBetween: (min: number, max: number) => (v: string) =>
    v.length >= min && v.length <= max,
  isNumberBetween: (min: number, max: number) => (v: number) =>
    v >= min && v <= max,
} as const;
