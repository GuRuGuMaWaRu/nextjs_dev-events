import { z } from "zod";

import { VALID_EVENT_MODES } from "@/database/event.model";

const Text = z.string().trim();

const DateString = Text.regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => {
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
}, "Invalid calendar date");

const TimeString = Text.regex(
  /^([01]\d|2[0-3]):[0-5]\d$/,
  "Invalid time (HH:MM)",
);

const ImageSchema = z
  .custom<File>((v): v is File => v instanceof File, {
    message: "Image is required",
  })
  .refine((f) => f.size > 0, "Image is empty")
  .refine((f) => f.size <= 10 * 1024 * 1024, "Image is too large")
  .refine(
    (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    "Unsupported image type",
  );

const CanonicalStringArray = z
  .array(Text.min(1).max(200))
  .transform((arr) => Array.from(new Set(arr.map((s) => s.toLowerCase()))))
  .pipe(z.array(Text.min(1).max(200)).min(1).max(20));

const normalizeStringArray = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return value;
    }

    //** JSON array? */
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }

    //** CSV string? */
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return value;
};

const StringArrayFromAnything = z.preprocess(
  normalizeStringArray,
  CanonicalStringArray,
);

export const EventSchema = z.object({
  title: Text.min(1).max(200),
  description: Text.min(10).max(500),
  overview: Text.min(10).max(2000),
  image: ImageSchema,
  venue: Text.min(1).max(200),
  location: Text.min(1).max(200),
  date: DateString,
  time: TimeString,
  mode: z.enum(VALID_EVENT_MODES, { message: "Invalid mode" }),
  audience: Text.min(1).max(200),
  agenda: StringArrayFromAnything,
  organizer: Text.min(1).max(200),
  tags: StringArrayFromAnything,
});

export const BookEventSchema = z.object({
  email: z.email("Invalid email address"),
});

export type EventSchemaType = z.infer<typeof EventSchema>;
export type BookEventSchemaType = z.infer<typeof BookEventSchema>;
