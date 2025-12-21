"use client";

import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useEffect, useState } from "react";

interface ThemeSelectorProps {
  value?: "light" | "dark" | "auto";
  onChange?: (theme: "light" | "dark" | "auto") => void;
}

const themes = [
  {
    id: "light" as const,
    label: "Light",
    icon: Sun,
    description: "Bright & clean",
    preview: {
      bg: "bg-white",
      surface: "bg-slate-100",
      accent: "bg-violet-500",
    },
  },
  {
    id: "dark" as const,
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes",
    preview: {
      bg: "bg-slate-900",
      surface: "bg-slate-800",
      accent: "bg-violet-500",
    },
  },
  {
    id: "auto" as const,
    label: "System",
    icon: Monitor,
    description: "Match device",
    preview: {
      bg: "bg-gradient-to-r from-white to-slate-900",
      surface: "bg-gradient-to-r from-slate-100 to-slate-800",
      accent: "bg-violet-500",
    },
  },
];

export function ThemeSelector({ value: externalValue, onChange: externalOnChange }: ThemeSelectorProps) {
  const { theme: contextTheme, setTheme: setContextTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("dark");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("dark");

  // Load saved theme mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;
    if (savedMode === "system") {
      setThemeMode("auto");
    } else if (savedMode) {
      setThemeMode(savedMode as "light" | "dark");
    } else {
      setThemeMode(contextTheme === "light" ? "light" : "dark");
    }

    // Detect system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [contextTheme]);

  // Use external value if provided, otherwise use local state
  const currentValue = externalValue ?? themeMode;

  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    setThemeMode(newTheme);

    // Apply the theme
    if (newTheme === "auto") {
      setContextTheme(systemTheme);
      localStorage.setItem("themeMode", "system");
      localStorage.setItem("theme", systemTheme);
    } else {
      setContextTheme(newTheme);
      localStorage.setItem("themeMode", newTheme);
      localStorage.setItem("theme", newTheme);
    }

    // Call external handler if provided
    if (externalOnChange) {
      externalOnChange(newTheme);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isSelected = currentValue === theme.id;

        return (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`
              relative group p-4 rounded-xl transition-all duration-300
              border-2 overflow-hidden
              ${
                isSelected
                  ? "border-violet-500/50 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                  : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]"
              }
            `}
          >
            {/* Theme preview mockup */}
            <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
              <div className={`h-12 ${theme.preview.bg} relative p-1.5`}>
                {/* Mini window chrome */}
                <div className="flex gap-0.5 mb-1">
                  <div className="w-1 h-1 rounded-full bg-red-400/60" />
                  <div className="w-1 h-1 rounded-full bg-yellow-400/60" />
                  <div className="w-1 h-1 rounded-full bg-green-400/60" />
                </div>
                {/* Mini content */}
                <div className="flex gap-1">
                  <div className={`w-1/4 h-4 rounded-sm ${theme.preview.surface}`} />
                  <div className="flex-1">
                    <div className={`h-1.5 w-1/2 rounded-sm ${theme.preview.surface} mb-0.5`} />
                    <div className={`h-1 w-3/4 rounded-sm ${theme.preview.surface} opacity-50`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Icon and label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${isSelected 
                    ? "bg-violet-500/20 text-violet-400" 
                    : "bg-white/[0.05] text-slate-400 group-hover:text-slate-300"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-medium text-sm ${isSelected ? "text-white" : "text-slate-300"}`}>
                  {theme.label}
                </div>
                <div className="text-xs text-slate-500">{theme.description}</div>
              </div>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Glow effect on selected */}
            {isSelected && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-violet-500/10 to-transparent pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Simpler inline version
export function ThemeSelectorInline() {
  const { theme: contextTheme, setTheme: setContextTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("dark");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;
    if (savedMode === "system") {
      setThemeMode("auto");
    } else if (savedMode) {
      setThemeMode(savedMode as "light" | "dark");
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    setThemeMode(newTheme);
    if (newTheme === "auto") {
      setContextTheme(systemTheme);
      localStorage.setItem("themeMode", "system");
    } else {
      setContextTheme(newTheme);
      localStorage.setItem("themeMode", newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <div className="flex gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isSelected = themeMode === theme.id;

        return (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
              ${
                isSelected
                  ? "bg-violet-500/20 text-violet-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-300 hover:bg-white/[0.03]"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
}
