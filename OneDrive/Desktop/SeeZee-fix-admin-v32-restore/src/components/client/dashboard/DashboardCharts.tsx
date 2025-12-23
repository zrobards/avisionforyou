'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { FiTrendingUp, FiPieChart, FiClock } from 'react-icons/fi';

// =============================================================================
// TYPES
// =============================================================================

interface ProjectStatusData {
  name: string;
  value: number;
  color: string;
}

interface HoursUsageData {
  month: string;
  used: number;
  included: number;
}

interface ChartsProps {
  projectsByStatus: Record<string, number>;
  hoursHistory?: Array<{
    month: string;
    used: number;
    included: number;
  }>;
  hoursBalance?: {
    monthlyUsed: number;
    monthlyIncluded: number;
    rolloverHours: number;
    packHours: number;
    totalAvailable: number;
  };
}

// =============================================================================
// COLORS
// =============================================================================

const STATUS_COLORS: Record<string, string> = {
  LEAD: '#6366f1',
  QUOTED: '#8b5cf6',
  DEPOSIT_PAID: '#a855f7',
  ACTIVE: '#22c55e',
  REVIEW: '#eab308',
  COMPLETED: '#10b981',
  MAINTENANCE: '#06b6d4',
  CANCELLED: '#ef4444',
};

const HOURS_COLORS = {
  monthly: '#22c55e',
  rollover: '#06b6d4',
  packs: '#a855f7',
  used: '#ef4444', // Solid red for used hours
};

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      {label && (
        <p className="text-xs text-gray-400 mb-2">{label}</p>
      )}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-white">
            {entry.name}: {entry.value}
            {entry.dataKey === 'used' || entry.dataKey === 'included' ? ' hrs' : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function DashboardCharts({
  projectsByStatus,
  hoursHistory,
  hoursBalance,
}: ChartsProps) {
  // Transform project status data for pie chart
  const projectStatusData = useMemo(() => {
    return Object.entries(projectsByStatus)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        name: status.replace(/_/g, ' '),
        value,
        color: STATUS_COLORS[status] || '#6b7280',
      }));
  }, [projectsByStatus]);

  // Transform hours balance for donut chart
  const hoursDonutData = useMemo(() => {
    if (!hoursBalance) return [];
    
    const data = [];
    
    // Add used hours first (so it appears in the pie chart)
    if (hoursBalance.monthlyUsed > 0) {
      data.push({
        name: 'Used',
        value: hoursBalance.monthlyUsed,
        color: HOURS_COLORS.used,
      });
    }
    
    // Add available hours
    if (hoursBalance.monthlyIncluded - hoursBalance.monthlyUsed > 0) {
      data.push({
        name: 'Monthly',
        value: hoursBalance.monthlyIncluded - hoursBalance.monthlyUsed,
        color: HOURS_COLORS.monthly,
      });
    }
    if (hoursBalance.rolloverHours > 0) {
      data.push({
        name: 'Rollover',
        value: hoursBalance.rolloverHours,
        color: HOURS_COLORS.rollover,
      });
    }
    if (hoursBalance.packHours > 0) {
      data.push({
        name: 'Hour Packs',
        value: hoursBalance.packHours,
        color: HOURS_COLORS.packs,
      });
    }
    return data;
  }, [hoursBalance]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Status Distribution */}
      {projectStatusData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <FiPieChart className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Projects by Status</h3>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-40 h-40 min-w-[160px] min-h-[160px] flex-shrink-0" style={{ width: '160px', height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2">
              {projectStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-400 flex-1">{item.name}</span>
                  <span className="text-sm font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Hours Balance Breakdown */}
      {hoursBalance && hoursDonutData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/20 rounded-xl">
              <FiClock className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Hours Breakdown</h3>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-40 h-40 min-w-[160px] min-h-[160px] flex-shrink-0" style={{ width: '160px', height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hoursDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {hoursDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {hoursBalance.totalAvailable}
                </span>
                <span className="text-xs text-gray-400">hrs total</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {hoursDonutData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-sm flex-1 ${item.name === 'Used' ? 'text-red-400' : 'text-gray-400'}`}>
                    {item.name}
                  </span>
                  <span className={`text-sm font-semibold ${item.name === 'Used' ? 'text-red-400' : 'text-white'}`}>
                    {item.value}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Hours Usage Trend */}
      {hoursHistory && hoursHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <FiTrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Hours Usage Trend</h3>
          </div>

          <div className="h-64 w-full" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hoursHistory}>
                <defs>
                  <linearGradient id="usedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="included"
                  stroke="#6b7280"
                  strokeDasharray="5 5"
                  fill="none"
                  name="Included"
                />
                <Area
                  type="monotone"
                  dataKey="used"
                  stroke="#22c55e"
                  fill="url(#usedGradient)"
                  name="Used"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
