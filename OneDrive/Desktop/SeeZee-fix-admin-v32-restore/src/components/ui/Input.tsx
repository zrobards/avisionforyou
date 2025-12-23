"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const inputType = showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;
    
    const hasValue = props.value !== undefined && props.value !== "";
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              error ? "text-red-400" : "text-gray-300"
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            type={inputType}
            className={cn(
              "w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-bus-navy-light border rounded-lg text-white placeholder-gray-500 transition-all duration-200 text-base sm:text-sm",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              leftIcon && "pl-9 sm:pl-10",
              (rightIcon || showPasswordToggle || error || success) && "pr-9 sm:pr-10",
              error
                ? "border-red-500 focus:ring-red-500"
                : success
                ? "border-emerald-500 focus:ring-emerald-500"
                : "border-gray-800 focus:ring-bus-red focus:border-transparent",
              disabled && "opacity-50 cursor-not-allowed",
              isFocused && !error && !success && "border-bus-red",
              className
            )}
            ref={ref}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {/* Right Icons */}
          <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
            {/* Error Icon */}
            {error && (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            
            {/* Success Icon */}
            {success && !error && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            
            {/* Password Toggle */}
            {showPasswordToggle && type === "password" && !error && !success && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
            
            {/* Custom Right Icon */}
            {rightIcon && !error && !success && !showPasswordToggle && (
              <div className="text-gray-500">{rightIcon}</div>
            )}
          </div>
        </div>
        
        {/* Helper Text / Error Message */}
        {(helperText || error) && (
          <p
            className={cn(
              "mt-2 text-sm",
              error ? "text-red-400" : "text-gray-400"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };




