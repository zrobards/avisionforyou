"use client";

import { forwardRef, HTMLAttributes } from "react";

type GlassVariant = "elevated" | "inset" | "outlined" | "subtle";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  glow?: "none" | "subtle" | "accent";
  hoverEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const variantStyles: Record<GlassVariant, string> = {
  elevated: `
    bg-white/[0.03] backdrop-blur-2xl
    border border-white/[0.08]
    shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
  `,
  inset: `
    bg-black/20 backdrop-blur-xl
    border border-white/[0.04]
    shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
  `,
  outlined: `
    bg-transparent backdrop-blur-lg
    border border-white/10
    hover:border-white/20
  `,
  subtle: `
    bg-white/[0.02] backdrop-blur-xl
    border border-white/[0.05]
  `,
};

const glowStyles: Record<"none" | "subtle" | "accent", string> = {
  none: "",
  subtle: "shadow-[0_0_60px_-12px_rgba(255,255,255,0.1)]",
  accent: "shadow-[0_0_60px_-12px_rgba(168,85,247,0.15),0_0_30px_-8px_rgba(236,72,153,0.1)]",
};

const paddingStyles: Record<"none" | "sm" | "md" | "lg" | "xl", string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
  xl: "p-8",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = "elevated",
      glow = "none",
      hoverEffect = false,
      padding = "lg",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          relative rounded-2xl overflow-hidden
          transition-all duration-300 ease-out
          ${variantStyles[variant]}
          ${glowStyles[glow]}
          ${paddingStyles[padding]}
          ${hoverEffect ? "hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-white/[0.12]" : ""}
          ${className}
        `}
        {...props}
      >
        {/* Gradient border accent at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// Sub-components for structured content
interface GlassCardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function GlassCardHeader({ icon, title, description, action }: GlassCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function GlassCardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function GlassCardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-6 pt-4 border-t border-white/[0.06] ${className}`}>
      {children}
    </div>
  );
}








