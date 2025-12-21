"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast, type ToastType } from "@/stores/useToast";
import { cn } from "@/lib/utils";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
};

const styles: Record<ToastType, string> = {
  success: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
  error: "bg-red-500/10 border-red-500/50 text-red-400",
  info: "bg-blue-500/10 border-blue-500/50 text-blue-400",
  warning: "bg-amber-500/10 border-amber-500/50 text-amber-400",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm rounded-lg border backdrop-blur-xl shadow-lg animate-in slide-in-from-top-2 fade-in duration-300",
            styles[toast.type]
          )}
          role="alert"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-sm opacity-90 mt-1">
                    {toast.message}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          {toast.duration && toast.duration > 0 && (
            <div className="h-1 bg-current opacity-20">
              <div
                className="h-full bg-current opacity-50 animate-shrink-width"
                style={{
                  animationDuration: `${toast.duration}ms`,
                }}
              />
            </div>
          )}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-shrink-width {
          animation: shrink-width linear;
        }
      `}</style>
    </div>
  );
}

// Re-export useToast and ToastType for convenience
export { useToast, type ToastType } from "@/stores/useToast";




