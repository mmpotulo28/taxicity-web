# Mobile Driver Hardening Tracker

Date: 2026-04-06
Scope: Execution tracking for mobile-driver hardening after native migration.
Usage: Update Status, Owner, and Notes as work progresses.

## Status Legend

- Not Started
- In Progress
- Blocked
- In Review
- Done

## Workstreams

| ID    | Workstream          | Task                                                                      | Priority | Owner           | Estimate    | Depends On          | Status      | Evidence / Touchpoints                                                                                                                                                                                                                                                                                           | Notes                                                      |
| ----- | ------------------- | ------------------------------------------------------------------------- | -------- | --------------- | ----------- | ------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| MD-01 | Monorepo Compliance | Add explicit shared workspace dependencies used by mobile-driver          | High     | Mobile Platform | 0.5 day     | None                | Done        | [apps/mobile-driver/package.json](../apps/mobile-driver/package.json), [apps/mobile-driver/src/core/socket/channels.ts](../apps/mobile-driver/src/core/socket/channels.ts)                                                                                                                                       | Removes hidden hoist risk                                  |
| MD-02 | Monorepo Compliance | Align tsconfig inheritance with monorepo conventions                      | High     | Mobile Platform | 0.5 day     | MD-01               | Done        | [apps/mobile-driver/tsconfig.json](../apps/mobile-driver/tsconfig.json), [packages/configs](../packages/configs)                                                                                                                                                                                                 | Keep Expo requirements while matching shared baseline      |
| MD-03 | Monorepo Compliance | Normalize mobile task naming with root orchestration                      | Medium   | Mobile Platform | 0.5 day     | None                | Done        | [apps/mobile-driver/package.json](../apps/mobile-driver/package.json), [turbo.json](../turbo.json), [package.json](../package.json)                                                                                                                                                                              | Ensure quality gate consistency                            |
| MD-04 | Reliability         | Finalize socket ack and event contract behavior                           | High     | Mobile + API    | 1 day       | None                | Done        | [apps/mobile-driver/src/core/socket/contracts.ts](../apps/mobile-driver/src/core/socket/contracts.ts), [apps/mobile-driver/src/core/socket/client.ts](../apps/mobile-driver/src/core/socket/client.ts)                                                                                                           | Lock timeout/retry semantics with backend                  |
| MD-05 | Reliability         | Harden reconnect and resume flow for request sync                         | High     | Mobile          | 1 day       | MD-04               | Done        | [apps/mobile-driver/src/features/requests/hooks/use-requests.ts](../apps/mobile-driver/src/features/requests/hooks/use-requests.ts)                                                                                                                                                                              | Verify state reconciliation after reconnect                |
| MD-06 | Location            | Close background/foreground tracking continuity gaps                      | High     | Mobile          | 1 to 2 days | None                | Done        | [apps/mobile-driver/src/core/location/tracking.ts](../apps/mobile-driver/src/core/location/tracking.ts), [apps/mobile-driver/src/core/location/permissions.ts](../apps/mobile-driver/src/core/location/permissions.ts)                                                                                           | Define expected behavior per OS lifecycle                  |
| MD-07 | Product Completion  | Implement earnings experience from placeholder to data-backed flow        | High     | Mobile + API    | 2 days      | MD-04               | Done        | [apps/mobile-driver/app/(tabs)/earnings.tsx](<../apps/mobile-driver/app/(tabs)/earnings.tsx>)                                                                                                                                                                                                                    | Include empty, loading, pagination states                  |
| MD-08 | Product Completion  | Implement notifications experience from placeholder                       | High     | Mobile + API    | 1 to 2 days | MD-04               | Blocked     | [apps/mobile-driver/app/(tabs)/notifications.tsx](<../apps/mobile-driver/app/(tabs)/notifications.tsx>)                                                                                                                                                                                                          | Awaiting dedicated backend notifications endpoint/contract |
| MD-09 | Product Completion  | Implement profile experience from placeholder                             | Medium   | Mobile + API    | 1 to 2 days | None                | Done        | [apps/mobile-driver/app/(tabs)/profile.tsx](<../apps/mobile-driver/app/(tabs)/profile.tsx>)                                                                                                                                                                                                                      | Include account and driver metadata                        |
| MD-10 | Product Completion  | Replace shift end summary placeholder with backend-backed closeout        | High     | Mobile + API    | 1 day       | MD-07               | Done        | [apps/mobile-driver/app/(shift)/end-summary.tsx](<../apps/mobile-driver/app/(shift)/end-summary.tsx>)                                                                                                                                                                                                            | Show totals deterministically                              |
| MD-11 | QA Baseline         | Add unit and integration tests for core mobile flows                      | High     | Mobile QA       | 2 to 3 days | MD-04, MD-05, MD-06 | Not Started | [apps/mobile-driver/package.json](../apps/mobile-driver/package.json)                                                                                                                                                                                                                                            | Current test command is placeholder                        |
| MD-12 | QA Baseline         | Add smoke CI checks for mobile-driver in monorepo pipeline                | High     | DevOps          | 1 day       | MD-11               | Not Started | [/.github/workflows/docker-publish.yml](../.github/workflows/docker-publish.yml), [turbo.json](../turbo.json)                                                                                                                                                                                                    | Add dedicated mobile lane                                  |
| MD-13 | Observability       | Standardize telemetry initialization and env strategy                     | Medium   | Mobile Platform | 1 day       | None                | Done        | [apps/mobile-driver/src/core/telemetry/sentry.ts](../apps/mobile-driver/src/core/telemetry/sentry.ts), [apps/mobile-driver/src/core/telemetry/newrelic.ts](../apps/mobile-driver/src/core/telemetry/newrelic.ts)                                                                                                 | Align dev/stage/prod sampling and tags                     |
| MD-14 | Documentation       | Update migration docs to reflect current native architecture and versions | Medium   | Tech Lead       | 0.5 day     | None                | Done        | [docs/mobile-app-prd-and-plan.md](mobile-app-prd-and-plan.md), [apps/mobile-driver/package.json](../apps/mobile-driver/package.json)                                                                                                                                                                             | Remove old WebView-era assumptions                         |
| MD-15 | Notifications       | Integrate FlowPush SDK registration lifecycle with authenticated sessions | High     | Mobile Platform | 0.5 day     | MD-13               | Done        | [apps/mobile-driver/src/core/push/flowpush.ts](../apps/mobile-driver/src/core/push/flowpush.ts), [apps/mobile-driver/src/core/push/use-flowpush-registration.ts](../apps/mobile-driver/src/core/push/use-flowpush-registration.ts), [apps/mobile-driver/app/\_layout.tsx](../apps/mobile-driver/app/_layout.tsx) | Requires `EXPO_PUBLIC_FLOWPUSH_APP_KEY` env configuration  |

