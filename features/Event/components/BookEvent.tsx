"use client";

import { useActionState, useEffect } from "react";

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
    const raw = formData.get("email");
    const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

    if (!email) {
      return { ok: false, code: "VALIDATION", message: "Email required" };
    }

    return bookEventAction(email, eventId);
  }, null);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.ok) {
      toast.success("Event booked successfully");
    } else {
      toastAppError(state);
    }
  }, [state]);

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
              aria-invalid={state?.ok === false}
            />
            {state?.ok === false ? (
              <p role="alert" className="text-destructive text-sm">
                {state.message}
              </p>
            ) : null}
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
