import "server-only";

import { revalidateTag, revalidatePath, unstable_cache } from "next/cache";

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

const DAL_REVALIDATE_SECONDS = 60;

const EVENTS_TAG = "events";
const EVENT_DETAILS_TAG = "event-details";
const SIMILAR_EVENTS_TAG = "similar-events";
const BOOKINGS_TAG = "bookings";

const getEventsCached = unstable_cache(
  async (): Promise<EventDetailDto[]> => {
    const events = await getEventsDB();

    return events?.map((event) => toEventDetailDto(event)) ?? [];
  },
  ["event-dal-get-events"],
  { revalidate: DAL_REVALIDATE_SECONDS, tags: [EVENTS_TAG] },
);

const getEventBySlugCached = unstable_cache(
  async (slug: string): Promise<EventDetailDto> => {
    const event = await getEventBySlugDB(slug);

    return toEventDetailDto(event);
  },
  ["event-dal-get-event-by-slug"],
  { revalidate: DAL_REVALIDATE_SECONDS, tags: [EVENT_DETAILS_TAG] },
);

const getSimilarEventsBySlugCached = unstable_cache(
  async (slug: string): Promise<SimilarEventDto[]> => {
    const similarEvents = await getSimilarEventsBySlugDB(slug);

    return similarEvents?.map((event) => toEventDetailDto(event)) ?? [];
  },
  ["event-dal-get-similar-events-by-slug"],
  { revalidate: DAL_REVALIDATE_SECONDS, tags: [SIMILAR_EVENTS_TAG] },
);

const getBookingsByEventCached = unstable_cache(
  async (eventId: string): Promise<BookingDto[]> => {
    const bookings = await getBookingsByEventDB(eventId);

    return bookings?.map((booking) => toBookingDto(booking)) ?? [];
  },
  ["event-dal-get-bookings-by-event"],
  { revalidate: DAL_REVALIDATE_SECONDS, tags: [BOOKINGS_TAG] },
);

export const getEventsDAL = async (): Promise<EventDetailDto[]> => {
  try {
    return await getEventsCached();
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

    revalidateTag(EVENTS_TAG, "max");
    revalidateTag(EVENT_DETAILS_TAG, "max");
    revalidateTag(SIMILAR_EVENTS_TAG, "max");
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

    revalidateTag(EVENTS_TAG, "max");
    revalidateTag(EVENT_DETAILS_TAG, "max");
    revalidateTag(SIMILAR_EVENTS_TAG, "max");
    revalidateTag(BOOKINGS_TAG, "max");

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
  try {
    return await getSimilarEventsBySlugCached(slug);
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
  try {
    return await getEventBySlugCached(slug);
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

    revalidateTag(BOOKINGS_TAG, "max");

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
  try {
    return await getBookingsByEventCached(eventId);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("DB", "Failed to get bookings by event", {
      status: 500,
    });
  }
};
