# Mobile Application PRD and Implementation Plan

## 1. Overview

TaxiCity mobile has moved from the initial WebView-wrapper strategy to a native Expo Router foundation for the driver experience. This document reflects the current direction and hardening plan.

## 2. Product Scope

### 2.1 Mobile User App

- Location: [apps/mobile-user](../apps/mobile-user)
- Status: foundational app shell, lower feature depth than driver app.

### 2.2 Mobile Driver App

- Location: [apps/mobile-driver](../apps/mobile-driver)
- Status: native foundation with auth, onboarding, shift lifecycle, requests, socket sync, and location publishing.

## 3. Current Architecture

- Framework: Expo SDK 54 + React Native 0.81 + Expo Router.
- Language: TypeScript.
- Monorepo orchestration: pnpm + turbo.
- Auth: Clerk via [apps/mobile-driver/src/core/auth](../apps/mobile-driver/src/core/auth).
- API layer: centralized client/interceptors under [apps/mobile-driver/src/core/api](../apps/mobile-driver/src/core/api).
- Realtime: Socket.IO contracts and client under [apps/mobile-driver/src/core/socket](../apps/mobile-driver/src/core/socket).
- Location: adaptive tracking and publisher under [apps/mobile-driver/src/core/location](../apps/mobile-driver/src/core/location) and [apps/mobile-driver/src/shared/utils/location-publisher.ts](../apps/mobile-driver/src/shared/utils/location-publisher.ts).
- Telemetry: initialized at provider level in [apps/mobile-driver/src/shared/ui/app-providers.tsx](../apps/mobile-driver/src/shared/ui/app-providers.tsx).

## 4. Implemented Feature Baseline

- Driver request sync with socket and HTTP fallback.
- Request accept, decline, and status transitions.
- Active shift controls with location publishing and end-shift flow.
- Earnings summary screen backed by API.
- Editable profile screen backed by API.
- End-shift summary screen using closeout route params.
- FlowPush SDK integration for push registration, identify, and unregister tied to auth lifecycle.

## 5. Remaining Gaps

- Notifications screen is blocked pending backend notifications endpoint and contract.
- QA baseline is incomplete: mobile-driver tests are not yet implemented.
- CI lane for mobile build/test quality gate is not yet in workflow.

## 6. Phase Plan (Current)

### Phase A: Monorepo Compliance

- Done: workspace dependency declarations and tsconfig/script alignment.

### Phase B: Reliability

- Done: socket ack parsing hardening.
- Done: reconnect, app foreground refresh, and pending-request action guards.
- Done: app-state-aware location cadence restart.

### Phase C: Product Surface Completion

- Done: earnings.
- Done: profile.
- Done: end-shift summary.
- Blocked: notifications endpoint/contract.

### Phase D: Quality, Observability, and Ops

- In progress: telemetry initialization strategy complete in app providers.
- Done: FlowPush integration wiring in root layout auth lifecycle and push service module.
- Pending: test suite baseline.
- Pending: mobile CI pipeline lane.

## 7. Push Notification Configuration

- Integration package: `@flowpush/app-sdk` in mobile-driver dependencies.
- Registration lifecycle:
    - Register and identify on authenticated session.
    - Unregister on sign-out.
- Required environment variables:
    - `EXPO_PUBLIC_FLOWPUSH_APP_KEY` (required)
    - `EXPO_PUBLIC_FLOWPUSH_API_URL` (optional; defaults to SDK default)
- Integration touchpoints:
    - [apps/mobile-driver/src/core/push/flowpush.ts](../apps/mobile-driver/src/core/push/flowpush.ts)
    - [apps/mobile-driver/src/core/push/use-flowpush-registration.ts](../apps/mobile-driver/src/core/push/use-flowpush-registration.ts)
    - [apps/mobile-driver/app/\_layout.tsx](../apps/mobile-driver/app/_layout.tsx)

## 8. Verification and Release Criteria

1. `pnpm --filter mobile-driver check` passes.
2. Critical tabs (`requests`, `earnings`, `profile`) are functional and non-placeholder.
3. Shift lifecycle (`start`, `active`, `end-summary`) is stable.
4. Realtime sync remains consistent after reconnect and app state transitions.
5. Test and CI gates are enabled before production store rollout.
6. Push registration and identify/unregister behavior is validated on sign-in and sign-out.

## 9. Related Docs

- Audit: [docs/mobile-driver-migration-audit.md](mobile-driver-migration-audit.md)
- Tracker: [docs/mobile-driver-hardening-tracker.md](mobile-driver-hardening-tracker.md)
