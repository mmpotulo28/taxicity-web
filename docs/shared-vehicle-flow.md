# Shared Vehicle (Minibus) Logic & Flow

## Overview

TaxiCity operates on a **Shared Vehicle** model (similar to a minibus taxi service), distinct from traditional ride-hailing (Uber/Bolt).

- **Vehicle Trip (Run):** A driver starts a "run" on a specific route. This represents the physical movement of the taxi from Start to End.
- **Passenger Trip:** Users request rides along this route. They "join" the active Vehicle Trip.
- **Multiple Passengers:** A single Vehicle Trip contains multiple Passenger Trips.
- **Stops:** Passengers board and alight at different points. The Vehicle Trip continues until the driver ends the run.

## Data Model

### `VehicleTrip`

Represents the taxi's journey.

- `id`: UUID
- `driverId`: Link to Driver
- `taxiId`: Link to Taxi
- `routeId`: Link to Route
- `status`: `SCHEDULED` | `BOARDING` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED`
- `capacity`: Max passengers (snapshot from Taxi)
- `passengers`: List of `Trip` records

### `Trip` (Passenger)

Represents a user's booking.

- `id`: UUID
- `userId`: Link to User
- `vehicleTripId`: Link to the `VehicleTrip` they are on
- `status`: `REQUESTED` | `ACCEPTED` | `ARRIVED_AT_PICKUP` | `IN_PROGRESS` | `COMPLETED` (Dropped off)

## Workflow

### 1. Driver Starts a Run

**Endpoint:** `POST /api/driver/vehicle-trips`

- Driver selects a `taxiId` and `routeId`.
- System creates a `VehicleTrip` with status `BOARDING`.
- System checks if the taxi is already on an active run (prevents duplicates).

### 2. User Requests a Ride

**Endpoint:** `POST /api/trips`

- User selects `pickup`, `dropoff`, `routeId`.
- System creates a `Trip` with status `REQUESTED`.
- _Note:_ The request is broadcast to drivers on that route.

### 3. Driver Accepts Passenger

**Endpoint:** `POST /api/driver/vehicle-trips/[id]/passengers/[tripId]/accept`

- Driver sees the request.
- System checks `VehicleTrip` capacity (`current_passengers < capacity`).
- If space exists:
    - `Trip` is linked to `VehicleTrip`.
    - `Trip` status -> `ACCEPTED`.
    - `VehicleTrip` available seats decrease.

### 4. Pickup & Progress

**Endpoint:** `POST /api/driver/trips/[id]/status`

- Driver arrives at pickup: `Trip` status -> `ARRIVED_AT_PICKUP`.
- Passenger boards: `Trip` status -> `IN_PROGRESS`.
- _Note:_ This only updates the _passenger's_ status. The `VehicleTrip` remains `IN_PROGRESS`.

### 5. Dropoff (Passenger Completion)

**Endpoint:** `POST /api/driver/trips/[id]/status`

- Passenger reaches destination.
- Driver marks `Trip` status -> `COMPLETED`.
- **Crucial:** The `VehicleTrip` continues! The seat becomes available again for new passengers down the route.

### 6. End of Run

**Endpoint:** `PATCH /api/driver/vehicle-trips/[id]`

- Driver finishes the route.
- Driver updates `VehicleTrip` status -> `COMPLETED`.
- Any remaining passengers must be dropped off first.

## Key Differences from Uber-like Model

1.  **One-to-Many:** One Driver/Vehicle serves multiple Users simultaneously.
2.  **Independent Lifecycles:** A Passenger Trip (`Trip`) can start and end _within_ the lifecycle of a `VehicleTrip`.
3.  **Capacity Management:** System strictly enforces `Taxi.capacity`.
4.  **Route Adherence:** Pickups/Dropoffs are generally constrained to the fixed `Route`.
