import "server-only";

import {
  BookingDto,
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
  bookEventDAL,
} from "@/features/Event/dal";
import { EventSchema } from "@/lib/schemas";
import { AppError } from "@/core/app-error";

/** Server-only wrappers keep UI usage consistent and enable caching. */
export const getEventsService = async (): Promise<EventDetailDto[]> => {
  return getEventsDAL();
};

export const createEventService = async (
  event: unknown,
): Promise<EventDetailDto> => {
  const validatedEvent = EventSchema.safeParse(event);

  if (!validatedEvent.success) {
    throw new AppError("VALIDATION", "Invalid event payload", {
      status: 400,
      cause: validatedEvent.error.issues,
    });
  }

  return createEventDAL(validatedEvent.data);
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

export const bookEventService = async (
  email: string,
  eventId: string,
): Promise<BookingDto> => {
  return bookEventDAL(email, eventId);
};
