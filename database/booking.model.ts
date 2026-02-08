import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";

import { Event } from "@/database/event.model";

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
  findByEvent(eventId: string): Promise<BookingDocument[]>;
}

const bookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
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
  },
);

// Performance indexes for common query patterns.
bookingSchema.index({ email: 1 }); // For finding bookings by email
bookingSchema.index({ createdAt: -1 }); // For sorting by newest first

// Unique compound index to prevent duplicate bookings (same email for same event).
// This also serves as an index for queries filtering by both eventId and email.
bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Pre-save hook verifies that the referenced event exists.
bookingSchema.pre("save", async function (this: BookingDocument) {
  // Only perform the existence check when eventId is new or has changed.
  if (this.isModified("eventId") || this.isNew) {
    const event = await Event.findById(this.eventId);
    if (!event) {
      throw new Error(
        "Referenced event does not exist. Cannot create booking for non-existent event.",
      );
    }

    // Prevent booking for past events.
    // Parse event datetime as UTC to match how event.date is stored (normalized from UTC).
    const eventDateTime = new Date(`${event.date}T${event.time}Z`);
    if (eventDateTime < new Date()) {
      throw new Error(
        "Cannot create booking for past events. Please select an upcoming event.",
      );
    }
  }
});

// Static method to find all bookings for a specific event.
bookingSchema.statics.findByEvent = async function (
  this: BookingModel,
  eventId: string,
): Promise<BookingDocument[]> {
  const bookings = await this.find({ eventId })
    .sort({ createdAt: -1 })
    .select("email eventId -_id")
    .lean<BookingDocument[]>();

  return bookings;
};

export const Booking: BookingModel =
  (models.Booking as BookingModel) ||
  model<BookingDocument, BookingModel>("Booking", bookingSchema);
