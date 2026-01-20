# TaxiCity Web & Mobile Monorepo

The comprehensive platform for modern shared taxi operations in South Africa.

## 🏗 System Architecture

```mermaid
graph TD
    subgraph "Clients"
        U_WEB[User Web App\n(:3000)]
        D_WEB[Driver Web App\n(:3001)]
        A_WEB[Admin Dashboard\n(:3002)]
        U_MOB[User Mobile App\n(:3005)]
        D_MOB[Driver Mobile App\n(:3004)]
    end

    subgraph "Backend Services (Next.js API Routes)"
        API[Unified API Layer\n(Auth, Routes, Trips)]
    end

    subgraph "Infrastructure"
        DB[(PostgreSQL\nPrisma)]
        REDIS[(Upstash Redis/KV\nCaching & State)]
        PUSHER[Pusher Channels\nRealtime Updates]
        CLERK[Clerk Auth\nIdentity Management]
        MAPS[Google Maps API\nRouting & Geocoding]
    end

    U_WEB --> API
    D_WEB --> API
    A_WEB --> API
    U_MOB --> API
    D_MOB --> API

    API --> DB
    API --> REDIS
    API --> PUSHER
    API --> CLERK
    API --> MAPS

    PUSHER -.-> U_WEB
    PUSHER -.-> D_WEB
    PUSHER -.-> U_MOB
    PUSHER -.-> D_MOB
```

## 📂 Project Structure

This project is a release-ready **Turborepo** monorepo.

### Apps

| Path                 | Description                       | Port   |
| :------------------- | :-------------------------------- | :----- |
| `apps/user`          | Passenger Web Application         | `3000` |
| `apps/driver`        | Driver Web Dashboard & Operations | `3001` |
| `apps/admin`         | Operator/Admin Dashboard          | `3002` |
| `apps/mobile-driver` | Expo/React Native Driver App      | `3004` |
| `apps/mobile-user`   | Expo/React Native Passenger App   | `3005` |

### Packages

| Path                | Description                                |
| :------------------ | :----------------------------------------- |
| `packages/database` | Shared Prisma Client (v7+) & Redis Config  |
| `packages/ui`       | Shared HeroUI Components & Tailwind Config |
| `packages/configs`  | Shared TSConfig, ESLint, etc.              |
| `packages/utils`    | Shared Helper Functions                    |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20+
- **PNPM**: v9 or v10 (`npm install -g pnpm`)
- **Docker** (Optional, for containerized builds)

### 1. Environment Setup

Create a `.env` file in the root (or specific app folders) with the following keys.

> **Note:** The `turbo.json` `globalPassThroughEnv` ensures these keys are available to all apps during build/dev.

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/taxicity"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Realtime (Pusher)
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
PUSHER_APP_ID=...
PUSHER_SECRET=...

# Caching (Upstash/Vercel)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### 2. Installation

```bash
pnpm install
```

### 3. Database Generation

Generate the Prisma Client types:

```bash
pnpm db:generate
```

### 4. Run Development Servers

Start all web applications locally:

```bash
pnpm dev
# or specifically:
turbo dev
```

---

## 📱 Running Mobile Apps

The mobile apps are built with **Expo**. ensure you have the Expo Go app on your physical device or an Android Emulator/iOS Simulator running.

### Driver Mobile App

```bash
cd apps/mobile-driver
pnpm dev
# Port: 3004
```

### User Mobile App

```bash
cd apps/mobile-user
pnpm dev
# Port: 3005
```

---

## 🐳 Docker Deployment

The web applications are containerized using **Docker**.

### Build Commands

Run these from the **root** of the monorepo to ensure the build context includes the shared packages.

**User App:**

```bash
docker build --platform linux/amd64 -f apps/user/Dockerfile -t mmpotulo28/taxicity-user:latest .
docker push mmpotulo28/taxicity-user:latest
```

**Driver App:**

```bash
docker build --platform linux/amd64 -f apps/driver/Dockerfile -t mmpotulo28/taxicity-driver:latest .
docker push mmpotulo28/taxicity-driver:latest
```

**Push to Production Server:**

```bash
docker compose pull
docker compose up -d --force-recreate
```

> **Note:** We use a multi-stage Dockerfile that `prunes` the monorepo using `turbo prune` to isolate only necessary package dependencies, keeping images small.

---

## 🔄 Data Flow & Runtime Configuration

### Shared Vehicle Model

Unlike standard ride-hailing (Uber/Bolt), TaxiCity uses a **Shared Vehicle** model:

1.  **Driver** starts a `VehicleTrip` on a specific `Route` (e.g., "Sandton to Soweto").
2.  **User** requests a `Trip` (seat) on an active `VehicleTrip`.
3.  **Queueing:** Users are added to a waiting queue.
4.  **Dispatch:** When the vehicle is full (or driver departs), the status updates to `IN_PROGRESS`.

### Runtime Configuration

- **Authentication:** All requests are validated via Clerk Middleware.
- **State Management:**
    - **Frontend:** React Query for server state, React Context for local UI state.
    - **Backend:** Redis/Upstash is used for real-time location caching and rapid queue management before persisting to PostgreSQL.
- **Build Time vs Runtime:**
    - `NEXT_PUBLIC_` variables are baked in at build time.
    - `DATABASE_URL` and tokens are read at runtime (Server Components).

### SSL/TLS Note

In some CI/Docker environments, strict SSL verification might block Prisma engine downloads. We handle this in the Dockerfile by setting `NODE_TLS_REJECT_UNAUTHORIZED=0` specifically for the `pnpm install` step.
