"use client";

import { ReactNode } from "react";
import { IconType } from "react-icons";
import { motion } from "framer-motion";

interface EnhancedStatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  iconColor?: string;
  iconBgColor?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function EnhancedStatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-trinity-red",
  iconBgColor = "bg-trinity-red/20",
  subtitle,
  trend,
  onClick,
}: EnhancedStatCardProps) {
  const CardWrapper = onClick ? motion.button : motion.div;

  return (
    <CardWrapper
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large text-left w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-semibold">
          {label}
        </p>
        <div
          className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center border border-${iconColor.replace("text-", "")}/30`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-heading font-bold text-white mb-1">
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {trend && (
          <div
            className={`text-xs font-semibold ${
              trend.isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
















