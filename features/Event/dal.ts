import "server-only";

import { AppResult } from "@/core/types";
import { cacheLife, cacheTag } from "next/cache";

import { EventDetailDto } from "@/features/Event/types";
import { getEventBySlugAction } from "@/features/Event/actions";

export const getEventBySlugDAL = async (
  slug: string
): Promise<AppResult<EventDetailDto>> => {
  'use cache';
  cacheLife('minutes');
  cacheTag(`event-details-${slug}`);
  
  return getEventBySlugAction(slug);
};
