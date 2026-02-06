
import { handleAppError } from "@/lib/app-error-ui";
import { ExploreBtn } from "@/components/ExploreBtn";
import { EventCard } from "@/features/Event/components/EventCard";
import { getEventsService } from "@/features/Event/service.server";
import { EventDetailDto } from "@/features/Event/types";

const Page = async () => {
  const eventsData = await getEventsService();

  const eventsError = eventsData.ok
    ? null
    : handleAppError(eventsData, {
        fallbackMessage: "Failed to load events.",
      });

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
          {eventsError && <div>Error: {eventsError}</div>}

          {eventsData.ok && eventsData.data && eventsData.data.length === 0 && <div>No events found</div>}
          
          {eventsData.ok && eventsData.data && eventsData.data.map((event: EventDetailDto) => (
            <li key={event._id}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Page;
