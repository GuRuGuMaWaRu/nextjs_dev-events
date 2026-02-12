import Image from "next/image";
import { notFound } from "next/navigation";

import EventDetailItem from "@/features/Event/components/EventDetailItem";
import EventAgenda from "@/features/Event/components/EventAgenda";
import EventTags from "@/features/Event/components/EventTags";
import BookEvent from "@/features/Event/components/BookEvent";
import { EventCard } from "@/features/Event/components/EventCard";
import { handleAppError } from "@/lib/app-error-ui";
import {
  getBookingsByEventAction,
  getEventBySlugAction,
  getSimilarEventsBySlugAction,
} from "@/features/Event/actions";

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const eventResult = await getEventBySlugAction(slug);
  if (!eventResult.ok) {
    if (eventResult.code === "NOT_FOUND") {
      return notFound();
    }

    const message = handleAppError(eventResult, {
      fallbackMessage: "Failed to fetch event details",
    });
    return <div>Error: {message}</div>;
  }

  const event = eventResult.data;
  if (!event) {
    return notFound();
  }

  const [bookingsResult, similarEventsResult] = await Promise.all([
    getBookingsByEventAction(event.id),
    getSimilarEventsBySlugAction(event.slug),
  ]);

  const bookingCount = bookingsResult.ok
    ? (bookingsResult.data?.length ?? 0)
    : 0;
  const bookingCountError = bookingsResult.ok
    ? null
    : handleAppError(bookingsResult, {
        fallbackMessage: "Booking count unavailable.",
      });

  const similarEventsError = similarEventsResult.ok
    ? null
    : handleAppError(similarEventsResult);
  const similarEvents = similarEventsResult.ok
    ? (similarEventsResult.data ?? [])
    : [];

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{event.description}</p>
      </div>

      <div className="details">
        {/* Left Side - Event Content */}
        <div className="content">
          <Image
            src={event.image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{event.overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>

            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={event.date}
            />
            <EventDetailItem
              icon="/icons/clock.svg"
              alt="clock"
              label={event.time}
            />
            <EventDetailItem
              icon="/icons/pin.svg"
              alt="pin"
              label={event.location}
            />
            <EventDetailItem
              icon="/icons/mode.svg"
              alt="Mode"
              label={event.mode}
            />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="Audience"
              label={event.audience}
            />
          </section>

          <EventAgenda agendaItems={event.agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{event.organizer}</p>
          </section>

          <EventTags tags={event.tags} />
        </div>
        {/* Right Side - Booking Form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookingCountError ? (
              <p className="text-sm">{bookingCountError}</p>
            ) : bookingCount > 0 ? (
              <p className="text-sm">
                Join {bookingCount} other people who already booked this event.
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot.</p>
            )}

            <BookEvent eventId={event.id} />
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-4 mt-20 w-full">
        <h2>Similar Events</h2>
        {similarEventsError ? (
          <p className="text-sm">{similarEventsError}</p>
        ) : (
          <div className="events">
            {similarEvents.map((similarEvent) => (
              <EventCard key={similarEvent.slug} {...similarEvent} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventDetailsPage;
