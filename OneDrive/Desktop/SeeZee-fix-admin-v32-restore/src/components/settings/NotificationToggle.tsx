"use client";

import { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/Switch";

interface NotificationToggleProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function NotificationToggle({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  disabled = false,
}: NotificationToggleProps) {
  return (
    <div 
      className={`
        group flex items-center justify-between py-4 px-4 -mx-4 first:-mt-2 last:-mb-2
        rounded-xl transition-all duration-200
        hover:bg-white/[0.02]
        ${disabled ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-start gap-3 flex-1">
        {Icon && (
          <div className={`
            p-2 rounded-lg transition-colors duration-200
            ${checked 
              ? "bg-violet-500/15 text-violet-400" 
              : "bg-white/[0.05] text-slate-500 group-hover:text-slate-400"
            }
          `}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="pt-0.5">
          <label 
            className={`
              text-sm font-medium transition-colors duration-200 cursor-pointer
              ${checked ? "text-white" : "text-slate-300 group-hover:text-slate-200"}
            `}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors">
              {description}
            </p>
          )}
        </div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onChange} 
        disabled={disabled}
      />
    </div>
  );
}

// Group of notification toggles with a header
interface NotificationGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function NotificationGroup({ title, description, children }: NotificationGroupProps) {
  return (
    <div className="space-y-1">
      <div className="px-4 py-2">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] divide-y divide-white/[0.04]">
        {children}
      </div>
    </div>
  );
}

// Styled notification toggle for inside groups
export function NotificationToggleItem({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  disabled = false,
}: NotificationToggleProps) {
  return (
    <div 
      className={`
        group flex items-center justify-between py-3 px-4
        transition-all duration-200
        hover:bg-white/[0.02]
        first:rounded-t-xl last:rounded-b-xl
        ${disabled ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        {Icon && (
          <Icon className={`
            w-4 h-4 transition-colors duration-200
            ${checked ? "text-violet-400" : "text-slate-500"}
          `} />
        )}
        <div>
          <label 
            className={`
              text-sm font-medium transition-colors duration-200 cursor-pointer
              ${checked ? "text-slate-200" : "text-slate-400"}
            `}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onChange} 
        disabled={disabled}
      />
    </div>
  );
}






