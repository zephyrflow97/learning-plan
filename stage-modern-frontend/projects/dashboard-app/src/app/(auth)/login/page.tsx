import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">TeamPulse</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          鐧诲綍鎮ㄧ殑璐﹀彿
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        杩樻病鏈夎处鍙?{" "}
        <a href="/register" className="text-primary hover:underline">
          绔嬪嵆娉ㄥ唽
        </a>
      </p>
    </div>
  );
}