"use client";

import clsx from "clsx";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "border-yellow-700 bg-yellow-900/30 text-yellow-300",
  },
  received: {
    label: "Received",
    className: "border-blue-700 bg-blue-900/30 text-blue-300",
  },
  in_progress: {
    label: "In Progress",
    className: "border-trinity-red bg-trinity-red/30 text-trinity-red",
  },
  completed: {
    label: "Completed",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  paid: {
    label: "Paid",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  unpaid: {
    label: "Unpaid",
    className: "border-red-700 bg-red-900/30 text-red-300",
  },
  lead: {
    label: "Lead",
    className: "border-gray-600 bg-gray-700 text-gray-300",
  },
  proposal: {
    label: "Proposal",
    className: "border-blue-700 bg-blue-900/30 text-blue-300",
  },
  paid_status: {
    label: "Paid",
    className: "border-green-700 bg-green-900/30 text-green-300",
  },
  active: {
    label: "Active",
    className: "border-trinity-red bg-trinity-red/30 text-trinity-red",
  },
};

const SIZE_MAP = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
} as const;

export interface StatusBadgeProps {
  status: string;
  size?: keyof typeof SIZE_MAP;
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalized = status?.toLowerCase?.() ?? "unknown";
  const config = STATUS_STYLES[normalized] ?? {
    label: status,
    className: "border-gray-600 bg-gray-700 text-gray-300",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border font-medium",
        config.className,
        SIZE_MAP[size],
      )}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;




















