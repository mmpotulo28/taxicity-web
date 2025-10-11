# Copilot Instructions for TaxiCity Web

## Project Overview

- **Framework:** Next.js 14 (App Router, `/app` directory)
- **UI:** HeroUI v2, Tailwind CSS, Framer Motion
- **Auth:** Clerk (see `/lib/config/clerk.ts`)
- **ORM:** Prisma (PostgreSQL, AWS RDS)
- **Monitoring:** Sentry

## Key Architecture & Patterns

- **API routes:** Place under `/app/api/` using RESTful conventions (e.g., `/api/trips`, `/api/taxis`).
    - Each route: validate input (Zod or similar), authenticate with Clerk, use Prisma for DB, return only necessary data.
    - Example: see `docs/backend-integration-plan.md` and `/app/api/trips/route.ts`.
- **Prisma:**
    - Schema: `/prisma/schema.prisma`
    - Generated client: `/lib/prisma/generated/`
    - Use a single Prisma Client per serverless function (see Prisma Next.js docs).
    - Never expose Prisma Client to the browser.
- **Clerk:**
    - Protect all API routes with Clerk middleware.
    - Use Clerk JWTs for user identity; map Clerk user IDs to the `User` model.
    - Enforce roles/permissions in API logic.
- **Providers:**
    - App-wide context/providers are composed in `/app/providers.tsx` (Clerk, HeroUI, Theme, Ride, Map, Toast).
- **UI:**
    - Use HeroUI components and Tailwind CSS. See `/components/` for custom UI.
    - Main layout: `/app/layout.tsx`.
- **State/Context:**
    - Use React context for ride and map state (`/context/`).

## Developer Workflows

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Type/lint check:** `npm run check`
- **Prisma:**
    - Migrate: `npx prisma migrate dev` (local), `prisma migrate deploy` (deploy)
    - Generate: `npx prisma generate` (after schema changes)
- **Env vars:**
    - Store secrets in `.env` or Vercel dashboard: `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

## Conventions & Notes

- **API:** Always validate and paginate large queries. Never return sensitive/internal fields.
- **Security:** Never log or expose sensitive user data. Comply with POPIA/GDPR.
- **Testing:** No explicit test setup found—add tests in `/tests/` if needed.
- **Deployment:** Use Vercel or similar. Set env vars in dashboard. Run Prisma deploy/generate on deploy.
- **Monitoring:** Use Sentry for error monitoring. Enable Prisma query logging for debugging (disable in prod).

## References

- See `docs/backend-integration-plan.md` for backend, API, and security details.
- Prisma schema: `/prisma/schema.prisma`
- Providers: `/app/providers.tsx`
- UI: `/components/`, `/app/layout.tsx`
