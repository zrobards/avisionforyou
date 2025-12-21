"use client";

import { IconType } from "react-icons";
import { motion } from "framer-motion";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

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
  iconColor = "text-[#22d3ee]",
  iconBgColor = "bg-[#22d3ee]/20",
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
      className="
        relative overflow-hidden
        rounded-2xl 
        border border-white/10 
        bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 
        backdrop-blur-xl 
        p-6 
        text-white 
        hover:border-white/20 
        transition-all duration-300 
        group 
        hover:shadow-xl 
        text-left 
        w-full
      "
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                trend.isPositive 
                  ? "text-[#10b981] bg-[#10b981]/10" 
                  : "text-[#ef4444] bg-[#ef4444]/10"
              }`}
            >
              {trend.isPositive ? (
                <FiTrendingUp className="w-3 h-3" />
              ) : (
                <FiTrendingDown className="w-3 h-3" />
              )}
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </div>
          )}
        </div>
        <div>
          <p className="text-3xl lg:text-4xl font-heading font-bold text-white mb-1 tracking-tight">
            {value}
          </p>
          <p className="text-sm uppercase tracking-wider text-slate-400">
            {label}
          </p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </CardWrapper>
  );
}
