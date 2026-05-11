import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">TeamPulse</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">{session.user?.name || session.user?.email}</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}