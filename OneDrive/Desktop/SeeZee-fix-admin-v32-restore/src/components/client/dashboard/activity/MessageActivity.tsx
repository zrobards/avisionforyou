"use client";

import { formatActivityTime } from "@/lib/dashboard-helpers";
import type { Activity } from "@/lib/dashboard-helpers";

interface MessageActivityProps {
  activity: Activity;
}

export default function MessageActivity({ activity }: MessageActivityProps) {
  const senderName = activity.metadata?.senderName || 'Team';
  const message = activity.description || '';
  
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-xl">
        💬
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white">
          <span className="font-semibold">{senderName}</span> sent a message
        </p>
        <p className="mt-1 text-sm text-gray-400 line-clamp-2">{message}</p>
        <p className="mt-1 text-xs text-gray-500">
          {formatActivityTime(activity.createdAt)}
        </p>
      </div>
      <button className="flex-shrink-0 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-1 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800">
        Reply
      </button>
    </div>
  );
}

