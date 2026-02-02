"use client";

import { useState, useTransition } from "react";

import { bookEventService } from "@/features/Event/service";
import { toastAppError } from "@/lib/app-error-ui";

type BookEventProps = {
  eventId: string;
};

const BookEvent = ({ eventId }: BookEventProps) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      return;
    }

    startTransition(async () => {
      const result = await bookEventService(email, eventId);
      if (!result.ok) {
        toastAppError(result);
        return;
      }

      setSubmitted(true);
      setEmail("");
    });
  };

  return (
    <section id="book-event">
      {submitted ? (
        <p>Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
            />
          </div>
          <button
            type="submit"
            className="button-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Book Now"}
          </button>
        </form>
      )}
    </section>
  );
};

export default BookEvent;
