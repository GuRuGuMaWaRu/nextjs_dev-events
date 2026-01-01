import { Schema, model, models, type Document, type Model } from "mongoose";

// Domain type for event modes.
export type EventMode = "online" | "offline" | "hybrid";

// Valid event mode values for validation.
const VALID_EVENT_MODES: EventMode[] = ["online", "offline", "hybrid"];

// Attributes required to create an Event.
export interface EventAttrs {
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as normalized ISO date string (YYYY-MM-DD)
  time: string; // stored as normalized 24h time string (HH:mm)
  mode: EventMode;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

// Mongoose document type including timestamps.
export interface EventDocument extends Document, EventAttrs {
  createdAt: Date;
  updatedAt: Date;
  isPast(): boolean;
}

export interface EventModel extends Model<EventDocument> {
  findUpcoming(limit?: number): Promise<EventDocument[]>;
  findByMode(mode: EventMode, limit?: number): Promise<EventDocument[]>;
}

const eventSchema = new Schema<EventDocument, EventModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters."],
      minlength: [3, "Title must be at least 3 characters."],
    },
    slug: { type: String, unique: true, index: true },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters."],
      minlength: [10, "Description must be at least 10 characters."],
    },
    overview: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Overview cannot exceed 2000 characters."],
      minlength: [10, "Overview must be at least 10 characters."],
    },
    image: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2048, "Image URL cannot exceed 2048 characters."],
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Venue cannot exceed 200 characters."],
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters."],
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: VALID_EVENT_MODES,
        message: "Mode must be one of: online, offline, or hybrid.",
      },
    },
    audience: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Audience cannot exceed 500 characters."],
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0 && v.length <= 50,
        message: "Agenda must contain between 1 and 50 items.",
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Organizer cannot exceed 200 characters."],
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0 && v.length <= 20,
        message: "Tags must contain between 1 and 20 items.",
      },
    },
  },
  {
    timestamps: true, // automatically manages createdAt and updatedAt
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Performance indexes for common query patterns.
eventSchema.index({ date: 1, mode: 1 }); // For filtering events by date and mode
eventSchema.index({ organizer: 1 }); // For finding events by organizer
eventSchema.index({ tags: 1 }); // For tag-based searches
eventSchema.index({ createdAt: -1 }); // For sorting by newest first

// Simple, dependency-free slug generator from the title.
function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // collapse whitespace to single dashes
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
}

// Generate a unique slug by checking for existing slugs and appending a number if needed.
// Includes safety limit to prevent infinite loops.
const MAX_SLUG_ATTEMPTS = 1000;

async function generateUniqueSlug(
  model: EventModel,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (counter <= MAX_SLUG_ATTEMPTS) {
    const query: { slug: string; _id?: { $ne: string } } = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await model.findOne(query);
    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Fallback: append timestamp if we exceed max attempts (extremely rare edge case)
  throw new Error(
    `Unable to generate unique slug after ${MAX_SLUG_ATTEMPTS} attempts. Please try a different title.`
  );
}

// Validate URL format for image field.
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

// Normalize a date-like string into `YYYY-MM-DD` (ISO calendar date).
// Parses dates consistently by extracting calendar date components and constructing UTC dates,
// avoiding timezone-induced date shifts that occur with inconsistent Date parsing.
function normalizeDate(value: string): string {
  const trimmed = value.trim();

  // If already in YYYY-MM-DD format, validate and return it (treating as UTC calendar date).
  const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const isoMatch = trimmed.match(isoDateRegex);

  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);

    // Validate the date components.
    const utcDate = Date.UTC(year, month - 1, day);
    if (Number.isNaN(utcDate)) {
      throw new Error("Invalid date format. Expected a parseable date value.");
    }

    // Verify the components match (catches invalid dates like 2025-13-45).
    const constructed = new Date(utcDate);
    if (
      constructed.getUTCFullYear() !== year ||
      constructed.getUTCMonth() !== month - 1 ||
      constructed.getUTCDate() !== day
    ) {
      throw new Error("Invalid date format. Expected a parseable date value.");
    }

    return trimmed;
  }

  // For other formats, parse and extract calendar date components, then construct UTC date.
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date format. Expected a parseable date value.");
  }

  // Extract calendar date components from the parsed date (using local time interpretation).
  // Then construct a UTC date from those components to avoid timezone shifts.
  const year = parsed.getFullYear();
  const month = parsed.getMonth() + 1; // getMonth() returns 0-11
  const day = parsed.getDate();

  // Construct UTC date from the calendar date components.
  const utcDate = Date.UTC(year, month - 1, day);
  const normalized = new Date(utcDate);

  // Return the UTC ISO date part.
  return normalized.toISOString().slice(0, 10);
}

