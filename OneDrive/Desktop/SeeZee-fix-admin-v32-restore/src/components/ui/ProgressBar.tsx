"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  animated?: boolean;
  gradient?: boolean;
}

export default function ProgressBar({
  value,
  className = "",
  animated = true,
  gradient = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-800 ${className}`}>
      <motion.div
        className={`h-full ${
          gradient
            ? "bg-gradient-to-r from-blue-600 to-purple-600"
            : "bg-trinity-red"
        }`}
        initial={animated ? { width: 0 } : { width: `${clampedValue}%` }}
        animate={{ width: `${clampedValue}%` }}
        transition={animated ? { duration: 1, ease: "easeOut" } : { duration: 0 }}
      />
    </div>
  );
}

