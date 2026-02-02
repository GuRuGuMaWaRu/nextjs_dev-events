import { BookingDocument, EventDocument } from "@/database";

export type SimilarEventDto = Pick<
  EventDocument,
  "title" | "image" | "slug" | "location" | "date" | "time"
>;

export type BookingDto = Pick<BookingDocument, "email" | "eventId">;
