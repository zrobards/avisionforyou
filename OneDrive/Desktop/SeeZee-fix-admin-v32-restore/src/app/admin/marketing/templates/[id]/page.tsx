import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { EmailTemplateForm } from "@/components/admin/marketing/EmailTemplateForm";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  const template = await prisma.emailTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Edit Email Template</h1>
        <p className="text-slate-400 mt-1">
          Update template: {template.name}
        </p>
      </div>

      <EmailTemplateForm template={template} />
    </div>
  );
}







