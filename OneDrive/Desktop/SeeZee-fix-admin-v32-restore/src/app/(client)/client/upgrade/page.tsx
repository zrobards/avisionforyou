import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/server/db";
import { UpgradeClient } from "@/components/client/UpgradeClient";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const session = await requireAuth();

  // Get user's organization
  const orgMembership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: true,
    },
  });

  if (!orgMembership) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Organization Found</h2>
          <p className="text-gray-400">You are not associated with any organization.</p>
        </div>
      </div>
    );
  }

  // Get all projects for this organization with their subscriptions
  const projects = await db.project.findMany({
    where: {
      organizationId: orgMembership.organizationId,
    },
    include: {
      subscriptions: {
        where: {
          status: "active",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get current active subscriptions
  const currentSubscriptions = projects.flatMap((project) =>
    project.subscriptions.map((sub) => ({
      id: sub.id,
      projectId: sub.projectId,
      projectName: project.name,
      planName: sub.planName || "Standard Monthly",
      priceId: sub.priceId,
    }))
  );

  return (
    <UpgradeClient
      plans={SUBSCRIPTION_PLANS}
      currentSubscriptions={currentSubscriptions}
    />
  );
}