// Normalize a time string to 24-hour `HH:mm` format.
function normalizeTime(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/i);

  if (!match) {
    throw new Error("Invalid time format. Expected HH:mm or HH:mm AM/PM.");
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toLowerCase();

  if (minute < 0 || minute > 59) {
    throw new Error("Invalid time: minutes must be between 00 and 59.");
  }

  if (period) {
    // Convert 12-hour clock to 24-hour clock.
    if (hour < 1 || hour > 12) {
      throw new Error("Invalid time: hour must be between 1 and 12 for AM/PM.");
    }
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
  } else {
    if (hour < 0 || hour > 23) {
      throw new Error("Invalid time: hour must be between 0 and 23.");
    }
  }

  const hourStr = hour.toString().padStart(2, "0");
  const minuteStr = minute.toString().padStart(2, "0");
  return `${hourStr}:${minuteStr}`;
}

// Pre-save hook to generate slug, normalize date/time, and validate custom constraints.
eventSchema.pre("save", async function (this: EventDocument) {
  // Validate image URL format.
  if (this.isModified("image") || this.isNew) {
    if (!isValidUrl(this.image)) {
      throw new Error("Image must be a valid HTTP or HTTPS URL.");
    }
  }

  // Validate array fields contain non-empty strings.
  const arrayFields: Array<keyof Pick<EventDocument, "agenda" | "tags">> = [
    "agenda",
    "tags",
  ];
  for (const field of arrayFields) {
    const value = this[field];
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`Field "${field}" must be a non-empty array.`);
    }
    const hasInvalidItem = value.some(
      (item) => typeof item !== "string" || item.trim().length === 0
    );
    if (hasInvalidItem) {
      throw new Error(`Field "${field}" must contain only non-empty strings.`);
    }
  }

  // Generate unique slug when title changes or slug is missing.
  if (this.isModified("title") || !this.slug) {
    const baseSlug = slugifyTitle(this.title);
    if (!baseSlug) {
      throw new Error("Title cannot be converted to a valid slug.");
    }
    const excludeId = this.isNew ? undefined : this._id.toString();
    const EventModel = this.constructor as EventModel;
    this.slug = await generateUniqueSlug(EventModel, baseSlug, excludeId);
  }

  // Normalize date and time representations for consistent storage.
  if (this.isModified("date") || this.isNew) {
    this.date = normalizeDate(this.date);
  }
  if (this.isModified("time") || this.isNew) {
    this.time = normalizeTime(this.time);
  }
});

// Instance method to check if event date is in the past.
eventSchema.methods.isPast = function (this: EventDocument): boolean {
  // Parse event datetime as UTC to match how this.date is stored (normalized from UTC).
  const eventDateTime = new Date(`${this.date}T${this.time}Z`);
  return eventDateTime < new Date();
};

// Static method to find upcoming events.
eventSchema.statics.findUpcoming = function (this: EventModel, limit = 10) {
  const today = new Date().toISOString().slice(0, 10);
  return this.find({ date: { $gte: today } })
    .sort({ date: 1, time: 1 })
    .limit(limit);
};

// Static method to find events by mode.
eventSchema.statics.findByMode = function (
  this: EventModel,
  mode: EventMode,
  limit = 50
) {
  return this.find({ mode }).sort({ date: 1, time: 1 }).limit(limit);
};

export const Event: EventModel =
  (models.Event as EventModel) ||
  model<EventDocument, EventModel>("Event", eventSchema);
