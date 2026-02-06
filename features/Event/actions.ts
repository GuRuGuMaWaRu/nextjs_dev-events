"use server";

import { Types } from "mongoose";
import { v2 as cloudinary } from "cloudinary";

import { connectToDatabase } from "@/lib/mongodb";
import { Booking, Event, EventDocument } from "@/database";
import { toAppError } from "@/core/app-error";
import { AppResult } from "@/core/types";
import {
  BookingDto,
  CreateEventDto,
  EventDetailDto,
  SimilarEventDto,
} from "@/features/Event/types";
import { extractPublicIdFromUrl, toEventDetailDto } from "@/features/Event/helpers";

export const getEventsAction = async (): Promise<AppResult<EventDetailDto[]>> => {
  try {
    await connectToDatabase();

    const events = await Event.find().sort({ createdAt: -1 }).select("title slug description overview image venue location date time mode audience agenda organizer tags").lean<EventDocument[]>();

    return { ok: true, data: events.map((event) => toEventDetailDto(event)) };
  } catch (error) {
    return toAppError(error, "Failed to get events");
  }
};

export const createEventAction = async (event: CreateEventDto): Promise<AppResult<EventDetailDto>> => {
  try {
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
          }
        )
        .end(buffer);
    });
    const imageUrl = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({
      ...event,
      image: imageUrl,
    });

    return {
      ok: true,
      data: toEventDetailDto(createdEvent),
    };
  } catch (error) {
    return toAppError(error, "Failed to create event");
  }
};

export const deleteEventAction = async (
  eventId: string
): Promise<AppResult<EventDetailDto>> => {
  if (!eventId?.trim()) {
    return { ok: false, code: "VALIDATION", message: "Event ID is required" };
  }

  try {
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
      return { ok: false, code: "NOT_FOUND", message: "Event not found" };
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
                }
              );
            }
          );

          if (result && result.result === "ok") {
            console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
          } else if (result && result.result === "not found") {
            console.warn(
              `Image not found in Cloudinary: ${publicId}. URL was: ${event.image}`
            );
          } else {
            console.warn(`Unexpected result from Cloudinary destroy:`, result);
          }
        } catch (cloudinaryError) {
          console.error(
            `Error deleting image from Cloudinary (public_id: ${publicId}):`,
            cloudinaryError
          );
        }
      } else {
        console.warn(`Could not extract public_id from URL: ${event.image}`);
      }
    }

    await Event.findByIdAndDelete(eventId);

    return { ok: true, data: toEventDetailDto(event) };
  } catch (error) {
    return toAppError(error, "Failed to delete event");
  }
};

export const getSimilarEventsBySlugAction = async (
  slug: string
): Promise<AppResult<SimilarEventDto[]>> => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug });
    if (!event) {
      return { ok: false, code: "NOT_FOUND", message: "Event not found" };
    }

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .select("title image slug location date time -_id")
      .limit(3)
      .lean<SimilarEventDto[]>();

    return {
      ok: true,
      data: similarEvents,
    };
  } catch (error) {
    return toAppError(error, "Failed to get similar events");
  }
};

export const getEventBySlugAction = async (
  slug: string
): Promise<AppResult<EventDetailDto>> => {
  const sanitizedSlug = slug?.trim().toLowerCase();
  if (!sanitizedSlug) {
    return { ok: false, code: "VALIDATION", message: "Event slug is required" };
  }

  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug: sanitizedSlug })
      .select(
        "title slug description overview image venue location date time mode audience agenda organizer tags"
      )
      .lean<EventDetailDto<Types.ObjectId>>();
    if (!event) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: `Event with slug "${sanitizedSlug}" not found`,
      };
    }

    return { ok: true, data: toEventDetailDto(event) };
  } catch (error) {
    return toAppError(error, "Failed to fetch event");
  }
};

const validateBookingAction = async (
  email: string,
  eventId: string
): Promise<AppResult<void>> => {
  try {
    await connectToDatabase();

    const booking = await Booking.findOne({ email, eventId });
    if (booking) {
      return {
        ok: false,
        code: "CONFLICT",
        message: "You have already booked this event.",
      };
    }

    return { ok: true };
  } catch (error) {
    return toAppError(error, "Failed to validate booking");
  }
};

export const bookEventAction = async (
  email: string,
  eventId: string
): Promise<AppResult<BookingDto>> => {
  try {
    await connectToDatabase();

    const isValid = await validateBookingAction(email, eventId);
    if (!isValid.ok) {
      return isValid;
    }
    
    const booking = await Booking.create({ email, eventId });

    return {
      ok: true,
      data: {
        id: booking._id.toString(),
        email: booking.email,
        eventId: booking.eventId.toString(),
      },
    };
  } catch (error) {
    return toAppError(error, "Failed to book event");
  }
};

export const getBookingsByEventAction = async (
  eventId: string
): Promise<AppResult<BookingDto[]>> => {
  try {
    await connectToDatabase();

    const bookings = await Booking.findByEvent(eventId);
    return {
      ok: true,
      data: bookings.map((booking) => ({
        email: booking.email,
        eventId: booking.eventId.toString(),
      })),
    };
  } catch (error) {
    return toAppError(error, "Failed to fetch bookings");
  }
};
