/**
 * Tools Page - Display all tools in a card grid layout
 */

import { ToolsClient } from "@/components/admin/ToolsClient";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Fetch tools from the Tool model
  const tools = await prisma.tool.findMany({
    orderBy: [
      { category: "asc" },
      { name: "asc" },
    ],
  });

  // Convert to serializable format
  const serializedTools = tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    url: tool.url,
    category: tool.category,
    logoUrl: tool.logoUrl,
    pricing: tool.pricing,
    tags: tool.tags,
    createdAt: tool.createdAt.toISOString(),
    updatedAt: tool.updatedAt.toISOString(),
  }));

  return <ToolsClient tools={serializedTools} />;
}

