import { AppErrorCode, AppResult } from "@/core/types";

export type AppFailure = Extract<AppResult<unknown>, { ok: false }>;

const DEFAULT_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  VALIDATION: "Please check your input and try again.",
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "You do not have access to this resource.",
  NOT_FOUND: "We could not find what you are looking for.",
  BUSINESS: "We could not complete that action.",
  INTERNAL: "Something went wrong. Please try again.",
  CONFLICT: "This action conflicts with an existing record.",
};

export const toAppError = (
  error: unknown,
  message: string,
  code: AppErrorCode = "INTERNAL"
): AppFailure => {
  console.error(error);
  return { ok: false, code, message };
};

export const getAppErrorMessage = (
  failure: AppFailure,
  fallbackMessage = DEFAULT_ERROR_MESSAGES.INTERNAL
): string => {
  return (
    failure.message ??
    DEFAULT_ERROR_MESSAGES[failure.code] ??
    fallbackMessage
  );
};
