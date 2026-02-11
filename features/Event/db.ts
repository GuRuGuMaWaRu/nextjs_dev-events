import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { connectToDatabase } from "@/lib/mongodb";
import { uploadToCloudinary } from "@/lib/upload-to-cloudinary";
import { Booking, BookingDocument, Event, EventDocument } from "@/database";
import { AppError } from "@/core/app-error";
import { CreateEventDto } from "@/features/Event/types";
import { extractPublicIdFromUrl } from "@/features/Event/helpers";

export const getEventsDB = async (): Promise<EventDocument[]> => {
  await connectToDatabase();

  const events = await Event.find()
    .sort({ createdAt: -1 })
    .select(
      "title slug description overview image venue location date time mode audience agenda organizer tags",
    )
    .lean<EventDocument[]>();

  return events;
};

export const createEventDB = async (
  event: CreateEventDto,
): Promise<EventDocument> => {
  await connectToDatabase();

  const { secure_url: imageUrl } = await uploadToCloudinary(event.image);

  const createdEvent = await Event.create({
    title: event.title,
    description: event.description,
    overview: event.overview,
    venue: event.venue,
    location: event.location,
    date: event.date,
    time: event.time,
    mode: event.mode,
    audience: event.audience,
    agenda: event.agenda,
    organizer: event.organizer,
    tags: event.tags,
    image: imageUrl,
  });

  return createdEvent;
};

export const deleteEventDB = async (
  eventId: string,
): Promise<EventDocument> => {
  if (!eventId?.trim()) {
    throw new AppError("VALIDATION", "Event ID is required", { status: 400 });
  }

  await connectToDatabase();

  const deletedEvent = await Event.findByIdAndDelete(eventId);

  if (!deletedEvent) {
    throw new AppError("NOT_FOUND", "Event not found", { status: 404 });
  }

  const imageUrl = deletedEvent.image;
  if (imageUrl) {
    const publicId = extractPublicIdFromUrl(imageUrl);

    if (publicId) {
      try {
        const result = await new Promise<{ result: string }>(
          (resolve, reject) => {
            cloudinary.uploader.destroy(
              publicId,
              {
                invalidate: true,
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result as { result: string });
                }
              },
            );
          },
        );

        if (result && result.result === "ok") {
          console.log(
            `Successfully deleted image from Cloudinary: ${publicId}`,
          );
        } else if (result && result.result === "not found") {
          console.warn(
            `Image not found in Cloudinary: ${publicId}. URL was: ${imageUrl}`,
          );
        } else {
          console.warn(`Unexpected result from Cloudinary destroy:`, result);
        }
      } catch (cloudinaryError) {
        console.error(
          `Error deleting image from Cloudinary (public_id: ${publicId}, url: ${imageUrl}):`,
          cloudinaryError,
        );
      }
    } else {
      console.warn(`Could not extract public_id from URL: ${imageUrl}`);
    }
  }

  return deletedEvent;
};

export const getSimilarEventsBySlugDB = async (
  slug: string,
): Promise<EventDocument[]> => {
  await connectToDatabase();

  const event = await Event.findOne({ slug });

  if (!event) {
    throw new AppError("NOT_FOUND", "Event not found", { status: 404 });
  }

  const similarEvents = await Event.find({
    _id: { $ne: event._id },
    tags: { $in: event.tags },
  })
    .select("title image slug location date time")
    .limit(3)
    .lean<EventDocument[]>();

  return similarEvents;
};

export const getEventBySlugDB = async (
  slug: string,
): Promise<EventDocument> => {
  const sanitizedSlug = slug?.trim().toLowerCase();

  if (!sanitizedSlug) {
    throw new AppError("VALIDATION", "Event slug is required", { status: 400 });
  }

  await connectToDatabase();

  const event = await Event.findOne({ slug: sanitizedSlug })
    .select(
      "title slug description overview image venue location date time mode audience agenda organizer tags",
    )
    .lean<EventDocument>();

  if (!event) {
    throw new AppError(
      "NOT_FOUND",
      `Event with slug "${sanitizedSlug}" not found`,
      { status: 404 },
    );
  }

  return event;
};

export const bookEventDB = async (
  email: string,
  eventId: string,
): Promise<BookingDocument> => {
  await connectToDatabase();

  const booking = await Booking.create({ email, eventId });
  return booking;
};

export const getBookingsByEventDB = async (
  eventId: string,
): Promise<BookingDocument[]> => {
  await connectToDatabase();

  const bookings = await Booking.findByEvent(eventId);

  return bookings;
};
