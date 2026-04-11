/**
 * Core domain entity interfaces: Service, Vehicle, Driver, Guide.
 * These types represent the data shapes returned by the API.
 */
import type {
// Domain model interfaces below define the canonical shapes consumed by features and APIs.

  DriverLicense,
  Gender,
  ServiceStatus,
  ServiceType,
  VehicleType,
} from "../constants/enums";
export { SERVICE_STATUSES } from "../constants/enums";
export type { DriverLicense, Gender, ServiceStatus, ServiceType, VehicleType } from "../constants/enums";

export interface Service {
  id: number;
  scheduledAt: string; // ISO date/time string
  description: string; // e.g., "Funchal to Santana"
  stops: string[]; // List of stop names or locations
  distanceKm?: number; // Optional, total route distance
  estimatedDurationMin?: number; // Optional, duration in minutes
  status: ServiceStatus;
  type: ServiceType;
  vehicle: Vehicle;
  passengerQuantity?: number;
  driver: Driver;
  guide?: Guide;
  notes?: string;
  agencyName?: string;
}

export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  passengerCapacity: number;
  type: VehicleType;
  color: string;
  registrationDate?: string;
  inspectionExpiry?: string;
  active?: boolean;
  notes?: string;
  suitedFor?: ServiceType;
}

export interface Driver {
  id: number;
  name: string;
  gender: Gender;
  license: DriverLicense;
  entitledToDrive: VehicleType;
  phone?: string;
}

export interface Guide {
  id: number;
  name: string;
  gender: Gender;
  phone?: string;
  languages?: string[]; // Array for multiple languages
}



