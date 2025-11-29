"use client";

import { formatActivityTime } from "@/lib/dashboard-helpers";
import type { Activity } from "@/lib/dashboard-helpers";

interface PaymentActivityProps {
  activity: Activity;
}

export default function PaymentActivity({ activity }: PaymentActivityProps) {
  const amount = activity.metadata?.amount || '';
  const invoiceNumber = activity.metadata?.invoiceNumber || '';
  
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-xl">
        💰
      </div>
      <div className="flex-1">
        <p className="text-white">
          <span className="font-semibold">Payment received</span>
        </p>
        <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
        {invoiceNumber && (
          <p className="mt-1 text-xs text-gray-500">Invoice #{invoiceNumber}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formatActivityTime(activity.createdAt)}
        </p>
      </div>
      <div className="flex-shrink-0 text-lg font-bold text-green-400">
        ${amount}
      </div>
    </div>
  );
}

