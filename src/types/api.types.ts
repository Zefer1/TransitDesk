import {
  type Service,
  type Vehicle,
  type Driver,
  type Guide,
} from "./service.types";

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

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type ServiceCreateRequest = Omit<Service, "id">;
export type ServiceUpdateRequest = Partial<Service> & { id: number };

export type VehicleCreateRequest = Omit<Vehicle, "id">;
export type VehicleUpdateRequest = Partial<Vehicle> & { id: number };

export type DriverCreateRequest = Omit<Driver, "id">;
export type DriverUpdateRequest = Partial<Driver> & { id: number };

export type GuideCreateRequest = Omit<Guide, "id">;
export type GuideUpdateRequest = Partial<Guide> & { id: number };
