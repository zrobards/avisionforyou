"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface RevenueDataPoint {
  month: string;
  revenue: number;
  invoices: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  isLoading?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0f172a]/95 backdrop-blur-xl p-4 shadow-2xl">
        <p className="text-sm font-semibold text-white mb-2">{label}</p>
        <p className="text-lg font-bold text-[#22d3ee]">
          {currencyFormatter.format(payload[0].value)}
        </p>
        {payload[0].payload.invoices && (
          <p className="text-xs text-slate-400 mt-1">
            {payload[0].payload.invoices} invoice{payload[0].payload.invoices !== 1 ? "s" : ""} paid
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const { totalRevenue, trend, percentChange } = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalRevenue: 0, trend: "up" as const, percentChange: 0 };
    }

    const total = data.reduce((sum, d) => sum + d.revenue, 0);
    
    // Calculate trend (compare last 3 months to previous 3 months)
    const recentMonths = data.slice(-3);
    const previousMonths = data.slice(-6, -3);
    
    const recentTotal = recentMonths.reduce((sum, d) => sum + d.revenue, 0);
    const previousTotal = previousMonths.reduce((sum, d) => sum + d.revenue, 0);
    
    const change = previousTotal > 0 
      ? ((recentTotal - previousTotal) / previousTotal) * 100 
      : 0;

    return {
      totalRevenue: total,
      trend: change >= 0 ? ("up" as const) : ("down" as const),
      percentChange: Math.abs(change),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/5 rounded mb-4" />
        <div className="h-[300px] bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-[#22d3ee]/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-white">
            Revenue Overview
          </h2>
          <p className="text-sm text-slate-400">Last 6 months performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl lg:text-3xl font-bold text-white">
              {currencyFormatter.format(totalRevenue)}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                trend === "up" 
                  ? "bg-[#10b981]/10 text-[#10b981]" 
                  : "bg-[#ef4444]/10 text-[#ef4444]"
              }`}>
                {trend === "up" ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span className="text-sm font-semibold">
                  {percentChange.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs text-slate-500">vs prev period</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[300px] min-h-[300px] mt-4">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#22d3ee" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.05)" 
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
                }
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22d3ee"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm">No revenue data available yet</p>
            <p className="text-xs text-slate-600 mt-1">Data will appear once invoices are paid</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default RevenueChart;
