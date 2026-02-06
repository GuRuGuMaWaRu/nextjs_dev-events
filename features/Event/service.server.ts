import "server-only";

import { AppResult } from "@/core/types";
import { BookingDto, CreateEventDto, EventDetailDto, SimilarEventDto } from "@/features/Event/types";
import { createEventDAL, getEventsDAL, getEventBySlugDAL } from "@/features/Event/dal";
import {
  getBookingsByEventAction,
  getSimilarEventsBySlugAction,
} from "@/features/Event/actions";

/** Server-only wrappers keep UI usage consistent and enable caching. */
export const getEventsService = async (): Promise<AppResult<EventDetailDto[]>> => {
  return getEventsDAL();
};

export const createEventService = async (event: CreateEventDto): Promise<AppResult<EventDetailDto>> => {
  return createEventDAL(event);
};

export const getBookingsByEventService = async (
  eventId: string
): Promise<AppResult<BookingDto[]>> => {
  return getBookingsByEventAction(eventId);
};

export const getSimilarEventsBySlugService = async (
  slug: string
): Promise<AppResult<SimilarEventDto[]>> => {
  return getSimilarEventsBySlugAction(slug);
};

export const getEventBySlugService = async (
  slug: string
): Promise<AppResult<EventDetailDto>> => {
  return getEventBySlugDAL(slug);
};
