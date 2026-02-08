export type AppErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BUSINESS"
  | "INTERNAL"
  | "CONFLICT"
  | "DB"
  | "UNKNOWN";

export type AppResult<T> =
  | {
      ok: true;
      data?: T;
    }
  | {
      ok: false;
      code: AppErrorCode;
      message?: string;
      fieldErrors?: Record<string, string>;
    };
