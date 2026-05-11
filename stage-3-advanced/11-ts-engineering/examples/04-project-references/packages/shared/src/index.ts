/**
 * @file shared/src/index.ts
 * @description 共享类型定义和工具函数 — 被 api 和 web 包依赖
 */

// === 共享类型 ===

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  publishedAt: Date | null;
  tags: string[];
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: string;
  timestamp: number;
}

// === 共享常量 ===

export const APP_NAME = 'MyApp';
export const API_VERSION = 'v1';
export const MAX_PAGE_SIZE = 100;

// === 共享工具函数 ===

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function createResponse<T>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
    timestamp: Date.now(),
  };
}

export function createErrorResponse(error: string): ApiResponse<null> {
  return {
    ok: false,
    data: null,
    error,
    timestamp: Date.now(),
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}
