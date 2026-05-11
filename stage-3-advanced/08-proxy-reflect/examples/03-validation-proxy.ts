/**
 * @file 03-validation-proxy.ts
 * @description 用 Proxy 实现运行时类型检查和数据验证
 * @prerequisites Stage 2 Ch01 TypeScript 基础, Stage 2 Ch08 错误处理
 * @related examples/01-proxy-traps.ts
 */

console.log('[INFO] === 数据验证代理 (Validation Proxy) ===\n');

// ============================================================================
// 1. 基础类型验证
// ============================================================================
console.log('[1] 基础类型验证\n');

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

type TypeName = 'string' | 'number' | 'boolean' | 'object' | 'array';

function createTypeValidator<T extends object>(
  schema: Record<string, TypeName>
): T {
  return new Proxy({} as T, {
    set(target, prop, value) {
      const expected = schema[String(prop)];
      if (!expected) {
        throw new ValidationError(`未知属性: ${String(prop)}`);
      }
      const actual = Array.isArray(value) ? 'array' : typeof value;
      if (actual !== expected) {
        throw new ValidationError(
          `属性 ${String(prop)} 期望 ${expected}, 实际 ${actual}`
        );
      }
      console.log(`  [VALID] ${String(prop)}: ${expected} = ${value}`);
      return Reflect.set(target, prop, value);
    }
  });
}

interface User { name: string; age: number; isActive: boolean; }

const user = createTypeValidator<User>({
  name: 'string', age: 'number', isActive: 'boolean'
});

user.name = 'Alice';
user.age = 30;
user.isActive = true;

const typeTests = [
  { fn: () => { (user as any).age = '30'; }, desc: '类型错误' },
  { fn: () => { (user as any).email = 'a@b.c'; }, desc: '未知属性' }
];

typeTests.forEach(({ fn, desc }) => {
  try { fn(); }
  catch (e) { console.error(`  [ERROR] ${desc}:`, (e as Error).message); }
});

console.log('');

// ============================================================================
// 2. 高级验证规则
// ============================================================================
console.log('[2] 高级验证规则\n');

type ValidationRule = {
  type: TypeName;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: readonly string[];
  custom?: (value: any) => boolean | string;
};

function createAdvancedValidator<T extends object>(
  schema: Record<keyof T & string, ValidationRule>
): T {
  return new Proxy({} as T, {
    set(target, prop, value) {
      const rule = schema[String(prop) as keyof T & string];
      if (!rule) throw new ValidationError(`未知属性: ${String(prop)}`);

      // 1. required
      if (rule.required && (value === undefined || value === null)) {
        throw new ValidationError(`${String(prop)} 是必需的`);
      }

      // 2. 类型
      const actual = Array.isArray(value) ? 'array' : typeof value;
      if (actual !== rule.type) {
        throw new ValidationError(`${String(prop)} 期望 ${rule.type}, 实际 ${actual}`);
      }

      // 3. 字符串约束
      if (rule.type === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength)
          throw new ValidationError(`${String(prop)} 长度至少 ${rule.minLength}`);
        if (rule.maxLength !== undefined && value.length > rule.maxLength)
          throw new ValidationError(`${String(prop)} 长度最多 ${rule.maxLength}`);
        if (rule.pattern && !rule.pattern.test(value))
          throw new ValidationError(`${String(prop)} 不匹配模式 ${rule.pattern}`);
      }

      // 4. 数字约束
      if (rule.type === 'number') {
        if (rule.min !== undefined && value < rule.min)
          throw new ValidationError(`${String(prop)} 不能小于 ${rule.min}`);
        if (rule.max !== undefined && value > rule.max)
          throw new ValidationError(`${String(prop)} 不能大于 ${rule.max}`);
      }

      // 5. 枚举
      if (rule.enum && !rule.enum.includes(value))
        throw new ValidationError(`${String(prop)} 必须是 [${rule.enum}] 之一`);

      // 6. 自定义
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true)
          throw new ValidationError(typeof result === 'string' ? result : `${String(prop)} 验证失败`);
      }

      console.log(`  [VALID] ${String(prop)} = ${JSON.stringify(value)}`);
      return Reflect.set(target, prop, value);
    }
  });
}

interface Product { name: string; price: number; category: string; stock: number; }

const product = createAdvancedValidator<Product>({
  name:     { type: 'string', required: true, minLength: 3, maxLength: 50 },
  price:    { type: 'number', required: true, min: 0, max: 1000000 },
  category: { type: 'string', enum: ['Electronics', 'Clothing', 'Food', 'Books'] as const },
  stock:    { type: 'number', min: 0, custom: v => Number.isInteger(v) || '库存必须是整数' }
});

product.name = 'Laptop';
product.price = 1200;
product.category = 'Electronics';
product.stock = 50;

