import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { TeamClient } from "@/components/admin/TeamClient";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // Only CEO/CFO can manage team
  const allowedRoles = [ROLE.CEO, ROLE.CFO];
  if (!allowedRoles.includes(currentUser.role as any)) {
    redirect("/admin");
  }

  // Fetch all users (team members and clients) for the filter functionality
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return <TeamClient users={users} />;
}
