import { Types } from "mongoose";
import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import { v2 as cloudinary } from "cloudinary";

import { BookingDocument, EventDocument } from "@/database";
import { BookingDto, EventDetailDto } from "@/features/Event/types";

export const toEventDetailDto = (
  event:
    | EventDocument
    | (EventDetailDto<Types.ObjectId> & { _id: Types.ObjectId }),
): EventDetailDto => {
  const eventObject =
    typeof (event as EventDocument).toObject === "function"
      ? (event as EventDocument).toObject()
      : event;

  return {
    title: eventObject.title,
    slug: eventObject.slug,
    description: eventObject.description,
    overview: eventObject.overview,
    image: eventObject.image,
    venue: eventObject.venue,
    location: eventObject.location,
    date: eventObject.date,
    time: eventObject.time,
    id: eventObject._id.toString(),
    mode: eventObject.mode,
    audience: eventObject.audience,
    agenda: eventObject.agenda,
    organizer: eventObject.organizer,
    tags: eventObject.tags,
  };
};

export const toBookingDto = (booking: BookingDocument): BookingDto => {
  const bookingObject =
    typeof (booking as BookingDocument).toObject === "function"
      ? (booking as BookingDocument).toObject()
      : booking;

  return {
    email: bookingObject.email,
    eventId: bookingObject.eventId.toString(),
  };
};

/**
 * Extracts the public_id from a Cloudinary URL.
 * Cloudinary URLs follow the pattern:
 * https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
 * or
 * https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{format}
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)/);
    if (!match) {
      return null;
    }

    const pathWithExtension = match[1];
    const publicId = pathWithExtension.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
};

export const normalizeSlug = (slug: string): string => {
  return slug.trim().toLowerCase().replace(/ /g, "-");
};

export const uploadToCloudinary = (
  file: File,
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "dev-events" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result as { secure_url: string });
      },
    );

    Readable.fromWeb(
      file.stream() as unknown as ReadableStream,
    ).pipe(upload);
  });
};
