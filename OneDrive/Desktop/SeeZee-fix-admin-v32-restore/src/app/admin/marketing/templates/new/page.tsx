import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { EmailTemplateForm } from "@/components/admin/marketing/EmailTemplateForm";

export const dynamic = "force-dynamic";

export default async function NewTemplatePage({
  searchParams,
}: {
  searchParams: { preset?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  const preset = searchParams.preset;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Create Email Template</h1>
        <p className="text-slate-400 mt-1">
          {preset ? `Create a template for: ${preset}` : "Design a new email template with variables"}
        </p>
      </div>

      <EmailTemplateForm preset={preset} />
    </div>
  );
}


