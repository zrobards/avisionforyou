"use client";

import { LucideIcon } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardContent } from "./GlassCard";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: "elevated" | "inset" | "outlined" | "subtle";
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  variant = "elevated",
}: SettingsSectionProps) {
  return (
    <GlassCard variant={variant} padding="lg" hoverEffect={false}>
      <GlassCardHeader
        icon={Icon && <Icon className="w-5 h-5" />}
        title={title}
        description={description}
      />
      <GlassCardContent>
        {children}
      </GlassCardContent>
    </GlassCard>
  );
}

// Alternative inline section without card wrapper
interface SettingsSectionInlineProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSectionInline({
  title,
  description,
  children,
}: SettingsSectionInlineProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-white/[0.06] pb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}









