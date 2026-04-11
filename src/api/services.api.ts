/**
 * Mock API for Services.
 *
 * This is more complex than the other mock APIs (drivers, vehicles, guides) because:
 *
 *  1. Services have status transition rules (e.g. "scheduled" can become "ongoing"
 *     but not jump straight to "completed"). See serviceStatuses.ts for the rules.
 *  2. Data is saved to sessionStorage so it survives page refreshes during development.
 *  3. Each service record embeds full Vehicle, Driver, and Guide objects (nested entities).
 *
 * When replacing with the real backend, keep the same exported function names and
 * return types -- just swap the body of each function for an Axios call.
 */
import type {
  Service,
  Vehicle,
  Driver,
  Guide,
  ServiceStatus,
  VehicleType,
  Gender,
} from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import { mockDelay } from "./mockDelay";

/*
 * ---------- Seed data ----------
 * These fake records are used to populate the services list on first load.
 * They reference mock Vehicle, Driver, and Guide objects so the UI has
 * something realistic to display.
 */
const VEHICLE_TYPE: VehicleType = "Van";
const GENDER: Gender = "Male";

const mockVehicle: Vehicle = {
  id: 1,
  licensePlate: "AA-12-BB",
  brand: "Mercedes",
  model: "Sprinter",
  year: 2022,
  passengerCapacity: 16,
  type: VEHICLE_TYPE,
  color: "White",
  active: true,
};

const mockDriver: Driver = {
  id: 1,
  name: "Joao Silva",
  gender: GENDER,
  license: "D",
  entitledToDrive: VEHICLE_TYPE,
  phone: "+351910000000",
};

const mockGuide: Guide = {
  id: 1,
  name: "Maria Santos",
  gender: "Female",
  languages: ["Portuguese", "English"],
};

const now = Date.now();

/** Key used to read/write the services array in the browser's sessionStorage. */
const SERVICES_STORAGE_KEY = "transitdesk:services-store:v1";

const seededServicesStore: Service[] = [
  {
    id: 1,
    scheduledAt: new Date(now + 60 * 60 * 1000).toISOString(),
    agencyName: "Madeira Explorer",
    description: "Funchal to Santana",
    stops: ["Funchal", "Faial", "Santana"],
    distanceKm: 41,
    estimatedDurationMin: 75,
    status: "scheduled",
    type: "Tour",
    vehicle: mockVehicle,
    passengerQuantity: 12,
    driver: mockDriver,
    guide: mockGuide,
    notes: "Hotel pickup at 08:30",
  },
  {
    id: 2,
    scheduledAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    description: "Airport transfer",
    stops: ["Hotel", "Airport"],
    status: "completed",
    type: "Transfer",
    vehicle: { ...mockVehicle, id: 2, licensePlate: "CC-34-DD" },
    passengerQuantity: 4,
    driver: { ...mockDriver, id: 2, name: "Pedro Costa" },
  },
];

/*
 * ---------- SessionStorage persistence helpers ----------
 * These small functions handle saving and loading the services array from the
 * browser's sessionStorage. This way mock data survives page refreshes during
 * development. If sessionStorage is not available (e.g. in SSR or tests), we
 * silently fall back to the seed data.
 */
function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function loadServicesStore(): Service[] {
  if (!canUseSessionStorage()) {
    return [...seededServicesStore];
  }

  try {
    const raw = window.sessionStorage.getItem(SERVICES_STORAGE_KEY);
    if (!raw) {
      return [...seededServicesStore];
    }

    const parsed = JSON.parse(raw) as Service[];
    return Array.isArray(parsed) ? parsed : [...seededServicesStore];
  } catch {
    return [...seededServicesStore];
  }
}

function persistServicesStore(nextStore: Service[]): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(nextStore));
  } catch {
    // Ignore quota/security errors in mock persistence.
  }
}

/** The in-memory "database". Loaded from sessionStorage (or seed data on first visit). */
let servicesStore: Service[] = loadServicesStore();

/** Helper that attaches an ID to a service payload to create a full Service record. */
const createServiceEntity = (
  payload: Omit<Service, "id">,
  id: number,
): Service => ({
  id,
  ...payload,
});

/*
 * ---------- CRUD operations ----------
 * These mirror the function signatures you would use with a real REST API.
 */

/** Returns all services, wrapped in a paginated response shape. */
export async function listServices(): Promise<PaginatedApiResponse<Service>> {
  await mockDelay();
  return {
    success: true,
    data: servicesStore,
    pagination: {
      page: 1,
      pageSize: servicesStore.length,
      total: servicesStore.length,
      totalPages: 1,
    },
  };
}

/** Finds a single service by its numeric ID. Throws if not found. */
export async function getServiceById(id: number): Promise<ApiResponse<Service>> {
  await mockDelay();
  const service = servicesStore.find((item) => item.id === id);

  if (!service) {
    throw new Error(`Service with id ${id} not found`);
  }

  return {
    success: true,
    data: service,
  };
}

/** Creates a new service and persists the updated list to sessionStorage. */
export async function createService(
  payload: Omit<Service, "id">,
): Promise<ApiResponse<Service>> {
  await mockDelay();
  const id = servicesStore.length
    ? Math.max(...servicesStore.map((item) => item.id)) + 1
    : 1;

  const created = createServiceEntity(payload, id);
  servicesStore = [created, ...servicesStore];
  persistServicesStore(servicesStore);

  return {
    success: true,
    data: created,
  };
}

/** Updates an existing service by merging provided fields, then persists. */
export async function updateService(
  payload: Partial<Service> & { id: number },
): Promise<ApiResponse<Service>> {
  await mockDelay();
  const index = servicesStore.findIndex((item) => item.id === payload.id);

  if (index < 0) {
    throw new Error(`Service with id ${payload.id} not found`);
  }

  const updated: Service = {
    ...servicesStore[index],
    ...payload,
    id: payload.id,
  };

  servicesStore[index] = updated;
  persistServicesStore(servicesStore);

  return {
    success: true,
    data: updated,
  };
}

/** Removes a service from the store and persists the change. */
export async function deleteService(id: number): Promise<{ success: true; data: { id: number } }> {
  await mockDelay();
  servicesStore = servicesStore.filter((item) => item.id !== id);
  persistServicesStore(servicesStore);

  return {
    success: true,
    data: { id },
  };
}

/** Convenience wrapper that updates only the status field of a service. */
export async function setServiceStatus(
  id: number,
  status: ServiceStatus,
): Promise<ApiResponse<Service>> {
  return updateService({ id, status });
}

/** Exposes the raw mock store for use in tests or debugging. */
export function getServicesMockStore(): Service[] {
  return servicesStore;
}

/** Replaces the entire mock store and persists -- useful for resetting state in tests. */
export function resetServicesMockStore(services: Service[]): void {
  servicesStore = services;
  persistServicesStore(servicesStore);
}

/** Restores the mock store to the original seed data and clears sessionStorage. */
export function resetServicesToDefaults(): void {
  resetServicesMockStore([...seededServicesStore]);
}



