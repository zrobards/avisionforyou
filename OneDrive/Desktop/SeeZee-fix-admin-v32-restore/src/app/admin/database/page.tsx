/**
 * Database Management - CEO gets full access, Admin gets read-only
 */

import { listModels } from "@/server/actions/database";
import { DatabaseClient } from "@/components/admin/DatabaseClient";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  // Auth check is handled in layout.tsx to prevent flash

  const result = await listModels();
  const models = result.success ? result.models : [];

  return (
    <DatabaseClient models={models} />
  );
}



