// app/auth/signin/page.tsx
import { signIn } from "@/lib/auth"

export default function SignInPage() {
  return (
    <div>
      <h1>登录</h1>
      
      {/* OAuth 登录按钮 */}
      <form
        action={async () => {
          "use server"
          await signIn("github", { redirectTo: "/dashboard" })
        }}
      >
        <button type="submit">
          使用 GitHub 登录
        </button>
      </form>
      
      <form
        action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/dashboard" })
        }}
      >
        <button type="submit">
          使用 Google 登录
        </button>
      </form>
    </div>
  )
}
