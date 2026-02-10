import { z } from "zod";

export const zodIssuesToFieldErrors = (
  issues: z.core.$ZodIssue[],
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  for (const issue of issues) {
    const path = issue.path.join(".");

    if (!result[path]) {
      result[path] = [];
    }

    result[path].push(issue.message);
  }

  return result;
};
