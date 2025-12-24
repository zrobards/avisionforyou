import { getCurrentUser } from '@/lib/auth/requireRole';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PurchasesClient from './PurchasesClient';

export default async function AdminPurchasesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get all subscriptions with their projects and organizations
  const subscriptions = await prisma.maintenancePlan.findMany({
    where: {
      stripeSubscriptionId: { not: null },
    },
    include: {
      project: {
        include: {
          organization: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Get all hour packs
  const hourPacks = await prisma.hourPack.findMany({
    include: {
      plan: {
        include: {
          project: {
            include: {
              organization: {
                include: {
                  members: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      purchasedAt: 'desc',
    },
  });

  // Get subscription invoices (for monthly payments)
  const subscriptionInvoices = await prisma.invoice.findMany({
    where: {
      invoiceType: 'subscription',
      status: 'PAID',
    },
    include: {
      organization: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      project: true,
    },
    orderBy: {
      paidAt: 'desc',
    },
    take: 100, // Last 100 subscription payments
  });

  return (
    <PurchasesClient
      subscriptions={subscriptions.map(sub => ({
        id: sub.id,
        tier: sub.tier,
        status: sub.status,
        monthlyPrice: Number(sub.monthlyPrice),
        stripeSubscriptionId: sub.stripeSubscriptionId,
        currentPeriodEnd: sub.currentPeriodEnd,
        createdAt: sub.createdAt,
        project: {
          id: sub.project.id,
          name: sub.project.name,
        },
        organization: {
          id: sub.project.organization?.id || '',
          name: sub.project.organization?.name || 'N/A',
          members: sub.project.organization?.members.map(m => ({
            userId: m.userId,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
            },
          })) || [],
        },
      }))}
      hourPacks={hourPacks.map(pack => ({
        id: pack.id,
        packType: pack.packType,
        hours: pack.hours,
        hoursRemaining: pack.hoursRemaining,
        cost: pack.cost,
        purchasedAt: pack.purchasedAt,
        expiresAt: pack.expiresAt,
        neverExpires: pack.neverExpires,
        isActive: pack.isActive,
        project: {
          id: pack.plan.project.id,
          name: pack.plan.project.name,
        },
        organization: {
          id: pack.plan.project.organization?.id || '',
          name: pack.plan.project.organization?.name || 'N/A',
          members: pack.plan.project.organization?.members.map(m => ({
            userId: m.userId,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
            },
          })) || [],
        },
      }))}
      subscriptionPayments={subscriptionInvoices.map(inv => ({
        id: inv.id,
        number: inv.number,
        amount: Number(inv.amount),
        total: Number(inv.total),
        paidAt: inv.paidAt,
        project: inv.project ? {
          id: inv.project.id,
          name: inv.project.name,
        } : null,
        organization: {
          id: inv.organization.id,
          name: inv.organization.name,
          members: inv.organization.members.map(m => ({
            userId: m.userId,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
            },
          })),
        },
      }))}
    />
  );
}







