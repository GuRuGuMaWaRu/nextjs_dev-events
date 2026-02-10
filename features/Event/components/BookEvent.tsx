"use client";

import { useActionState } from "react";

import { toastAppError } from "@/lib/app-error-ui";
import { bookEventAction } from "@/features/Event/actions";
import { AppResult } from "@/core/types";
import { BookingDto } from "@/features/Event/types";
import { toast } from "sonner";

type BookEventProps = {
  eventId: string;
};

const BookEvent = ({ eventId }: BookEventProps) => {
  const [state, formAction, isPending] = useActionState<
    AppResult<BookingDto> | null,
    FormData
  >(async (_prev, formData) => {
    const email = String(formData.get("email") ?? "");
    if (!email) {
      return { ok: false, code: "VALIDATION", message: "Email required" };
    }

    const result = await bookEventAction(email, eventId);

    if (result.ok) {
      toast.success("Event booked successfully");
    } else {
      toastAppError(result);
    }
    return result;
  }, null);

  return (
    <section id="book-event">
      {state?.ok ? (
        <p>Thank you for signing up!</p>
      ) : (
        <form action={formAction}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              id="email"
              name="email"
              required
              disabled={isPending}
            />
          </div>
          <button type="submit" className="button-submit" disabled={isPending}>
            {isPending ? "Booking..." : "Book Now"}
          </button>
        </form>
      )}
    </section>
  );
};

export default BookEvent;
