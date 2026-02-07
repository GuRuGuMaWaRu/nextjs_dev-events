import "server-only";

import { AppResult } from "@/core/types";
import { cacheLife, cacheTag, revalidateTag, revalidatePath } from "next/cache";

import { CreateEventDto, EventDetailDto } from "@/features/Event/types";
import {
  createEventAction,
  deleteEventAction,
  getEventBySlugAction,
  getEventsAction,
} from "@/features/Event/actions";

export const getEventsDAL = async (): Promise<AppResult<EventDetailDto[]>> => {
  'use cache';
  cacheLife('minutes');
  cacheTag('events');
  
  return getEventsAction();
};

export const createEventDAL = async (event: CreateEventDto): Promise<AppResult<EventDetailDto>> => {
  const newEvent = await createEventAction(event);

  if (newEvent.ok) {
    revalidateTag('events', 'max');
  }

  return newEvent;
};

export const getEventBySlugDAL = async (
  slug: string
): Promise<AppResult<EventDetailDto>> => {
  'use cache';
  cacheLife('minutes');
  cacheTag(`event-details-${slug}`);
  
  return getEventBySlugAction(slug);
};

export const deleteEventDAL = async (
  eventId: string
): Promise<AppResult<EventDetailDto>> => {
  const deletedEvent = await deleteEventAction(eventId);

  if (deletedEvent.ok) {
    revalidateTag('events', 'max');

    if (deletedEvent.data?.slug) {
      revalidateTag(`event-details-${deletedEvent.data.slug}`, 'max');
    }
  }

  return deletedEvent;
};
