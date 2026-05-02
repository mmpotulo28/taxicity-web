# User App Migration Runbook (Developer + AI Agent)

## 1. Purpose

This is an execution runbook, not a business document.

Primary goal:

- Replace the current WebView-based user mobile app with a fully native Expo React Native app using Expo Router, NativeWind, and Clerk Expo.

Secondary goals:

- Preserve current UX/design language from the web app.
- Increase reliability, performance, and maintainability.
- Enable autonomous implementation by AI agents with minimal human review loops.

## 2. Scope and Source of Truth

Current web source:

- apps/user

Current mobile target:

- apps/mobile-user

In scope for native parity:

- Home dashboard and map entry
- Ride request funnel
- Active trip tracking
- Trip history and trip details
- Settings and support entry points
- Sign-in and sign-up

Out of scope for initial migration:

- Non-critical experimental pages
- Web-only developer docs pages

## 3. Non-Negotiable Technical Constraints

- Navigation must use Expo Router.
- Styling must use Tailwind semantics via NativeWind.
- Authentication must use Clerk Expo, not Clerk Next.js.
- Core flows must not depend on WebView.
- No direct network calls in screen components.
- Typed DTO contracts are mandatory for service boundaries.
- Realtime events must use typed payload interfaces.

## 4. Required Architecture

## 4.1 Directory blueprint (target)

Use this structure as the target shape in apps/mobile-user:

```text
app/
  _layout.tsx
  (auth)/
    sign-in.tsx
    sign-up.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    history.tsx
    settings.tsx
  (ride)/
    route.tsx
    location.tsx
    taxi-list.tsx
    track.tsx
    trip-details.tsx
src/
  core/
    api/
      client.ts
      errors.ts
      interceptors.ts
    auth/
      clerk.ts
      guards.ts
      token-cache.ts
    config/
      env.ts
      runtime.ts
    telemetry/
      sentry.ts
      newrelic.ts
      logger.ts
  features/
    ride/
      hooks/
      services/
      dto/
      store/
      components/
    trip/
      hooks/
      services/
      dto/
      components/
    settings/
      hooks/
      services/
      components/
  shared/
    ui/
    utils/
    types/
```

## 4.2 State design

- Server state: TanStack Query.
- Session/auth state: Clerk + route guards.
- Feature flow state: local store per feature (Zustand preferred).
- Realtime state: dedicated socket adapter and store.

## 4.3 Networking design

- Central API client with request/response interceptors.
- Auth token injection at interceptor layer only.
- DTO mapping in service files, not screens.

## 4.4 Styling design

- NativeWind plus shared token constants.
- Preserve spacing scale, color palette, typography hierarchy from web.
- Build RN-native versions for web-only components.

## 5. Web-to-Native Route Mapping

Required mapping table:

- / -> /(tabs)/index
- /ride/route -> /(ride)/route
- /ride/location -> /(ride)/location
- /ride/taxi/list -> /(ride)/taxi-list
- /ride/track -> /(ride)/track
- /ride/trip/history -> /(tabs)/history
- /ride/trip/details -> /(ride)/trip-details
- /settings -> /(tabs)/settings
- /support -> /(tabs)/settings (support section) or /(support)/index if split
- /auth/sign-in/\* -> /(auth)/sign-in
- /auth/sign-up/\* -> /(auth)/sign-up

## 6. AI Agent Execution Protocol

Apply this protocol to every phase.

For each task:

- Read relevant source files before editing.
- Create or update only files in current task scope.
- Run lint, typecheck, and targeted tests.
- Write a concise implementation note in PR description.
- Do not move to next task if current gate fails.

PR policy:

- One PR per phase.
- Keep PR under 600 changed lines when possible.
- If a task exceeds limit, split into sub-PRs by feature module.

Autonomy policy:

- If blocked by missing API contracts, create a typed local adapter with TODO marker and continue.
- If blocked by infra secrets, implement fallback wiring and document exact env key needed.
- Never reintroduce WebView for core flows.

## 7. Phase Plan (Task Cards)

Estimated timeline: 14 to 18 weeks.

## Phase 0: Audit and baseline

Task U-00.1 Route and dependency inventory

- Inputs: apps/user/app routes, apps/user/providers, current mobile-user app.
- Actions:
    - Build migration matrix from web route to native route.
    - Document API endpoints and socket events used by user flows.
- Outputs:
    - migration matrix markdown section in this file.
    - api and socket contract list.
- Gate:
    - 100% in-scope routes mapped.

Task U-00.2 Performance baseline

- Actions:
    - Measure startup time, first interaction latency, and active-trip update latency in existing WebView app.
- Outputs:
    - baseline metrics table.
- Gate:
    - metrics captured on at least one Android and one iOS test device.

## Phase 1: Foundation

Task U-01.1 Expo Router shell

- Actions:
    - Create route groups and base layouts in app.
    - Add navigation container conventions and screen wrappers.
