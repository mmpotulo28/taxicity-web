import { useEffect, useState } from "react";

import { toDomainError } from "../../../core/api/errors";
import { getDriverSocket } from "../../../core/socket/client";
import { socketEvents } from "../../../core/socket/channels";
import type { DriverRequest } from "../../../shared/types/driver";
import { acceptDriverRequest, declineDriverRequest, syncDriverRequests } from "../services/requests.service";

export function useRequests() {
  const [requests, setRequests] = useState<DriverRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const synced = await syncDriverRequests();
      setRequests(synced);
    } catch (caughtError: unknown) {
      const mapped = toDomainError(caughtError);
      setError(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();

    let isMounted = true;

    const setup = async () => {
      const socket = await getDriverSocket();

      const onNewRequest = (request: DriverRequest) => {
        if (!isMounted) {
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
        if (!isMounted) {
          return;
        }

        setRequests((prev) => prev.filter((request) => request.id !== payload.requestId));
      };

      socket.on(socketEvents.newRideRequest, onNewRequest);
      socket.on(socketEvents.rideTaken, onRequestTaken);

      return () => {
        socket.off(socketEvents.newRideRequest, onNewRequest);
        socket.off(socketEvents.rideTaken, onRequestTaken);
      };
    };

    let cleanup: (() => void) | undefined;

    void setup().then((teardown) => {
      cleanup = teardown;
    });

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, []);

  const accept = async (requestId: string) => {
    await acceptDriverRequest(requestId);
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  const decline = async (requestId: string) => {
    await declineDriverRequest(requestId);
    setRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  return {
    requests,
    isLoading,
    isError: Boolean(error),
    error: error ?? new Error("Unknown request sync error"),
    refresh,
    accept,
    decline
  };
}
