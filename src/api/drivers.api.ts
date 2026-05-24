import type { Driver } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import { mockDelay } from "./mockDelay";

const initialDrivers: Driver[] = [
	{
		id: 1,
		name: "Joao Silva",
		gender: "Male",
		license: "D",
		entitledToDrive: "Van",
		phone: "+351910000000",
	},
	{
		id: 2,
		name: "Pedro Costa",
		gender: "Male",
		license: "D1",
		entitledToDrive: "Minibus",
		phone: "+351910000001",
	},
	{
		id: 3,
		name: "Ana Freitas",
		gender: "Female",
		license: "B",
		entitledToDrive: "Light Vehicle",
		phone: "+351910000002",
	},
];

let driversStore: Driver[] = [...initialDrivers];

export async function listDrivers(): Promise<PaginatedApiResponse<Driver>> {
	await mockDelay();
	return {
		success: true,
		data: driversStore,
		pagination: {
			page: 1,
			pageSize: driversStore.length,
			total: driversStore.length,
			totalPages: 1,
		},
	};
}

export async function getDriverById(id: number): Promise<ApiResponse<Driver>> {
	await mockDelay();
	const driver = driversStore.find((item) => item.id === id);
	if (!driver) {
		throw new Error(`Driver with id ${id} not found`);
	}
	return { success: true, data: driver };
}

export async function createDriver(payload: Omit<Driver, "id">): Promise<ApiResponse<Driver>> {
	await mockDelay();
	const id = driversStore.length ? Math.max(...driversStore.map((item) => item.id)) + 1 : 1;
	const created = { id, ...payload } as Driver;
	driversStore = [created, ...driversStore];
	return { success: true, data: created };
}

export async function updateDriver(payload: Partial<Driver> & { id: number }): Promise<ApiResponse<Driver>> {
	await mockDelay();
	const index = driversStore.findIndex((item) => item.id === payload.id);
	if (index < 0) {
		throw new Error(`Driver with id ${payload.id} not found`);
	}
	const updated = { ...driversStore[index], ...payload } as Driver;
	driversStore[index] = updated;
	return { success: true, data: updated };
}

export async function deleteDriver(id: number): Promise<{ success: true; data: { id: number } }> {
	await mockDelay();
	driversStore = driversStore.filter((item) => item.id !== id);
	return { success: true, data: { id } };
}

export function getDriversMockStore(): Driver[] {
	return driversStore;
}

export function resetDriversMockStore(items: Driver[]): void {
	driversStore = items;
}

export function resetDriversToDefaults(): void {
	resetDriversMockStore([...initialDrivers]);
}
