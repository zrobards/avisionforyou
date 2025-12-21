"use client";

import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiDollarSign,
  FiFolder,
  FiMessageSquare,
  FiUser,
  FiActivity,
} from "react-icons/fi";

export interface ActivityItem {
  id: string;
  type?: string | null;
  message: string;
  timestamp: string | Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const iconMap: Record<string, { icon: JSX.Element; bgClass: string }> = {
  project_created: { 
    icon: <FiFolder className="h-4 w-4 text-[#3b82f6]" />,
    bgClass: "bg-[#3b82f6]/20"
  },
  payment_received: { 
    icon: <FiDollarSign className="h-4 w-4 text-[#10b981]" />,
    bgClass: "bg-[#10b981]/20"
  },
  milestone_completed: { 
    icon: <FiCheckCircle className="h-4 w-4 text-[#22d3ee]" />,
    bgClass: "bg-[#22d3ee]/20"
  },
  request_created: { 
    icon: <FiMessageSquare className="h-4 w-4 text-[#f59e0b]" />,
    bgClass: "bg-[#f59e0b]/20"
  },
  client_added: { 
    icon: <FiUser className="h-4 w-4 text-[#a855f7]" />,
    bgClass: "bg-[#a855f7]/20"
  },
};

const defaultIcon = {
  icon: <FiActivity className="h-4 w-4 text-[#22d3ee]" />,
  bgClass: "bg-[#22d3ee]/20"
};

function relativeTime(timestamp: string | Date) {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (Number.isNaN(date.getTime())) return "Just now";

  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {
    const minutes = Math.max(1, Math.floor(diff / minute));
    return `${minutes}m ago`;
  }

  if (diff < day) {
    const hours = Math.max(1, Math.floor(diff / hour));
    return `${hours}h ago`;
  }

  const days = Math.max(1, Math.floor(diff / day));
  return `${days}d ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-[#22d3ee]/20">
          <FiActivity className="h-5 w-5 text-[#22d3ee]" />
        </div>
        <div>
          <h3 className="text-xl font-heading font-semibold text-white">Recent Activity</h3>
          <p className="text-sm text-slate-400">Latest updates across your workspace</p>
        </div>
      </div>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const iconConfig = iconMap[activity.type ?? ""] ?? defaultIcon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-start gap-4 rounded-xl border border-white/5 bg-[#0f172a]/60 p-4 transition-all duration-200 hover:border-white/10 hover:bg-[#1e293b]/40"
              >
                <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconConfig.bgClass}`}>
                  {iconConfig.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium leading-relaxed">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {relativeTime(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0f172a]/40 p-10 text-center">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-sm text-slate-400">No recent activity</p>
            <p className="text-xs text-slate-500 mt-1">Activity will show up here as you work</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
