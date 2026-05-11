import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">TeamPulse</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          鍒涘缓鎮ㄧ殑璐﹀彿
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        宸叉湁璐﹀彿?{" "}
        <a href="/login" className="text-primary hover:underline">
          绔嬪嵆鐧诲綍
        </a>
      </p>
    </div>
  );
}