"use client";

import * as React from "react";
import { X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);
  
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const variantStyles = {
    default: {
      icon: "text-blue-400",
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    danger: {
      icon: "text-red-400",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: "text-amber-400",
      confirmButton: "bg-amber-600 hover:bg-amber-700 text-white",
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? handleCancel : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-50 w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-white/10">
              <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id="confirm-dialog-title"
                    className="text-xl font-bold text-white mb-2"
                  >
                    {title}
                  </h2>
                )}
                <p
                  id="confirm-dialog-description"
                  className="text-slate-300 text-sm leading-relaxed whitespace-pre-line"
                >
                  {message}
                </p>
              </div>
              {!isLoading && (
                <button
                  onClick={handleCancel}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 bg-slate-800/50">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  styles.confirmButton
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

