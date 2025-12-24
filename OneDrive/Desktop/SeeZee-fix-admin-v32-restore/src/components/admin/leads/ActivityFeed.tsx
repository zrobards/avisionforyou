"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle,
  FileText,
  Archive,
  Sparkles,
  Clock,
  MessageCircle,
} from "lucide-react";
import { ActivityType } from "@prisma/client";

interface Activity {
  id: string;
  createdAt: Date;
  type: ActivityType;
  description: string;
  metadata?: any;
  prospect: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
}

interface ActivityFeedProps {
  limit?: number;
}

export function ActivityFeed({ limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/activity/recent?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "EMAIL_SENT":
        return <Mail className="w-4 h-4 text-blue-400" />;
      case "EMAIL_OPENED":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "EMAIL_REPLIED":
        return <MessageCircle className="w-4 h-4 text-purple-400" />;
      case "DISCOVERED":
      case "ANALYZED":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case "NOTE_ADDED":
        return <FileText className="w-4 h-4 text-yellow-400" />;
      case "ARCHIVED":
        return <Archive className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-700 bg-[#0a0e1a] p-4">
        <h3 className="text-sm font-semibold text-white mb-4">📋 Recent Activity</h3>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-[#0a0e1a] p-4">
      <h3 className="text-sm font-semibold text-white mb-4">📋 Recent Activity</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-gray-400 text-sm">No recent activity</div>
        ) : (
          activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition"
            >
              <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white">{activity.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(activity.createdAt)}
                </div>
                {activity.prospect && (
                  <div className="text-xs text-gray-500 mt-1">
                    {activity.prospect.company || activity.prospect.name}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
      <a
        href="/admin/leads"
        className="block mt-4 text-sm text-purple-400 hover:text-purple-300 text-center"
      >
        Show All Activity →
      </a>
    </div>
  );
}


