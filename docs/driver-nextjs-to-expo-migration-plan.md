# Driver App Migration Runbook (Developer + AI Agent)

## 1. Purpose

This runbook is implementation-first and optimized for autonomous execution by developers and AI agents.

Primary goal:

- Replace the WebView-based driver mobile app with a fully native Expo React Native app using Expo Router, NativeWind, and Clerk Expo.

Critical objective:

- Preserve and harden operational workflows for shift, requests, and location updates.

## 2. Scope and Source of Truth

Web source of truth:

- apps/driver

Mobile target:

- apps/mobile-driver

In scope for native parity:

- Auth and profile eligibility checks
- Apply and onboarding flow
- Vehicle registration and route assignment
- Shift start and shift end
- Rank queue and roaming mode
- Incoming request handling and passenger status actions
- Dashboard, status, earnings, notifications, profile

Out of scope for initial migration:

- Non-operational or low-value decorative pages
- Fallback WebView for core operations

## 3. Non-Negotiable Constraints

- Expo Router is mandatory.
- Tailwind semantics through NativeWind are mandatory.
- Authentication must use Clerk Expo.
- Core trip and shift operations cannot use WebView.
- No untyped socket payloads in production code.
- No API calls directly from screen components.
- Location tracking must be resource-aware and resilient.

## 4. Required Architecture

## 4.1 Directory blueprint (target)

```text
app/
  _layout.tsx
  (auth)/
    sign-in.tsx
    sign-up.tsx
  (onboarding)/
    apply.tsx
    vehicle-registration.tsx
  (tabs)/
    _layout.tsx
    dashboard.tsx
    requests.tsx
    status.tsx
    earnings.tsx
    notifications.tsx
    profile.tsx
  (shift)/
    start.tsx
    active.tsx
    end-summary.tsx
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
    socket/
      client.ts
      channels.ts
      contracts.ts
      reconnect.ts
    telemetry/
      sentry.ts
      newrelic.ts
      logger.ts
    location/
      tracking.ts
      permissions.ts
  features/
    driver-profile/
    onboarding/
    vehicle/
    shift/
    requests/
    queue/
    earnings/
    notifications/
  shared/
    ui/
    types/
    utils/
```

## 4.2 State design

- Server state: TanStack Query.
- Session/auth state: Clerk and guarded route groups.
- Realtime state: dedicated socket store plus contract validation.
- UI state: feature-local stores for short-lived interaction state.

## 4.3 Networking and socket design

- Core API client provides typed get, post, patch wrappers.
- Auth token attachment via interceptor only.
- Socket events defined in a single contracts file.
- Every socket action expects typed ack and fallback handling.

## 4.4 Design parity

- NativeWind and tokenized design constants.
- RN-native component replacements for web-only UI primitives.
- Focus motion on operational clarity, not decoration.

## 5. Web-to-Native Route Mapping

Required mapping table:

- / -> /(tabs)/dashboard or /(onboarding)/apply based on eligibility
- /dashboard -> /(tabs)/dashboard
- /requests -> /(tabs)/requests
- /status -> /(tabs)/status
- /earnings -> /(tabs)/earnings
- /notifications -> /(tabs)/notifications
- /vehicle -> /(tabs)/profile or /(onboarding)/vehicle-registration
- /profile -> /(tabs)/profile
- /apply -> /(onboarding)/apply

## 6. AI Agent Execution Protocol

Execution rules per task:

- Read source route and provider files before changes.
- Limit edits to current task scope.
- Run validation commands before finishing task.
- Record unresolved blockers in task note with exact dependency.
- Do not continue to next task on failed gate.

PR rules:

- One PR per phase.
- Keep PR under 700 changed lines when practical.
- Split large phase work by module if needed.

Autonomy rules:

- If backend contract is unclear, create typed adapter with explicit TODO contract marker and proceed.
- If secret config is missing, implement config guard and continue with mocked development fallback.
- Never add WebView dependency to recover from implementation gaps.

## 7. Phase Plan (Task Cards)

Estimated timeline: 16 to 20 weeks.

## Phase 0: Operational audit and contracts

Task D-00.1 Workflow decomposition

- Inputs: apps/driver routes, driver context, current mobile-driver shell.
- Actions:
    - Document exact shift lifecycle states.
    - Document request lifecycle states and transitions.
- Output:
    - state transition table for shift and request workflows.
- Gate:
    - all critical transitions are represented and testable.

Task D-00.2 API and socket contract inventory

- Actions:
    - Enumerate all endpoints and socket events used by current driver workflows.
- Output:
    - typed contract checklist for request, accept, decline, status update, location sync.
- Gate:
    - zero undocumented event names in active codepaths.

## Phase 1: Foundation

