"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { LucideIcon, Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-violet-600 to-fuchsia-600
    hover:from-violet-500 hover:to-fuchsia-500
    text-white font-semibold
    shadow-[0_4px_20px_rgba(139,92,246,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
    hover:shadow-[0_6px_24px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
    active:scale-[0.98]
  `,
  secondary: `
    bg-white/[0.06] hover:bg-white/[0.1]
    border border-white/[0.1] hover:border-white/[0.15]
    text-slate-200 hover:text-white
    shadow-[0_2px_8px_rgba(0,0,0,0.2)]
  `,
  ghost: `
    bg-transparent hover:bg-white/[0.05]
    text-slate-300 hover:text-white
    border border-transparent hover:border-white/[0.08]
  `,
  danger: `
    bg-red-500/10 hover:bg-red-500/20
    border border-red-500/20 hover:border-red-500/30
    text-red-400 hover:text-red-300
    shadow-[0_2px_8px_rgba(239,68,68,0.1)]
  `,
  success: `
    bg-green-500/10 hover:bg-green-500/20
    border border-green-500/20 hover:border-green-500/30
    text-green-400 hover:text-green-300
    shadow-[0_2px_8px_rgba(34,197,94,0.1)]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-base gap-2.5 rounded-xl",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      loading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-medium whitespace-nowrap
          transition-all duration-200 ease-out
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
            {children && <span>{children}</span>}
            {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
          </>
        )}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

// Icon-only button
interface GlassIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  "aria-label": string;
}

export const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  (
    {
      icon: Icon,
      variant = "ghost",
      size = "md",
      loading = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const sizeMap = { sm: "p-1.5", md: "p-2", lg: "p-3" };
    const iconSizeMap = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center rounded-xl
          transition-all duration-200 ease-out
          ${variantStyles[variant]}
          ${sizeMap[size]}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className={`${iconSizeMap[size]} animate-spin`} />
        ) : (
          <Icon className={iconSizeMap[size]} />
        )}
      </button>
    );
  }
);

GlassIconButton.displayName = "GlassIconButton";








