/**
 * @file index.ts
 * @description @learn/ts-toolkit 统一导出入口
 * @module @learn/ts-toolkit
 *
 * 各模块按功能领域组织, 支持整体导入或按需子路径导入:
 *   import { ok, err, pipe } from '@learn/ts-toolkit';
 *   import { ok, err }      from '@learn/ts-toolkit/result';
 *   import { pipe }          from '@learn/ts-toolkit/fp';
 */

// ============================================================
// Result — 函数式错误处理
// ============================================================
export {
  type Result, type Ok, type Err,
  ok, err,
  tryCatch, tryCatchAsync,
  map, flatMap, mapErr,
  unwrapOr, unwrap,
  isOk, isErr, all,
} from './result/result.js';

// ============================================================
// Validate — Proxy 验证器 + 正则模式
// ============================================================
export {
  createValidator, createReadonly, createTracked,
  ValidationError,
  type FieldSchema, type ValidationSchema, type ValidationRule,
} from './validate/validator.js';

export { Patterns, Validators } from './validate/patterns.js';

// ============================================================
// FP — 函数式编程工具
// ============================================================
export { compose, pipe, pipeTyped, composeTyped, pipeAsync, composeAsync } from './fp/compose.js';
export { curry, partial, partialRight, uncurry, type Curried } from './fp/curry.js';
export { memoize, memoizeTTL, memoizeWeak, type MemoizeOptions, type MemoizedFunction } from './fp/memoize.js';

// ============================================================
// Type Utils — 品牌类型 & 工具类型
// ============================================================
export {
  type Brand, brand, unsafeBrand, unbrand,
  type PositiveInt, createPositiveInt,
  type Percentage, createPercentage,
  type MoneyInCents, createMoneyInCents,
  type NonEmptyString, createNonEmptyString,
  type EmailBrand, createEmail,
  type URLBrand, createURL,
  type ISODateString, createISODateString,
  type Timestamp, createTimestamp,
  type UserId, createUserId,
  type OrderId, createOrderId,
  type ProductId, createProductId,
} from './type-utils/brand.js';

export {
  type DeepReadonly, type DeepMutable, type DeepPartial, type DeepRequired,
  type Prettify,
  type PickByType, type OmitByType,
  type OptionalKeys, type RequiredKeys, type MutableKeys, type ReadonlyKeys,
  type UnionToIntersection, type TupleToUnion,
  type Nullable, type AwaitedType,
} from './type-utils/deep-readonly.js';

// ============================================================
// Event Emitter — 类型安全事件系统
// ============================================================
export {
  EventEmitter, createEventEmitter, onceAsync, eventStream,
  type EventListener, type EventMap,
} from './event-emitter/emitter.js';

// ============================================================
// Task Runner — 并发控制
// ============================================================
export {
  TaskQueue, pLimit, retry, batch, throttle, debounce,
  type Task, type TaskResult, type TaskQueueOptions,
} from './task-runner/task-queue.js';

export {
  WorkerPool, createInlineWorker, parallel,
  type WorkerTask, type WorkerPoolOptions,
} from './task-runner/worker-pool.js';

// ============================================================
// 库元信息
// ============================================================
export const VERSION = '1.0.0';

export const LIBRARY_INFO = {
  name: '@learn/ts-toolkit',
  version: VERSION,
  description: '综合运用 JS/TS 核心深化学习的轻量级工具库',
  modules: ['result', 'validate', 'fp', 'type-utils', 'event-emitter', 'task-runner'] as const,
};
