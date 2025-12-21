"use client";

/**
 * Section Card wrapper for content areas
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/ui";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  delay = 0,
  className,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        `
        relative overflow-hidden
        rounded-2xl
        border border-white/10
        bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/60
        backdrop-blur-xl
        hover:border-white/20
        transition-all duration-300
        hover:shadow-xl
      `,
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative z-10">
        {(title || description || action) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/5">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-heading font-semibold text-white">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-slate-400 mt-1">{description}</p>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </motion.div>
  );
}
