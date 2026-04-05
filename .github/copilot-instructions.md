# TaxiCity Web Copilot Instructions

You are an expert full-stack developer working in the **TaxiCity Web** monorepo. This project uses **Next.js 14 (App Router)**, **HeroUI v2**, **Tailwind CSS**, **Prisma**, and **Clerk** Authentication managed with **Turbo** and **pnpm**.

## 🏗️ Monorepo Architecture

- **Workspace Management:** `pnpm` workspaces + `turbo` for build orchestration.
- **Root/Apps (`/apps`):**
    - `user/`, `driver/`, `admin/`: Next.js web applications (App Router).
    - `mobile-user/`, `mobile-driver/`: React Native (Expo) mobile apps in TypeScript.
    - `websocket/`: Socket.IO server (replaces Pusher) for realtime events.
- **Packages (`/packages`):**
    - `database/`: Shared Prisma schema and client (`@taxiciti/database`). contains `redis.ts` key-value store.
    - `ui/`: Shared HeroUI components and Tailwind config (`@taxiciti/ui`).
    - `utils/`: Shared utility functions (`@taxiciti/utils`).

## 🛠️ Key Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Components by default).
- **Language:** TypeScript.
- **Database:** PostgreSQL (AWS RDS) accessed via **Prisma** (`@taxiciti/database`).
- **Auth:** Clerk (Middleware logic often found in `proxy.ts`, check for usage).
- **State Management:** URL State > React Server Components > Context API > Zustand (if needed).
- **Testing:** Playwright (`pnpm run test:e2e`).
- **Error Tracking:** Sentry.

## 💻 Developer Workflows

### Build & Run

- **Start All (Dev):** `pnpm dev` (runs `turbo dev` across workspaces).
- **Start Specific App:** `pnpm dev --filter=user` (or `driver`, `admin`, `websocket`).
- **Build:** `pnpm build` (runs `turbo build`).
- **Type Check:** `pnpm check` (runs `tsc` across workspaces).

### Database Management (`packages/database`)

- **Schema Location:** `packages/database/prisma/schema.prisma`.
- **Generate Client:** `pnpm db:generate`.
- **Migrate Dev:** `cd packages/database && npx prisma migrate dev`.
- **Studio:** `cd packages/database && npx prisma studio`.

## 🧩 Project Patterns & Conventions

### 1. Database Access (`PrismaClient`)

- **Import:** Always import `prisma` from `@taxiciti/database`.
- **Usage:**

    ```typescript
    import { prisma } from "@taxiciti/database"; // Shared singleton instance

    export async function getTrip(id: string) {
    	// Queries are run directly without instantiating new clients
    	return await prisma.trip.findUnique({ where: { id } });
    }
    ```

- **Redis:** Import `redis` from `@taxiciti/database` for caching/KV operations.

### 2. UI Components (`@taxiciti/ui`)

- **Library:** Use `@taxiciti/ui` for shared components. It wraps HeroUI + Tailwind.
- **Usage:**
    ```typescript
    import { Button } from "@taxiciti/ui";
    // OR specific paths if tree-shaking is critical, though module exports handle this.
    ```
- **Styles:** Tailwind configs in apps extend the base config (`presets`).

### 3. API Routes (`app/api/`)

- **Structure:** `app/api/[resource]/route.ts` (Next.js App Router conventions).
- **Validation:** Use `zod` schema validation for request bodies.
- **Auth:** Protect routes using Clerk `auth()` helper.
- **Error Handling:** Return standard JSON error responses with appropriate status codes.

### 4. Middleware & Auth

- **Convention:** Clerk Middleware logic is often seen in `proxy.ts`. Ensure this file (or `middleware.ts`) is correctly configured in `next.config.js` or root if authentication isn't working as expected.
- **Public Routes:** Defined via `createRouteMatcher` (e.g., `/`, `/auth/*`, `/api/webhooks`).

### 5. Realtime (WebSockets)

- **Server:** `apps/websocket` (Socket.IO).
- **Client:** Connect using `socket.io-client` with Clerk token in `auth` payload.
- **Events:** `ride-request`, `driver-location-update`, `new-message` (see `apps/websocket/README.md`).

## ⚠️ Critical Rules

1. **Monorepo Imports:** Prefer package alias imports (`@taxiciti/ui`) over relative paths (`../../packages/ui`) to ensure portability and build correctness.
2. **Environment Variables:** Access via `process.env`. Secrets (like `DATABASE_URL`) are in root `.env`. Public vars often prefixed with `NEXT_PUBLIC_`.
3. **Server Components:** Default to Server Components in `app/`. Add `"use client"` only when interactive state/hooks are needed.
4. **Data Fetching:** Fetch data directly in Server Components using Prisma where possible. Use API routes for Client Component mutations/fetching.
5. **Membership Checks:** For constant membership validation (enums/literal unions), use `Set` + `.has()` instead of arrays + `.includes()` to keep style and intent consistent.
6. **API Contracts:** Do not use `Promise<unknown>` or `unknown[]` for controller/service response contracts. Define and return dedicated DTO interfaces.
7. **DTO Mapping:** Map Prisma entities to DTOs before returning from services to avoid leaking ORM/runtime-specific types across module boundaries.

## 🧪 Testing

- **E2E:** Playwright is set up (`pnpm test:e2e`).
- **Tests Location:** `/tests` directory in root or `__tests__` inside apps.
