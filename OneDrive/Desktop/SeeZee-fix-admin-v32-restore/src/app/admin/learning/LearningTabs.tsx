/**
 * Learning Hub Tabs - Client Component
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { label: "Training", href: "/admin/learning/training" },
  { label: "Tools", href: "/admin/learning/tools" },
  { label: "Resources", href: "/admin/learning/resources" },
];

export default function LearningTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 border-b border-white/5">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              isActive
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
















