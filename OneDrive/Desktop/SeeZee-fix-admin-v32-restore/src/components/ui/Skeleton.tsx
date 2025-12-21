"use client";

import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className,
  variant = "rect",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    rect: "rounded-lg",
    circle: "rounded-full",
  };
  
  const baseClasses = "bg-slate-800 animate-pulse";
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;
  
  if (count === 1) {
    return (
      <div
        className={cn(baseClasses, variantClasses[variant], className)}
        style={style}
      />
    );
  }
  
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClasses, variantClasses[variant], className)}
          style={style}
        />
      ))}
    </div>
  );
}




