import { Types } from "mongoose";

import { AppResult } from "@/core/types";
import { BookingDto, SimilarEventDto } from "@/features/Event/types";
import {
  bookEventAction,
  getBookingsByEventAction,
  getSimilarEventsBySlugAction,
} from "@/features/Event/actions";
import { BookingDocument } from "@/database";

export const getBookingsByEventService = async (
  eventId: Types.ObjectId
): Promise<AppResult<BookingDto[]>> => {
  const bookingsResult = await getBookingsByEventAction(eventId);
  if (!bookingsResult.ok) {
    return bookingsResult;
  }

  return {
    ok: true,
    data: bookingsResult.data?.map((booking) => ({
      email: booking.email,
      eventId: booking.eventId,
    })),
  };
};

//** Thin wrappers keep the UI consistent and provide a hook for future logic.
export const getSimilarEventsBySlugService = async (
  slug: string
): Promise<AppResult<SimilarEventDto[]>> => {
  return getSimilarEventsBySlugAction(slug);
};

export const bookEventService = async (
  email: string,
  eventId: string
): Promise<AppResult<BookingDocument>> => {
  return bookEventAction(email, eventId);
};
