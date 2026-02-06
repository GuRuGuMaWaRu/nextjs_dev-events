import { Types } from "mongoose";

import { EventDocument } from "@/database";
import { EventDetailDto } from "@/features/Event/types";

export const toEventDetailDto = (
  event: EventDocument | (EventDetailDto<Types.ObjectId> & { _id: Types.ObjectId })
): EventDetailDto => {
  const eventObject =
    typeof (event as EventDocument).toObject === "function"
      ? (event as EventDocument).toObject()
      : event;

  return {
    ...eventObject,
    _id: eventObject._id.toString(),
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
