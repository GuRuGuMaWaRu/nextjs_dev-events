import { Types } from "mongoose";

import { AppResult } from "@/core/types";
import {
  BookingDto,
  EventDetailDto,
  SimilarEventDto,
} from "@/features/Event/types";
import {
  bookEventAction,
  getEventBySlugAction,
  getBookingsByEventAction,
  getSimilarEventsBySlugAction,
} from "@/features/Event/actions";

/** Thin wrappers keep the UI consistent and provide a hook for future logic. */
export const getBookingsByEventService = async (
  eventId: Types.ObjectId
): Promise<AppResult<BookingDto[]>> => {
  return await getBookingsByEventAction(eventId);
};

export const getSimilarEventsBySlugService = async (
  slug: string
): Promise<AppResult<SimilarEventDto[]>> => {
  return getSimilarEventsBySlugAction(slug);
};

export const getEventBySlugService = async (
  slug: string
): Promise<AppResult<EventDetailDto>> => {
  return getEventBySlugAction(slug);
};

export const bookEventService = async (
  email: string,
  eventId: string
): Promise<AppResult<BookingDto>> => {
  return bookEventAction(email, eventId);
};
