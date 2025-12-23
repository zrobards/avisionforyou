"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/stores/useNotifications";
import { formatDistanceToNow } from "date-fns";

export function Notifications() {
  const [open, setOpen] = useState(false);
  const { notifications, count, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ""}`}
      >
        <Bell className="h-4 w-4 text-slate-300" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-950">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-[100]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.href || "#"}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      setOpen(false);
                    }}
                    className="block px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                          notification.read ? "bg-slate-600" : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            notification.read ? "text-slate-400" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/10 p-2">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg px-3 py-2 text-center text-sm text-blue-400 hover:bg-white/5 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
