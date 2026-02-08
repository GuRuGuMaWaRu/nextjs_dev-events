import { EventDocument } from "@/database";

export type SimilarEventDto = Pick<
  EventDocument,
  "title" | "image" | "slug" | "location" | "date" | "time"
>;

export type CreateEventDto = {
  title: string;
  description: string;
  overview: string;
  image: File;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
};

export type EventDetailDto<id = string> = Pick<
  EventDocument,
  | "title"
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
  | "slug"
> & {
  id: id;
};

export type BookingDto = {
  email: string;
  eventId: string;
};
