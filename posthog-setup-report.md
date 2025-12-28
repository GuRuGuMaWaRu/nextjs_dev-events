# PostHog post-wizard report

The wizard has completed a deep integration of your Next.js DevEvents project. PostHog is now fully configured with client-side analytics using the modern `instrumentation-client.ts` approach (recommended for Next.js 15.3+), a reverse proxy for improved tracking reliability, automatic pageview and pageleave tracking, error/exception capturing, and custom event tracking across key user interaction points.

## Integration Summary

### Files Created
| File | Purpose |
|------|---------|
| `instrumentation-client.ts` | Client-side PostHog initialization with reverse proxy, automatic pageviews, and exception tracking |
| `.env` | Environment variables for PostHog API key and host |
| `posthog-setup-report.md` | This setup report |

### Files Modified
| File | Changes |
|------|---------|
| `next.config.ts` | Added reverse proxy rewrites for `/ingest` to route through PostHog EU servers |
| `components/ExploreBtn.tsx` | Added `explore_events_clicked` event tracking |
| `components/EventCard.tsx` | Added `event_card_clicked` event tracking with event properties |
| `components/Navbar.tsx` | Added navigation click tracking (`nav_home_clicked`, `nav_events_clicked`, `nav_create_event_clicked`, `nav_logo_clicked`) |
| `components/LightRays.tsx` | Added error tracking via `posthog.captureException()` for WebGL errors |

## Events Tracked

| Event Name | Description | File | Properties |
|------------|-------------|------|------------|
| `explore_events_clicked` | User clicked the 'Explore Events' button | `components/ExploreBtn.tsx` | `button_location`, `target_section` |
| `event_card_clicked` | User clicked on an event card | `components/EventCard.tsx` | `event_title`, `event_slug`, `event_location`, `event_date`, `event_time` |
| `nav_home_clicked` | User clicked Home link | `components/Navbar.tsx` | `nav_item`, `navigation_location` |
| `nav_events_clicked` | User clicked Events link | `components/Navbar.tsx` | `nav_item`, `navigation_location` |
| `nav_create_event_clicked` | User clicked Create Event link | `components/Navbar.tsx` | `nav_item`, `navigation_location` |
| `nav_logo_clicked` | User clicked the logo | `components/Navbar.tsx` | `nav_item`, `navigation_location` |
| `$pageview` | Automatic pageview tracking | `instrumentation-client.ts` | (automatic) |
| `$pageleave` | Automatic page leave tracking | `instrumentation-client.ts` | (automatic) |
| `$exception` | Error/exception tracking | `components/LightRays.tsx` | (automatic error details) |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://eu.posthog.com/project/111404/dashboard/470476) - Core analytics dashboard with conversion funnels, navigation patterns, and engagement metrics

### Insights
- [Event Card Clicks - Conversion Funnel](https://eu.posthog.com/project/111404/insights/oqASCxku) - Tracks user journey from exploring to clicking event cards
- [Navigation Click Patterns](https://eu.posthog.com/project/111404/insights/yEjsoTa8) - Breakdown of navigation usage
- [Daily Active Users](https://eu.posthog.com/project/111404/insights/glsjjSlM) - Unique daily visitors
- [Most Clicked Events](https://eu.posthog.com/project/111404/insights/Ugp3iCUn) - Which event cards get the most engagement
- [Error Tracking](https://eu.posthog.com/project/111404/insights/1LES9FD9) - Monitor application exceptions

## Configuration Details

- **PostHog Host**: EU (https://eu.i.posthog.com)
- **Reverse Proxy**: Enabled via `/ingest` path
- **Automatic Tracking**: Pageviews, pageleaves, autocapture enabled
- **Exception Tracking**: Enabled (`capture_exceptions: true`)
- **Debug Mode**: Enabled in development environment
