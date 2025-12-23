"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  className,
  variant = "default",
  padding = "md",
  hover = false,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default: "bg-slate-900/50 border border-white/10",
    elevated: "bg-slate-900/80 border border-white/20 shadow-xl",
    outlined: "bg-transparent border-2 border-white/20",
    gradient: "bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10",
  };
  
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        hover && "hover:border-white/30 hover:shadow-lg cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardHeader({
  className,
  title,
  description,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between mb-4",
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-white mb-1">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-slate-400">
            {description}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn("", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: "start" | "center" | "end" | "between";
}

export function CardFooter({
  className,
  justify = "end",
  children,
  ...props
}: CardFooterProps) {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 mt-6 pt-6 border-t border-white/10",
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}








