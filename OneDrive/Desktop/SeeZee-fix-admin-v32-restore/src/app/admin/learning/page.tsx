"use client";

import { useState, useEffect } from "react";
import { TrendingUp, AlertCircle, Trophy, Users } from "lucide-react";
import StatsBar from "@/components/ceo/StatsBar";

interface LearningOverview {
  totals: {
    totalAssigned: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    completionRate: number;
  };
  overdue: {
    count: number;
    list: Array<{
      id: string;
      user: { id: string; name: string | null; email: string };
      training: { id: string; title: string; type: string };
      dueAt: string;
      status: string;
      daysOverdue: number;
    }>;
  };
  roleCompletionRates: Array<{
    role: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  leaderboard: Array<{
    user: { id: string; name: string | null; email: string };
    completed: number;
    total: number;
    completionRate: number;
  }>;
}

export default function AdminLearningPage() {
  const [data, setData] = useState<LearningOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/learning/overview");
      if (!response.ok) {
        throw new Error("Failed to fetch learning overview");
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Learning Overview</h1>
          <p className="admin-page-subtitle">Team training and completion analytics</p>
        </div>
        <div className="text-center py-12 text-slate-400">Loading overview...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Learning Overview</h1>
          <p className="admin-page-subtitle">Team training and completion analytics</p>
        </div>
        <div className="glass p-6 rounded-lg border border-red-500/20 bg-red-500/10">
          <p className="text-red-400">{error || "Failed to load data"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Learning Overview</h1>
        <p className="admin-page-subtitle">
          Team training and completion analytics (Read-Only)
        </p>
      </div>

      {/* Overall Stats */}
      <StatsBar
        totalAssigned={data.totals.totalAssigned}
        inProgress={data.totals.inProgress}
        completed={data.totals.completed}
        notStarted={data.totals.notStarted}
      />

      {/* Overdue Assignments Alert */}
      {data.overdue.count > 0 && (
        <div className="seezee-glass p-4 rounded-xl border border-seezee-orange/20 bg-seezee-orange/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-seezee-orange" />
            <h3 className="text-lg font-semibold text-seezee-orange">
              {data.overdue.count} Overdue Assignment{data.overdue.count !== 1 ? "s" : ""}
            </h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.overdue.list.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-seezee-card-bg rounded-lg flex items-center justify-between border border-white/5"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {item.user.name || item.user.email}
                  </div>
                  <div className="text-xs text-slate-400">{item.training.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-seezee-orange font-medium">
                    {item.daysOverdue} day{item.daysOverdue !== 1 ? "s" : ""} overdue
                  </div>
                  <div className="text-xs text-slate-500">
                    Due: {new Date(item.dueAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Completion Rates & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Completion Rates */}
        <div className="seezee-glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-seezee-purple" />
            <h3 className="text-lg font-semibold text-white">Completion by Role</h3>
          </div>
          <div className="space-y-3">
            {data.roleCompletionRates.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-sm">
                No data available
              </p>
            ) : (
              data.roleCompletionRates.map((roleData) => (
                <div key={roleData.role} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{roleData.role}</span>
                    <span className="text-slate-400">
                      {roleData.completed}/{roleData.total} ({roleData.completionRate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-seezee-card-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-seezee-red to-seezee-blue"
                      style={{ width: `${roleData.completionRate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="seezee-glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-seezee-yellow" />
            <h3 className="text-lg font-semibold text-white">Top Performers</h3>
          </div>
          <div className="space-y-2">
            {data.leaderboard.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-sm">
                No completions yet
              </p>
            ) : (
              data.leaderboard.map((entry, index) => (
                <div
                  key={entry.user.id}
                  className="flex items-center gap-3 p-3 bg-seezee-card-bg rounded-lg border border-white/5"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-seezee-yellow/20 text-seezee-yellow"
                        : index === 1
                        ? "bg-slate-400/20 text-slate-300"
                        : index === 2
                        ? "bg-seezee-orange/20 text-seezee-orange"
                        : "bg-seezee-card-bg text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {entry.user.name || entry.user.email}
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.completed} completed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-seezee-green">
                      {entry.completionRate}%
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.completed}/{entry.total}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="seezee-glass p-4 rounded-xl">
        <p className="text-sm text-slate-400 text-center">
          <Users className="w-4 h-4 inline mr-2" />
          This is a read-only view. To create or assign trainings, visit the{" "}
          <a href="/admin/ceo/training" className="text-seezee-blue hover:underline">
            CEO Training Dashboard
          </a>
          .
        </p>
      </div>
    </div>
  );
}
