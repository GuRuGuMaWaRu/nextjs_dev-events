# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands and Tooling

This is a small Next.js 16.1.1 App Router project using TypeScript, Tailwind CSS v4, and PostHog analytics.

### Package management

- Install dependencies: `npm install`

### Running the app

- Start dev server: `npm run dev`
  - Runs the Next.js dev server on the default port (usually 3000).
- Build for production: `npm run build`
- Start production server (after building): `npm start`

### Linting

- Lint the entire project: `npm run lint`
  - Uses `eslint` with `eslint-config-next` core web vitals and TypeScript presets, configured in `eslint.config.mjs`.

### Tests

- There is currently **no** test script configured in `package.json` and no test runner set up. If you add tests (e.g. Jest, Vitest, Playwright), also add an appropriate `"test"` script to `package.json` and update this file with how to run them (including how to run a single test).

## High-level Architecture

### App entry and routing

- Next.js App Router structure under `app/`:
  - `app/layout.tsx` defines the root layout, loads global fonts via `next/font`, includes the global `Navbar`, and mounts a full-screen `LightRays` WebGL background behind the page content.
  - `app/page.tsx` is the home route (`/`). It renders the hero section, the `ExploreBtn` call-to-action, and the list of upcoming events based on `events` from `lib/constants.ts`.
- There are currently no additional routes (e.g. `/events/[slug]`), although `EventCard` links to `"/events/${slug}"`. If you add routes, place them under `app/` and keep using the `@/*` path alias defined in `tsconfig.json`.

### Styling and design system

- Tailwind CSS v4 is configured via `postcss.config.mjs` and `app/globals.css` (there is no separate `tailwind.config.*`).
- `app/globals.css` is the central styling layer and defines:
  - CSS variables for the color palette, radii, and layout tokens (`:root` and `@theme inline`).
  - Global element styles in `@layer base` (e.g. `body`, `main`, `h1`, `ul`).
  - Custom `@utility` classes such as `flex-center`, `text-gradient`, `glass`, and `card-shadow` used throughout the UI.
  - Component-level styles for IDs and selectors like `#explore-btn`, `header`, `.events`, and `#event` to control layout and typography.
- `components.json` configures shadcn UI integration and path aliases (`components`, `utils`, `ui`, `lib`, `hooks`), but at present only the basic components in `components/` and `lib/` are used.

### Components

All components live in `components/` and are imported using the `@/*` alias.

- `Navbar.tsx`
  - Client component (`"use client"`) that renders the sticky header and navigation links.
  - Uses `next/link` and `next/image` for routing and images.
  - Tracks navigation interactions with PostHog via `posthog.capture` for clicks on the logo and main nav items.

- `ExploreBtn.tsx`
  - Client component for the hero call-to-action.
  - Renders a styled button that anchors to the `#events` section on click.
  - Sends a `"explore_events_clicked"` event to PostHog when clicked.

- `EventCard.tsx`
  - Client component representing a single event card with image, location, date, and time.
  - Uses `next/link` and `next/image` and links to `/events/{slug}`.
  - On click, sends an `"event_card_clicked"` event to PostHog with several event-related properties.

- `LightRays.tsx`
  - Client-side WebGL background effect implemented with `ogl` (`Renderer`, `Program`, `Triangle`, `Mesh`).
  - Uses a fragment shader and uniforms to render animated light rays; configurable via props (`raysOrigin`, `raysColor`, `raysSpeed`, `lightSpread`, `rayLength`, etc.).
  - Uses `IntersectionObserver` to lazily initialize rendering only when visible, and manages resize and mouse-move listeners.
  - On rendering errors, calls `posthog.captureException` to send error details to PostHog.
  - `components/LightRays.css` contains legacy/basic container styles; the main layout and sizing are now driven via Tailwind and `app/globals.css`.

### Data and utilities

- `lib/constants.ts`
  - Holds a static `events` array (title, image, slug, location, date, time) used by `app/page.tsx` to render the events list.
  - There is no dynamic data fetching or backend integration yet; events are purely static.

