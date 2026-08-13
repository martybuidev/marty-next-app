# Auth Plan

1. Env config with zod (client-safe + server-only) and TanStack Query provider. (done)
2. Auth domain: types, constants, server cookie options, zod validation schemas. (in progress)
3. HTTP layer: in-memory token store + Axios client (Bearer token, 401 single-flight refresh, retry once).
4. Server auth API: server-only fetcher calling Nest endpoints, typed envelope parsing.
5. Route handlers (BFF): login / register / logout / session with httpOnly refresh-token cookie.
6. TanStack Query hooks (session + mutations), AuthProvider, protected-route guard.
7. UI: login / register / dashboard pages and logout button (React Hook Form + zod).
8. `proxy.ts`: redirect unauthenticated users away from protected routes.
