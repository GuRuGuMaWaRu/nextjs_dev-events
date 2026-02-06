import "server-only";

import { AppResult } from "@/core/types";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

import { CreateEventDto, EventDetailDto } from "@/features/Event/types";
import { getEventBySlugAction, getEventsAction, createEventAction } from "@/features/Event/actions";

export const getEventsDAL = async (): Promise<AppResult<EventDetailDto[]>> => {
  'use cache';
  cacheLife('hours');
  cacheTag('events');
  
  return getEventsAction();
};

export const createEventDAL = async (event: CreateEventDto): Promise<AppResult<EventDetailDto>> => {
  const newEvent = await createEventAction(event);

  if (newEvent.ok) {
    revalidateTag('events', 'force');
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
