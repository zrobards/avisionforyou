/**
 * CEO Automations - Rule builder for workflow automation
 */

import { AutomationsClient } from "@/components/ceo/AutomationsClient";

export const dynamic = "force-dynamic";

export default async function CEOAutomationsPage() {
  // In the future, fetch real automation data from database
  const mockAutomations = [
    {
      id: "auto-1",
      name: "Client Survey on Project Completion",
      trigger: "Project status → Completed",
      action: "Send client satisfaction survey email",
      enabled: true,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: "auto-2",
      name: "Failed Payment Ticket Creation",
      trigger: "Stripe renewal → Failed",
      action: "Create maintenance ticket for billing issue",
      enabled: true,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ];

  return <AutomationsClient automations={mockAutomations} />;
}
