import { apiClient } from "../../../core/api/client";

export interface DriverApplicationInput {
  licenseNumber: string;
  phoneNumber: string;
}

export interface VehicleRegistrationInput {
  licensePlate: string;
  model: string;
}

export async function submitDriverApplication(input: DriverApplicationInput) {
  return apiClient.post<{ success: boolean }, DriverApplicationInput>("/api/driver/apply", input);
}

export async function registerVehicle(input: VehicleRegistrationInput) {
  return apiClient.post<{ success: boolean }, VehicleRegistrationInput>("/api/driver/vehicle", input);
}
