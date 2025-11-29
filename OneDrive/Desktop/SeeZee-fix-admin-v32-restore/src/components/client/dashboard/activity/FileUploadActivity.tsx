"use client";

import { formatActivityTime } from "@/lib/dashboard-helpers";
import type { Activity } from "@/lib/dashboard-helpers";

interface FileUploadActivityProps {
  activity: Activity;
}

export default function FileUploadActivity({ activity }: FileUploadActivityProps) {
  const fileName = activity.metadata?.fileName || activity.description || 'Unknown file';
  const fileSize = activity.metadata?.fileSize;
  const fileUrl = activity.metadata?.url;
  
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xl">
        📁
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white">
          <span className="font-semibold">File uploaded</span>
        </p>
        <p className="truncate text-sm text-gray-400">{fileName}</p>
        {fileSize && (
          <p className="text-xs text-gray-500">
            {(fileSize / 1024).toFixed(1)} KB
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formatActivityTime(activity.createdAt)}
        </p>
      </div>
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-1 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800"
        >
          Download
        </a>
      )}
    </div>
  );
}

