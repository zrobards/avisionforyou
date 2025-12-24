import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { EmailsDashboard } from "@/components/admin/leads/EmailsDashboard";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Only CEO, CFO, or OUTREACH roles can access
  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch sent emails
  const emails = await prisma.sentEmail.findMany({
    include: {
      prospect: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      }
    >
      <EmailsDashboard initialEmails={emails as any} />
    </Suspense>
  );
}


