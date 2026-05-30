import type {
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
  scheduledAt: string;
  description: string;
  stops: string[];
  distanceKm?: number;
  estimatedDurationMin?: number;
  status: ServiceStatus;
  type: ServiceType;
  vehicle: Vehicle;
  passengerQuantity?: number;
  driver: Driver;
  guide?: Guide;
  notes?: string;
  agencyName?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { id: number; name: string } | null;
  updatedBy?: { id: number; name: string } | null;
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
  languages?: string[];
}



