# TaxiCity Project Status & Implementation Roadmap

This document serves as the global master tracker for the TaxiCity multi-app ecosystem integration. It tracks implemented features, identifies critical missing architectural components for synchronization, and prioritizes pending work.

**Last Updated:** January 10, 2026

## 🚨 Critical Infrastructure & Synchronization (Priority: Critical)

These components are required to bridge the gap between the Admin, Driver, and User apps to achieve "perfect synchronization" and real-time responsiveness.

- [ ] **Real-Time Event Engine (Pusher/WebSockets)**
    - **Goal:** Replace polling (setInterval) with event-driven updates.
    - **Requirement:** Instant "Ride Request" popups for drivers and "Driver Accepted" updates for users.
    - **Tech:** Pusher (compatible with Vercel Serverless). - **Status:** 🏗️ Infrastructure Integrated (Pusher Context + Utils). Needs feature conversion.- [ ] **Location Ingestion Service (High-Frequency Tracking)**
    - **Goal:** Handle 1-sec GPS updates from thousands of drivers without crashing Postgres.
    - **Requirement:** A lightweight store (Redis/Upstash) to buffer coordinates before writing to DB.
    - **Impact:** Smooth "Uber-like" car movement on User maps.
- [ ] **Transactional Seat Locking (Concurrency)**
    - **Goal:** Prevent double-booking on shared vehicles (Minibus Taxis).
    - **Requirement:** Prisma Interactive Transactions to lock `VehicleTrip` capacity during booking.
    - **Scenario:** 2 users booking the last seat simultaneously -> System must reject one.

## 📱 User App (Passenger Experience)

### Core Features

- [x] **Authentication & Onboarding** (Clerk Integration)
- [x] **Trip Booking UI** (Pickup/Dropoff selection)
- [x] **Ride History & Receipts**
- [ ] **Live Driver Tracking** (Requires Location Service)
    - \*Missing:\*\* Real-time map updates of the assigned taxi.
- [ ] **Smart Grouping / Matchmaking** ( _Priority: Medium_ )
    - **Goal:** Group users going to similar destinations before dispatching a driver.
    - **Current State:** Basic 1-to-1 or manual selection logic.
- [ ] **Push Notifications** ( _Priority: Medium_ )
    - **Goal:** Notify user when "Taxi is Arriving" even if phone is locked.

## 🚙 Driver App (Operator Experience)

### Core Features

- [x] **Authentication & Profile** (Clerk + Prisma Driver Link)
- [x] **Shift Management** (Start/End Shift logic)
- [x] **Vehicle Association** (Linking Driver to Taxi)
- [ ] **Incoming Request Stream** ( _Priority: High_ )
    - **Missing:** Real-time stream of requests filtered by the driver's current active Route.
- [ ] **Queue Management** ( _Priority: Medium_ )
    - **Goal:** Digital "Rank Queue" visualization. Driver knows their position in the queue (1st, 2nd, etc).
- [ ] **Earnings & Wallet** ( _Priority: Low_ )
    - **Goal:** Daily/Weekly earning summaries and payout requests.

## 🖥️ Admin Dashboard (Management & Oversight)

### Core Features

- [x] **Dashboard Architecture** (HeroUI + Next.js App Router)
- [x] **Ranks Management**
    - [x] CRUD functionality
    - [x] Linked "Active Taxis" view (Fixed)
    - [x] "Refresh" capability
- [x] **Routes Management** (Basic CRUD)
- [x] **Fleets (Taxi/Driver) Management**
- [ ] **Live Operations Map** ( _Priority: Medium_ )
    - **Goal:** "God view" of all active taxis moving on the map.
- [ ] **Dispute Resolution Portal** ( _Priority: Low_ )
    - **Goal:** Handling user/driver reports within the admin panel.

## 🛠️ Backend & Shared Architecture

- [x] **Monorepo Structure** (Turbo, shared UI/DB packages)
- [x] **Database Schema** (Prisma + PostgreSQL)
- [x] **Type Safety** (Shared `types/` across apps)
- [ ] **API Rate Limiting & Security** ( _Priority: High_ )
    - **Goal:** Protect API routes from abuse.
- [ ] **Background Jobs / Cron** ( _Priority: Medium_ )
    - **Goal:** Automated tasks (e.g., "archive old trips", "calculate daily leaderboards").

---

## 📅 Recommended Implementation Sequence

1.  **Phase 1: The Sync Fix (Immediate)**
    - Implement **Pusher** for generic real-time events.
    - Implement **Transactional Locking** for booking seats.
2.  **Phase 2: The Location Fix**
    - Implement **Redis/Upstash** for coordinate streaming.
    - Update User App Map to consume this stream.
3.  **Phase 3: Operational Polish**
    - Add Push Notifications (Firebase/OneSignal).
    - Implement "Smart Grouping" logic for efficiency.
