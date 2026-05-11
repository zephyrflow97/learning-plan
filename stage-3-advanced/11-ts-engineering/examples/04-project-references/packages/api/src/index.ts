/**
 * @file api/src/index.ts
 * @description API 服务入口 — 使用 shared 包的类型和工具函数
 */

import {
  User,
  Post,
  ApiResponse,
  createResponse,
  createErrorResponse,
  formatDate,
  APP_NAME,
  API_VERSION,
} from '../../shared/src/index';

// === API 路由处理 ===

const mockUsers: User[] = [
  {
    id: 'u-001',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'u-002',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'editor',
    createdAt: new Date('2024-03-20'),
  },
];

export function getUsers(): ApiResponse<User[]> {
  return createResponse(mockUsers);
}

export function getUserById(id: string): ApiResponse<User | null> {
  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    return createErrorResponse(`User not found: ${id}`);
  }
  return createResponse(user);
}

export function getServerInfo(): ApiResponse<{ app: string; version: string; startedAt: string }> {
  return createResponse({
    app: APP_NAME,
    version: API_VERSION,
    startedAt: formatDate(new Date()),
  });
}

// === 演示 ===
console.log('[API] Server info:', getServerInfo());
console.log('[API] All users:', getUsers());
console.log('[API] User u-001:', getUserById('u-001'));
console.log('[API] User u-999:', getUserById('u-999'));
