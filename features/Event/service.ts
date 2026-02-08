import { BookingDto } from "@/features/Event/types";
import { bookEventDAL } from "@/features/Event/dal";

export const bookEventService = async (
  email: string,
  eventId: string,
): Promise<BookingDto> => {
  return bookEventDAL(email, eventId);
};
