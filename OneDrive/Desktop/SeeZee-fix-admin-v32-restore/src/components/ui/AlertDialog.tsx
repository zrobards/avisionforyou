"use client";

import * as React from "react";
import { X, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  buttonText?: string;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  buttonText = "OK",
}: AlertDialogProps) {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  
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

  const variantStyles = {
    info: {
      icon: Info,
      iconColor: "text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-400",
      button: "bg-green-600 hover:bg-green-700 text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    error: {
      icon: XCircle,
      iconColor: "text-red-400",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
  };

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  // Auto-detect variant from message emojis/prefixes
  const detectVariant = (msg: string): typeof variant => {
    if (msg.startsWith("✅") || msg.startsWith("✓") || msg.includes("success")) {
      return "success";
    }
    if (msg.startsWith("❌") || msg.startsWith("✗") || msg.includes("error") || msg.includes("failed")) {
      return "error";
    }
    if (msg.startsWith("⚠️") || msg.startsWith("ℹ️") || msg.includes("warning")) {
      return "warning";
    }
    return "info";
  };

  const finalVariant = variant === "info" ? detectVariant(message) : variant;
  const finalStyles = variantStyles[finalVariant];
  const FinalIcon = finalStyles.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-50 w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-white/10">
              <div className={cn("flex-shrink-0 mt-0.5", finalStyles.iconColor)}>
                <FinalIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id="alert-dialog-title"
                    className="text-xl font-bold text-white mb-2"
                  >
                    {title}
                  </h2>
                )}
                <p
                  id="alert-dialog-description"
                  className="text-slate-300 text-sm leading-relaxed whitespace-pre-line"
                >
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-end p-6 bg-slate-800/50">
              <button
                onClick={onClose}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  finalStyles.button
                )}
              >
                {buttonText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

