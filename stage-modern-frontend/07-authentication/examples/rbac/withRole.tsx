// app/actions/post.ts
"use server"

import { auth } from "@/lib/auth"
import { requirePermission } from "@/lib/rbac"
import { db } from "@/lib/db"

export async function deletePost(postId: string) {
  console.log('🗑️ 删除帖子请求:', postId);
  
  const session = await auth();
  if (!session) throw new Error('未登录');
  
  // 1️⃣ 查找帖子
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  
  if (!post) throw new Error('帖子不存在');
  
  // 2️⃣ 权限检查
  const isOwner = post.authorId === session.user.id;
  
  if (isOwner) {
    // 删除自己的帖子
    requirePermission(session.user.role, "post:delete:own");
  } else {
    // 删除别人的帖子(需要管理员权限)
    requirePermission(session.user.role, "post:delete:any");
  }
  
  // 3️⃣ 执行删除
  await db.post.delete({ where: { id: postId } });
  
  console.log('✅ 帖子已删除:', postId);
  return { success: true };
}
