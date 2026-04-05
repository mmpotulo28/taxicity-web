import { useMutation, useQuery } from "@tanstack/react-query";

import { toDomainError } from "../../../core/api/errors";
import { endShift, fetchActiveShift, startShift } from "../services/shift.service";

const activeShiftQueryKey = ["shift", "active"] as const;

export function useActiveShift() {
  const query = useQuery({
    queryKey: activeShiftQueryKey,
    queryFn: fetchActiveShift,
    staleTime: 5000
  });

  return {
    shift: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? toDomainError(query.error) : new Error("No error"),
    refresh: query.refetch
  };
}

export function useStartShift() {
  const mutation = useMutation({
    mutationFn: startShift
  });

  return {
    ...mutation,
    error: mutation.error ? toDomainError(mutation.error) : new Error("No error")
  };
}

export function useEndShift() {
  const mutation = useMutation({
    mutationFn: endShift
  });

  return {
    ...mutation,
    error: mutation.error ? toDomainError(mutation.error) : new Error("No error")
  };
}
