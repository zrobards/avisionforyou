"use client";

import { motion } from "framer-motion";
import { SectionCard } from "@/components/admin/SectionCard";
import { Plus, Play, Pause, Settings, Zap } from "lucide-react";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun?: Date;
}

interface AutomationsClientProps {
  automations: Automation[];
}

export function AutomationsClient({ automations }: AutomationsClientProps) {
  return (
    <div className="space-y-6">
      {/* Premium Header with Animated Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        {/* Animated glow orbs */}
        <motion.div 
          className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="relative z-10 p-8 backdrop-blur-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-pink-200 bg-clip-text text-transparent">
                Automations
              </h1>
            </div>
            <p className="text-slate-400 text-lg ml-[60px]">
              Create and manage automated workflows
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600 text-white font-medium shadow-lg shadow-purple-500/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Automation
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Automations List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {automations.map((automation) => (
          <SectionCard key={automation.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {automation.name}
                  </h3>
                  {automation.enabled ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                      Paused
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Trigger:</span>
                    <span className="text-blue-400">{automation.trigger}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Action:</span>
                    <span className="text-white">{automation.action}</span>
                  </div>
                  {automation.lastRun && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Last run:</span>
                      <span className="text-slate-400">
                        {automation.lastRun.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                  {automation.enabled ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </SectionCard>
        ))}
      </motion.div>

      {/* Rule Builder Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SectionCard title="Rule Builder">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-900/40 border border-white/5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">
                    IF (Event)
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm">
                    <option>Project → Completed</option>
                    <option>Invoice → Paid</option>
                    <option>Stripe → Renewal failed</option>
                    <option>Task → Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">
                    THEN (Action)
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm">
                    <option>Send email</option>
                    <option>Create ticket</option>
                    <option>Update status</option>
                    <option>Notify team</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">
                    Target
                  </label>
                  <input
                    type="text"
                    placeholder="Email, user, etc."
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              TODO: Implement full rule builder with condition logic
            </p>
          </div>
        </SectionCard>
      </motion.div>
    </div>
  );
}
