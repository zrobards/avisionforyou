"use client";

import { useState, useCallback } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertDialog } from "@/components/ui/AlertDialog";

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning";
}

interface AlertOptions {
  title?: string;
  variant?: "info" | "success" | "warning" | "error";
  buttonText?: string;
}

export function useDialog() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    message: string;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    message: "",
    options: {},
    resolve: null,
  });

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    message: string;
    options: AlertOptions;
  }>({
    isOpen: false,
    message: "",
    options: {},
  });

  const confirm = useCallback(
    (message: string, options?: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          message,
          options: options || {},
          resolve,
        });
      });
    },
    []
  );

  const alert = useCallback(
    (message: string, options?: AlertOptions): Promise<void> => {
      return new Promise((resolve) => {
        setAlertState({
          isOpen: true,
          message,
          options: { ...options, _resolve: resolve } as any,
        });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState({
      isOpen: false,
      message: "",
      options: {},
      resolve: null,
    });
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState({
      isOpen: false,
      message: "",
      options: {},
      resolve: null,
    });
  }, [confirmState]);

  const handleAlertClose = useCallback(() => {
    const resolve = (alertState.options as any)?._resolve;
    if (resolve) {
      resolve();
    }
    setAlertState({
      isOpen: false,
      message: "",
      options: {},
    });
  }, [alertState.options]);

  return {
    confirm,
    alert,
    dialogs: (
      <>
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          message={confirmState.message}
          title={confirmState.options.title}
          confirmText={confirmState.options.confirmText}
          cancelText={confirmState.options.cancelText}
          variant={confirmState.options.variant}
        />
        <AlertDialog
          isOpen={alertState.isOpen}
          onClose={handleAlertClose}
          message={alertState.message}
          title={alertState.options.title}
          variant={alertState.options.variant}
          buttonText={alertState.options.buttonText}
        />
      </>
    ),
  };
}

