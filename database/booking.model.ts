import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";

import { Event } from "./event.model";

// Attributes required to create a Booking.
export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
}

// Mongoose document type including timestamps.
export interface BookingDocument extends Document, BookingAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingModel extends Model<BookingDocument> {
  findByEvent(eventId: Types.ObjectId): Promise<BookingDocument[]>;
  findByEmail(email: string): Promise<BookingDocument[]>;
  countByEvent(eventId: Types.ObjectId): Promise<number>;
}

const bookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // index for faster event-based lookups
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: [254, "Email cannot exceed 254 characters."], // RFC 5321 max email length
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address.",
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
bookingSchema.index({ email: 1 }); // For finding bookings by email
bookingSchema.index({ createdAt: -1 }); // For sorting by newest first

// Unique compound index to prevent duplicate bookings (same email for same event).
// This also serves as an index for queries filtering by both eventId and email.
bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Basic RFC5322-inspired but pragmatic email validation regex.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Pre-save hook validates email formatting and verifies that the referenced event exists.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
bookingSchema.pre("save", async function (this: BookingDocument, next: any) {
  try {
    // Validate email format (schema validation handles this, but provides better error message).
    if (this.isModified("email") || this.isNew) {
      if (!isValidEmail(this.email)) {
        return next(
          new Error(
            "Invalid email format. Please provide a valid email address."
          )
        );
      }
    }

    // Only perform the existence check when eventId is new or has changed.
    if (this.isModified("eventId") || this.isNew) {
      const event = await Event.findById(this.eventId);
      if (!event) {
        return next(
          new Error(
            "Referenced event does not exist. Cannot create booking for non-existent event."
          )
        );
      }

      // Prevent booking for past events.
      // Parse event datetime as UTC to match how event.date is stored (normalized from UTC).
      const eventDateTime = new Date(`${event.date}T${event.time}Z`);
      if (eventDateTime < new Date()) {
        return next(
          new Error(
            "Cannot create booking for past events. Please select an upcoming event."
          )
        );
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Static method to find all bookings for a specific event.
bookingSchema.statics.findByEvent = function (
  this: BookingModel,
  eventId: Types.ObjectId
) {
  return this.find({ eventId }).sort({ createdAt: -1 });
};

// Static method to find all bookings for a specific email.
bookingSchema.statics.findByEmail = function (
  this: BookingModel,
  email: string
) {
  return this.find({ email: email.toLowerCase() })
    .populate("eventId")
    .sort({ createdAt: -1 });
};

// Static method to count bookings for a specific event.
bookingSchema.statics.countByEvent = function (
  this: BookingModel,
  eventId: Types.ObjectId
) {
  return this.countDocuments({ eventId });
};

export const Booking: BookingModel =
  (models.Booking as BookingModel) ||
  model<BookingDocument, BookingModel>("Booking", bookingSchema);
