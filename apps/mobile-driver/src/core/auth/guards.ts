import type { DriverEligibilityDto } from "../../shared/types/driver";

export function isOperationallyEligible(profile: DriverEligibilityDto | null | undefined) {
  return Boolean(profile?.isEligible && profile.profile?.status === "ACTIVE");
}
