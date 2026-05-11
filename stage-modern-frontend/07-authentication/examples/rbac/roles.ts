// lib/rbac/roles.ts - RBAC 权限模型
export enum Role {
  GUEST = 'GUEST',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

// 权限命名规范: resource:action:scope
export type Permission =
  | 'post:create:own'
  | 'post:read:any'
  | 'post:update:own'
  | 'post:update:any'
  | 'post:delete:own'
  | 'post:delete:any'
  | 'user:ban:any'
  | 'user:delete:any'
  | 'comment:create:own'
  | 'comment:delete:own'
  | 'comment:delete:any';

// 角色与权限映射
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.GUEST]: [
    'post:read:any', // 游客只能读帖子
  ],

  [Role.USER]: [
    'post:read:any',
    'post:create:own',  // 创建自己的帖子
    'post:update:own',  // 编辑自己的帖子
    'post:delete:own',  // 删除自己的帖子
    'comment:create:own',
    'comment:delete:own',
  ],

  [Role.MODERATOR]: [
    'post:read:any',
    'post:create:own',
    'post:update:own',
    'post:update:any',  // 编辑任何人的帖子
    'post:delete:own',
    'post:delete:any',  // 删除任何人的帖子
    'comment:create:own',
    'comment:delete:own',
    'comment:delete:any', // 删除任何人的评论
    'user:ban:any',     // 封禁用户
  ],

  [Role.ADMIN]: [
    'post:read:any',
    'post:create:own',
    'post:update:own',
    'post:update:any',
    'post:delete:own',
    'post:delete:any',
    'comment:create:own',
    'comment:delete:own',
    'comment:delete:any',
    'user:ban:any',
    'user:delete:any', // 删除用户
  ],
};

// 检查角色是否有权限
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  const hasPermission = permissions.includes(permission);

  console.log('🔍 权限检查:', {
    role,
    permission,
    hasPermission,
  });

  return hasPermission;
}

// 检查用户是否可以操作资源
export function canPerformAction(
  userRole: Role,
  userId: string,
  resource: { authorId: string },
  permission: Permission
): boolean {
  // 如果操作的是自己的资源,检查 :own 权限
  const isOwner = userId === resource.authorId;

  if (isOwner) {
    const ownPermission = permission.replace(':any', ':own') as Permission;
    if (hasPermission(userRole, ownPermission)) {
      console.log('✅ 操作自己的资源,权限通过');
      return true;
    }
  }

  // 检查 :any 权限
  if (hasPermission(userRole, permission)) {
    console.log('✅ 拥有 :any 权限,通过');
    return true;
  }

  console.log('❌ 权限不足');
  return false;
}

// 示例:检查用户是否可以删除帖子
export async function canDeletePost(
  userId: string,
  userRole: Role,
  postId: string
) {
  // 假设从数据库获取帖子
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    console.log('❌ 帖子不存在');
    return false;
  }

  return canPerformAction(
    userRole,
    userId,
    { authorId: post.authorId },
    'post:delete:any'
  );
}
