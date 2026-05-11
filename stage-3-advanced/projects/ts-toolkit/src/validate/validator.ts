/**
 * @file validator.ts
 * @description 基于 Proxy 的运行时验证器 — 拦截对象属性赋值, 实施类型检查与业务规则
 * @module validate
 *
 * 核心原理:
 *   - createValidator<T>(schema) 在创建时验证初始数据
 *   - 返回的对象被 Proxy 包裹, 后续赋值也会触发验证
 *   - Proxy 的 set trap 拦截每次属性写入
 *   - Proxy 的 deleteProperty trap 阻止删除必填字段
 */

import { Patterns } from './patterns.js';

// ============================================================
// 1. 类型定义
// ============================================================

/** 自定义验证规则 */
export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

/** 单个字段的验证配置 */
export interface FieldSchema {
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: ValidationRule[];
}

/** 整个对象的验证模式 */
export type ValidationSchema<T extends Record<string, unknown>> = {
  [K in keyof T]?: FieldSchema;
};

// ============================================================
// 2. 验证错误类
// ============================================================

/** 验证失败时抛出的错误 */
export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(`Validation failed for field "${field}": ${message}`);
    this.name = 'ValidationError';
  }
}

// ============================================================
// 3. 核心: createValidator
// ============================================================

/**
 * 创建基于 Proxy 的验证器
 *
 * @param schema  各字段验证规则
 * @param options strict=true 时禁止 schema 中未定义的字段
 * @returns 验证函数: 传入数据 → 返回被 Proxy 包裹的合法对象
 *
 * @example
 * ```ts
 * const validateUser = createValidator<User>({
 *   name:  { type: 'string', required: true, min: 2, max: 50 },
 *   age:   { type: 'number', min: 0, max: 120 },
 *   email: { type: 'string', required: true, pattern: Patterns.email },
 * });
 *
 * const user = validateUser({ name: 'Alice', age: 25, email: 'a@b.c' });
 * user.age = -1; // throws ValidationError
 * ```
 */
export function createValidator<T extends Record<string, unknown>>(
  schema: ValidationSchema<T>,
  options: { strict?: boolean } = {},
): (data: T) => T {
  const { strict = false } = options;

  return (data: T): T => {
    console.log('[Validator] 开始验证初始数据...');

    // ---- 验证初始数据 ----
    for (const [key, value] of Object.entries(data)) {
      const fieldSchema = schema[key as keyof T];
      if (fieldSchema) {
        validateField(key, value, fieldSchema);
      } else if (strict) {
        throw new ValidationError(key, 'Field not defined in schema');
      }
    }

    // ---- 检查必填字段 ----
    for (const [key, fieldSchema] of Object.entries(schema)) {
      if (fieldSchema?.required && !(key in (data as Record<string, unknown>))) {
        throw new ValidationError(key, 'Required field is missing');
      }
    }

    console.log('[Validator] 初始验证通过, 创建 Proxy 拦截后续赋值');

    // ---- 创建 Proxy ----
    return new Proxy(data, {
      set(target, prop, value): boolean {
        if (typeof prop === 'string') {
          const fieldSchema = schema[prop as keyof T];
          if (fieldSchema) {
            console.log(`[Proxy set] 拦截字段 "${prop}" 赋值:`, value);
            validateField(prop, value, fieldSchema);
          } else if (strict) {
            throw new ValidationError(prop, 'Field not defined in schema');
          }
        }
        (target as Record<string | symbol, unknown>)[prop] = value;
        return true;
      },

      deleteProperty(target, prop): boolean {
        if (typeof prop === 'string') {
          const fieldSchema = schema[prop as keyof T];
          if (fieldSchema?.required) {
            throw new ValidationError(prop, 'Cannot delete required field');
          }
        }
        delete (target as Record<string | symbol, unknown>)[prop];
        return true;
      },
    });
  };
}

// ============================================================
// 4. 字段验证逻辑 (内部)
// ============================================================

function validateField(field: string, value: unknown, schema: FieldSchema): void {
  // 类型检查
  if (schema.type) {
    const actual = Array.isArray(value) ? 'array' : typeof value;
    if (actual !== schema.type) {
      throw new ValidationError(field, `Expected type ${schema.type}, got ${actual}`);
    }
  }

  // 字符串约束
  if (typeof value === 'string') {
    if (schema.min !== undefined && value.length < schema.min) {
      throw new ValidationError(field, `String length must be at least ${schema.min}`);
    }
    if (schema.max !== undefined && value.length > schema.max) {
      throw new ValidationError(field, `String length must be at most ${schema.max}`);
    }
    if (schema.pattern && !schema.pattern.test(value)) {
      throw new ValidationError(field, `String does not match pattern ${schema.pattern}`);
    }
  }

  // 数字约束
  if (typeof value === 'number') {
    if (schema.min !== undefined && value < schema.min) {
      throw new ValidationError(field, `Number must be at least ${schema.min}`);
    }
    if (schema.max !== undefined && value > schema.max) {
      throw new ValidationError(field, `Number must be at most ${schema.max}`);
    }
  }

  // 数组约束
  if (Array.isArray(value)) {
    if (schema.min !== undefined && value.length < schema.min) {
      throw new ValidationError(field, `Array length must be at least ${schema.min}`);
    }
    if (schema.max !== undefined && value.length > schema.max) {
      throw new ValidationError(field, `Array length must be at most ${schema.max}`);
    }
  }

  // 自定义规则
  if (schema.custom) {
    for (const rule of schema.custom) {
      if (!rule.validate(value)) {
        throw new ValidationError(field, rule.message);
      }
    }
  }
}

// ============================================================
// 5. 辅助 Proxy: createReadonly / createTracked
// ============================================================

/** 创建只读 Proxy — 阻止任何修改操作 */
export function createReadonly<T extends object>(obj: T): Readonly<T> {
  console.log('[Validator] 创建只读 Proxy');
  return new Proxy(obj, {
    set(): boolean {
      throw new Error('Cannot modify readonly object');
    },
    deleteProperty(): boolean {
      throw new Error('Cannot delete property from readonly object');
    },
  }) as Readonly<T>;
}

/** 创建带变更追踪的 Proxy */
export function createTracked<T extends Record<string, unknown>>(obj: T) {
  const changes = new Map<keyof T, { old: unknown; new: unknown }>();
  console.log('[Validator] 创建变更追踪 Proxy');

  const proxy = new Proxy(obj, {
    set(target, prop, value): boolean {
      const oldVal = target[prop as keyof T];
      if (oldVal !== value) {
        changes.set(prop as keyof T, { old: oldVal, new: value });
        console.log(`[Tracked] 字段 "${String(prop)}" 变更: ${String(oldVal)} → ${String(value)}`);
      }
      (target as Record<string | symbol, unknown>)[prop] = value;
      return true;
    },
  });

  return {
    proxy,
    getChanges: () => Object.fromEntries(changes),
    clearChanges: () => changes.clear(),
    hasChanges: () => changes.size > 0,
  };
}

// 重新导出 Patterns 方便外部统一导入
export { Patterns, Validators } from './patterns.js';
