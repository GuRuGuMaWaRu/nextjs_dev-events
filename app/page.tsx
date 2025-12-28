import { ExploreBtn } from "@/components/ExploreBtn";
import { EventCard } from "@/components/EventCard";
import { events } from "@/lib/constants";

const Page = () => {
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
          {events.map((event) => (
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
