### Next.js 16.1.1

Mainly trying various styling.

#### Server-only vs client-safe services

This project separates cached/server-only logic from client-safe utilities to
avoid Next.js errors like:
"It is not allowed to define inline "use cache" annotated functions in Client Components."

- `features/Event/service.server.ts` is server-only and can call cached DAL
  functions.
- `features/Event/dal.ts` is server-only and may use `next/cache` + `'use cache'`.
- `features/Event/service.ts` is client-safe and should not import anything that
  uses `next/cache`.

If a Client Component needs to call a service, import from `service.ts`.
If a Server Component needs cached data, import from `service.server.ts`.
