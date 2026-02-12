import { AppErrorCode } from "@/core/types";

export const toHttpStatus = (code: AppErrorCode): number => {
  switch (code) {
    case "VALIDATION":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "BUSINESS":
      return 400;
    default:
      return 500;
  }
};
