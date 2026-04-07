# Driver App Web to Expo Migration Plan

## Objective

Migrate driver tab pages from legacy web implementations to Expo Router React Native screens while preserving:

- visual hierarchy
- card/section layout
- information density
- interaction flow

## Scope

In scope:

- `app/(tabs)/index.tsx` (Driver Console shell/state gates)
- `app/(tabs)/earnings.tsx`
- `app/(tabs)/vehicle.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/requests.tsx` (minimal parity because web version was minimal)

Out of scope for this pass:

- full map rendering with native geospatial canvas (tracked as follow-up hardening)

## Source of Truth (Web Pages)

- `app/page.tsx` (driver state gates and console entry)
- `app/earnings/page.tsx`
- `app/vehicle/page.tsx`
- `app/profile/page.tsx`
- `app/requests/page.tsx`

## Phase Plan

### Phase 0: Planning and Baseline

- [x] capture migration strategy
- [x] verify app-folder routing and lint baseline
- [x] identify API endpoints used by web pages

### Phase 1: Data and UI Parity Pages

- [x] migrate `earnings` page with:
    - loading/error states
    - earnings summary cards
    - trip history list
    - pagination controls
- [x] migrate `profile` page with:
    - profile fetch
    - editable personal details form
    - save/update flow

### Phase 2: Vehicle Management Page

- [x] migrate vehicle list card structure
- [x] migrate vehicle registration form
- [x] migrate route-management interaction (native modal + route selection + permit reference input)

### Phase 3: Console State Gates

- [x] migrate web state gate logic into `index` tab:
    - loading
    - missing profile
    - missing vehicle
    - active console shell

### Phase 4: Validation and Hardening

- [x] run lint and fix diagnostics
- [x] smoke-check routes/navigation
- [x] track follow-up work for full active-shift/map migration

### Phase 5: Realtime and Native Auth/File Flows

- [x] migrate active-shift console internals into native modules
    - queue handling (join/leave + live queue position)
    - passenger state transitions (accept/arrived/in-progress/completed)
    - live location + route summary map panel scaffolding
- [x] re-enable Clerk Expo provider flow and wire real sign-out action
- [x] replace permit URL input with native document picker + upload flow
- [x] split console UI into lower-complexity native components for maintainability

### Phase 6: Parity Closure and Production Hardening (Next)

- [x] replace active-shift map scaffold with real native map rendering
    - decode/render route polyline
    - render stop markers and passenger pickup/dropoff markers
    - center/follow driver location with reconnect-safe updates
- [ ] complete non-tab parity screens that are still lightweight stubs
    - completed: `app/apply.tsx` multi-step, validation, uploads
    - completed: `app/notifications.tsx` API-backed notification list + mark-read actions
    - completed: `app/(tabs)/requests.tsx` live incoming queue/history parity
- [ ] finish hook-first architecture hardening for remaining migrated tab pages
    - completed: `app/(tabs)/profile.tsx` -> `src/hooks/useDriverProfile.ts`
    - completed: `app/(tabs)/earnings.tsx` -> `src/hooks/useDriverEarnings.ts`
    - completed: `app/(tabs)/vehicle.tsx` -> `src/hooks/useDriverVehicle.ts`
- [ ] harden realtime reliability and offline behavior
    - explicit reconnect/resubscribe strategy and stale-state refresh
    - degraded UI states when socket/location permissions are unavailable
- [ ] add migration verification coverage
    - smoke E2E for shift lifecycle (start, accept, status transitions, end)
    - smoke E2E for route-management permit picker/upload

## Migration Gap Analysis (2026-04-07)

Confirmed implemented:

- tab navigation and core tab parity (`index`, `earnings`, `vehicle`, `profile`)
- native console orchestration (`useDriverConsole`) with queue/realtime/location wiring
- native permit picker/upload and Clerk Expo auth token bridge

Remaining gaps (highest impact first):

1. E2E coverage for migrated native critical paths is not yet in place.

## Next Step Plan

Immediate next phase: **Phase 6A - Map + Stub Closure**

Delivery goals:

1. Ship real native active-shift map parity in console.
2. Upgrade `notifications` and `requests` from placeholder shells to API/realtime-backed screens. ✅
3. Expand `apply` into full multi-step validated workflow with document upload parity.

Exit criteria:

- `driver-app` lint passes.
- migrated screens have loading/error/empty states.
- manual QA checklist passes for start-shift and request lifecycle.

## Key Native Modules Added

- `src/modules/driver-console/useDriverConsole.ts`
    - realtime socket lifecycle
    - active trip orchestration
    - queue synchronization
    - GPS tracking emits
- `src/modules/driver-console/DriverConsoleNative.tsx`
    - start-shift and queue onboarding flows
    - incoming request cards
    - passenger state-machine controls
    - active-shift route summary and capacity controls

## Migration Notes

- Keep Tailwind utility styling via NativeWind classes for visual parity.
- Keep API contract compatibility by using existing `src/lib/api-client`.
- Prefer progressive enhancement: parity first, then deeper realtime/map features.
- Enforce separation of concerns: business/realtime/data state must live in hooks, while route screens stay presentational and only call hook functions.
- `app/(tabs)/requests.tsx` now follows this via `src/hooks/useRequests.ts`.
- `app/notifications.tsx` now follows this via `src/hooks/useDriverNotifications.ts`.
- `app/apply.tsx` now follows this via `src/hooks/useDriverApply.ts`.

## Execution Log

- 2026-04-07: Plan created.
- 2026-04-07: Phase 1 executed. `earnings` and `profile` now use native parity layouts with API-backed state.
- 2026-04-07: Phase 2 executed. `vehicle` now includes native list cards, registration flow, and route management modal.
- 2026-04-07: Phase 3 executed. `index` now uses web-like state gates (loading/profile/vehicle/console).
- 2026-04-07: Phase 4 executed. Validation completed with lint passing.
- 2026-04-07: Phase 5 executed. Added native realtime active-shift console module, restored Clerk Expo auth wiring, and migrated route permit handling to native document picker upload.
- 2026-04-07: Phase 5 refinement executed. Rebuilt `DriverConsoleNative` into modular sections and revalidated diagnostics/lint for `driver-app`.
- 2026-04-07: Post-phase audit executed. Added gap analysis and defined Phase 6A next-step plan for map parity and remaining stub screen closure.
- 2026-04-07: Phase 6A partial execution completed. `notifications` and `requests` screens were upgraded from placeholders to realtime/API-backed native screens and revalidated with `driver-app` lint.
- 2026-04-07: Architecture hardening update. Extracted requests business logic into `useRequests` hook and kept `requests` tab UI-only to enforce hook-first separation.
- 2026-04-07: Architecture hardening update. Extracted notifications business logic into `useDriverNotifications` hook and kept `notifications` screen UI-only.
- 2026-04-07: Architecture hardening update. Extracted multi-step apply workflow logic into `useDriverApply` and kept `apply` screen presentational-only.
- 2026-04-07: Architecture hardening update. Extracted profile and earnings business logic into `useDriverProfile` and `useDriverEarnings`; both tabs now keep state in hooks and render presentational UI only.
- 2026-04-07: Architecture hardening update. Extracted vehicle tab business logic into `useDriverVehicle` and kept `vehicle` tab presentational-only.
- 2026-04-07: Map parity update. Replaced console map placeholder with native map rendering (route polyline, passenger and route markers, live driver marker), and expanded `useDriverConsole` with decoded route coordinates, stop derivation, next-stop distance tracking, and reconnect-aware GPS emission.
