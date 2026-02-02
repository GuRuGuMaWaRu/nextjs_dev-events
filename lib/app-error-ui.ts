import { toast } from "sonner";

import { getAppErrorMessage } from "@/core/app-error";
import { AppResult } from "@/core/types";

type AppFailure = Extract<AppResult<unknown>, { ok: false }>;

type AppErrorHandlers = {
  fallbackMessage?: string;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
  onNotFound?: () => void;
  onValidation?: (fieldErrors?: Record<string, string>) => void;
};

export const handleAppError = (
  failure: AppFailure,
  handlers: AppErrorHandlers = {}
): string => {
  if (failure.code === "UNAUTHORIZED") {
    handlers.onUnauthorized?.();
  }

  if (failure.code === "FORBIDDEN") {
    handlers.onForbidden?.();
  }

  if (failure.code === "NOT_FOUND") {
    handlers.onNotFound?.();
  }

  if (failure.code === "VALIDATION") {
    handlers.onValidation?.(failure.fieldErrors);
  }

  return getAppErrorMessage(failure, handlers.fallbackMessage);
};

export const toastAppError = (
  failure: AppFailure,
  handlers: AppErrorHandlers = {}
): void => {
  const message = handleAppError(failure, handlers);
  toast.error(message);
};
