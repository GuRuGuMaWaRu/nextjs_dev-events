"use client";

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

export function Navbar() {
  const handleNavClick = (navItem: string) => {
    posthog.capture(`nav_${navItem}_clicked`, {
      nav_item: navItem,
      navigation_location: "header",
    });
  };

  return (
    <header>
      <nav>
        <Link
          href="/"
          className="logo"
          onClick={() => handleNavClick("logo")}>
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>DevEvents</p>
        </Link>

        <ul className="list-none">
          <li>
            <Link href="/" onClick={() => handleNavClick("home")}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/" onClick={() => handleNavClick("events")}>
              Events
            </Link>
          </li>
          <li>
            <Link href="/" onClick={() => handleNavClick("create_event")}>
              Create Event
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
