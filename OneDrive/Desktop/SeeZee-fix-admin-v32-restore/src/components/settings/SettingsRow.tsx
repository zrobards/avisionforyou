"use client";

import { LucideIcon } from "lucide-react";

interface SettingsRowProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  vertical?: boolean;
  danger?: boolean;
}

export function SettingsRow({
  label,
  description,
  icon: Icon,
  children,
  vertical = false,
  danger = false,
}: SettingsRowProps) {
  if (vertical) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className={`w-4 h-4 ${danger ? "text-red-400" : "text-slate-400"}`} />
          )}
          <label className={`text-sm font-medium ${danger ? "text-red-300" : "text-slate-300"}`}>
            {label}
          </label>
        </div>
        {description && (
          <p className={`text-xs ${danger ? "text-red-400/70" : "text-slate-500"}`}>
            {description}
          </p>
        )}
        <div className="pt-1">{children}</div>
      </div>
    );
  }

  return (
    <div 
      className={`
        group flex items-center justify-between py-4 px-4 -mx-4
        rounded-xl transition-all duration-200
        hover:bg-white/[0.02]
        ${danger ? "hover:bg-red-500/[0.05]" : ""}
      `}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <div className={`
            p-2 rounded-lg mt-0.5 transition-colors duration-200
            ${danger 
              ? "bg-red-500/10 text-red-400 group-hover:bg-red-500/15" 
              : "bg-white/[0.05] text-slate-400 group-hover:text-slate-300 group-hover:bg-white/[0.08]"
            }
          `}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <label className={`
            text-sm font-medium transition-colors duration-200
            ${danger ? "text-red-300" : "text-slate-200 group-hover:text-white"}
          `}>
            {label}
          </label>
          {description && (
            <p className={`
              text-xs mt-0.5 transition-colors duration-200
              ${danger ? "text-red-400/60" : "text-slate-500 group-hover:text-slate-400"}
            `}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );
}

// Divider for settings sections
export function SettingsDivider() {
  return <div className="border-t border-white/[0.06] my-2" />;
}

// Action row with button styling
interface SettingsActionRowProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger" | "primary";
  disabled?: boolean;
  loading?: boolean;
}

export function SettingsActionRow({
  label,
  description,
  icon: Icon,
  onClick,
  variant = "default",
  disabled = false,
  loading = false,
}: SettingsActionRowProps) {
  const variantStyles = {
    default: "bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 border-white/[0.08]",
    danger: "bg-red-500/10 hover:bg-red-500/15 text-red-400 border-red-500/20",
    primary: "bg-violet-500/20 hover:bg-violet-500/25 text-violet-300 border-violet-500/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full flex items-center gap-3 py-3 px-4 rounded-xl
        border transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
      `}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      <div className="flex-1 text-left">
        <div className="font-medium text-sm">{label}</div>
        {description && (
          <div className="text-xs opacity-60 mt-0.5">{description}</div>
        )}
      </div>
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}






