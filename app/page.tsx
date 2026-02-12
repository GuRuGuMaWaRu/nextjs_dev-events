import { handleAppError } from "@/lib/app-error-ui";
import { ExploreBtn } from "@/components/ExploreBtn";
import { EventCard } from "@/features/Event/components/EventCard";
import { EventDetailDto } from "@/features/Event/types";
import { getEventsAction } from "@/features/Event/actions";

const Page = async () => {
  const eventsResult = await getEventsAction();

  const eventsError = eventsResult.ok
    ? null
    : handleAppError(eventsResult, {
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
        {eventsError && <div>Error: {eventsError}</div>}

        {eventsResult.ok &&
          eventsResult.data &&
          eventsResult.data.length === 0 && <div>No events found</div>}

        {eventsResult.ok && eventsResult.data && (
          <ul className="events list-none">
            {eventsResult.data.map((event: EventDetailDto) => (
              <li key={event.id}>
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Page;
