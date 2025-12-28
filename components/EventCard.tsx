"use client";

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

interface Props {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export function EventCard({ title, image, slug, location, date, time }: Props) {
  const handleEventCardClick = () => {
    posthog.capture("event_card_clicked", {
      event_title: title,
      event_slug: slug,
      event_location: location,
      event_date: date,
      event_time: time,
    });
    throw new Error("test");
  };

  return (
    <Link
      href={`/events/${slug}`}
      className="flex flex-col gap-3"
      onClick={handleEventCardClick}>
      <Image
        src={image}
        alt={title}
        width={410}
        height={300}
        className="h-[300px] w-full rounded-lg object-cover"
      />

      <div className="flex gap-2">
        <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
        <p className="text-light-200 text-sm font-light">{location}</p>
      </div>

      <h2 className="text-[20px] font-semibold line-clamp-1">{title}</h2>

      <div className="text-light-200 font-light text-sm flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
          <p>{date}</p>
        </div>
        <div className="flex gap-2">
          <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
}
