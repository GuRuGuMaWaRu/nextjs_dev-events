import "server-only";

import { cacheLife, cacheTag, revalidateTag, revalidatePath } from "next/cache";

import { AppError } from "@/core/app-error";
import {
  CreateEventDto,
  EventDetailDto,
  SimilarEventDto,
  BookingDto,
} from "@/features/Event/types";
import {
  getEventsDB,
  createEventDB,
  deleteEventDB,
  getEventBySlugDB,
  getSimilarEventsBySlugDB,
  getBookingsByEventDB,
  bookEventDB,
} from "@/features/Event/db";
import { toBookingDto, toEventDetailDto } from "@/features/Event/helpers";

const EVENTS_CACHE_TAG = "events";
const EVENT_DETAILS_CACHE_TAG = (slug: string) => `event-details-${slug}`;
const SIMILAR_EVENTS_CACHE_TAG = (slug: string) => `similar-events-${slug}`;
const BOOKINGS_CACHE_TAG = (eventId: string) => `bookings-${eventId}`;

export const getEventsDAL = async (): Promise<EventDetailDto[]> => {
  "use cache";
  cacheLife("minutes");
  cacheTag(EVENTS_CACHE_TAG);

  try {
    const events = await getEventsDB();

    return events?.map((event) => toEventDetailDto(event)) ?? [];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("DB", "Failed to get events", { status: 500 });
  }
};

export const createEventDAL = async (
  event: CreateEventDto,
): Promise<EventDetailDto> => {
  try {
    const newEvent = await createEventDB(event);

    revalidateTag(EVENTS_CACHE_TAG, "max");
    revalidatePath("/");

    return toEventDetailDto(newEvent);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("DB", "Failed to create event", { status: 500 });
  }
};

export const deleteEventDAL = async (
  eventId: string,
): Promise<EventDetailDto> => {
  try {
    const deletedEvent = await deleteEventDB(eventId);

    revalidateTag(EVENTS_CACHE_TAG, "max");
    revalidateTag(EVENT_DETAILS_CACHE_TAG(deletedEvent.slug), "max");
    revalidateTag(SIMILAR_EVENTS_CACHE_TAG(deletedEvent.slug), "max");

    return toEventDetailDto(deletedEvent);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("DB", "Failed to delete event", { status: 500 });
  }
};

export const getSimilarEventsBySlugDAL = async (
  slug: string,
): Promise<SimilarEventDto[]> => {
  "use cache";
  cacheLife("minutes");
  cacheTag(SIMILAR_EVENTS_CACHE_TAG(slug));

  try {
    const similarEvents = await getSimilarEventsBySlugDB(slug);

    return similarEvents?.map((event) => toEventDetailDto(event)) ?? [];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("DB", "Failed to get similar events by slug", {
      status: 500,
    });
  }
};

export const getEventBySlugDAL = async (
  slug: string,
): Promise<EventDetailDto> => {
  "use cache";
  cacheLife("minutes");
  cacheTag(EVENT_DETAILS_CACHE_TAG(slug));

  try {
    const event = await getEventBySlugDB(slug);

    return toEventDetailDto(event);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("DB", "Failed to get event by slug", { status: 500 });
  }
};

export const bookEventDAL = async (
  email: string,
  eventId: string,
): Promise<BookingDto> => {
  try {
    const booking = await bookEventDB(email, eventId);

    revalidateTag(BOOKINGS_CACHE_TAG(eventId), "max");

    return toBookingDto(booking);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      throw new AppError("CONFLICT", "You have already booked this event.", {
        status: 409,
        cause: error,
      });
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("DB", "Failed to book event", { status: 500 });
  }
};

export const getBookingsByEventDAL = async (
  eventId: string,
): Promise<BookingDto[]> => {
  "use cache";
  cacheLife("minutes");
  cacheTag(BOOKINGS_CACHE_TAG(eventId));

  try {
    const bookings = await getBookingsByEventDB(eventId);

    return bookings?.map((booking) => toBookingDto(booking)) ?? [];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("DB", "Failed to get bookings by event", {
      status: 500,
    });
  }
};
