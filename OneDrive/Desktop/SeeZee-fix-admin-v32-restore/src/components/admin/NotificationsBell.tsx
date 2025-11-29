"use client";

/**
 * Notifications Bell with dropdown
 */

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/providers/NotificationsProvider";
import { formatRelativeTime } from "@/lib/ui";
import Link from "next/link";

const getNotificationStyle = (type: string) => {
  const styles: Record<string, { icon: string; color: string }> = {
    TASK_ASSIGNED: { icon: "📋", color: "text-blue-400" },
    TASK_COMPLETED: { icon: "✅", color: "text-green-400" },
    INVOICE_PAID: { icon: "💰", color: "text-emerald-400" },
    PROJECT_UPDATE: { icon: "🔔", color: "text-purple-400" },
  };
  return styles[type] || { icon: "ℹ️", color: "text-slate-400" };
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          relative w-9 h-9 rounded-lg
          bg-slate-900/40 border border-white/10
          flex items-center justify-center
          text-slate-400 hover:text-white
          hover:bg-slate-900/60 hover:border-white/20
          transition-all
        "
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 mt-2 w-96
              bg-slate-900/95 backdrop-blur-xl
              border border-white/10
              rounded-xl shadow-2xl
              overflow-hidden
              z-60
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => {
                  const style = getNotificationStyle(notif.type);
                  return (
                    <div
                      key={notif.id}
                      className={`
                        relative px-4 py-3 border-b border-white/5
                        hover:bg-slate-800/40
                        transition-colors
                        ${!notif.read ? "bg-blue-500/5" : ""}
                      `}
                    >
                      {!notif.read && (
                        <div className="absolute top-1/2 left-2 w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`text-lg ${style.color}`}>
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-500">
                              {formatRelativeTime(notif.timestamp)}
                            </span>
                            {notif.actionUrl && (
                              <>
                                <span className="text-slate-700">•</span>
                                <Link
                                  href={notif.actionUrl}
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    setOpen(false);
                                  }}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  {notif.actionLabel || "View"}
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
