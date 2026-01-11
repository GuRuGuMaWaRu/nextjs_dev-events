import Image from "next/image";
import { notFound } from "next/navigation";

import EventDetailItem from "@/features/Event/components/EventDetailItem";
import EventAgenda from "@/features/Event/components/EventAgenda";
import EventTags from "@/features/Event/components/EventTags";
import BookEvent from "@/features/Event/components/BookEvent";
import { getSimilarEventsBySlugAction } from "@/features/Event/actions";
import { EventCard } from "@/features/Event/components/EventCard";
import { EventDocument } from "@/database";

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const request = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`
  );
  const { event, error } = await request.json();

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!event) {
    return notFound();
  }

  const bookings = 10;

  const similarEvents: EventDocument[] = await getSimilarEventsBySlugAction(
    event.slug
  );

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
            <h2>EventDetails</h2>

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
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} other people who already booked this event.
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot.</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-4 mt-20 w-full">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.map((event) => (
            <EventCard key={event.title} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
