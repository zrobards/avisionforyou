"use client";

/**
 * Admin Notification Banner - Shows important notifications at the top of admin pages
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";
import Link from "next/link";
import { useNotifications } from "@/providers/NotificationsProvider";
import { formatRelativeTime } from "@/lib/ui";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "SUCCESS":
      return <FiCheckCircle className="w-5 h-5 text-green-400" />;
    case "WARNING":
      return <FiAlertTriangle className="w-5 h-5 text-yellow-400" />;
    case "ERROR":
      return <FiAlertCircle className="w-5 h-5 text-red-400" />;
    default:
      return <FiInfo className="w-5 h-5 text-blue-400" />;
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case "SUCCESS":
      return "bg-green-500/10 border-green-500/20";
    case "WARNING":
      return "bg-yellow-500/10 border-yellow-500/20";
    case "ERROR":
      return "bg-red-500/10 border-red-500/20";
    default:
      return "bg-blue-500/10 border-blue-500/20";
  }
};

export function AdminNotificationBanner() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  // Get unread notifications (most recent first)
  const unreadNotifications = notifications
    .filter((n) => !n.read && !dismissedIds.has(n.id))
    .slice(0, 5); // Show max 5 at a time

  // Auto-dismiss after 10 seconds for non-critical notifications
  useEffect(() => {
    unreadNotifications.forEach((notif) => {
      if (notif.type !== "ERROR" && notif.type !== "WARNING") {
        const timer = setTimeout(() => {
          setDismissedIds((prev) => new Set(prev).add(notif.id));
          markAsRead(notif.id);
        }, 10000);
        return () => clearTimeout(timer);
      }
    });
  }, [unreadNotifications, markAsRead]);

  if (unreadNotifications.length === 0) {
    return null;
  }

  const topNotification = unreadNotifications[0];

  return (
    <div className="relative z-50">
      <AnimatePresence>
        {unreadNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`border-b ${getNotificationBgColor(topNotification.type)}`}
          >
            <div className="mx-auto max-w-[1200px] px-4 py-3 lg:px-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(topNotification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {topNotification.title}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        {topNotification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(topNotification.timestamp)}
                        </span>
                        {topNotification.actionUrl && (
                          <>
                            <span className="text-slate-600">•</span>
                            <Link
                              href={topNotification.actionUrl}
                              onClick={() => markAsRead(topNotification.id)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            >
                              {topNotification.actionLabel || "View"}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {unreadCount > 1 && (
                        <button
                          onClick={() => setExpanded(!expanded)}
                          className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                        >
                          {unreadCount - 1} more
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDismissedIds((prev) => new Set(prev).add(topNotification.id));
                          markAsRead(topNotification.id);
                        }}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                        aria-label="Dismiss notification"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded view showing all notifications */}
              <AnimatePresence>
                {expanded && unreadNotifications.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-3"
                  >
                    {unreadNotifications.slice(1).map((notif) => (
                      <div
                        key={notif.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-300 mt-1">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-400">
                              {formatRelativeTime(notif.timestamp)}
                            </span>
                            {notif.actionUrl && (
                              <>
                                <span className="text-slate-600">•</span>
                                <Link
                                  href={notif.actionUrl}
                                  onClick={() => markAsRead(notif.id)}
                                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                >
                                  {notif.actionLabel || "View"}
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDismissedIds((prev) => new Set(prev).add(notif.id));
                            markAsRead(notif.id);
                          }}
                          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
                          aria-label="Dismiss notification"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


