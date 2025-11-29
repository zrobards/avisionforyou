"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { BillingInfo } from "@/lib/dashboard-helpers";
import type { MockAISuggestion } from "@/lib/mock-ai-suggestions";

interface StatsGridProps {
  billing: BillingInfo;
  files: Array<{
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    createdAt: Date;
  }>;
  aiSuggestions: MockAISuggestion[];
}

export default function StatsGrid({ billing, files, aiSuggestions }: StatsGridProps) {
  const recentFiles = files.slice(0, 3);
  const newAiCount = aiSuggestions.filter(s => s.status === 'NEW').length;
  
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Billing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h3 className="font-semibold text-white">Billing</h3>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Paid Amount */}
          <div>
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-green-400">
              ${billing.totalPaid.toLocaleString()}
            </p>
          </div>
          
          {/* Due Amount */}
          {billing.totalDue > 0 && (
            <div>
              <p className="text-xs text-gray-500">Balance Due</p>
              <p className="text-2xl font-bold text-yellow-400">
                ${billing.totalDue.toLocaleString()}
              </p>
            </div>
          )}
          
          {/* Next Payment */}
          {billing.nextPaymentDue && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
              <p className="text-xs text-yellow-400">Next Payment Due</p>
              <p className="font-semibold text-white">
                {new Date(billing.nextPaymentDue).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {/* Subscription Status */}
          {billing.hasActiveSubscription && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
              <span>Active {billing.subscriptionPlan} Plan</span>
            </div>
          )}
        </div>
        
        <Link
          href="/client/invoices"
          className="mt-4 block rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-center text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800"
        >
          View Invoices
        </Link>
      </motion.div>
      
      {/* Files Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📁</span>
            <h3 className="font-semibold text-white">Files</h3>
          </div>
          <span className="text-sm text-gray-500">{files.length}</span>
        </div>
        
        {recentFiles.length > 0 ? (
          <div className="space-y-2">
            {recentFiles.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 transition-all hover:border-gray-700 hover:bg-gray-900"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  {file.mimeType.startsWith('image/') ? '🖼️' : '📄'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No files yet</p>
        )}
        
        <div className="mt-4 flex gap-2">
          <button className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800">
            Upload
          </button>
          {files.length > 3 && (
            <button className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800">
              View All
            </button>
          )}
        </div>
      </motion.div>
      
      {/* AI Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
        id="ai-insights"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="font-semibold text-white">AI Insights</h3>
          </div>
          {newAiCount > 0 && (
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
              {newAiCount} new
            </span>
          )}
        </div>
        
        {aiSuggestions.length > 0 ? (
          <div className="space-y-2">
            {aiSuggestions.slice(0, 3).map((suggestion) => (
              <div
                key={suggestion.id}
                className="rounded-lg border border-gray-800 bg-gray-900/50 p-3 transition-all hover:border-gray-700"
              >
                <div className="mb-2 flex items-start gap-2">
                  <span className="text-lg">{suggestion.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {suggestion.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${suggestion.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {suggestion.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No suggestions yet</p>
        )}
        
        {aiSuggestions.length > 0 && (
          <button className="mt-4 block w-full rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-4 py-2 text-sm font-medium text-blue-300 transition-all hover:border-blue-500/50 hover:from-blue-600/20 hover:to-purple-600/20">
            View All Insights →
          </button>
        )}
      </motion.div>
    </div>
  );
}

