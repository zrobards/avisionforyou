import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import { buildClientProjectWhere } from "@/lib/client-access";
import { ProjectsClient } from "@/app/(client)/client/components/ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await requireAuth();

  const identity = { userId: session.user.id, email: session.user.email };
  const accessWhere = await buildClientProjectWhere(identity);

  const projects = await db.project.findMany({
    where: accessWhere,
    include: {
      assignee: {
        select: {
          name: true,
          image: true,
        },
      },
      milestones: {
        select: {
          completed: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <ProjectsClient projects={projects} />;
}
