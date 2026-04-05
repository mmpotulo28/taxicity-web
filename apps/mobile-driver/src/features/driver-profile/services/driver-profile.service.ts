import { apiClient } from "../../../core/api/client";
import type { DriverEligibilityDto, DriverProfile } from "../../../shared/types/driver";

const ACTIVE_STATUSES = new Set(["ACTIVE"] as const);

export async function fetchDriverProfile() {
  const profile = await apiClient.get<DriverProfile | null>("/api/driver/me");
  return profile;
}

export async function fetchDriverEligibility(): Promise<DriverEligibilityDto> {
  const profile = await fetchDriverProfile();

  if (!profile) {
    return {
      isEligible: false,
      status: "UNKNOWN",
      profile: null
    };
  }

  return {
    isEligible: ACTIVE_STATUSES.has(profile.status as "ACTIVE"),
    status: profile.status,
    profile
  };
}