Task D-01.1 Expo Router skeleton

- Actions:
    - create route groups and root layouts.
- Gate:
    - app navigates across placeholder tabs and onboarding routes.

Task D-01.2 NativeWind and design token bridge

- Actions:
    - configure NativeWind and token mapping.
- Gate:
    - baseline screen matches spacing and typography scale.

Task D-01.3 Core API and error model

- Actions:
    - implement typed API client and domain-level error mapper.
- Gate:
    - one feature module uses typed query and mutation hooks with no any.

## Phase 2: Auth and onboarding

Task D-02.1 Clerk Expo integration

- Actions:
    - integrate Clerk provider and secure token cache.
    - implement auth callback deep links.
- Gate:
    - authenticated launch succeeds after app restart.

Task D-02.2 Eligibility and onboarding routes

- Actions:
    - route to apply or dashboard based on driver profile state.
    - implement vehicle registration starter flow.
- Gate:
    - ineligible account cannot access operational tabs.

## Phase 3: Shift lifecycle

Task D-03.1 Shift start flow

- Actions:
    - implement taxi selection, route selection, and mode selection.
- Gate:
    - driver can start shift in both roaming and queue pathways.

Task D-03.2 Active shift screen

- Actions:
    - implement active shift controls and status indicators.
- Gate:
    - core actions remain responsive under live updates.

Task D-03.3 End-shift summary

- Actions:
    - implement end-shift closeout and totals summary.
- Gate:
    - summary values are deterministic and match backend response.

## Phase 4: Realtime requests

Task D-04.1 Incoming request queue

- Actions:
    - implement request list with urgency UX and lifecycle states.
- Gate:
    - incoming request appears within latency target on stable network.

Task D-04.2 Accept and decline actions

- Actions:
    - implement socket ack and fallback HTTP sync paths.
- Gate:
    - no duplicate request state updates on reconnect.

Task D-04.3 Passenger status updates

- Actions:
    - implement arrived, in progress, completed transitions.
- Gate:
    - transitions are idempotent and recover after app resume.

## Phase 5: Location and map reliability

Task D-05.1 Tracking policy

- Actions:
    - implement adaptive location tracking cadence.
    - ensure location permissions and denial flows are robust.
- Gate:
    - location updates publish reliably without excessive battery drain.

Task D-05.2 Map overlays

- Actions:
    - render route and stop overlays with efficient updates.
- Gate:
    - map interactions remain smooth on target devices.

## Phase 6: Remaining parity surfaces

Task D-06.1 Dashboard and status

- Actions:
    - complete dashboard and status screens with live metrics.
- Gate:
    - values refresh correctly after app foreground events.

Task D-06.2 Earnings, notifications, profile

- Actions:
    - implement all remaining tab screens with pagination and robust empty states.
- Gate:
    - each screen has loading, error, and empty handling.

## Phase 7: Hardening and release

Task D-07.1 Performance pass

- Actions:
    - profile render loops, list performance, and memory usage.
- Gate:
    - no critical jank in request-heavy scenarios.

Task D-07.2 Reliability pass

- Actions:
    - test reconnect loops, token refresh, and long-session behavior.
- Gate:
    - stability metrics meet release thresholds.

Task D-07.3 Release and deprecation

- Actions:
    - staged rollout with telemetry monitoring.
    - remove WebView core dependency.
- Gate:
    - no core driver workflow depends on react-native-webview.

## 8. Validation Commands (per PR)

Run at repo root unless otherwise needed:

```bash
pnpm --filter mobile-driver type-check
pnpm --filter mobile-driver lint
pnpm --filter mobile-driver test
```

Runtime validation:

```bash
cd apps/mobile-driver
expo start --clear
```

Build validation:

```bash
cd apps/mobile-driver
eas build --profile preview --platform android
```

## 9. Quality Gates

Each phase must pass all:

- Zero new TypeScript errors.
- No any in new socket and service contracts.
- No direct API calls inside screen files.
- Every operational screen has explicit loading, error, and empty states.
- Realtime listeners cleaned on unmount and reconnect.
- Auth guard behavior validated for all route groups.

## 10. Operational Performance Targets

Release targets:

- Request event-to-render latency under 500ms p95.
- Accept action ack under 1.0s p95.
- Stable location publish cadence within configured target.
- Crash-free sessions 99.5% or higher.
- No memory growth trend during 60 minute active session test.

## 11. Definition of Done

Migration is complete only when:

- Expo Router fully owns navigation.
- Clerk Expo owns auth lifecycle.
- Shift and request operations are fully native and stable.
- NativeWind plus tokens preserve design language.
- Realtime and location flows meet reliability targets.
- WebView dependency is removed from core workflows.
- All phase gates and validation checks are completed.
