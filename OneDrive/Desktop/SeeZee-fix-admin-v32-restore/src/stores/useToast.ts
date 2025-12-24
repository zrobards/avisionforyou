import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  showToast: (title: string, type?: ToastType) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 5000; // Default 5 seconds
    const newToast: Toast = {
      ...toast,
      id,
      duration,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
  
  showToast: (title: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      type,
      title,
      duration: 5000,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },
}));

// Helper functions for common toast types
export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    useToast.getState().addToast({ type: "success", title, message, duration });
  },
  
  error: (title: string, message?: string, duration?: number) => {
    useToast.getState().addToast({ type: "error", title, message, duration });
  },
  
  info: (title: string, message?: string, duration?: number) => {
    useToast.getState().addToast({ type: "info", title, message, duration });
  },
  
  warning: (title: string, message?: string, duration?: number) => {
    useToast.getState().addToast({ type: "warning", title, message, duration });
  },
};











