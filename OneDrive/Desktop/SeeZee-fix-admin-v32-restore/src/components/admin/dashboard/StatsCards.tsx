"use client";

import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiDollarSign,
  FiFolder,
  FiUsers,
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
      bgClass: "bg-trinity-red/20",
      iconClass: "text-trinity-red",
    },
    {
      label: "Total Revenue",
      value: currencyFormatter.format(revenueValue),
      Icon: FiDollarSign,
      bgClass: "bg-trinity-red/20",
      iconClass: "text-trinity-red",
    },
    {
      label: "Total Clients",
      value: stats.totalClients ?? 0,
      Icon: FiUsers,
      bgClass: "bg-trinity-red/20",
      iconClass: "text-trinity-red",
    },
    {
      label: "Unpaid Invoices",
      value: stats.unpaidInvoices ?? 0,
      Icon: FiAlertCircle,
      bgClass: "bg-trinity-red/20",
      iconClass: "text-trinity-red",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, Icon, bgClass, iconClass }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="rounded-2xl border-2 border-gray-700 glass-effect p-6 hover:border-trinity-red/50 transition-all duration-300 hover:shadow-large group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgClass} border border-trinity-red/30 group-hover:scale-110 transition-transform`}>
              <Icon className={`h-6 w-6 ${iconClass}`} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-heading font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default StatsCards;