- `lib/utils.ts`
  - Defines a single `cn` helper that merges class names using `clsx` and `tailwind-merge`. Prefer this for composing Tailwind className strings.

### Database layer (MongoDB with Mongoose)

- `lib/mongodb.ts`
  - MongoDB connection utility using Mongoose with connection caching for Next.js hot reloads.
  - Exports `connectToDatabase()` function that reuses existing connections via `globalThis.mongooseCache`.
  - Requires `MONGODB_URI` environment variable.
  - Configures `autoIndex` based on `NODE_ENV` (enabled in development, disabled in production for performance).

- `database/event.model.ts`
  - Mongoose model for Event documents with schema validation, pre-save hooks, and instance/static methods.
  - Fields include: title, slug (unique, auto-generated), description, overview, image, venue, location, date (normalized to YYYY-MM-DD UTC), time (normalized to HH:mm), mode (enum: online/offline/hybrid), audience, agenda, organizer, tags.
  - Pre-save hook normalizes date/time formats, generates unique slugs, and validates URLs and array fields.
  - Instance method: `isPast()` checks if event date/time is in the past (using UTC semantics).
  - Static methods: `findUpcoming(limit?)` and `findByMode(mode, limit?)` for querying events.

- `database/booking.model.ts`
  - Mongoose model for Booking documents linking users (via email) to events (via eventId).
  - Fields include: eventId (ObjectId reference to Event), email (validated, unique per event via compound index).
  - Pre-save hook validates that the referenced event exists and prevents bookings for past events.
  - Static methods: `findByEvent(eventId)`, `findByEmail(email)`, `countByEvent(eventId)` for querying bookings.
  - Unique compound index on `{ eventId, email }` prevents duplicate bookings.

- `database/index.ts`
  - Barrel export file that re-exports `Event` and `Booking` models for convenient imports.

### Analytics and instrumentation (PostHog)

- Global PostHog initialization lives in `instrumentation-client.ts` (Next.js 15.3+ style client instrumentation):
  - Initializes `posthog-js` using `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` from environment variables.
  - Uses `api_host: "/ingest"` so that analytics traffic is routed through the local reverse proxy.
  - Enables automatic pageview, pageleave, and exception tracking, plus debug logging in development.
- `next.config.ts` is configured with rewrites for the PostHog reverse proxy:
  - `/ingest/static/:path*` → PostHog EU assets host.
  - `/ingest/:path*` → PostHog EU API host.
  - `skipTrailingSlashRedirect: true` is enabled for compatibility with PostHog API URLs.
- `posthog-setup-report.md` documents the events currently tracked (e.g. `explore_events_clicked`, `event_card_clicked`, navigation events, `$pageview`, `$pageleave`, `$exception`) and the files where they are defined. When adding new tracked interactions, follow the existing pattern of calling `posthog.capture` in client components.

### TypeScript and ESLint

- `tsconfig.json` configures strict TypeScript compilation for both `.ts` and `.tsx` files and defines the `@/*` path alias to point to the project root.
  - The `include` section adds `next-env.d.ts`, all TypeScript files, `.next` types, and explicitly includes `app/LightRays.jsx` (to ensure type coverage if a JSX version exists or is reintroduced).
- `eslint.config.mjs` uses the flat-config API and applies:
  - `eslint-config-next/core-web-vitals` for Next.js best practices.
  - `eslint-config-next/typescript` for TS-specific linting.
  - `globalIgnores` to ignore build artifacts such as `.next/**`, `out/**`, `build/**`, and `next-env.d.ts`.

## Notes for future changes

- If you introduce routing beyond the home page (e.g. event detail pages), keep the layout and styling consistent with the existing `app/layout.tsx` and `app/globals.css` patterns.
- When adding new analytics events, reuse the global PostHog client from `instrumentation-client.ts` and follow the existing naming and property conventions described in `posthog-setup-report.md`.
- If you add tests or new build tooling, update the "Commands and Tooling" section so future agents know how to run builds, lints, and tests (including focused/single-test runs).