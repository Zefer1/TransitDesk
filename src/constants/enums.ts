export const SERVICE_STATUSES = ["scheduled", "ongoing", "completed", "cancelled"] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const SERVICE_TYPES = ["Tour", "Transfer", "Taxi", "Shuttle", "Full Day", "Half Day"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const VEHICLE_TYPES = [
  "Light Vehicle",
  "Heavy Vehicle",
  "Van",
  "Minibus",
  "Bus",
  "SUV",
  "Hybrid",
  "Taxi",
  "School Bus",
  "Other",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const GENDERS = ["Male", "Female"] as const;

export type Gender = (typeof GENDERS)[number];

export const DRIVER_LICENSES = ["B1", "B", "C1", "C", "D1", "D", "BE", "C1E", "CE", "D1E", "DE"] as const;

export type DriverLicense = (typeof DRIVER_LICENSES)[number];
