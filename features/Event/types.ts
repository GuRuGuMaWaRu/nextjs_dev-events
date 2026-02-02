import { EventDocument } from "@/database";

export type SimilarEventDto = Pick<
  EventDocument,
  "title" | "image" | "slug" | "location" | "date" | "time"
>;

export type BookingDto = {
  email: string;
  eventId: string;
  id?: string;
};
