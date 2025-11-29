"use client";

import { formatActivityTime } from "@/lib/dashboard-helpers";
import type { Activity } from "@/lib/dashboard-helpers";

interface MilestoneActivityProps {
  activity: Activity;
}

export default function MilestoneActivity({ activity }: MilestoneActivityProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-xl">
        🎯
      </div>
      <div className="flex-1">
        <p className="text-white">
          <span className="font-semibold">Milestone reached</span>
        </p>
        <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
        <p className="mt-1 text-xs text-gray-500">
          {formatActivityTime(activity.createdAt)}
        </p>
      </div>
      <div className="flex-shrink-0 text-2xl">✓</div>
    </div>
  );
}

