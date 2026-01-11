import { EventDocument } from "@/database";

export type SimilarEvent = Pick<
  EventDocument,
  "title" | "image" | "slug" | "location" | "date" | "time"
>;
