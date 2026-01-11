import { ExploreBtn } from "@/components/ExploreBtn";
import { EventCard } from "@/features/Event/components/EventCard";
import { EventDocument } from "@/database";

const Page = async () => {
  const events = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`);
  const eventsData = await events.json();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Event <br /> You Don&apos;t Want to Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, Conferences, and more. All in one place.
      </p>

      <ExploreBtn />

      <div id="events" className="mt-20 space-y-7">
        <h2 className="text-center text-2xl font-bold">Upcoming Events</h2>
        <ul className="events list-none">
          {eventsData.error && <div>Error: {eventsData.error}</div>}
          {eventsData.events.length === 0 && <div>No events found</div>}
          {eventsData.events &&
            eventsData.events.map((event: EventDocument) => (
              <li key={event.title}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default Page;
