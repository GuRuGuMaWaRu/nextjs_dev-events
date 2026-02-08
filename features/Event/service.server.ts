import "server-only";

import { AppResult } from "@/core/types";
import {
  BookingDto,
  CreateEventDto,
  EventDetailDto,
  SimilarEventDto,
} from "@/features/Event/types";
import {
  createEventDAL,
  deleteEventDAL,
  getEventBySlugDAL,
  getEventsDAL,
  getBookingsByEventDAL,
  getSimilarEventsBySlugDAL,
} from "@/features/Event/dal";

/** Server-only wrappers keep UI usage consistent and enable caching. */
export const getEventsService = async (): Promise<EventDetailDto[]> => {
  return getEventsDAL();
};

export const createEventService = async (
  event: CreateEventDto,
): Promise<EventDetailDto> => {
  return createEventDAL(event);
};

export const getBookingsByEventService = async (
  eventId: string,
): Promise<BookingDto[]> => {
  return getBookingsByEventDAL(eventId);
};

export const getSimilarEventsBySlugService = async (
  slug: string,
): Promise<SimilarEventDto[]> => {
  return getSimilarEventsBySlugDAL(slug);
};

export const getEventBySlugService = async (
  slug: string,
): Promise<EventDetailDto> => {
  return getEventBySlugDAL(slug);
};

export const deleteEventService = async (
  eventId: string,
): Promise<EventDetailDto> => {
  return deleteEventDAL(eventId);
};
