/**
 * Pipeline Tabs - Client Component
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { label: "Overview", href: "/admin/pipeline" },
  { label: "Leads", href: "/admin/pipeline/leads" },
  { label: "Projects", href: "/admin/pipeline/projects" },
  { label: "Invoices", href: "/admin/pipeline/invoices" },
  { label: "Kanban View", href: "/admin/pipeline/view" },
];

export default function PipelineTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 border-b border-white/5">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/admin/pipeline"
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              px-4 py-2 text-sm font-medium
              border-b-2 transition-all
              ${
                isActive
                  ? "border-blue-500 text-white"
                  : "border-transparent text-slate-400 hover:text-white"
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
















