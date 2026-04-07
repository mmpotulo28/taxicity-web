# Mobile Driver Migration Audit

Date: 2026-04-06
Scope: Native mobile-driver migration review (no code changes), feature completeness, architecture alignment, cleanup, and monorepo adaptation.

## Executive Summary

The native foundation is strong, but the app is not fully production-ready yet. Core risks are missing product surfaces, no automated tests, partial monorepo alignment, and release-process gaps.

## What Is Implemented Well

- Auth flow and session plumbing are present across the native app shell and auth routes.
- Request lifecycle has realtime and fallback structure.
- Location cadence model exists in [apps/mobile-driver/src/core/location/tracking.ts](../apps/mobile-driver/src/core/location/tracking.ts).
- Socket event mapping is centralized in [apps/mobile-driver/src/core/socket/channels.ts](../apps/mobile-driver/src/core/socket/channels.ts).
- Telemetry modules exist:
    - [apps/mobile-driver/src/core/telemetry/sentry.ts](../apps/mobile-driver/src/core/telemetry/sentry.ts)
    - [apps/mobile-driver/src/core/telemetry/newrelic.ts](../apps/mobile-driver/src/core/telemetry/newrelic.ts)

## Missing Features

### High Priority Features

- Earnings experience is still placeholder-only in [apps/mobile-driver/app/(tabs)/earnings.tsx](<../apps/mobile-driver/app/(tabs)/earnings.tsx>).
- Notifications tab is placeholder-only in [apps/mobile-driver/app/(tabs)/notifications.tsx](<../apps/mobile-driver/app/(tabs)/notifications.tsx>).
- Profile tab is placeholder-only in [apps/mobile-driver/app/(tabs)/profile.tsx](<../apps/mobile-driver/app/(tabs)/profile.tsx>).
- Shift closeout summary is placeholder-only in [apps/mobile-driver/app/(shift)/end-summary.tsx](<../apps/mobile-driver/app/(shift)/end-summary.tsx>).

### Medium Priority Features

- Shift start UX relies on manual identifiers and needs stronger flow design in [apps/mobile-driver/app/(shift)/start.tsx](<../apps/mobile-driver/app/(shift)/start.tsx>).
- Onboarding validation and richer input constraints need expansion in [apps/mobile-driver/app/(onboarding)/apply.tsx](<../apps/mobile-driver/app/(onboarding)/apply.tsx>).

## Monorepo Architecture Adaptation Gaps

### Dependency Contract

- Shared package imports are used (for example in [apps/mobile-driver/src/core/socket/channels.ts](../apps/mobile-driver/src/core/socket/channels.ts)), but shared workspace dependencies were not fully declared in [apps/mobile-driver/package.json](../apps/mobile-driver/package.json).
- Risk: hidden hoist dependency and brittle installs.

### TypeScript and Config Consistency

- Mobile tsconfig currently needed alignment with monorepo shared config approach used by sibling apps.
- Touchpoint: [apps/mobile-driver/tsconfig.json](../apps/mobile-driver/tsconfig.json).

### Task and Pipeline Consistency

- Mobile scripts exist in [apps/mobile-driver/package.json](../apps/mobile-driver/package.json), but test command remains a placeholder.
- Root orchestration exists in [turbo.json](../turbo.json) and [package.json](../package.json); mobile task naming and quality gates should remain aligned.

## Reliability and Quality Improvements

### High Priority Reliability

- Add real automated testing baseline (unit + integration) because current test script is non-functional in [apps/mobile-driver/package.json](../apps/mobile-driver/package.json).
- Finalize socket ack and retention contract notes in [apps/mobile-driver/src/core/socket/contracts.ts](../apps/mobile-driver/src/core/socket/contracts.ts).
- Improve lifecycle robustness for app background/foreground around location and socket continuity:
    - [apps/mobile-driver/src/core/location/tracking.ts](../apps/mobile-driver/src/core/location/tracking.ts)
    - [apps/mobile-driver/src/core/location/permissions.ts](../apps/mobile-driver/src/core/location/permissions.ts)

### Medium Priority Reliability

- Add offline retry/queue behavior for transient failures in request and socket-driven flows.
- Reduce complexity hotspots in request synchronization logic:
    - [apps/mobile-driver/src/features/requests/hooks/use-requests.ts](../apps/mobile-driver/src/features/requests/hooks/use-requests.ts)

## Cleanup Opportunities

- Replace remaining placeholder routes with data-backed screens.
- Extract magic numbers and operational constants in location and network behavior.
- Standardize telemetry initialization path and enrich breadcrumbs for easier incident debugging.
- Refresh migration docs to match current native implementation and versions:
    - [docs/mobile-app-prd-and-plan.md](mobile-app-prd-and-plan.md)

## Release and Ops Readiness

- Mobile release config exists in [apps/mobile-driver/eas.json](../apps/mobile-driver/eas.json), but repo-level mobile CI workflow is not yet visible under [/.github/workflows/docker-publish.yml](../.github/workflows/docker-publish.yml).
- Add dedicated CI lane for mobile checks, builds, and release readiness.

## Prioritized Action Plan

1. Stabilize reliability and quality gates.

1. Enforce monorepo compliance.

1. Complete key product surfaces.

1. Harden release workflow and docs.

Reliability gate contents: tests, socket contract finalization, location lifecycle hardening.

Monorepo compliance contents: explicit workspace dependencies, tsconfig alignment, task normalization.

Product surface contents: earnings, notifications, profile, shift summary.

Release workflow contents: mobile CI, release checklist, and architecture doc refresh.

## Scope Boundaries

Included:

- Audit and planning for mobile-driver migration completeness and monorepo fit.

Excluded:

- Code edits, config changes, test implementation, CI file creation.
