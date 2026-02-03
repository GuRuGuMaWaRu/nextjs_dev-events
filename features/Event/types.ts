import { EventDocument } from "@/database";

export type SimilarEventDto = Pick<
  EventDocument,
  "title" | "image" | "slug" | "location" | "date" | "time"
>;

export type EventDetailDto = Pick<
  EventDocument,
  | "title"
  | "slug"
  | "description"
  | "overview"
  | "image"
  | "venue"
  | "location"
  | "date"
  | "time"
  | "mode"
  | "audience"
  | "agenda"
  | "organizer"
  | "tags"
> & {
  _id: EventDocument["_id"];
};

export type BookingDto = {
  email: string;
  eventId: string;
  id?: string;
};
