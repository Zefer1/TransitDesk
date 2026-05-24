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

let servicesStore: Service[] = loadServicesStore();

const createServiceEntity = (
  payload: Omit<Service, "id">,
  id: number,
): Service => ({
  id,
  ...payload,
});

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

export async function deleteService(id: number): Promise<{ success: true; data: { id: number } }> {
  await mockDelay();
  servicesStore = servicesStore.filter((item) => item.id !== id);
  persistServicesStore(servicesStore);

  return {
    success: true,
    data: { id },
  };
}

export async function setServiceStatus(
  id: number,
  status: ServiceStatus,
): Promise<ApiResponse<Service>> {
  return updateService({ id, status });
}

export function getServicesMockStore(): Service[] {
  return servicesStore;
}

export function resetServicesMockStore(services: Service[]): void {
  servicesStore = services;
  persistServicesStore(servicesStore);
}

export function resetServicesToDefaults(): void {
  resetServicesMockStore([...seededServicesStore]);
}
