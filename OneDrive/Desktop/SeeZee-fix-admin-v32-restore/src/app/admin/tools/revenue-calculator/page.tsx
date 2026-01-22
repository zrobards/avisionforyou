import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { RevenueCalculator } from '@/components/admin/RevenueCalculator';

export const metadata = {
  title: 'Revenue Calculator | Admin Tools',
  description: 'Calculate project revenue splits',
};

export default async function RevenueCalculatorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnUrl=/admin/tools/revenue-calculator');
  }

  // Only allow CEO, CFO, ADMIN roles
  if (!['CEO', 'CFO', 'ADMIN'].includes(user.role)) {
    redirect('/admin');
  }

  // Get all projects for the calculator
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      organization: true,
      revenueSplits: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  // Get all team members (potential revenue recipients)
  const teamMembers = await prisma.user.findMany({
    where: {
      role: {
        in: ['CEO', 'CFO', 'ADMIN', 'FRONTEND', 'BACKEND', 'DESIGNER', 'DEV', 'OUTREACH'],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Revenue Split Calculator</h1>
        <p className="text-white/60">
          Calculate and manage project revenue allocations for team members
        </p>
      </div>

      <RevenueCalculator
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          budget: Number(p.budget || 0),
          organizationName: p.organization.name,
          existingSplit: p.revenueSplits[0]
            ? {
                id: p.revenueSplits[0].id,
                totalAmount: Number(p.revenueSplits[0].totalAmount),
                businessShare: Number(p.revenueSplits[0].businessShare),
                adminShares: p.revenueSplits[0].adminShares as any,
                notes: p.revenueSplits[0].notes || '',
              }
            : null,
        }))}
        teamMembers={teamMembers}
      />
    </div>
  );
}