- Gate:
    - app boots and navigates between placeholder routes.

Task U-01.2 NativeWind and tokens

- Actions:
    - Install and configure NativeWind.
    - Create shared token bridge for RN styles.
- Gate:
    - reference screen renders with tokenized spacing/colors.

Task U-01.3 Core API and error handling

- Actions:
    - Build core/api/client with typed methods.
    - Standardize error model and retry policy.
- Gate:
    - one sample service returns typed DTO and typed error.

## Phase 2: Authentication and route guards

Task U-02.1 Clerk Expo integration

- Actions:
    - Add Clerk Expo provider to root layout.
    - Implement secure token cache.
    - Add deep-link handling for auth callbacks.
- Gate:
    - cold launch to authenticated tab after successful sign-in.

Task U-02.2 Guarded route groups

- Actions:
    - Protect tabs and ride groups.
    - Redirect unauthenticated users to auth routes.
- Gate:
    - no protected screen can be opened without valid session.

## Phase 3: Core ride flow

Task U-03.1 Home and route selection

- Actions:
    - Implement native home with map entry and action cards.
    - Implement route selection screen.
- Gate:
    - can start ride request funnel from home.

Task U-03.2 Pickup and dropoff selection

- Actions:
    - Implement location input UX and validation.
    - Persist draft request state in feature store.
- Gate:
    - state survives navigation hops and app foreground transitions.

Task U-03.3 Taxi list and request action

- Actions:
    - Implement taxi list fetch and selection.
    - Submit request with optimistic UI and rollback.
- Gate:
    - success and failure paths both handled with typed states.

Task U-03.4 Active trip tracking

- Actions:
    - Build native tracking screen with realtime updates.
    - Add reconnect and state reconciliation logic.
- Gate:
    - tracking state recovers correctly after temporary network loss.

## Phase 4: History and settings

Task U-04.1 Trip history list

- Actions:
    - Implement paginated history with list virtualization.
- Gate:
    - smooth scrolling at 100 plus records.

Task U-04.2 Trip details

- Actions:
    - Build detail screen from selected history item.
- Gate:
    - detail data consistently loads from navigation params plus query cache.

Task U-04.3 Settings and support

- Actions:
    - Implement user settings and support entry.
- Gate:
    - update actions persist and recover after restart.

## Phase 5: Realtime and notifications hardening

Task U-05.1 Socket adapter

- Actions:
    - Implement typed socket client and channel manager.
    - Add exponential backoff reconnect policy.
- Gate:
    - no duplicate listeners after reconnect loops.

Task U-05.2 Push notification integration

- Actions:
    - Integrate expo-notifications.
    - Route notification taps into ride or history screens.
- Gate:
    - notification deep-links open correct screen state.

## Phase 6: Performance and reliability

Task U-06.1 Render and memory optimization

- Actions:
    - profile expensive renders and apply memoization or split components.
- Gate:
    - no visible jank in ride flow on target mid-range devices.

Task U-06.2 Error budgets and crash hardening

- Actions:
    - wire Sentry and New Relic events for critical user actions.
    - fix crashers and major unhandled promise flows.
- Gate:
    - crash-free sessions meet target threshold in staging.

## Phase 7: Release and deprecation

Task U-07.1 Staged rollout

- Actions:
    - release to internal, then phased cohorts.
    - monitor critical telemetry panels.
- Gate:
    - core funnels stable for agreed monitoring window.

Task U-07.2 Remove WebView dependency

- Actions:
    - delete or archive old WebView app shell logic.
- Gate:
    - no runtime imports of react-native-webview for core flows.

## 8. Validation Commands (per PR)

Run at repo root unless otherwise noted:

```bash
pnpm --filter mobile-user type-check
pnpm --filter mobile-user lint
pnpm --filter mobile-user test
```

If lint or test script does not exist yet, add it in the same phase before merging.

Device validation:

```bash
cd apps/mobile-user
expo start --clear
```

Optional build validation:

```bash
cd apps/mobile-user
eas build --profile preview --platform android
```

## 9. Quality Gates

Every phase must satisfy all:

- TypeScript has zero new errors.
- No any in new DTO and service contracts.
- No direct fetch or axios calls inside screen components.
- Feature code has deterministic loading, error, and empty states.
- Realtime listeners are cleaned on unmount.
- Route guards verified for authenticated and unauthenticated states.

## 10. Performance Targets

Release targets for user app:

- Cold start p50 under 2.5s on mid-range Android.
- First actionable screen under 3.0s p95.
- Active trip event-to-UI latency under 500ms p95.
- Crash-free sessions 99.5% or higher on production cohort.

## 11. Definition of Done

Migration is done only when all are true:

- Expo Router is the sole navigation layer.
- Clerk Expo fully handles auth and token lifecycle.
- Core user ride flows are native and production-stable.
- Styling is NativeWind-based with token parity.
- WebView is removed from core app flow and dependencies.
- Phase checklists and validation commands are complete.
