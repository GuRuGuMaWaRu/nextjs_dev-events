"use server";

import { z } from "zod";

import { AppError } from "@/core/app-error";
import { AppResult } from "@/core/types";
import { zodIssuesToFieldErrors } from "@/lib/zod-issue-field-converter";
import {
  BookingDto,
  EventDetailDto,
  SimilarEventDto,
} from "@/features/Event/types";
import {
  createEventService,
  deleteEventService,
  getBookingsByEventService,
  getEventBySlugService,
  getEventsService,
  getSimilarEventsBySlugService,
} from "@/features/Event/service.server";
import { bookEventService } from "@/features/Event/service";
import { normalizeSlug } from "@/features/Event/helpers";

export const getEventsAction = async (): Promise<
  AppResult<EventDetailDto[]>
> => {
  try {
    const events = await getEventsService();

    return { ok: true, data: events };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, code: error.code, message: error.message };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "An unknown error occurred while getting the events",
    };
  }
};

export const createEventAction = async (
  event: unknown,
): Promise<AppResult<EventDetailDto>> => {
  try {
    const createdEvent = await createEventService(event);

    return { ok: true, data: createdEvent };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
        ...(error.cause
          ? {
              details: zodIssuesToFieldErrors(
                error.cause as z.core.$ZodIssue[],
              ),
            }
          : {}),
      };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "An unknown error occurred while creating the event",
    };
  }
};

export const deleteEventAction = async (
  eventId: string,
): Promise<AppResult<EventDetailDto>> => {
  try {
    const deletedEvent = await deleteEventService(eventId);

    return { ok: true, data: deletedEvent };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, code: error.code, message: error.message };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "An unknown error occurred while deleting the event",
    };
  }
};

export const getSimilarEventsBySlugAction = async (
  slug: string,
): Promise<AppResult<SimilarEventDto[]>> => {
  try {
    const similarEvents = await getSimilarEventsBySlugService(slug);

    return { ok: true, data: similarEvents };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, code: error.code, message: error.message };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "An unknown error occurred while getting the similar events",
    };
  }
};

export const getEventBySlugAction = async (
  slug: string,
): Promise<AppResult<EventDetailDto>> => {
  try {
    const normalizedSlug = normalizeSlug(slug);
    const event = await getEventBySlugService(normalizedSlug);

    return { ok: true, data: event };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, code: error.code, message: error.message };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "An unknown error occurred while getting the event by slug",
    };
  }
};

export const bookEventAction = async (
  email: string,
  eventId: string,
): Promise<AppResult<BookingDto>> => {
  try {
    const booking = await bookEventService(email, eventId);

    return { ok: true, data: booking };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, code: error.code, message: error.message };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "An unknown error occurred while booking the event",
    };
  }
};

export const getBookingsByEventAction = async (
  eventId: string,
): Promise<AppResult<BookingDto[]>> => {
  try {
    const bookings = await getBookingsByEventService(eventId);
    console.log("bookings", bookings);
    return { ok: true, data: bookings };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, code: error.code, message: error.message };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "An unknown error occurred while getting the bookings by event",
    };
  }
};