const advTests = [
  { fn: () => { (product as any).name = 'AB'; }, desc: '名称过短' },
  { fn: () => { (product as any).price = -100; }, desc: '价格为负' },
  { fn: () => { (product as any).category = 'Unknown'; }, desc: '无效枚举' },
  { fn: () => { (product as any).stock = 10.5; }, desc: '库存非整数' }
];

advTests.forEach(({ fn, desc }) => {
  try { fn(); }
  catch (e) { console.error(`  [ERROR] ${desc}:`, (e as Error).message); }
});

console.log('');

// ============================================================================
// 3. 正则验证 — 邮箱、手机号
// ============================================================================
console.log('[3] 正则验证\n');

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^1[3-9]\d{9}$/,
  url:   /^https?:\/\/.+/
} as const;

interface Contact { email: string; phone: string; website: string; }

const contact = createAdvancedValidator<Contact>({
  email:   { type: 'string', required: true, pattern: PATTERNS.email },
  phone:   { type: 'string', required: true, pattern: PATTERNS.phone },
  website: { type: 'string', pattern: PATTERNS.url }
});

contact.email = 'alice@example.com';
contact.phone = '13800138000';
contact.website = 'https://example.com';

try { (contact as any).email = 'invalid-email'; }
catch (e) { console.error('  [ERROR]', (e as Error).message); }

console.log('');

// ============================================================================
// 4. 只读 + 白名单代理
// ============================================================================
console.log('[4] 只读 + 白名单代理\n');

function createReadOnlyProxy<T extends object>(
  data: T,
  allowedKeys: Set<keyof T>
): T {
  return new Proxy({ ...data }, {
    get(target, prop) {
      if (!allowedKeys.has(prop as keyof T)) {
        console.warn(`  [WARN] 受限属性: ${String(prop)}`);
        return undefined;
      }
      return Reflect.get(target, prop);
    },
    set() { throw new ValidationError('对象只读'); },
    deleteProperty() { throw new ValidationError('对象只读'); },
    ownKeys() { return Array.from(allowedKeys) as (string | symbol)[]; },
    getOwnPropertyDescriptor(target, prop) {
      if (!allowedKeys.has(prop as keyof T)) return undefined;
      return Reflect.getOwnPropertyDescriptor(target, prop);
    }
  });
}

const config = createReadOnlyProxy(
  { apiKey: 'secret', apiUrl: 'https://api.test.com', debug: true },
  new Set(['apiUrl', 'debug'] as const)
);

console.log('  config.apiUrl:', config.apiUrl);   // 允许
console.log('  config.debug:', config.debug);     // 允许
console.log('  config.apiKey:', config.apiKey);    // 受限

try { (config as any).debug = false; }
catch (e) { console.error('  [ERROR]', (e as Error).message); }

console.log('');

// ============================================================================
// 5. 实战：表单验证器
// ============================================================================
console.log('[5] 实战：表单验证器\n');

class FormValidator {
  private fields: Record<string, { value: any; error: string | null; touched: boolean }> = {};
  private rules: Record<string, ValidationRule>;

  constructor(fieldNames: string[], rules: Record<string, ValidationRule>) {
    this.rules = rules;
    fieldNames.forEach(f => { this.fields[f] = { value: '', error: null, touched: false }; });
  }

  setValue(field: string, value: any): void {
    const entry = this.fields[field];
    if (!entry) return;
    entry.value = value;
    entry.touched = true;
    entry.error = this.validate(field, value);
    console.log(`  [FORM] ${field} = "${value}", error: ${entry.error ?? 'null'}`);
  }

  private validate(field: string, value: any): string | null {
    const rule = this.rules[field];
    if (!rule) return null;
    if (rule.required && !value) return '必填';
    if (rule.type === 'string' && rule.minLength && value.length < rule.minLength)
      return `长度至少 ${rule.minLength}`;
    if (rule.type === 'string' && rule.pattern && !rule.pattern.test(value))
      return '格式不正确';
    return null;
  }

  isValid(): boolean { return Object.values(this.fields).every(f => f.error === null); }
  getErrors(): Record<string, string | null> {
    const out: Record<string, string | null> = {};
    Object.entries(this.fields).forEach(([k, v]) => { out[k] = v.error; });
    return out;
  }
}

const form = new FormValidator(['username', 'email'], {
  username: { type: 'string', required: true, minLength: 3 },
  email:    { type: 'string', required: true, pattern: PATTERNS.email }
});

form.setValue('username', 'alice');
form.setValue('email', 'alice@test.com');
form.setValue('username', 'ab');
form.setValue('email', 'bad');

console.log('  isValid:', form.isValid());
console.log('  errors:', form.getErrors());

console.log('\n[INFO] === 示例结束 ===');
