"use client";

/**
 * Stat Card for KPIs with optional trend indicator
 */

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  delay?: number;
}

export function StatCard({ label, value, icon, trend, delay = 0 }: StatCardProps) {
  const trendPositive = trend && trend.value > 0;
  const trendNegative = trend && trend.value < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="
        relative overflow-hidden
        rounded-2xl
        border border-white/10
        bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80
        backdrop-blur-xl
        p-6
        hover:border-white/20 hover:shadow-xl
        transition-all duration-300
      "
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>

          {trend && (
            <div
              className={`
                mt-3 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit
                ${trendPositive ? "text-[#10b981] bg-[#10b981]/10" : ""}
                ${trendNegative ? "text-[#ef4444] bg-[#ef4444]/10" : ""}
                ${!trendPositive && !trendNegative ? "text-slate-400 bg-white/5" : ""}
              `}
            >
              {trendPositive && <TrendingUp className="w-3 h-3" />}
              {trendNegative && <TrendingDown className="w-3 h-3" />}
              <span>
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className="flex-shrink-0 p-3 rounded-xl bg-white/5 text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
