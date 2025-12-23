/**
 * CEO System Logs - Real Activity from Database
 */

import { listActivity } from "@/server/actions/activity";
import { LogsClient } from "@/components/admin/LogsClient";

export const dynamic = "force-dynamic";

export default async function CEOLogsPage() {
  const result = await listActivity(100);
  const activities = result.success ? result.activities : [];

  return <LogsClient activities={activities} />;
}

