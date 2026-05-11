/**
 * @file web/src/index.ts
 * @description Web 应用入口 — 使用 shared 包的类型和工具函数
 */

import {
  User,
  ApiResponse,
  formatDate,
  slugify,
  APP_NAME,
  MAX_PAGE_SIZE,
} from '../../shared/src/index';

// === 前端展示逻辑 ===

export function renderUserCard(user: User): string {
  return `
    <div class="user-card">
      <h3>${user.name}</h3>
      <p>Email: ${user.email}</p>
      <p>Role: ${user.role}</p>
      <p>Joined: ${formatDate(user.createdAt)}</p>
    </div>
  `.trim();
}

export function renderUserList(response: ApiResponse<User[]>): string {
  if (!response.ok) {
    return `<div class="error">${response.error}</div>`;
  }

  const cards = response.data.map(renderUserCard).join('\n');
  return `
    <div class="user-list">
      <h2>${APP_NAME} - Users</h2>
      ${cards}
      <p class="meta">Max page size: ${MAX_PAGE_SIZE}</p>
    </div>
  `.trim();
}

export function createPageSlug(title: string): string {
  return slugify(title);
}

// === 演示 ===
const mockUser: User = {
  id: 'u-001',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin',
  createdAt: new Date('2024-01-15'),
};

console.log('[WEB] User card HTML:');
console.log(renderUserCard(mockUser));
console.log('\n[WEB] Page slug:', createPageSlug('Hello World! This is a Test'));
