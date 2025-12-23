"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function UsernameInput({ value, onChange, error }: UsernameInputProps) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!value || value.length < 3) {
      setAvailable(null);
      setLocalError("");
      return;
    }

    // Validate format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(value)) {
      setLocalError("Only letters, numbers, underscores, and dashes allowed");
      setAvailable(false);
      return;
    }

    if (value.length > 20) {
      setLocalError("Username must be 20 characters or less");
      setAvailable(false);
      return;
    }

    setLocalError("");

    // Debounce API call
    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(value)}`
        );
        const data = await response.json();
        setAvailable(data.available);
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <Input
        type="text"
        label="Username"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error || localError || (available === false ? "Username already taken" : undefined)}
        placeholder="johndoe"
      />
      
      {value && value.length >= 3 && !localError && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {checking && (
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          )}
          {!checking && available === true && (
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {!checking && available === false && (
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}








