"use client";

import { forwardRef } from "react";

interface GlassSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeStyles = {
  sm: {
    track: "w-8 h-[18px]",
    thumb: "w-3.5 h-3.5",
    translate: "translate-x-[14px]",
  },
  md: {
    track: "w-11 h-6",
    thumb: "w-5 h-5",
    translate: "translate-x-5",
  },
  lg: {
    track: "w-14 h-7",
    thumb: "w-6 h-6",
    translate: "translate-x-7",
  },
};

export const GlassSwitch = forwardRef<HTMLButtonElement, GlassSwitchProps>(
  ({ checked, onCheckedChange, disabled = false, size = "md", label }, ref) => {
    const styles = sizeStyles[size];

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={`
          relative inline-flex items-center rounded-full
          transition-all duration-300 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
          ${styles.track}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${
            checked
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_16px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
              : "bg-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
          }
        `}
      >
        {/* Glow effect when checked */}
        {checked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-sm" />
        )}

        {/* Thumb */}
        <span
          className={`
            relative inline-block rounded-full
            transition-all duration-300 ease-out
            transform
            ${styles.thumb}
            ${
              checked
                ? `${styles.translate} bg-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]`
                : "translate-x-0.5 bg-slate-400 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
            }
          `}
        >
          {/* Inner highlight */}
          <span 
            className={`
              absolute inset-0.5 rounded-full 
              bg-gradient-to-b from-white/40 to-transparent
              transition-opacity duration-300
              ${checked ? "opacity-100" : "opacity-0"}
            `}
          />
        </span>
      </button>
    );
  }
);

GlassSwitch.displayName = "GlassSwitch";






