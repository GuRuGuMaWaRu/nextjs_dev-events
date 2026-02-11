import { z } from "zod";

/**
 * Maps Zod validation issues to fieldErrors format for UI.
 * Multiple messages per field are joined with ". ".
 */
export const zodIssuesToFieldErrors = (
  issues: z.core.$ZodIssue[],
): Record<string, string> => {
  const byPath: Record<string, string[]> = {};

  for (const issue of issues) {
    const path = issue.path.join(".") || "root";

    if (!byPath[path]) {
      byPath[path] = [];
    }
    byPath[path].push(issue.message);
  }

  const result: Record<string, string> = {};
  for (const [path, messages] of Object.entries(byPath)) {
    result[path] = messages.join(". ");
  }
  return result;
};
