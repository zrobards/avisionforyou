"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  size = "md",
}: SwitchProps) {
  const sizeClasses = {
    sm: "h-5 w-9",
    md: "h-6 w-11",
    lg: "h-7 w-14",
  };
  
  const thumbSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  const translateClasses = {
    sm: "translate-x-4",
    md: "translate-x-5",
    lg: "translate-x-7",
  };
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        checked ? "bg-trinity-red" : "bg-gray-700",
        className
      )}
    >
      <span className="sr-only">Toggle switch</span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          thumbSizeClasses[size],
          checked ? translateClasses[size] : "translate-x-0"
        )}
      />
    </button>
  );
}











