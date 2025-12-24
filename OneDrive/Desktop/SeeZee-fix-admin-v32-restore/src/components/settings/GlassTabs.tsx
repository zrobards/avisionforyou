"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

interface GlassTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function GlassTabs({ tabs, activeTab, onTabChange, className = "" }: GlassTabsProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  const updateIndicator = useCallback(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabEl = tabsRef.current[activeIndex];
    const container = containerRef.current;

    if (activeTabEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabEl.getBoundingClientRect();
      
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
      setIsInitialized(true);
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div className={`relative ${className}`}>
      {/* Glass container for tabs */}
      <div
        ref={containerRef}
        className="
          relative flex items-center gap-1 p-1.5
          bg-white/[0.03] backdrop-blur-xl
          border border-white/[0.08]
          rounded-2xl
          shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
          overflow-x-auto scrollbar-hide
        "
      >
        {/* Animated background indicator */}
        <div
          className={`
            absolute top-1.5 bottom-1.5 rounded-xl
            bg-gradient-to-r from-violet-500/20 via-fuchsia-500/15 to-violet-500/20
            border border-white/[0.1]
            shadow-[0_0_20px_rgba(139,92,246,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]
            transition-all duration-300 ease-out
            ${isInitialized ? "opacity-100" : "opacity-0"}
          `}
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />

        {/* Tabs */}
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={(el) => { tabsRef.current[index] = el; }}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl
                font-medium text-sm whitespace-nowrap
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }
                ${tab.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {Icon && (
                <Icon
                  className={`
                    w-4 h-4 transition-colors duration-200
                    ${isActive ? "text-violet-400" : "text-slate-500"}
                  `}
                />
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`
                    px-1.5 py-0.5 text-xs font-semibold rounded-full
                    ${
                      isActive
                        ? "bg-violet-500/30 text-violet-300"
                        : "bg-slate-700/50 text-slate-400"
                    }
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Glow effect under active tab */}
      <div
        className="
          absolute -bottom-2 h-4
          bg-gradient-to-r from-transparent via-violet-500/20 to-transparent
          blur-xl
          transition-all duration-300 ease-out pointer-events-none
        "
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: isInitialized ? 1 : 0,
        }}
      />
    </div>
  );
}

// Alternative: Underline-style tabs
interface GlassTabsUnderlineProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function GlassTabsUnderline({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: GlassTabsUnderlineProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  const updateIndicator = useCallback(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabEl = tabsRef.current[activeIndex];
    const container = containerRef.current;

    if (activeTabEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabEl.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
      setIsInitialized(true);
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-px">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={(el) => { tabsRef.current[index] = el; }}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative flex items-center gap-2 py-3 px-1
                font-medium text-sm whitespace-nowrap
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }
                ${tab.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {Icon && (
                <Icon
                  className={`
                    w-4 h-4 transition-colors duration-200
                    ${isActive ? "text-violet-400" : "text-slate-500"}
                  `}
                />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]" />

      {/* Animated underline indicator */}
      <div
        className={`
          absolute bottom-0 h-0.5 rounded-full
          bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500
          transition-all duration-300 ease-out
          ${isInitialized ? "opacity-100" : "opacity-0"}
        `}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />

      {/* Glow under underline */}
      <div
        className="
          absolute -bottom-1 h-3
          bg-gradient-to-r from-transparent via-violet-500/40 to-transparent
          blur-md
          transition-all duration-300 ease-out pointer-events-none
        "
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: isInitialized ? 1 : 0,
        }}
      />
    </div>
  );
}









