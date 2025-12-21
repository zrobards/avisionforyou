"use client";

import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiDollarSign,
  FiFolder,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";

export interface AdminStats {
  activeProjects?: number;
  totalRevenue?: number;
  totalClients?: number;
  unpaidInvoices?: number;
}

interface StatsCardsProps {
  stats: AdminStats;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function StatsCards({ stats }: StatsCardsProps) {
  // Convert Decimal to number safely
  const revenueValue = stats.totalRevenue 
    ? (typeof stats.totalRevenue === 'number' 
        ? stats.totalRevenue 
        : Number(stats.totalRevenue) || 0)
    : 0;

  const cards = [
    {
      label: "Active Projects",
      value: stats.activeProjects ?? 0,
      Icon: FiFolder,
      iconBgClass: "bg-[#3b82f6]/20",
      iconTextClass: "text-[#3b82f6]",
      borderGlow: "hover:shadow-[#3b82f6]/10",
      trend: "+2",
      trendUp: true,
    },
    {
      label: "Total Revenue",
      value: currencyFormatter.format(revenueValue),
      Icon: FiDollarSign,
      iconBgClass: "bg-[#22d3ee]/20",
      iconTextClass: "text-[#22d3ee]",
      borderGlow: "hover:shadow-[#22d3ee]/10",
      trend: "+23%",
      trendUp: true,
    },
    {
      label: "Total Clients",
      value: stats.totalClients ?? 0,
      Icon: FiUsers,
      iconBgClass: "bg-[#10b981]/20",
      iconTextClass: "text-[#10b981]",
      borderGlow: "hover:shadow-[#10b981]/10",
      trend: "+5",
      trendUp: true,
    },
    {
      label: "Unpaid Invoices",
      value: stats.unpaidInvoices ?? 0,
      Icon: FiAlertCircle,
      iconBgClass: "bg-[#f59e0b]/20",
      iconTextClass: "text-[#f59e0b]",
      borderGlow: "hover:shadow-[#f59e0b]/10",
      trend: (stats.unpaidInvoices ?? 0) > 0 ? "Action needed" : "All clear",
      trendUp: (stats.unpaidInvoices ?? 0) === 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, Icon, iconBgClass, iconTextClass, borderGlow, trend, trendUp }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
          whileHover={{ y: -4, scale: 1.02 }}
          className={`
            relative overflow-hidden rounded-2xl 
            border border-white/10 
            bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 
            backdrop-blur-xl 
            p-6 
            transition-all duration-300 
            hover:border-white/20 
            hover:shadow-xl ${borderGlow}
            group
          `}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgClass} transition-transform group-hover:scale-110`}>
                <Icon className={`h-6 w-6 ${iconTextClass}`} />
              </div>
              {/* Trend indicator */}
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                trendUp 
                  ? "bg-[#10b981]/10 text-[#10b981]" 
                  : "bg-[#f59e0b]/10 text-[#f59e0b]"
              }`}>
                {trendUp ? (
                  <FiTrendingUp className="h-3 w-3" />
                ) : (
                  <FiTrendingDown className="h-3 w-3" />
                )}
                <span>{trend}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight">{value}</p>
              <p className="text-sm text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default StatsCards;
