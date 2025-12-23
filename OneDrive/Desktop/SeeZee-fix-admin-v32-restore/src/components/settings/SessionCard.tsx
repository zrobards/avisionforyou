"use client";

import { Monitor, Smartphone, MapPin, Clock, Shield, AlertTriangle } from "lucide-react";
import { formatRelativeTime } from "@/lib/format/date";
import { GlassCard } from "./GlassCard";

interface SessionCardProps {
  session: {
    id: string;
    deviceInfo?: string;
    browser?: string;
    os?: string;
    location?: string;
    ipAddress?: string;
    lastActive: Date;
    createdAt: Date;
  };
  isCurrent: boolean;
  onRevoke: (id: string) => void;
  loading?: boolean;
}

export function SessionCard({
  session,
  isCurrent,
  onRevoke,
  loading = false,
}: SessionCardProps) {
  const isMobile = 
    session.deviceInfo?.toLowerCase().includes("mobile") ||
    session.deviceInfo?.toLowerCase().includes("android") ||
    session.deviceInfo?.toLowerCase().includes("ios") ||
    session.os?.toLowerCase().includes("android") ||
    session.os?.toLowerCase().includes("ios");

  const DeviceIcon = isMobile ? Smartphone : Monitor;

  return (
    <GlassCard 
      variant={isCurrent ? "elevated" : "subtle"} 
      padding="md"
      hoverEffect={!isCurrent}
      className={isCurrent ? "ring-1 ring-green-500/20" : ""}
    >
      <div className="flex items-start gap-4">
        {/* Device Icon */}
        <div className={`
          p-3 rounded-xl transition-colors
          ${isCurrent 
            ? "bg-green-500/10 text-green-400" 
            : "bg-white/[0.05] text-slate-400"
          }
        `}>
          <DeviceIcon className="w-6 h-6" />
        </div>

        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h4 className="font-semibold text-white">
              {session.browser || "Unknown Browser"}
              {session.os && <span className="font-normal text-slate-400"> on {session.os}</span>}
            </h4>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                <Shield className="w-3 h-3" />
                Current Session
              </span>
            )}
          </div>

          <div className="space-y-1">
            {session.location && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{session.location}</span>
              </div>
            )}
            {session.ipAddress && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-xs font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">
                  {session.ipAddress}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>
                {isCurrent ? "Active now" : `Last active ${formatRelativeTime(session.lastActive)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Revoke Button */}
        {!isCurrent && (
          <button
            onClick={() => onRevoke(session.id)}
            disabled={loading}
            className="
              px-3 py-1.5 rounded-lg text-sm font-medium
              text-red-400 hover:text-red-300
              bg-red-500/10 hover:bg-red-500/15
              border border-red-500/20 hover:border-red-500/30
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                Revoking...
              </span>
            ) : (
              "Revoke"
            )}
          </button>
        )}
      </div>
    </GlassCard>
  );
}

// Security alert card for suspicious sessions
interface SecurityAlertCardProps {
  title: string;
  description: string;
  severity: "warning" | "danger";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function SecurityAlertCard({
  title,
  description,
  severity,
  action,
}: SecurityAlertCardProps) {
  const styles = {
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: "text-amber-400",
      text: "text-amber-300",
    },
    danger: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: "text-red-400",
      text: "text-red-300",
    },
  };

  const s = styles[severity];

  return (
    <div className={`p-4 rounded-xl ${s.bg} border ${s.border}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 ${s.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${s.text}`}>{title}</h4>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 px-3 py-1.5 text-sm font-medium rounded-lg ${s.bg} ${s.text} border ${s.border} hover:brightness-110 transition-all`}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}






