"use server";

import { v2 as cloudinary } from "cloudinary";

import { connectToDatabase } from "@/lib/mongodb";
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

  const arrayBuffer = await event.image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "dev-events",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      )
      .end(buffer);
  });
  const imageUrl = (uploadResult as { secure_url: string }).secure_url;

  const createdEvent = await Event.create({
    ...event,
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

  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError("NOT_FOUND", "Event not found", { status: 404 });
  }

  if (event.image) {
    const publicId = extractPublicIdFromUrl(event.image);

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
            `Image not found in Cloudinary: ${publicId}. URL was: ${event.image}`,
          );
        } else {
          console.warn(`Unexpected result from Cloudinary destroy:`, result);
        }
      } catch (cloudinaryError) {
        console.error(
          `Error deleting image from Cloudinary (public_id: ${publicId}):`,
          cloudinaryError,
        );
      }
    } else {
      console.warn(`Could not extract public_id from URL: ${event.image}`);
    }
  }

  await Event.findByIdAndDelete(eventId);

  return event;
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

const validateBookingDB = async (
  email: string,
  eventId: string,
): Promise<void> => {
  await connectToDatabase();

  const booking = await Booking.findOne({ email, eventId });

  if (booking) {
    throw new AppError("CONFLICT", "You have already booked this event.", {
      status: 409,
    });
  }
};

export const bookEventDB = async (
  email: string,
  eventId: string,
): Promise<BookingDocument> => {
  await connectToDatabase();

  await validateBookingDB(email, eventId);

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
