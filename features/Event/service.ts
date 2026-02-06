import { AppResult } from "@/core/types";
import { BookingDto } from "@/features/Event/types";
import { bookEventAction } from "@/features/Event/actions";

/** Thin wrappers keep the UI consistent and provide a hook for future logic. */
export const bookEventService = async (
  email: string,
  eventId: string
): Promise<AppResult<BookingDto>> => {
  return bookEventAction(email, eventId);
};
