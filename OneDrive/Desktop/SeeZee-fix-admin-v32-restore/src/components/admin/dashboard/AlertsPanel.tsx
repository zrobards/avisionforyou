"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  MessageCircle,
  ArrowRight,
  Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type AlertType =
  | "overdue_invoice"
  | "pending_approval"
  | "upcoming_meeting"
  | "task_due"
  | "new_message"
  | "system";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  link?: string;
  createdAt: Date | string;
  metadata?: Record<string, any>;
}

interface AlertsPanelProps {
  alerts: Alert[];
  isLoading?: boolean;
}

const alertConfig: Record<
  AlertType,
  { icon: React.ComponentType<any>; iconColor: string; bgColor: string }
> = {
  overdue_invoice: {
    icon: FileText,
    iconColor: "text-[#ef4444]",
    bgColor: "bg-[#ef4444]/20",
  },
  pending_approval: {
    icon: CheckCircle,
    iconColor: "text-[#f59e0b]",
    bgColor: "bg-[#f59e0b]/20",
  },
  upcoming_meeting: {
    icon: Calendar,
    iconColor: "text-[#3b82f6]",
    bgColor: "bg-[#3b82f6]/20",
  },
  task_due: {
    icon: Clock,
    iconColor: "text-[#f97316]",
    bgColor: "bg-[#f97316]/20",
  },
  new_message: {
    icon: MessageCircle,
    iconColor: "text-[#22d3ee]",
    bgColor: "bg-[#22d3ee]/20",
  },
  system: {
    icon: AlertTriangle,
    iconColor: "text-[#a855f7]",
    bgColor: "bg-[#a855f7]/20",
  },
};

const severityStyles: Record<string, { border: string; indicator: string }> = {
  critical: { 
    border: "border-l-[#ef4444]", 
    indicator: "bg-[#ef4444]" 
  },
  warning: { 
    border: "border-l-[#f59e0b]", 
    indicator: "bg-[#f59e0b]" 
  },
  info: { 
    border: "border-l-[#3b82f6]", 
    indicator: "bg-[#3b82f6]" 
  },
};

export function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/5 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");

  return (
    <section className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#ef4444]/20">
            <Bell className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-white">
              Alerts
            </h2>
            <p className="text-sm text-slate-400">
              {alerts.length} item{alerts.length !== 1 ? "s" : ""} need attention
            </p>
          </div>
        </div>
        {criticalAlerts.length > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-[#ef4444]/20 text-[#f87171] text-xs font-semibold border border-[#ef4444]/30 animate-pulse">
            {criticalAlerts.length} Critical
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => {
            const config = alertConfig[alert.type] || alertConfig.system;
            const severity = severityStyles[alert.severity];
            const Icon = config.icon;
            const createdAt =
              typeof alert.createdAt === "string"
                ? new Date(alert.createdAt)
                : alert.createdAt;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => alert.link && window.location.assign(alert.link)}
                className={`
                  flex items-start gap-3 rounded-xl border border-white/5 border-l-4 
                  ${severity.border} 
                  bg-[#0f172a]/60 p-4 transition-all duration-200 
                  hover:border-white/10 hover:bg-[#1e293b]/40
                  ${alert.link ? "cursor-pointer" : ""}
                `}
              >
                <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {alert.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </p>
                </div>

                {alert.link && (
                  <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0f172a]/40 p-10 text-center">
            <CheckCircle className="w-12 h-12 text-[#10b981] mx-auto mb-3" />
            <p className="text-sm font-medium text-white">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">
              No alerts at the moment
            </p>
          </div>
        )}
      </div>

      {alerts.length > 5 && (
        <Link
          href="/admin/notifications"
          className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-[#22d3ee] hover:text-[#06b6d4] transition"
        >
          View all notifications
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </section>
  );
}

export default AlertsPanel;
