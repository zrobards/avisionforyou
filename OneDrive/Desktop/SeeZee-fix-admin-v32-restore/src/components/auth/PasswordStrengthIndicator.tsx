"use client";

import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    const emptyChecks = {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    };
    
    if (!password) return { score: 0, label: "", color: "", checks: emptyChecks };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    // Calculate score
    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    // Determine strength
    let label = "";
    let color = "";
    if (score <= 2) {
      label = "Weak";
      color = "bg-red-500";
    } else if (score <= 3) {
      label = "Medium";
      color = "bg-yellow-500";
    } else if (score <= 4) {
      label = "Strong";
      color = "bg-green-500";
    } else {
      label = "Very Strong";
      color = "bg-emerald-500";
    }

    return { score, label, color, checks };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1 text-xs text-slate-400">
        <div className={strength.checks.length ? "text-green-400" : ""}>
          {strength.checks.length ? "✓" : "○"} At least 8 characters
        </div>
        <div className={strength.checks.uppercase ? "text-green-400" : ""}>
          {strength.checks.uppercase ? "✓" : "○"} One uppercase letter
        </div>
        <div className={strength.checks.lowercase ? "text-green-400" : ""}>
          {strength.checks.lowercase ? "✓" : "○"} One lowercase letter
        </div>
        <div className={strength.checks.number ? "text-green-400" : ""}>
          {strength.checks.number ? "✓" : "○"} One number
        </div>
        <div className={strength.checks.special ? "text-green-400" : ""}>
          {strength.checks.special ? "✓" : "○"} One special character
        </div>
      </div>
    </div>
  );
}











