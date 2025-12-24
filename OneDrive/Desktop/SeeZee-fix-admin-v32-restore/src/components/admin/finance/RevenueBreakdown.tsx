"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Invoice {
  id: string;
  status: string;
  total: number;
  invoiceType?: string | null;
}

interface RevenueBreakdownProps {
  invoices: Invoice[];
}

const COLORS = ["#dc2626", "#22d3ee", "#f59e0b", "#10b981", "#8b5cf6"];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border-2 border-gray-700 bg-[#151b2e] p-3 shadow-xl">
        <p className="text-sm font-semibold text-white">{payload[0].name}</p>
        <p className="text-sm text-gray-400">
          {currencyFormatter.format(payload[0].value)}
        </p>
        <p className="text-xs text-gray-500">{payload[0].payload.percentage}%</p>
      </div>
    );
  }
  return null;
}

export function RevenueBreakdown({ invoices }: RevenueBreakdownProps) {
  const data = useMemo(() => {
    // Group paid invoices by type
    const paidInvoices = invoices.filter((inv) => inv.status === "PAID");
    
    const typeGroups: Record<string, number> = {};
    
    for (const invoice of paidInvoices) {
      const type = invoice.invoiceType || "project";
      const label = type === "deposit" ? "Deposits" 
        : type === "final" ? "Final Payments"
        : type === "subscription" ? "Maintenance"
        : type === "custom" ? "Custom"
        : "Projects";
      
      typeGroups[label] = (typeGroups[label] || 0) + invoice.total;
    }

    const total = Object.values(typeGroups).reduce((sum, val) => sum + val, 0);

    return Object.entries(typeGroups)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.value - a.value);
  }, [invoices]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <section className="rounded-2xl border-2 border-gray-700 glass-effect p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Revenue Breakdown
        </h3>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-sm text-gray-500">No revenue data available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-gray-700 glass-effect p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Revenue Breakdown
      </h3>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-4">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-400">{item.name}</span>
            </div>
            <span className="text-white font-medium">
              {currencyFormatter.format(item.value)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Total</span>
          <span className="text-xl font-bold text-white">
            {currencyFormatter.format(total)}
          </span>
        </div>
      </div>
    </section>
  );
}

export default RevenueBreakdown;







