import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { BillingDashboard } from '@/components/client/BillingDashboard';

export const metadata = {
  title: 'Billing | Client Dashboard',
  description: 'Manage your subscription and billing',
};

export default async function ClientBillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnUrl=/client/billing');
  }

  // Get user's projects with maintenance plans (single source of truth)
  const organizations = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          projects: {
            where: {
              maintenancePlanRel: {
                status: 'ACTIVE',
              },
            },
            include: {
              maintenancePlanRel: {
                include: {
                  hourPacks: {
                    where: {
                      isActive: true,
                      hoursRemaining: { gt: 0 },
                    },
                  },
                },
              },
              invoices: {
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          },
        },
      },
    },
  });

  // Flatten all projects with maintenance plans
  const projects = organizations.flatMap((orgMember) =>
    orgMember.organization.projects
      .filter((project) => project.maintenancePlanRel) // Only include projects with active maintenance plans
      .map((project) => {
        const plan = project.maintenancePlanRel!;
        // Extract and convert Decimal fields before spreading
        const { monthlyPrice, ...planWithoutDecimal } = plan;
        
        return {
          id: project.id,
          name: project.name,
          maintenancePlan: {
            ...planWithoutDecimal,
            // Convert Decimal field to number for client component serialization
            monthlyPrice: monthlyPrice ? Number(monthlyPrice) : 0,
            // hourPacks cost is Int, not Decimal, so no conversion needed
          },
          invoices: project.invoices.map((invoice) => ({
            id: invoice.id,
            number: invoice.number,
            title: invoice.title,
            amount: Number(invoice.amount),
            tax: Number(invoice.tax || 0),
            total: Number(invoice.total),
            status: invoice.status,
            dueDate: invoice.dueDate.toISOString(),
            paidAt: invoice.paidAt?.toISOString() || null,
            createdAt: invoice.createdAt.toISOString(),
          })),
        };
      })
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-white/60">
          Manage your maintenance plan and view invoices
        </p>
      </div>

      <BillingDashboard projects={projects} />
    </div>
  );
}

