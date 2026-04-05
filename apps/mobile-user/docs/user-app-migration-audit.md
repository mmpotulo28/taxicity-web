# User App Migration Audit (Phase 0)

## Current mobile-user baseline

- Current entry app is `App.tsx` with `react-native-webview` loading the web user app URL.
- There is no Expo Router route tree in the current implementation.
- Auth/session handling is currently web-driven through the WebView host app, not Clerk Expo.
- Existing scripts include `type-check`; `lint` and `test` are not yet present.

## Web to Native migration matrix

| Web route | Native route | Status |
| --- | --- | --- |
| `/` | `/(tabs)/index` | mapped |
| `/ride/route` | `/(ride)/route` | mapped |
| `/ride/location` | `/(ride)/location` | mapped |
| `/ride/taxi/list` | `/(ride)/taxi-list` | mapped |
| `/ride/track` | `/(ride)/track` | mapped |
| `/ride/trip/history` | `/(tabs)/history` | mapped |
| `/ride/trip/details` | `/(ride)/trip-details` | mapped |
| `/settings` | `/(tabs)/settings` | mapped |
| `/support` | `/(tabs)/settings` (support section) | mapped |
| `/auth/sign-in/*` | `/(auth)/sign-in` | mapped |
| `/auth/sign-up/*` | `/(auth)/sign-up` | mapped |

## User-flow API contract inventory

From web user flow and shared UI ride context/hooks:

- `GET /api/user/routes`
- `GET /api/user/ranks`
- `GET /api/user/taxis`
- `GET /api/user/users/saved-locations`
- `POST /api/user/users/saved-locations`
- `PUT /api/user/users/saved-locations/:id`
- `DELETE /api/user/users/saved-locations/:id`
- `POST /api/user/trips/:tripId/rating`

## User-flow socket event inventory

Socket channel patterns:

- `trip-{tripId}`
- `vehicle-{vehicleId}`
- `user-{userId}`
- `notifications-global`

Socket emits/subscriptions used by current user flow:

- `EVENTS.USER_TRIPS_SYNC` (`user-trips-sync`)
- `EVENTS.RIDE_REQUEST` (`ride-request`)
- `EVENTS.RIDE_STATUS_UPDATE` (`ride-status-update`)
- `EVENTS.TRIP_UPDATED` (`trip-updated`)
- `EVENTS.LOCATION_UPDATE` (`location-update`)
- `EVENTS.NOTIFICATIONS_SYNC` (`notifications-sync`)
- `EVENTS.NOTIFICATION_MARK_READ` (`notification-mark-read`)
- `new-notification` (channel event)
