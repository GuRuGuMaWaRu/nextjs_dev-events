"use client";

import Image from "next/image";
import posthog from "posthog-js";

export const ExploreBtn = () => {
  const handleExploreClick = () => {
    posthog.capture("explore_events_clicked", {
      button_location: "hero_section",
      target_section: "events",
    });
  };

  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={handleExploreClick}>
      <a href="#events">
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={24}
          height={24}
        />
      </a>
    </button>
  );
};
