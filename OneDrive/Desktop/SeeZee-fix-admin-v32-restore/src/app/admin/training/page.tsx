import { AdminTrainingClient } from "@/components/admin/AdminTrainingClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTrainingPage() {
  // Auth check is handled in layout.tsx to prevent flash

  const trainings = await prisma.training.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
        include: {
          completions: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  const trainingsWithStats = trainings.map((training) => {
    const totalAssigned = training.assignments.reduce(
      (acc, assignment) => acc + assignment.completions.length,
      0,
    );
    const completed = training.assignments.reduce(
      (acc, assignment) =>
        acc + assignment.completions.filter((c) => c.status === "COMPLETE").length,
      0,
    );
    const inProgress = training.assignments.reduce(
      (acc, assignment) =>
        acc + assignment.completions.filter((c) => c.status === "IN_PROGRESS").length,
      0,
    );

    const { assignments, ...trainingData } = training;

    return {
      ...trainingData,
      createdAt: trainingData.createdAt.toISOString(),
      updatedAt: trainingData.updatedAt.toISOString(),
      createdBy: {
        ...trainingData.createdBy,
        email: trainingData.createdBy.email || "",
      },
      stats: {
        totalAssigned,
        completed,
        inProgress,
        notStarted: totalAssigned - completed - inProgress,
      },
    };
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
          Learning Engine
        </span>
        <h1 className="text-3xl font-heading font-bold text-white">Training</h1>
        <p className="max-w-2xl text-sm text-gray-400">
          Stay sharp with curated modules covering sales, delivery, and automation. Completion metrics help you coach the team faster.
        </p>
      </header>

      <AdminTrainingClient trainings={trainingsWithStats} showHeader={false} />
    </div>
  );
}

