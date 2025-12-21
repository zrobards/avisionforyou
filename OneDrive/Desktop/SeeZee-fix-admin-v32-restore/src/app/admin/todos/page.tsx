import { TodosClient } from "@/components/admin/TodosClient";

interface TodoRow {
  id: string;
  title: string;
  project: string;
  dueDate: string | null;
  status: string;
}

export const dynamic = "force-dynamic";

export default async function AdminTodosPage() {
  // Auth check is handled in layout.tsx to prevent flash

  const { getTasks } = await import("@/server/actions/tasks");
  const tasksResult = await getTasks({ status: "TODO" as any });
  const tasks = tasksResult.success ? tasksResult.tasks : [];

  const rows: TodoRow[] = tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    project: task.project?.name ?? "—",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    status: String(task.status ?? "todo").toLowerCase(),
  }));

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
          Execution Queue
        </span>
        <h1 className="text-3xl font-heading font-bold text-white">Todos</h1>
        <p className="max-w-2xl text-sm text-gray-400">
          Focus mode for tasks that need action. Knock out deliverables, clear blockers, and keep velocity high.
        </p>
      </header>

      <TodosClient rows={rows} />
    </div>
  );
}

