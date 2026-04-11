/**
 * API response types and entity-specific request/response type aliases.
 *
 * When the real backend is connected, these types stay the same - only the
 * implementation in `src/api/` changes from mock to Axios.
 */
import {
  type Service,
  type Vehicle,
  type Driver,
  type Guide,
} from "./service.types";

// API RESPONSE TYPES

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  error?: string;
}

// PAGINATION METADATA

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// SERVICE TYPES

export type ServiceCreateRequest = Omit<Service, "id">;
export type ServiceUpdateRequest = Partial<Service> & { id: number };

// VEHICLE TYPES

export type VehicleCreateRequest = Omit<Vehicle, "id">;
export type VehicleUpdateRequest = Partial<Vehicle> & { id: number };

// DRIVER TYPES

export type DriverCreateRequest = Omit<Driver, "id">;
export type DriverUpdateRequest = Partial<Driver> & { id: number };

// GUIDE TYPES

export type GuideCreateRequest = Omit<Guide, "id">;
export type GuideUpdateRequest = Partial<Guide> & { id: number };
