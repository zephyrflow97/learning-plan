"use client";

import { api } from "@/lib/trpc/client";

export default function DashboardPage() {
  const { data: projects, isLoading } = api.project.getAll.useQuery();

  if (isLoading) {
    return <div>鍔犺浇涓?..</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">浠〃鐩?/h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <div key={project.id} className="p-6 bg-white dark:bg-slate-900 rounded-lg border">
            <h3 className="font-semibold">{project.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {project.description || "鏃犳弿杩?}
            </p>
            <div className="mt-4 text-xs text-slate-500">
              {project._count.tasks} 涓换鍔?            </div>
          </div>
        ))}
      </div>

      {projects && projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            杩樻病鏈夐」鐩紝鍒涘缓涓€涓紑濮嬪惂锛?          </p>
        </div>
      )}
    </div>
  );
}