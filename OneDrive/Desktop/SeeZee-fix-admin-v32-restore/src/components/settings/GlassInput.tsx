"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import { LucideIcon, Eye, EyeOff } from "lucide-react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  icon?: LucideIcon;
  error?: string;
  success?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, description, icon: Icon, error, success, className = "", type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full bg-white/[0.03] backdrop-blur-sm
              border rounded-xl px-4 py-3
              text-white placeholder:text-slate-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-violet-500/30
              ${Icon ? "pl-11" : ""}
              ${isPassword ? "pr-11" : ""}
              ${error 
                ? "border-red-500/50 focus:border-red-500/50" 
                : success 
                  ? "border-green-500/50 focus:border-green-500/50"
                  : "border-white/[0.08] focus:border-violet-500/50 hover:border-white/[0.12]"
              }
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {description && !error && !success && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
        {success && <p className="text-xs text-green-400">{success}</p>}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

// Textarea variant
interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  characterCount?: boolean;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ label, description, error, characterCount, maxLength, value, className = "", ...props }, ref) => {
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={`
            w-full bg-white/[0.03] backdrop-blur-sm
            border rounded-xl px-4 py-3
            text-white placeholder:text-slate-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-violet-500/30
            resize-none
            ${error 
              ? "border-red-500/50 focus:border-red-500/50" 
              : "border-white/[0.08] focus:border-violet-500/50 hover:border-white/[0.12]"
            }
            ${className}
          `}
          {...props}
        />
        <div className="flex justify-between items-center">
          {description && !error && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          {characterCount && maxLength && (
            <p className={`text-xs ml-auto ${currentLength >= maxLength ? "text-amber-400" : "text-slate-500"}`}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

GlassTextarea.displayName = "GlassTextarea";

// Select variant
interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ label, description, error, options, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full bg-white/[0.03] backdrop-blur-sm
            border rounded-xl px-4 py-3
            text-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-violet-500/30
            appearance-none
            cursor-pointer
            bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
            bg-no-repeat bg-[right_12px_center] bg-[length:20px]
            ${error 
              ? "border-red-500/50 focus:border-red-500/50" 
              : "border-white/[0.08] focus:border-violet-500/50 hover:border-white/[0.12]"
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
        {description && !error && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

GlassSelect.displayName = "GlassSelect";






