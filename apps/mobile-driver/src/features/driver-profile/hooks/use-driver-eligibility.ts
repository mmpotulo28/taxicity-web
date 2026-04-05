import { useQuery } from "@tanstack/react-query";

import { toDomainError } from "../../../core/api/errors";
import { fetchDriverEligibility } from "../services/driver-profile.service";

const driverEligibilityQueryKey = ["driver", "eligibility"] as const;

export function useDriverEligibility(enabled: boolean) {
  return useQuery({
    queryKey: driverEligibilityQueryKey,
    queryFn: fetchDriverEligibility,
    enabled,
    retry: false,
    staleTime: 30000,
    throwOnError: false,
    select: (data) => data,
    meta: {
      feature: "driver-profile"
    }
  });
}

export function useSafeDriverEligibility(enabled: boolean) {
  const query = useDriverEligibility(enabled);

  if (query.error) {
    return {
      ...query,
      error: toDomainError(query.error)
    };
  }

  return query;
}
