// app/profile/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session) {
    console.log('❌ 未登录,重定向到登录页');
    redirect('/auth/signin')
  }
  
  console.log('✅ 已登录用户:', session.user);
  
  return (
    <div>
      <h1>个人资料</h1>
      <p>邮箱: {session.user.email}</p>
      <p>名字: {session.user.name}</p>
      <img src={session.user.image ?? undefined} alt="Avatar" />
      
      {/* 登出按钮 */}
      <form
        action={async () => {
          "use server"
          await signOut()
        }}
      >
        <button type="submit">登出</button>
      </form>
    </div>
  )
}
