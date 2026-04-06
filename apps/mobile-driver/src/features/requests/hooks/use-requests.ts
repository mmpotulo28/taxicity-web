import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toDomainError } from "../../../core/api/errors";
import { socketEvents } from "../../../core/socket/channels";
import { getDriverSocket } from "../../../core/socket/client";
import type { DriverRequest, TripStatus } from "../../../shared/types/driver";
import {
  acceptDriverRequest,
  declineDriverRequest,
  syncDriverRequests,
  syncDriverRequestsHttpFallback,
  updatePassengerStatus
} from "../services/requests.service";

const TERMINAL_STATUSES = new Set<TripStatus>(["COMPLETED", "CANCELLED"]);
const MAX_PROCESSED_TRANSITIONS = 1000;

export function useRequests() {
  const [requests, setRequests] = useState<DriverRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const processedStatusTransitions = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const synced = await syncDriverRequests();
      setRequests(synced);
    } catch {
      try {
        const fallbackSynced = await syncDriverRequestsHttpFallback();
        setRequests(fallbackSynced);
      } catch (caughtError: unknown) {
        setError(toDomainError(caughtError));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    let mounted = true;
    let teardown: (() => void) | undefined;

    const setup = async () => {
      const socket = await getDriverSocket();

      const onReconnect = () => {
        void refresh();
      };

      const onNewRequest = (request: DriverRequest) => {
        if (!mounted) {
          return;
        }

        setRequests((prev) => {
          if (prev.some((existing) => existing.id === request.id)) {
            return prev;
          }

          return [request, ...prev];
        });
      };

      const onRequestTaken = (payload: { requestId: string }) => {
        if (!mounted) {
          return;
        }

        setRequests((prev) => prev.filter((request) => request.id !== payload.requestId));
      };

      const onStatusChanged = (updatedRequest: DriverRequest) => {
        if (!mounted) {
          return;
        }

        const transitionKey = `${updatedRequest.id}:${updatedRequest.status}`;
        if (processedStatusTransitions.current.has(transitionKey)) {
          return;
        }

        processedStatusTransitions.current.add(transitionKey);
        if (processedStatusTransitions.current.size > MAX_PROCESSED_TRANSITIONS) {
          processedStatusTransitions.current.clear();
        }

        setRequests((prev) => {
          const existing = prev.find((request) => request.id === updatedRequest.id);
          if (!existing) {
            return prev;
          }

          if (TERMINAL_STATUSES.has(updatedRequest.status)) {
            return prev.filter((request) => request.id !== updatedRequest.id);
          }

          return prev.map((request) =>
            request.id === updatedRequest.id ? { ...request, ...updatedRequest } : request
          );
        });
      };

      socket.on("reconnect", onReconnect);
      socket.on(socketEvents.newRideRequest, onNewRequest);
      socket.on(socketEvents.rideTaken, onRequestTaken);
      socket.on(socketEvents.rideStatusChanged, onStatusChanged);

      teardown = () => {
        socket.off("reconnect", onReconnect);
        socket.off(socketEvents.newRideRequest, onNewRequest);
        socket.off(socketEvents.rideTaken, onRequestTaken);
        socket.off(socketEvents.rideStatusChanged, onStatusChanged);
      };
    };

    void setup();

    return () => {
      mounted = false;
      teardown?.();
    };
  }, [refresh]);

  const accept = useCallback(async (requestId: string) => {
    await acceptDriverRequest(requestId);
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  }, []);

  const decline = useCallback(async (requestId: string) => {
    await declineDriverRequest(requestId);
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  }, []);

  const transitionStatus = useCallback(async (rideId: string, status: TripStatus) => {
    const updated = await updatePassengerStatus(rideId, status);

    setRequests((prev) => {
      if (TERMINAL_STATUSES.has(updated.status)) {
        return prev.filter((request) => request.id !== rideId);
      }

      return prev.map((request) =>
        request.id === rideId ? { ...request, ...updated } : request
      );
    });
  }, []);

  const activeRequests = useMemo(
    () => requests.filter((request) => !TERMINAL_STATUSES.has(request.status)),
    [requests]
  );

  return {
    requests: activeRequests,
    isLoading,
    isError: Boolean(error),
    error: error ?? new Error("Unknown request sync error"),
    refresh,
    accept,
    decline,
    transitionStatus
  };
}
