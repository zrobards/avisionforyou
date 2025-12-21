import { ResourcesClient } from "@/components/admin/ResourcesClient";

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  // Auth check is handled in layout.tsx to prevent flash

  const response = await fetch(`${getBaseUrl()}/api/ceo/resources`, {
    cache: "no-store",
  });

  let resources: any[] = [];
  if (response.ok) {
    const payload = await response.json();
    resources = Array.isArray(payload) ? payload : payload.items ?? [];
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
          Knowledge Base
        </span>
        <h1 className="text-3xl font-heading font-bold text-white">Resources</h1>
        <p className="max-w-2xl text-sm text-gray-400">
          Curated blueprints, SOPs, and playbooks for your team. Share high-efficiency workflows with clients or keep them internal for the crew.
        </p>
      </header>

      <ResourcesClient resources={resources} />
    </div>
  );
}

