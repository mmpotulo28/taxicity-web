import { useMutation } from "@tanstack/react-query";

import { toDomainError } from "../../../core/api/errors";
import { registerVehicle, submitDriverApplication, type DriverApplicationInput, type VehicleRegistrationInput } from "../services/onboarding.service";

export function useSubmitApplication() {
  const mutation = useMutation({
    mutationFn: (input: DriverApplicationInput) => submitDriverApplication(input)
  });

  if (mutation.error) {
    return {
      ...mutation,
      error: toDomainError(mutation.error)
    };
  }

  return mutation;
}

export function useRegisterVehicle() {
  const mutation = useMutation({
    mutationFn: (input: VehicleRegistrationInput) => registerVehicle(input)
  });

  if (mutation.error) {
    return {
      ...mutation,
      error: toDomainError(mutation.error)
    };
  }

  return mutation;
}