## Parallel Execution Plan

| Lane                     | Items                      |
| ------------------------ | -------------------------- |
| Lane A: Monorepo Fit     | MD-01, MD-02, MD-03        |
| Lane B: Reliability      | MD-04, MD-05, MD-06        |
| Lane C: Product Surfaces | MD-07, MD-08, MD-09, MD-10 |
| Lane D: Quality + Ops    | MD-11, MD-12, MD-13        |
| Lane E: Documentation    | MD-14                      |

## Phase Gates

| Gate   | Exit Criteria                                            |
| ------ | -------------------------------------------------------- |
| Gate 1 | MD-01 to MD-06 complete and verified in internal QA      |
| Gate 2 | MD-07 to MD-10 complete with backend contract validation |
| Gate 3 | MD-11 to MD-13 complete, CI green, telemetry verified    |
| Gate 4 | MD-14 merged and release checklist signed off            |

## Verification Checklist

| Check                                                                   | Owner           | Status      |
| ----------------------------------------------------------------------- | --------------- | ----------- |
| Request lifecycle stable under reconnect scenarios                      | Mobile QA       | Not Started |
| Location continuity behavior documented and validated per OS state      | Mobile QA       | Not Started |
| Monorepo install and build stable without hidden dependency assumptions | Mobile Platform | Not Started |
| CI pipeline includes mobile quality gate                                | DevOps          | Not Started |
| Critical tabs no longer placeholder-only                                | Mobile          | Not Started |
| Migration docs match current implementation                             | Tech Lead       | Not Started |
| FlowPush register and identify lifecycle validated on device            | Mobile QA       | Not Started |
